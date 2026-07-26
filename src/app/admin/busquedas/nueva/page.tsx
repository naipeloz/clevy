import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { listAdminCompanies } from "@/lib/admin-db";
import { SearchForm } from "../search-form";

export default async function NewSearchPage() {
  const t = await getDict();
  const companies = await listAdminCompanies();
  return (
    <Page max={820}>
      <Link
        href="/admin/busquedas"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {t.admin.searches.title}
      </Link>
      <PageTitle
        eyebrow={t.admin.searches.eyebrow}
        title={t.admin.searches.form.newTitle}
      />
      <SearchForm companies={companies.map((c) => ({ id: c.id, name: c.name }))} />
    </Page>
  );
}
