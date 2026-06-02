import { redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getCompanyForUser } from "@/lib/company-db";
import { NuevaVacanteClient } from "./nueva-client";

export default async function NuevaVacantePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");
  if (!isManager(session.role)) redirect("/empresa");

  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa/perfil");
  if (!company.hasCulture) redirect("/empresa/cultura");

  return <NuevaVacanteClient companyName={company.name} />;
}
