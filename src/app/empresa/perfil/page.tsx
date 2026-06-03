import { redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getCompanyForUser } from "@/lib/company-db";
import { PerfilClient } from "./perfil-client";

export default async function PerfilPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");
  // Only the HR manager edits the company profile.
  if (!isManager(session.role)) redirect("/empresa");

  const company = await getCompanyForUser(session.userId);

  return (
    <PerfilClient
      initial={
        company
          ? {
              name: company.name,
              tagline: company.tagline ?? "",
              industry: company.industry ?? "",
              countryCode: company.countryCode,
              city: company.city,
              domain: company.domain ?? "",
            }
          : null
      }
    />
  );
}
