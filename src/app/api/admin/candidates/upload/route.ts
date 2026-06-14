import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  candidateCulture,
  candidates as candidatesTable,
  jobs as jobsTable,
  matches as matchesTable,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { parseCsvRecords } from "@/lib/csv";
import { CULTURAL_AXES, type AxisValues } from "@/lib/clevy-data";

function optional(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
}

// Parse the 7 culture axes from a CSV row; returns null unless ALL are valid.
function parseAxes(row: Record<string, string>): AxisValues | null {
  const out: Partial<AxisValues> = {};
  for (const a of CULTURAL_AXES) {
    const raw = row[a.id];
    if (raw === undefined || raw.trim() === "") return null;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 100) return null;
    out[a.id] = Math.round(n);
  }
  return out as AxisValues;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { jobId, csv } = (body ?? {}) as { jobId?: string; csv?: string };
  if (!jobId || typeof csv !== "string") {
    return NextResponse.json(
      { error: "Falta la vacante o el CSV" },
      { status: 400 }
    );
  }

  // Validate the target job exists.
  const [job] = await db
    .select({ id: jobsTable.id })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId))
    .limit(1);
  if (!job) {
    return NextResponse.json({ error: "Vacante no encontrada" }, { status: 404 });
  }

  const records = parseCsvRecords(csv);
  if (records.length === 0) {
    return NextResponse.json({ error: "El CSV no tiene filas" }, { status: 400 });
  }

  let created = 0;
  let updated = 0;
  let matched = 0;
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    const lineNo = i + 2; // +1 header, +1 to 1-index
    const name = optional(row.name);
    const email = optional(row.email)?.toLowerCase();
    if (!name || !email) {
      errors.push(`Fila ${lineNo}: faltan name o email`);
      continue;
    }

    const fields = {
      name,
      role: optional(row.role),
      location: optional(row.city) ?? optional(row.location),
      linkedinUrl: optional(row.linkedinurl),
      summary: optional(row.summary),
      highlights: optional(row.highlights)
        ? row.highlights
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };

    // Upsert candidate by email (no slug → stays out of the global pool).
    let candidateId: string;
    const [existing] = await db
      .select({ id: candidatesTable.id })
      .from(candidatesTable)
      .where(eq(candidatesTable.email, email))
      .limit(1);

    if (existing) {
      candidateId = existing.id;
      await db
        .update(candidatesTable)
        .set(fields)
        .where(eq(candidatesTable.id, candidateId));
      updated++;
    } else {
      const [ins] = await db
        .insert(candidatesTable)
        .values({ email, ...fields })
        .returning({ id: candidatesTable.id });
      candidateId = ins.id;
      created++;
    }

    // Culture axes (optional).
    const axes = parseAxes(row);
    if (axes) {
      const [hasCulture] = await db
        .select({ id: candidateCulture.id })
        .from(candidateCulture)
        .where(eq(candidateCulture.candidateId, candidateId))
        .limit(1);
      if (hasCulture) {
        await db
          .update(candidateCulture)
          .set({ values: axes })
          .where(eq(candidateCulture.candidateId, candidateId));
      } else {
        await db
          .insert(candidateCulture)
          .values({ candidateId, values: axes });
      }
    }

    // Link the candidate to the selected vacancy (idempotent).
    const [existingMatch] = await db
      .select({ id: matchesTable.id })
      .from(matchesTable)
      .where(
        and(
          eq(matchesTable.jobId, jobId),
          eq(matchesTable.candidateId, candidateId)
        )
      )
      .limit(1);
    if (!existingMatch) {
      await db
        .insert(matchesTable)
        .values({ jobId, candidateId, status: "pending" });
      matched++;
    }
  }

  return NextResponse.json({ created, updated, matched, errors });
}
