import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { jobs, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";

const VALID_STATUS = new Set(["draft", "open", "paused", "closed"]);

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;

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
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { status } = (body ?? {}) as { status?: string };
  if (!status || !VALID_STATUS.has(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  // Verify the job belongs to the manager's company before mutating.
  const [job] = await db
    .select({ id: jobs.id, companyId: jobs.companyId })
    .from(jobs)
    .where(eq(jobs.id, id))
    .limit(1);

  if (!job || job.companyId !== user.companyId) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }

  await db
    .update(jobs)
    .set({ status: status as "draft" | "open" | "paused" | "closed" })
    .where(eq(jobs.id, id));

  return NextResponse.json({ ok: true });
}
