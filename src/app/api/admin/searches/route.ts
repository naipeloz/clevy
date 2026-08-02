import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  jobStatusEnum,
  jobVisibilityEnum,
  jobs,
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

// Admin: create a search (job) for a given company.
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
  const title = optionalString(raw.title);
  const companyId = optionalString(raw.companyId);
  const status = optionalString(raw.status) ?? "draft";
  const visibility = optionalString(raw.visibility) ?? "public";

  if (!title) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }
  if (!companyId) {
    return NextResponse.json(
      { error: "Elegí una empresa" },
      { status: 400 }
    );
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
  const [created] = await db
    .insert(jobs)
    .values({
      title,
      companyId,
      status: status as (typeof jobStatusEnum.enumValues)[number],
      visibility: visibility as (typeof jobVisibilityEnum.enumValues)[number],
      description: optionalString(raw.description),
      location: optionalString(raw.location),
      remote,
      // A scope only makes sense for remote searches.
      remoteScope: remote && isRemoteScope(raw.remoteScope) ? raw.remoteScope : null,
      createdById: session.userId,
    })
    .returning({ id: jobs.id });

  return NextResponse.json({ id: created.id, redirectTo: "/admin/busquedas" });
}
