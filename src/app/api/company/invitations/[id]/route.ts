import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { invitations, users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

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
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Scope the revoke to the manager's own company.
  await db
    .update(invitations)
    .set({ status: "revoked" })
    .where(
      and(
        eq(invitations.id, id),
        eq(invitations.companyId, user.companyId)
      )
    );

  return NextResponse.json({ ok: true });
}
