import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  jobStatusEnum,
  jobUsers,
  jobVisibilityEnum,
  jobs,
  matches,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { isRemoteScope } from "@/lib/location";

const STATUSES = new Set<string>(jobStatusEnum.enumValues);
const VISIBILITIES = new Set<string>(jobVisibilityEnum.enumValues);

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
  const title = optionalString(raw.title);
  const companyId = optionalString(raw.companyId);
  const status = optionalString(raw.status) ?? "draft";
  const visibility = optionalString(raw.visibility) ?? "public";

  if (!title) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }
  if (!companyId) {
    return NextResponse.json({ error: "Elegí una empresa" }, { status: 400 });
  }
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: "Estado inválido" }, { status: 400 });
  }
  if (!VISIBILITIES.has(visibility)) {
    return NextResponse.json({ error: "Visibilidad inválida" }, { status: 400 });
  }

  const [company] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  if (!company) {
    return NextResponse.json({ error: "Empresa inválida" }, { status: 400 });
  }

  const remote = raw.remote === true;
  const [updated] = await db
    .update(jobs)
    .set({
      title,
      companyId,
      status: status as (typeof jobStatusEnum.enumValues)[number],
      visibility: visibility as (typeof jobVisibilityEnum.enumValues)[number],
      description: optionalString(raw.description),
      location: optionalString(raw.location),
      remote,
      // A scope only makes sense for remote searches.
      remoteScope: remote && isRemoteScope(raw.remoteScope) ? raw.remoteScope : null,
    })
    .where(eq(jobs.id, id))
    .returning({ id: jobs.id });

  if (!updated) {
    return NextResponse.json({ error: "Búsqueda no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ id: updated.id, redirectTo: "/admin/busquedas" });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

  try {
    // Everything that points at the search has to go first, or the foreign keys
    // block the delete: its applications and any user assignments.
    const deleted = await db.transaction(async (tx) => {
      await tx.delete(matches).where(eq(matches.jobId, id));
      await tx.delete(jobUsers).where(eq(jobUsers.jobId, id));
      const [row] = await tx
        .delete(jobs)
        .where(eq(jobs.id, id))
        .returning({ id: jobs.id });
      return row;
    });

    if (!deleted) {
      return NextResponse.json(
        { error: "Búsqueda no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json({ ok: true, redirectTo: "/admin/busquedas" });
  } catch (error) {
    console.error("Failed to delete search", id, error);
    return NextResponse.json(
      { error: "No se pudo eliminar la búsqueda" },
      { status: 500 }
    );
  }
}
