import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  invitations,
  jobs,
  passwordResetTokens,
  roleEnum,
  users,
} from "@/db/schema";
import { getCurrentSession, hashPassword, type SessionRole } from "@/lib/auth";

const ROLES = new Set<string>(roleEnum.enumValues);

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = optionalString(raw.name);
  const email = optionalString(raw.email)?.toLowerCase() ?? null;
  const role = optionalString(raw.role);
  const companyId = optionalString(raw.companyId);
  const password = typeof raw.password === "string" ? raw.password : "";

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nombre y email son obligatorios" },
      { status: 400 }
    );
  }
  if (!role || !ROLES.has(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  // Email must stay unique across other users.
  const [clash] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (clash && clash.id !== id) {
    return NextResponse.json(
      { error: "Ya existe otra cuenta con ese email" },
      { status: 409 }
    );
  }

  if (companyId) {
    const [company] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);
    if (!company) {
      return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
    }
  }

  const fields: Record<string, unknown> = {
    name,
    email,
    role: role as SessionRole,
    companyId: companyId ?? null,
  };
  // Optional password reset — only when a new one is provided.
  if (password) {
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
    fields.passwordHash = await hashPassword(password);
  }

  const [updated] = await db
    .update(users)
    .set(fields)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!updated) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ id: updated.id, redirectTo: "/admin/usuarios" });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

  if (id === session.userId) {
    return NextResponse.json(
      { error: "No podés eliminar tu propia cuenta." },
      { status: 400 }
    );
  }

  // Detach references that would otherwise block the delete, then remove the user.
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));
  await db
    .update(jobs)
    .set({ createdById: null })
    .where(eq(jobs.createdById, id));
  await db
    .update(invitations)
    .set({ invitedById: null })
    .where(eq(invitations.invitedById, id));

  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, redirectTo: "/admin/usuarios" });
}
