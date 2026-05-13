import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import {
  COMPANY_VALUES_OPTIONS,
  valuesToAxes,
  type CompanyCulture,
} from "@/lib/clevy-data";

const ALLOWED_ROLES = new Set(["recruiter", "hiring_manager", "admin"]);
const VALID_VALUE_IDS = new Set(COMPANY_VALUES_OPTIONS.map((v) => v.id));

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || !ALLOWED_ROLES.has(session.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as {
    selected?: unknown;
    priorities?: unknown;
  };

  if (!Array.isArray(raw.selected) || raw.selected.length < 3) {
    return NextResponse.json(
      { error: "Elegí al menos 3 valores" },
      { status: 400 }
    );
  }
  if (raw.selected.length > 6) {
    return NextResponse.json(
      { error: "Máximo 6 valores" },
      { status: 400 }
    );
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
  const culture: CompanyCulture = { selected, priorities, axes };

  await db
    .update(users)
    .set({ culturalProfile: culture })
    .where(eq(users.id, session.userId));

  return NextResponse.json({ redirectTo: "/empresa/candidatos" });
}
