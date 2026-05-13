import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ComparisonBar, MatchPill } from "@/components/ui";
import {
  computeMatch,
  CULTURAL_AXES,
  isCandidateProfile,
} from "@/lib/clevy-data";
import { getCompanyBySlug } from "@/lib/clevy-db";

type Params = Promise<{ id: string }>;

function diffLabel(diff: number) {
  if (diff < 10) return "Idéntico";
  if (diff < 20) return "Muy cerca";
  if (diff < 35) return "Cerca";
  return "Divergen";
}

function matchCopy(match: number) {
  if (match >= 90)
    return "Encaje excepcional. Comparten valores fundamentales y dinámicas de trabajo.";
  if (match >= 80)
    return "Encaje fuerte. La mayoría de dimensiones están alineadas con tu perfil.";
  if (match >= 70)
    return "Encaje sólido con algunos matices — revisá los ejes donde difieren.";
  return "Encaje parcial. Vale la pena revisar qué aspectos pesan más para vos.";
}

export default async function MatchDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const company = await getCompanyBySlug(id);
  if (!company) notFound();

  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "candidate") redirect("/empresa");

  const [user] = await db
    .select({
      name: users.name,
      culturalProfile: users.culturalProfile,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/login");
  if (!isCandidateProfile(user.culturalProfile)) {
    redirect("/candidato/cuestionario");
  }

  const profile = user.culturalProfile;
  const match = computeMatch(profile.values, company.values);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={user.name ?? ""} />
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
            gap: 40,
          }}
        >
          <Link
            href="/candidato/matches"
            style={{
              alignSelf: "flex-start",
              fontSize: 13,
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            ← Volver a matches
          </Link>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 60,
              alignItems: "start",
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
                {company.industry} · {company.location}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 80,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {company.name}
              </h1>
              <p
                style={{
                  fontSize: 16,
                  color: "var(--fg-dim)",
                  marginTop: 16,
                  maxWidth: 540,
                  lineHeight: 1.55,
                }}
              >
                {company.tagline}. La afinidad cultural se calcula comparando las
                7 dimensiones de tu perfil con las de su equipo.
              </p>
            </div>
            <div
              style={{
                border: "1px solid var(--hairline-strong)",
                padding: 28,
                background: "var(--bg-2)",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
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
                  Afinidad cultural
                </div>
                <MatchPill value={match} size="sm" />
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 96,
                  lineHeight: 0.9,
                  color: "var(--accent)",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.04em",
                }}
              >
                {match}
                <span style={{ fontSize: 40, color: "var(--fg)" }}>%</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--fg-dim)",
                  lineHeight: 1.5,
                }}
              >
                {matchCopy(match)}
              </div>
              <button
                type="button"
                style={{
                  marginTop: 8,
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
                Mostrar interés
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
                Guardar para después
              </button>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--hairline)",
              paddingTop: 32,
            }}
          >
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
                Comparación por dimensión
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  fontSize: 12,
                  color: "var(--fg-dim)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--fg)",
                    }}
                  />{" "}
                  Vos
                </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />{" "}
                  {company.name}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
              }}
            >
              {CULTURAL_AXES.map((axis) => {
                const userValue = profile.values[axis.id];
                const otherValue = company.values[axis.id];
                const diff = Math.abs(userValue - otherValue);
                return (
                  <div
                    key={axis.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 80px",
                      gap: 32,
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 16,
                          fontSize: 12,
                          color: "var(--fg-dim)",
                          marginBottom: 12,
                          letterSpacing: "0.02em",
                        }}
                      >
                        <span style={{ whiteSpace: "nowrap" }}>{axis.left}</span>
                        <span style={{ whiteSpace: "nowrap" }}>{axis.right}</span>
                      </div>
                      <ComparisonBar
                        userValue={userValue}
                        otherValue={otherValue}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-instrument-serif), serif",
                        fontSize: 18,
                        color:
                          diff < 15
                            ? "var(--accent)"
                            : diff < 30
                              ? "var(--fg)"
                              : "var(--fg-dim)",
                        textAlign: "right",
                      }}
                    >
                      {diffLabel(diff)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr",
              gap: 40,
              borderTop: "1px solid var(--hairline)",
              paddingTop: 32,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 16,
                }}
              >
                Cómo trabajan en {company.name}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {company.culturalHighlights.map((h) => (
                  <div
                    key={h.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderBottom: "1px solid var(--hairline)",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: `1px solid ${h.strong ? "var(--accent)" : "var(--fg-dim)"}`,
                        background: h.strong ? "var(--accent)" : "transparent",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--bg)",
                        fontSize: 10,
                        flexShrink: 0,
                      }}
                    >
                      {h.strong ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: h.strong ? "var(--fg)" : "var(--fg-dim)",
                      }}
                    >
                      {h.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 16,
                }}
              >
                Roles abiertos
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {company.openRoles.map((r) => (
                  <div
                    key={r}
                    style={{
                      padding: "14px 16px",
                      border: "1px solid var(--hairline-strong)",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 14,
                    }}
                  >
                    <span>{r}</span>
                    <span style={{ color: "var(--fg-dim)" }}>↗</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  marginTop: 20,
                  padding: 20,
                  background: "var(--bg-2)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: "var(--fg-dim)",
                  }}
                >
                  Al mostrar interés, {company.name} verá tu perfil cultural. Tu
                  nombre completo y CV solo se comparten si te contactan.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
