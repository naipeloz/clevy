import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Avatar, MatchPill, ReadOnlyBanner, Tag } from "@/components/ui";
import {
  getCompanyForUser,
  getJobForCompany,
  getOrgCultureAxes,
  listApplicantsForJob,
} from "@/lib/company-db";
import { formatLocation, formatSalary } from "@/lib/location";
import { JobStatusControl } from "./status-control";

type Params = Promise<{ id: string }>;

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  open: "Abierta",
  paused: "Pausada",
  closed: "Cerrada",
};

const APPLICANT_STATUS_LABEL: Record<string, string> = {
  pending: "Nuevo",
  shortlisted: "Preseleccionado",
  rejected: "Descartado",
  hired: "Contratado",
};

export default async function VacanteDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;

  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");

  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa");

  const job = await getJobForCompany(id, company.id);
  if (!job) notFound();

  const manager = isManager(session.role);
  const companyAxes = await getOrgCultureAxes(company.id);
  const applicants = await listApplicantsForJob(id, companyAxes);

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);
  const locationLabel = formatLocation({
    city: job.city,
    countryCode: job.countryCode,
    location: job.location,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={company.name} />
      {!manager ? <ReadOnlyBanner /> : null}
      <main style={{ flex: 1, padding: "40px 64px 80px", overflow: "auto" }}>
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <Link
            href="/empresa"
            style={{
              fontSize: 13,
              color: "var(--fg-dim)",
              textDecoration: "none",
            }}
          >
            ← Vacantes
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
                  {STATUS_LABEL[job.status] ?? job.status}
                </Tag>
                {job.remote ? <Tag>Remoto</Tag> : null}
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
            <p
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--fg)",
                maxWidth: 720,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {job.description}
            </p>
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
              Postulados · {applicants.length}
            </div>

            {applicants.length === 0 ? (
              <div style={{ fontSize: 14, color: "var(--fg-dim)", padding: "20px 0" }}>
                Todavía no hay postulados para esta vacante.
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
                      <Tag>{APPLICANT_STATUS_LABEL[a.status] ?? a.status}</Tag>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {a.formCompleted && a.match !== null ? (
                        <MatchPill value={a.match} size="sm" />
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                          Formulario pendiente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
