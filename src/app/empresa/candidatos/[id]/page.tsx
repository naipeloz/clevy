import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Avatar, ComparisonBar } from "@/components/ui";
import {
  computeMatch,
  CULTURAL_AXES,
  isCompanyCulture,
} from "@/lib/clevy-data";
import { getCandidateBySlug } from "@/lib/clevy-db";

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

  const [user] = await db
    .select({
      name: users.name,
      culturalProfile: users.culturalProfile,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) redirect("/login");
  if (!isCompanyCulture(user.culturalProfile)) {
    redirect("/empresa/cultura");
  }

  const culture = user.culturalProfile;
  const match = computeMatch(culture.axes, candidate.values);

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
            ← Volver a candidatos
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
                  Completó su perfil cultural conversando con el agente.
                  Todavía no ve tu marca — solo el perfil.
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
                Afinidad cultural
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
                  Contactar candidato
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
                  Guardar para revisar
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
                Lo que busca
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
                Señales fuertes
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
                Podría fricción
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
                Comparación cultural
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
                  Su perfil
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
                  Su equipo
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
              {CULTURAL_AXES.map((axis) => {
                const candidateValue = candidate.values[axis.id];
                const companyValue = culture.axes[axis.id];
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
                      {axis.left} ↔ {axis.right}
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
                Notas del agente
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
