import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, roleEnum, users } from "@/db/schema";
import { getCurrentSession, hashPassword, type SessionRole } from "@/lib/auth";

const ROLES = new Set<string>(roleEnum.enumValues);

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Admin: create a new user account with any role.
export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const name = optionalString(raw.name);
  const email = optionalString(raw.email)?.toLowerCase() ?? null;
  const password = typeof raw.password === "string" ? raw.password : "";
  const role = optionalString(raw.role);
  const companyId = optionalString(raw.companyId);

  if (!name || !email) {
    return NextResponse.json(
      { error: "Nombre y email son obligatorios" },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }
  if (!role || !ROLES.has(role)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Ya existe una cuenta con ese email" },
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

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: role as SessionRole,
      companyId: companyId ?? null,
    })
    .returning({ id: users.id });

  return NextResponse.json({ id: created.id, redirectTo: "/admin/usuarios" });
}
