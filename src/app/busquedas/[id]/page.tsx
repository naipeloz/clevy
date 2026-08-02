import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, getLocale } from "@/lib/i18n";
import { Avatar, Tag } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { RichText } from "@/components/rich-text";
import { getPublicJob } from "@/lib/public-db";
import { formatLocation, remoteLabel } from "@/lib/location";
import { ApplyForm } from "./apply-form";

const SERIF = "var(--font-instrument-serif), serif";

export default async function PublicJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const locale = await getLocale();
  const p = t.publicJobs;
  const job = await getPublicJob(id);
  if (!job) notFound();

  const loc =
    formatLocation(
      { city: job.city, countryCode: job.countryCode, location: job.location },
      locale
    ) || "";
  const remote = remoteLabel(p.remote, job.remoteScope, t.remoteWork.scopes);
  const place = job.remote ? remote : loc;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PublicHeader />
      <main style={{ padding: "40px 64px 96px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          <Link
            href="/busquedas"
            style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
          >
            ← {p.back}
          </Link>

          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Avatar name={job.company} size={48} />
            <div>
              <h1
                style={{
                  fontFamily: SERIF,
                  fontSize: 44,
                  letterSpacing: "-0.02em",
                  margin: 0,
                  lineHeight: 1.05,
                  fontWeight: 400,
                }}
              >
                {job.title}
              </h1>
              <div style={{ fontSize: 14, color: "var(--fg-dim)", marginTop: 4 }}>
                {job.company}
                {place ? ` · ${place}` : ""}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {job.industry ? <Tag>{job.industry}</Tag> : null}
            {job.remote ? <Tag>{remote}</Tag> : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 40,
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                {p.aboutRole}
              </div>
              {job.description ? (
                <RichText markdown={job.description} style={{ fontSize: 15 }} />
              ) : (
                <div style={{ fontSize: 15, color: "var(--fg-dim)" }}>—</div>
              )}
            </div>

            <div
              id="aplicar"
              style={{
                border: "1px solid var(--hairline-strong)",
                borderRadius: 10,
                padding: 28,
                background: "var(--bg-2)",
                display: "flex",
                flexDirection: "column",
                gap: 18,
                position: "sticky",
                top: 24,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontFamily: SERIF, fontSize: 24, letterSpacing: "-0.01em" }}>
                  {p.applyTitle}
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-dim)", lineHeight: 1.5 }}>
                  {p.applySubtitle}
                </div>
              </div>
              <ApplyForm jobId={job.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
