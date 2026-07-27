import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getDict, getLocale } from "@/lib/i18n";
import { Avatar, MatchPill, Tag } from "@/components/ui";
import { CompanyShell } from "@/components/company/company-shell";
import { Page } from "@/components/admin/admin-ui";
import { RichText } from "@/components/rich-text";
import {
  getCompanyForUser,
  getJobForCompany,
  getOrgCultureAxes,
  listApplicantsForJob,
} from "@/lib/company-db";
import { formatLocation, formatSalary } from "@/lib/location";
import { fmt } from "@/lib/fmt";
import { JobStatusControl } from "./status-control";

type Params = Promise<{ id: string }>;

export default async function VacanteDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "user") redirect("/candidato");

  const t = await getDict();
  const locale = await getLocale();
  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa");

  const job = await getJobForCompany(id, company.id);
  if (!job) notFound();

  const manager = isManager(session.role);
  const companyAxes = await getOrgCultureAxes(company.id);
  const applicants = await listApplicantsForJob(id, companyAxes);

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, locale);
  const locationLabel = formatLocation(
    {
      city: job.city,
      countryCode: job.countryCode,
      location: job.location,
    },
    locale
  );

  return (
    <CompanyShell
      userName={company.name}
      companyName={company.name}
      manager={manager}
      readOnlyMessage={t.ui.readOnlyDefault}
    >
      <Page max={1040}>
          <Link
            href="/empresa"
            style={{
              fontSize: 13,
              color: "var(--fg-dim)",
              textDecoration: "none",
            }}
          >
            {t.vacante.backVacancies}
          </Link>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 24,
            }}
          >
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <Tag tone={job.status === "open" ? "accent" : "default"}>
                  {t.statuses[job.status]}
                </Tag>
                {job.remote ? <Tag>{t.empresa.remote}</Tag> : null}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 48,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {job.title}
              </h1>
              <div
                style={{
                  fontSize: 14,
                  color: "var(--fg-dim)",
                  marginTop: 10,
                  display: "flex",
                  gap: 16,
                }}
              >
                {locationLabel ? <span>{locationLabel}</span> : null}
                {salary ? <span>{salary}</span> : null}
              </div>
            </div>
            {manager ? (
              <JobStatusControl jobId={job.id} status={job.status} />
            ) : null}
          </div>

          {job.description ? (
            <RichText
              markdown={job.description}
              style={{ fontSize: 15, color: "var(--fg)", maxWidth: 720 }}
            />
          ) : null}

          {job.industry || job.experienceMin != null || job.hardSkills.length > 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
                borderTop: "1px solid var(--hairline)",
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                {t.vacante.requirements}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "wrap",
                  fontSize: 14,
                }}
              >
                {job.industry ? (
                  <span>
                    <span style={{ color: "var(--fg-dim)" }}>
                      {t.vacante.industryLabel}:{" "}
                    </span>
                    {job.industry}
                  </span>
                ) : null}
                {job.experienceMin != null ? (
                  <span>{fmt(t.vacante.experienceValue, { n: job.experienceMin })}</span>
                ) : null}
              </div>
              {job.hardSkills.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {job.hardSkills.map((s) => (
                    <Tag key={s} tone="accent">
                      {s}
                    </Tag>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 16,
                borderTop: "1px solid var(--fg)",
                paddingTop: 20,
              }}
            >
              {t.vacante.applicants} · {applicants.length}
            </div>

            {applicants.length === 0 ? (
              <div style={{ fontSize: 14, color: "var(--fg-dim)", padding: "20px 0" }}>
                {t.vacante.noApplicants}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {applicants.map((a) => (
                  <div
                    key={a.matchId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1.4fr 1.2fr 1fr 140px",
                      gap: 20,
                      padding: "18px 4px",
                      alignItems: "center",
                      borderBottom: "1px solid var(--hairline)",
                    }}
                  >
                    <Avatar name={a.name} size={36} />
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontFamily: "var(--font-instrument-serif), serif",
                        }}
                      >
                        {a.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--fg-dim)", marginTop: 2 }}>
                        {a.role || "—"}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                      {a.location || "—"}
                    </div>
                    <div>
                      <Tag>{t.applicantStatus[a.status]}</Tag>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {a.formCompleted && a.match !== null ? (
                        <MatchPill value={a.match} size="sm" />
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                          {t.vacante.formPending}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </Page>
    </CompanyShell>
  );
}
