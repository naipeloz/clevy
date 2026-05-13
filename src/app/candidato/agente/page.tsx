import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { PlaceholderPage } from "@/components/placeholder-page";

export default async function AgentePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return (
    <PlaceholderPage
      userName={user?.name ?? ""}
      eyebrow="Agente · próximamente"
      title={
        <>
          Conversá con el{" "}
          <em style={{ color: "var(--accent)" }}>agente</em>.
        </>
      }
      subtitle="El chat con el agente conversacional todavía no está construido. Volvé al selector mientras tanto."
      backHref="/candidato"
      backLabel="Volver al selector"
    />
  );
}
