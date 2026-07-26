import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { jobUsers, jobs, users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Assign a user to a search.
export async function POST(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: jobId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const userId = (body as { userId?: string })?.userId;
  if (!userId || !UUID.test(userId)) {
    return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
  }

  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  if (!job) {
    return NextResponse.json({ error: "Búsqueda no encontrada" }, { status: 404 });
  }
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  // Idempotent — assigning an already-assigned user is a no-op.
  await db
    .insert(jobUsers)
    .values({ jobId, userId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true });
}

// Remove a user from a search: DELETE ...?userId=<id>
export async function DELETE(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id: jobId } = await params;
  const userId = new URL(request.url).searchParams.get("userId");
  if (!userId || !UUID.test(userId)) {
    return NextResponse.json({ error: "Usuario inválido" }, { status: 400 });
  }

  await db
    .delete(jobUsers)
    .where(and(eq(jobUsers.jobId, jobId), eq(jobUsers.userId, userId)));

  return NextResponse.json({ ok: true });
}
