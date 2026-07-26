import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { CompanyForm } from "../company-form";

export default async function NewCompanyPage() {
  const t = await getDict();
  return (
    <Page max={800}>
      <Link
        href="/admin/empresas"
        style={{
          fontSize: 13,
          color: "var(--fg-dim)",
          textDecoration: "none",
        }}
      >
        ← {t.admin.companies.title}
      </Link>
      <PageTitle eyebrow={t.admin.companies.eyebrow} title="Nueva empresa." />
      <CompanyForm />
    </Page>
  );
}
