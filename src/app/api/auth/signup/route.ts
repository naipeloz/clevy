import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSessionToken,
  hashPassword,
  homeForRole,
  setSessionCookie,
  type SessionRole,
} from "@/lib/auth";

const SIGNUP_ROLES = new Set<SessionRole>(["candidate", "recruiter"]);

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, password, role } = (body ?? {}) as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
  };

  if (!email || !name || !password || !role) {
    return NextResponse.json(
      { error: "Faltan campos requeridos" },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail.includes("@")) {
    return NextResponse.json(
      { error: "Email inválido" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 }
    );
  }

  if (!SIGNUP_ROLES.has(role as SessionRole)) {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
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
      role: role as SessionRole,
    })
    .returning({ id: users.id, role: users.role });

  const token = await createSessionToken({
    userId: created.id,
    role: created.role,
  });
  await setSessionCookie(token);

  return NextResponse.json({ redirectTo: homeForRole(created.role) });
}
