import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { Page, PageTitle } from "@/components/admin/admin-ui";
import {
  getAdminJob,
  listAdminCompanies,
  listAdminUsers,
  listJobUsers,
} from "@/lib/admin-db";
import { SearchForm } from "../search-form";
import { SearchUsers } from "../search-users";

export default async function EditSearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const [job, companies, assigned, allUsers] = await Promise.all([
    getAdminJob(id),
    listAdminCompanies(),
    listJobUsers(id),
    listAdminUsers(),
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
      <SearchUsers
        jobId={job.id}
        assigned={assigned}
        allUsers={allUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        }))}
      />
    </Page>
  );
}
