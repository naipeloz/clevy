import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import {
  createSessionToken,
  hashPassword,
  homeForRole,
  setSessionCookie,
  type SessionRole,
} from "@/lib/auth";

// Roles a user can pick when self-registering. HR support (recruiter) is only
// created by accepting an invitation, never via open signup.
const SELF_SIGNUP_ROLES = new Set<SessionRole>(["candidate", "hiring_manager"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, password, role, invite } = (body ?? {}) as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    invite?: string;
  };

  if (!email || !name || !password) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  // Resolve the final role + company from either the invitation or open signup.
  let finalRole: SessionRole;
  let companyId: string | null = null;
  let invitationId: string | null = null;

  if (invite) {
    const [inv] = await db
      .select({
        id: invitations.id,
        email: invitations.email,
        role: invitations.role,
        companyId: invitations.companyId,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
      })
      .from(invitations)
      .where(eq(invitations.token, invite))
      .limit(1);

    if (!inv || inv.status !== "pending") {
      return NextResponse.json(
        { error: "Invitación inválida o ya utilizada" },
        { status: 400 }
      );
    }
    if (inv.expiresAt && inv.expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "La invitación expiró" },
        { status: 400 }
      );
    }
    if (inv.email.trim().toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: "El email no coincide con el de la invitación" },
        { status: 400 }
      );
    }
    finalRole = inv.role;
    // A candidate is not an employee of the inviting company — don't link them.
    companyId = inv.role === "candidate" ? null : inv.companyId;
    invitationId = inv.id;
  } else {
    if (!role || !SELF_SIGNUP_ROLES.has(role as SessionRole)) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }
    finalRole = role as SessionRole;
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
      role: finalRole,
      companyId,
    })
    .returning({ id: users.id, role: users.role });

  if (invitationId) {
    await db
      .update(invitations)
      .set({ status: "accepted" })
      .where(
        and(
          eq(invitations.id, invitationId),
          eq(invitations.status, "pending")
        )
      );
  }

  const token = await createSessionToken({
    userId: created.id,
    role: created.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ redirectTo: homeForRole(created.role) });
}
