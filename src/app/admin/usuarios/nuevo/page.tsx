import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { listAdminCompanies } from "@/lib/admin-db";
import { UserForm } from "../user-form";

const ROLE_ORDER = ["user", "admin", "root"] as const;

export default async function NewUserPage() {
  const t = await getDict();
  const companies = await listAdminCompanies();
  const roles = ROLE_ORDER.map((value) => ({
    value,
    label: t.admin.users.roles[value],
  }));

  return (
    <Page max={800}>
      <Link
        href="/admin/usuarios"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {t.admin.users.title}
      </Link>
      <PageTitle eyebrow={t.admin.users.eyebrow} title="Nuevo usuario." />
      <UserForm
        roles={roles}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </Page>
  );
}
