import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";

const VALID_STATUS = new Set(["draft", "open", "paused", "closed"]);

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function optionalInt(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  return null;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !isManager(session.role)) {
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

  const raw = (body ?? {}) as Record<string, unknown>;
  const title = optionalString(raw.title);
  if (!title) {
    return NextResponse.json(
      { error: "El título de la vacante es obligatorio" },
      { status: 400 }
    );
  }

  const status =
    typeof raw.status === "string" && VALID_STATUS.has(raw.status)
      ? (raw.status as "draft" | "open" | "paused" | "closed")
      : "draft";

  const [created] = await db
    .insert(jobs)
    .values({
      companyId: user.companyId,
      createdById: session.userId,
      title,
      description: optionalString(raw.description),
      location: optionalString(raw.location),
      remote: raw.remote === true,
      salaryMin: optionalInt(raw.salaryMin),
      salaryMax: optionalInt(raw.salaryMax),
      status,
    })
    .returning({ id: jobs.id });

  return NextResponse.json({ redirectTo: `/empresa/vacantes/${created.id}` });
}
