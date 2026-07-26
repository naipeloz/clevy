import { redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { CompanyShell } from "@/components/company/company-shell";
import {
  getCompanyForUser,
  listInvitations,
  listTeamMembers,
} from "@/lib/company-db";
import { EquipoClient } from "./equipo-client";

export default async function EquipoPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "user") redirect("/candidato");
  // Managers and HR support can both reach this page; support gets a reduced
  // view (only candidate invitations).
  const manager = isManager(session.role);

  const t = await getDict();
  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa");

  const [members, invites] = await Promise.all([
    manager ? listTeamMembers(company.id) : Promise.resolve([]),
    listInvitations(company.id),
  ]);

  const visibleInvites = manager
    ? invites
    : invites.filter((i) => i.role === "user");

  const pending = visibleInvites
    .filter((i) => i.status === "pending")
    .map((i) => ({
      id: i.id,
      email: i.email,
      token: i.token,
      role: i.role === "user" ? ("candidate" as const) : ("support" as const),
    }));

  return (
    <CompanyShell
      userName={company.name}
      companyName={company.name}
      manager={manager}
      readOnlyMessage={t.ui.readOnlySupportInvite}
    >
      <EquipoClient
        manager={manager}
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          isManager: m.role === "admin" || m.role === "root",
        }))}
        pending={pending}
      />
    </CompanyShell>
  );
}
