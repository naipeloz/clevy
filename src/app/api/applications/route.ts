import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { candidates, jobs, matches } from "@/db/schema";

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function kebab(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Public: apply to a public+open search. Creates or reuses a candidate (by
// email) and records a pending match so the application shows up in the
// company's applicant pipeline. No auth required.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const jobId = optionalString(raw.jobId);
  const name = optionalString(raw.name);
  const email = optionalString(raw.email)?.toLowerCase() ?? null;
  const linkedinUrl = optionalString(raw.linkedinUrl);
  const message = optionalString(raw.message);

  if (!jobId || !name || !email) {
    return NextResponse.json(
      { error: "Nombre, email y búsqueda son obligatorios" },
      { status: 400 }
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }
  // jobId is untrusted (from a public form) — reject non-UUIDs before querying.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)
  ) {
    return NextResponse.json(
      { error: "Esta búsqueda ya no está disponible." },
      { status: 404 }
    );
  }

  // Only public + open searches accept applications.
  const [job] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.id, jobId),
        eq(jobs.visibility, "public"),
        eq(jobs.status, "open")
      )
    )
    .limit(1);
  if (!job) {
    return NextResponse.json(
      { error: "Esta búsqueda ya no está disponible." },
      { status: 404 }
    );
  }

  // Upsert the candidate by email.
  const [existing] = await db
    .select({ id: candidates.id })
    .from(candidates)
    .where(eq(candidates.email, email))
    .limit(1);

  let candidateId: string;
  if (existing) {
    candidateId = existing.id;
    // Backfill LinkedIn if we didn't have it and it was provided now.
    if (linkedinUrl) {
      await db
        .update(candidates)
        .set({ linkedinUrl })
        .where(eq(candidates.id, candidateId));
    }
  } else {
    const slug = `${kebab(name) || "candidato"}-${randomBytes(3).toString("hex")}`;
    const [created] = await db
      .insert(candidates)
      .values({
        name,
        email,
        slug,
        linkedinUrl,
        summary: message,
        status: "new",
      })
      .returning({ id: candidates.id });
    candidateId = created.id;
  }

  // Avoid duplicate applications to the same search.
  const [already] = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.candidateId, candidateId), eq(matches.jobId, jobId)))
    .limit(1);

  if (already) {
    return NextResponse.json({ ok: true, already: true });
  }

  await db.insert(matches).values({
    candidateId,
    jobId,
    status: "pending",
  });

  return NextResponse.json({ ok: true, already: false });
}
