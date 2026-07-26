import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  atsIntegrations,
  companies,
  jobs,
  orgCulture,
  users,
} from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";

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
  const name = optionalString(raw.name);
  if (!name) {
    return NextResponse.json(
      { error: "El nombre de la empresa es obligatorio" },
      { status: 400 }
    );
  }

  const countryCode = optionalString(raw.countryCode);
  const [updated] = await db
    .update(companies)
    .set({
      name,
      domain: optionalString(raw.domain),
      tagline: optionalString(raw.tagline),
      industry: optionalString(raw.industry),
      location: optionalString(raw.location),
      countryCode: countryCode ? countryCode.toUpperCase().slice(0, 2) : null,
      city: optionalString(raw.city),
    })
    .where(eq(companies.id, id))
    .returning({ id: companies.id });

  if (!updated) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ id: updated.id, redirectTo: "/admin/empresas" });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getCurrentSession();
  if (!session || session.role !== "root") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;

  // Block deletion while the company still has dependents, rather than
  // cascade-deleting jobs/candidates. Admin must detach these first.
  const [userCount, jobCount] = await Promise.all([
    db.$count(users, eq(users.companyId, id)),
    db.$count(jobs, eq(jobs.companyId, id)),
  ]);
  if (userCount > 0 || jobCount > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede eliminar: la empresa tiene usuarios o búsquedas asociadas. Reasignalos o eliminalos primero.",
      },
      { status: 409 }
    );
  }

  // Remove the 1:1 / owned rows that have no independent value.
  await db.delete(orgCulture).where(eq(orgCulture.companyId, id));
  await db.delete(atsIntegrations).where(eq(atsIntegrations.companyId, id));

  const [deleted] = await db
    .delete(companies)
    .where(eq(companies.id, id))
    .returning({ id: companies.id });

  if (!deleted) {
    return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, redirectTo: "/admin/empresas" });
}
