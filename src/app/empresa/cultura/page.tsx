import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { CulturaClient } from "./cultura-client";
import { isCompanyCulture } from "@/lib/clevy-data";

export default async function CulturaPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");

  const [user] = await db
    .select({
      name: users.name,
      culturalProfile: users.culturalProfile,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/login");

  const existing = isCompanyCulture(user.culturalProfile)
    ? user.culturalProfile
    : null;

  return (
    <CulturaClient
      userName={user.name ?? ""}
      initialSelected={existing?.selected ?? null}
      initialPriorities={existing?.priorities ?? null}
    />
  );
}
