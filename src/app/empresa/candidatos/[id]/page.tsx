import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { Avatar, ComparisonBar } from "@/components/ui";
import { computeMatch, CULTURAL_AXES } from "@/lib/clevy-data";
import { getCandidateBySlug } from "@/lib/clevy-db";
import { getCompanyForUser, getOrgCultureAxes } from "@/lib/company-db";

type Params = Promise<{ id: string }>;

export default async function CompanyCandidateDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const candidate = await getCandidateBySlug(id);
  if (!candidate) notFound();

  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");

  const t = await getDict();
  const company = await getCompanyForUser(session.userId);
  if (!company) redirect("/empresa");
  if (!company.hasCulture) redirect(isManager(session.role) ? "/empresa/cultura" : "/empresa");

  const companyAxes = await getOrgCultureAxes(company.id);
  const match = computeMatch(companyAxes, candidate.values);

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
      <main
        style={{
          flex: 1,
          padding: "32px 64px 80px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 36,
          }}
        >
          <Link
            href="/empresa/candidatos"
            style={{
              alignSelf: "flex-start",
              fontSize: 13,
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t.candidatos.detailBack}
          </Link>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 60,
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <Avatar name={candidate.name} size={88} />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                    marginBottom: 10,
                  }}
                >
                  {candidate.role} · {candidate.location}
                </div>
                <h1
                  style={{
                    fontFamily: "var(--font-instrument-serif), serif",
                    fontSize: 64,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    margin: 0,
                    fontWeight: 400,
                  }}
                >
                  {candidate.name}
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    color: "var(--fg-dim)",
                    marginTop: 14,
                    maxWidth: 480,
                    lineHeight: 1.5,
                  }}
                >
                  {t.candidatos.completedNote}
                </p>
              </div>
            </div>
            <div
              style={{
                border: "1px solid var(--hairline-strong)",
                padding: 28,
                background: "var(--bg-2)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
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
                {t.candidatos.affinity}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 88,
                  lineHeight: 0.9,
                  color: "var(--accent)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.04em",
                }}
              >
                {match}
                <span style={{ fontSize: 36, color: "var(--fg)" }}>%</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  style={{
                    padding: "12px 22px",
                    background: "var(--accent)",
                    color: "var(--bg)",
                    border: "1px solid var(--accent)",
                    borderRadius: 4,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {t.candidatos.contact}
                </button>
                <button
                  type="button"
                  style={{
                    padding: "8px 16px",
                    background: "transparent",
                    color: "var(--fg)",
                    border: "1px solid var(--hairline-strong)",
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {t.candidatos.saveForLater}
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 0,
              borderTop: "1px solid var(--fg)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            <div
              style={{
                padding: "24px 28px 24px 0",
                borderRight: "1px solid var(--hairline)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 12,
                }}
              >
                {t.candidatos.whatTheySeek}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 18,
                  lineHeight: 1.35,
                }}
              >
                {candidate.highlights.slice(0, 3).join(" · ")}
              </div>
            </div>
            <div
              style={{
                padding: "24px 28px",
                borderRight: "1px solid var(--hairline)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 12,
                }}
              >
                {t.candidatos.strongSignals}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 18,
                  lineHeight: 1.35,
                }}
              >
                {candidate.signals.join(" · ")}
              </div>
            </div>
            <div style={{ padding: "24px 0 24px 28px" }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 12,
                }}
              >
                {t.candidatos.friction}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 18,
                  lineHeight: 1.35,
                  color: "var(--fg-dim)",
                }}
              >
                {candidate.frictions.join(" · ")}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: 24,
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
                {t.candidatos.culturalComparison}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 12,
                  color: "var(--fg-dim)",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />{" "}
                  {t.candidatos.theirProfile}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--fg)",
                    }}
                  />{" "}
                  {t.candidatos.yourTeam}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {CULTURAL_AXES.map((axis) => {
                const candidateValue = candidate.values[axis.id];
                const companyValue = companyAxes[axis.id];
                return (
                  <div
                    key={axis.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "220px 1fr",
                      gap: 24,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                      {t.axes[axis.id].left} ↔ {t.axes[axis.id].right}
                    </div>
                    <ComparisonBar
                      userValue={candidateValue}
                      otherValue={companyValue}
                      userColor="var(--accent)"
                      otherColor="var(--fg)"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              padding: 24,
              border: "1px solid var(--hairline)",
              background: "var(--bg-2)",
              borderRadius: 6,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                }}
              >
                ✦
              </span>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                }}
              >
                {t.candidatos.notes}
              </div>
            </div>
            <div
              style={{
                fontSize: 15,
                lineHeight: 1.6,
                fontStyle: "italic",
                color: "var(--fg)",
              }}
            >
              &ldquo;{candidate.agentNote}&rdquo;
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
