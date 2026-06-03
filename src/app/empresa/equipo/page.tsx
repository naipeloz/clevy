import { redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { ReadOnlyBanner } from "@/components/ui";
import {
  getCompanyForUser,
  listInvitations,
  listTeamMembers,
} from "@/lib/company-db";
import { EquipoClient } from "./equipo-client";

export default async function EquipoPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");
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

  // Support only sees the candidate invitations it can manage.
  const visibleInvites = manager
    ? invites
    : invites.filter((i) => i.role === "candidate");

  const pending = visibleInvites
    .filter((i) => i.status === "pending")
    .map((i) => ({
      id: i.id,
      email: i.email,
      token: i.token,
      role: i.role === "candidate" ? ("candidate" as const) : ("support" as const),
    }));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={company.name} />
      {!manager ? <ReadOnlyBanner message={t.ui.readOnlySupportInvite} /> : null}
      <EquipoClient
        manager={manager}
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          isManager: m.role === "hiring_manager" || m.role === "admin",
        }))}
        pending={pending}
      />
    </div>
  );
}
