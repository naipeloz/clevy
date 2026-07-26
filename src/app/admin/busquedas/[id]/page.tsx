import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import { getAdminJob, listAdminCompanies } from "@/lib/admin-db";
import { SearchForm } from "../search-form";

export default async function EditSearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const [job, companies] = await Promise.all([
    getAdminJob(id),
    listAdminCompanies(),
  ]);
  if (!job) notFound();

  return (
    <Page max={820}>
      <Link
        href="/admin/busquedas"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {t.admin.searches.title}
      </Link>
      <PageTitle eyebrow={t.admin.searches.eyebrow} title={job.title} />
      <SearchForm
        id={job.id}
        initial={{
          title: job.title,
          companyId: job.companyId,
          status: job.status,
          visibility: job.visibility,
          description: job.description ?? "",
          location: job.location ?? "",
          remote: job.remote,
        }}
        companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      />
    </Page>
  );
}
