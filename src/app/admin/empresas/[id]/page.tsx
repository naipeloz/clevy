import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { getAdminCompany } from "@/lib/admin-db";
import { CompanyForm } from "../company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const company = await getAdminCompany(id);
  if (!company) notFound();

  return (
    <Page max={800}>
      <Link
        href="/admin/empresas"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {t.admin.companies.title}
      </Link>
      <PageTitle eyebrow={t.admin.companies.eyebrow} title={company.name} />
      <CompanyForm
        id={company.id}
        initial={{
          name: company.name,
          industry: company.industry ?? "",
          domain: company.domain ?? "",
          location: company.location ?? "",
          city: company.city ?? "",
          countryCode: company.countryCode ?? "",
          tagline: company.tagline ?? "",
        }}
      />
    </Page>
  );
}
