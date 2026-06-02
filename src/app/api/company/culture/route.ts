import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orgCulture, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";
import { COMPANY_VALUES_OPTIONS, valuesToAxes } from "@/lib/clevy-data";

const VALID_VALUE_IDS = new Set(COMPANY_VALUES_OPTIONS.map((v) => v.id));

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: "Primero creá el perfil de la empresa", redirectTo: "/empresa/perfil" },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as { selected?: unknown; priorities?: unknown };

  if (!Array.isArray(raw.selected) || raw.selected.length < 3) {
    return NextResponse.json({ error: "Elegí al menos 3 valores" }, { status: 400 });
  }
  if (raw.selected.length > 6) {
    return NextResponse.json({ error: "Máximo 6 valores" }, { status: 400 });
  }

  const selected: string[] = [];
  for (const id of raw.selected) {
    if (typeof id === "string" && VALID_VALUE_IDS.has(id)) selected.push(id);
  }
  if (selected.length < 3) {
    return NextResponse.json(
      { error: "Algunos valores no son válidos" },
      { status: 400 }
    );
  }

  const priorities: Record<string, number> = {};
  if (raw.priorities && typeof raw.priorities === "object") {
    for (const id of selected) {
      const p = (raw.priorities as Record<string, unknown>)[id];
      priorities[id] =
        typeof p === "number" && p >= 0 && p <= 100 ? Math.round(p) : 70;
    }
  } else {
    for (const id of selected) priorities[id] = 70;
  }

  const axes = valuesToAxes(selected, priorities);

  // org_culture.values holds the AxisValues (read by the matching layer);
  // workStyle keeps the raw {selected, priorities} so the editor can prefill.
  const [existing] = await db
    .select({ id: orgCulture.id })
    .from(orgCulture)
    .where(eq(orgCulture.companyId, user.companyId))
    .limit(1);

  if (existing) {
    await db
      .update(orgCulture)
      .set({ values: axes, workStyle: { selected, priorities } })
      .where(eq(orgCulture.companyId, user.companyId));
  } else {
    await db.insert(orgCulture).values({
      companyId: user.companyId,
      values: axes,
      workStyle: { selected, priorities },
    });
  }

  return NextResponse.json({ redirectTo: "/empresa" });
}
