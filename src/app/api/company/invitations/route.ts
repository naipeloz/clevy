import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  // Managers and HR support can both reach this; the per-role check is below.
  if (!session || (session.role !== "recruiter" && !isManager(session.role))) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [user] = await db
    .select({ companyId: users.companyId })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user?.companyId) {
    return NextResponse.json(
      { error: "Primero creá el perfil de la empresa", redirectTo: "/empresa/perfil" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, role: rawRole } = (body ?? {}) as {
    email?: string;
    role?: string;
  };

  // Only two invitable roles. Inviting another HR support is manager-only;
  // inviting a candidate is allowed for managers and HR support alike.
  const inviteRole = rawRole === "candidate" ? "candidate" : "recruiter";
  if (inviteRole === "recruiter" && !isManager(session.role)) {
    return NextResponse.json(
      { error: "Solo el HR manager puede invitar a otro HR support" },
      { status: 401 }
    );
  }

  const normalizedEmail = email?.trim().toLowerCase() ?? "";
  if (!normalizedEmail.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  // Don't invite an email that already has an account.
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (existingUser) {
    return NextResponse.json(
      { error: "Ese email ya tiene una cuenta" },
      { status: 409 }
    );
  }

  // Reuse an existing pending invite for the same email+role instead of duplicating.
  const [pending] = await db
    .select({ token: invitations.token })
    .from(invitations)
    .where(
      and(
        eq(invitations.companyId, user.companyId),
        eq(invitations.email, normalizedEmail),
        eq(invitations.role, inviteRole),
        eq(invitations.status, "pending")
      )
    )
    .limit(1);

  if (pending) {
    return NextResponse.json({
      inviteUrl: `/signup?invite=${pending.token}`,
      reused: true,
    });
  }

  const token = randomBytes(24).toString("hex");
  await db.insert(invitations).values({
    companyId: user.companyId,
    email: normalizedEmail,
    role: inviteRole,
    token,
    invitedById: session.userId,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
  });

  return NextResponse.json({ inviteUrl: `/signup?invite=${token}` });
}
