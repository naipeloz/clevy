import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { matchStageEnum, matches } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

type Params = { params: Promise<{ matchId: string }> };

const STAGES = new Set<string>(matchStageEnum.enumValues);

// Admin: change a candidate's stage on a search (e.g. approve).
export async function PATCH(request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { matchId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const stage = (body as { stage?: string })?.stage;
  if (!stage || !STAGES.has(stage)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }

  const [updated] = await db
    .update(matches)
    .set({ stage: stage as (typeof matchStageEnum.enumValues)[number] })
    .where(eq(matches.id, matchId))
    .returning({ id: matches.id });

  if (!updated) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

// Admin: remove a candidate from a search.
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { matchId } = await params;

  const [deleted] = await db
    .delete(matches)
    .where(eq(matches.id, matchId))
    .returning({ id: matches.id });

  if (!deleted) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
