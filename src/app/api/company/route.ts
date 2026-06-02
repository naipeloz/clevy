import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";
import { slugifyUnique } from "@/lib/company-db";

function optionalString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !isManager(session.role)) {
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

  const fields = {
    name,
    domain: optionalString(raw.domain),
    tagline: optionalString(raw.tagline),
    industry: optionalString(raw.industry),
    location: optionalString(raw.location),
    logoUrl: optionalString(raw.logoUrl),
  };

  const [user] = await db
    .select({ companyId: users.companyId })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // Edit existing company.
  if (user?.companyId) {
    await db
      .update(companies)
      .set(fields)
      .where(eq(companies.id, user.companyId));
    return NextResponse.json({ redirectTo: "/empresa" });
  }

  // Create a new company and link the manager to it.
  const slug = await slugifyUnique(name);
  const [created] = await db
    .insert(companies)
    .values({ ...fields, slug })
    .returning({ id: companies.id });

  await db
    .update(users)
    .set({ companyId: created.id })
    .where(eq(users.id, session.userId));

  return NextResponse.json({ redirectTo: "/empresa/cultura" });
}
