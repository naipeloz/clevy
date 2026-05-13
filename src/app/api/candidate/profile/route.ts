import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { CULTURAL_AXES, type AxisId } from "@/lib/clevy-data";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "candidate") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body ?? {}) as { values?: Record<string, unknown> };
  if (!raw.values || typeof raw.values !== "object") {
    return NextResponse.json({ error: "Faltan valores" }, { status: 400 });
  }

  const values: Partial<Record<AxisId, number>> = {};
  for (const axis of CULTURAL_AXES) {
    const v = raw.values[axis.id];
    if (typeof v === "number" && v >= 0 && v <= 100) {
      values[axis.id] = Math.round(v);
    } else {
      values[axis.id] = 50;
    }
  }

  await db
    .update(users)
    .set({ culturalProfile: { values } })
    .where(eq(users.id, session.userId));

  return NextResponse.json({ redirectTo: "/candidato/perfil" });
}
