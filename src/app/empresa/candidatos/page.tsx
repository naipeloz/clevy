import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentSession, isManager } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Avatar, ReadOnlyBanner, Tag } from "@/components/ui";
import { COMPANY_VALUES_OPTIONS } from "@/lib/clevy-data";
import { listCandidatesScored } from "@/lib/clevy-db";
import {
  getCompanyForUser,
  getCompanyCultureMeta,
  getOrgCultureAxes,
} from "@/lib/company-db";
import { CandidateTabs } from "./candidate-tabs";

type SearchParams = Promise<{ tab?: string }>;

export default async function CompanyDashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { tab } = await searchParams;
  const activeTab =
    tab === "reviewed" || tab === "contacted" ? tab : "new";

  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");

  const manager = isManager(session.role);
  const company = await getCompanyForUser(session.userId);
  // /empresa handles the manager onboarding (create company) and the support
  // "not linked / culture not ready" states — keep those redirects there.
  if (!company) redirect("/empresa");
  if (!company.hasCulture) {
    if (manager) redirect("/empresa/cultura");
    redirect("/empresa");
  }

  const [companyAxes, cultureMeta] = await Promise.all([
    getOrgCultureAxes(company.id),
    getCompanyCultureMeta(company.id),
  ]);
  const scored = await listCandidatesScored(companyAxes);

  const counts = {
    new: scored.filter((c) => c.status === "new").length,
    reviewed: scored.filter((c) => c.status === "reviewed").length,
    contacted: scored.filter((c) => c.status === "contacted").length,
  };

  const filtered = scored
    .filter((c) => c.status === activeTab)
    .sort((a, b) => b.match - a.match);

  const valueLabels = (cultureMeta?.selected ?? [])
    .map((id) => COMPANY_VALUES_OPTIONS.find((v) => v.id === id)?.label)
    .filter((x): x is string => Boolean(x));

  const highMatch = scored.filter((c) => c.match >= 80).length;
  const contacted = counts.contacted;
  const avgMatch =
    scored.reduce((s, c) => s + c.match, 0) / Math.max(1, scored.length);

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
      <main
        style={{
          flex: 1,
          padding: "40px 64px 80px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1240,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gap: 48,
              alignItems: "end",
            }}
          >
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
                {company.name}
                {company.industry ? ` · ${company.industry}` : ""}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 56,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Candidatos que encajan
                <br />
                en cómo trabajan.
              </h1>
            </div>
            <div
              style={{
                border: "1px solid var(--hairline)",
                padding: 20,
                background: "var(--bg-2)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
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
                  Su perfil cultural
                </div>
                <Link
                  href="/empresa/cultura"
                  style={{
                    fontSize: 12,
                    color: "var(--fg)",
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Editar
                </Link>
              </div>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
              >
                {valueLabels.map((label) => (
                  <Tag key={label} tone="accent">
                    {label}
                  </Tag>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 0,
              borderTop: "1px solid var(--fg)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            {[
              { k: "Candidatos con ≥80% fit", v: String(highMatch).padStart(2, "0") },
              { k: "Contactados esta semana", v: String(contacted).padStart(2, "0") },
              { k: "Match promedio", v: `${Math.round(avgMatch)}%` },
              { k: "Tiempo promedio a match", v: "2.3d" },
            ].map((s, i) => (
              <div
                key={s.k}
                style={{
                  padding: "24px 28px",
                  borderRight: i < 3 ? "1px solid var(--hairline)" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--fg-dim)",
                    marginBottom: 8,
                  }}
                >
                  {s.k}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-instrument-serif), serif",
                    fontSize: 42,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.v}
                </div>
              </div>
            ))}
          </div>

          <CandidateTabs counts={counts} activeTab={activeTab} />

          <div
            style={{ display: "flex", flexDirection: "column" }}
          >
            {filtered.length === 0 ? (
              <div
                style={{
                  padding: "32px 4px",
                  fontSize: 14,
                  color: "var(--fg-dim)",
                }}
              >
                No hay candidatos en esta pestaña todavía.
              </div>
            ) : (
              filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/empresa/candidatos/${c.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1.2fr 1.2fr 1.5fr 100px 30px",
                    gap: 24,
                    padding: "22px 4px",
                    alignItems: "center",
                    borderBottom: "1px solid var(--hairline)",
                    textDecoration: "none",
                    color: "var(--fg)",
                  }}
                >
                  <Avatar name={c.name} size={40} />
                  <div>
                    <div
                      style={{
                        fontSize: 17,
                        fontFamily: "var(--font-instrument-serif), serif",
                        letterSpacing: "-0.005em",
                      }}
                    >
                      {c.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--fg-dim)",
                        marginTop: 2,
                      }}
                    >
                      {c.role}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                    {c.location}
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: 4 }}
                  >
                    {c.highlights.map((h) => (
                      <Tag key={h}>{h}</Tag>
                    ))}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-instrument-serif), serif",
                      fontSize: 30,
                      color:
                        c.match >= 85 ? "var(--accent)" : "var(--fg)",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                      textAlign: "right",
                    }}
                  >
                    {c.match}
                    <span style={{ fontSize: 16 }}>%</span>
                  </div>
                  <span style={{ color: "var(--fg-dim)" }}>→</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
