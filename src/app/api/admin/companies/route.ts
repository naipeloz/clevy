import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { slugifyUnique } from "@/lib/company-db";

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// Admin: create a new company (not linked to any user).
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
  const name = optionalString(raw.name);
  if (!name) {
    return NextResponse.json(
      { error: "El nombre de la empresa es obligatorio" },
      { status: 400 }
    );
  }

  const countryCode = optionalString(raw.countryCode);
  const slug = await slugifyUnique(name);
  const [created] = await db
    .insert(companies)
    .values({
      name,
      slug,
      domain: optionalString(raw.domain),
      tagline: optionalString(raw.tagline),
      industry: optionalString(raw.industry),
      location: optionalString(raw.location),
      countryCode: countryCode ? countryCode.toUpperCase().slice(0, 2) : null,
      city: optionalString(raw.city),
    })
    .returning({ id: companies.id });

  return NextResponse.json({ id: created.id, redirectTo: "/admin/empresas" });
}
