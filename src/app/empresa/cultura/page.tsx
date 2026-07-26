import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getCompanyForUser, getCompanyCultureMeta } from "@/lib/company-db";
import { CompanyShell } from "@/components/company/company-shell";
import { CulturaClient } from "./cultura-client";

export default async function CulturaPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "user") redirect("/candidato");
  // Only the HR manager defines the company culture.
  if (!isManager(session.role)) redirect("/empresa");

  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa/perfil");

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const meta = await getCompanyCultureMeta(company.id);

  return (
    <CompanyShell
      userName={user?.name ?? company.name}
      companyName={company.name}
      manager
    >
      <CulturaClient
        initialSelected={meta?.selected ?? null}
        initialPriorities={meta?.priorities ?? null}
      />
    </CompanyShell>
  );
}
