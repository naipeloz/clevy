import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { getAdminUser, listAdminCompanies } from "@/lib/admin-db";
import { UserForm } from "../user-form";

const ROLE_ORDER = ["user", "admin", "root"] as const;

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const [user, companies] = await Promise.all([
    getAdminUser(id),
    listAdminCompanies(),
  ]);
  if (!user) notFound();

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
      <PageTitle eyebrow={t.admin.users.eyebrow} title={user.name} />
      <UserForm
        id={user.id}
        initial={{
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId ?? "",
        }}
        roles={roles}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </Page>
  );
}
