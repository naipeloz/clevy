import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { candidates, jobs, matches } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Admin: add one or more candidates to a search (stage = presented_by_admin).
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
  const ids = (body as { candidateIds?: unknown })?.candidateIds;
  const candidateIds = Array.isArray(ids)
    ? ids.filter((v): v is string => typeof v === "string" && UUID.test(v))
    : [];
  if (candidateIds.length === 0) {
    return NextResponse.json({ error: "Elegí al menos un candidato" }, { status: 400 });
  }

  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(eq(jobs.id, jobId))
    .limit(1);
  if (!job) {
    return NextResponse.json({ error: "Búsqueda no encontrada" }, { status: 404 });
  }

  // Only real candidates, and skip any already on this search.
  const existingCandidates = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(inArray(candidates.id, candidateIds));
  const valid = new Set(existingCandidates.map((c) => c.id));

  const alreadyMatched = await db
    .select({ candidateId: matches.candidateId })
    .from(matches)
    .where(
      and(eq(matches.jobId, jobId), inArray(matches.candidateId, candidateIds))
    );
  const matched = new Set(alreadyMatched.map((m) => m.candidateId));

  const toAdd = candidateIds.filter((id) => valid.has(id) && !matched.has(id));
  if (toAdd.length > 0) {
    await db.insert(matches).values(
      toAdd.map((candidateId) => ({
        candidateId,
        jobId,
        status: "pending" as const,
        stage: "presented_by_admin" as const,
      }))
    );
  }

  return NextResponse.json({ ok: true, added: toAdd.length });
}
