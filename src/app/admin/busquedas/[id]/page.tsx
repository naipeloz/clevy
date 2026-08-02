import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, getLocale } from "@/lib/i18n";
import { Eyebrow, Page, PageTitle } from "@/components/admin/admin-ui";
import { Tag } from "@/components/ui";
import { RichText } from "@/components/rich-text";
import {
  getAdminJob,
  listAdminCompanies,
  listAllCandidates,
  listJobCandidates,
} from "@/lib/admin-db";
import { formatLocation, remoteLabel } from "@/lib/location";
import { SearchForm } from "../search-form";
import { SearchCandidates } from "../search-candidates";

export default async function EditSearchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const s = t.admin.searches;
  const [job, companies, candidates, allCandidates] = await Promise.all([
    getAdminJob(id),
    listAdminCompanies(),
    listJobCandidates(id),
    listAllCandidates(),
  ]);
  if (!job) notFound();

  // The public posting only exists while the search is public and open.
  const published = job.visibility === "public" && job.status === "open";
  const place = job.remote
    ? remoteLabel(s.form.remote, job.remoteScope, t.remoteWork.scopes)
    : formatLocation(
        { city: job.city, countryCode: job.countryCode, location: job.location },
        locale
      );

  return (
    <Page max={820}>
      <Link
        href="/admin/busquedas"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {s.title}
      </Link>
      <PageTitle eyebrow={`${s.eyebrow} · ${job.company}`} title={job.title} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Tag tone={job.status === "open" ? "accent" : "default"}>
          {t.statuses[job.status]}
        </Tag>
        <Tag>{s.visibility[job.visibility]}</Tag>
        {place ? <Tag>{place}</Tag> : null}
        <div style={{ flex: 1 }} />
        {published ? (
          <a
            href={`/busquedas/${job.id}`}
            target="_blank"
            rel="noreferrer noopener"
            style={{
              fontSize: 13,
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {s.viewPublished} ↗
          </a>
        ) : (
          <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
            {s.notPublished}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Eyebrow>{s.detail.description}</Eyebrow>
        {job.description ? (
          <RichText markdown={job.description} style={{ fontSize: 15 }} />
        ) : (
          <div style={{ fontSize: 14, color: "var(--fg-dim)" }}>
            {s.detail.noDescription}
          </div>
        )}
      </div>

      <SearchCandidates
        jobId={job.id}
        candidates={candidates}
        allCandidates={allCandidates}
      />

      <details style={{ borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
        <summary
          style={{
            fontSize: 13,
            color: "var(--fg-dim)",
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          {s.detail.edit}
        </summary>
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
            remoteScope: job.remoteScope ?? "",
          }}
          companies={companies.map((c) => ({ id: c.id, name: c.name }))}
        />
      </details>
    </Page>
  );
}
