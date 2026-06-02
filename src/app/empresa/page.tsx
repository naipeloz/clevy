import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { ReadOnlyBanner, Tag } from "@/components/ui";
import { getCompanyForUser, listJobsForCompany } from "@/lib/company-db";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  open: "Abierta",
  paused: "Pausada",
  closed: "Cerrada",
};

export default async function EmpresaHome() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "candidate") redirect("/candidato");

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (!user) redirect("/login");

  const manager = isManager(session.role);
  const company = await getCompanyForUser(session.userId);
  // Onboarding (create company / define culture) is manager-only. HR support
  // never gets sent to those pages — that would bounce back into a redirect loop.
  if (!company) {
    if (manager) redirect("/empresa/perfil");
    return <NoCompanyState userName={user.name ?? ""} />;
  }
  if (!company.hasCulture && manager) redirect("/empresa/cultura");

  const jobs = await listJobsForCompany(company.id);

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
      {!manager ? <ReadOnlyBanner /> : null}
      <main style={{ flex: 1, padding: "40px 64px 80px", overflow: "auto" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {!company.hasCulture ? (
            <div
              style={{
                padding: "12px 16px",
                border: "1px solid var(--hairline-strong)",
                borderRadius: 6,
                background: "var(--bg-2)",
                fontSize: 13,
                color: "var(--fg-dim)",
              }}
            >
              El HR manager todavía no definió la cultura de la empresa. Los
              matches con candidatos aparecerán cuando lo haga.
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 24,
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
                {manager ? "" : " · Solo lectura"}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 52,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                Vacantes
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Link
                href="/empresa/candidatos"
                style={linkStyle}
              >
                Pool de talento
              </Link>
              {manager ? (
                <>
                  <Link href="/empresa/equipo" style={linkStyle}>
                    Equipo
                  </Link>
                  <Link href="/empresa/perfil" style={linkStyle}>
                    Editar empresa
                  </Link>
                  <Link href="/empresa/vacantes/nueva" style={primaryBtnStyle}>
                    Nueva vacante <span aria-hidden>→</span>
                  </Link>
                </>
              ) : null}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 0.8fr 30px",
                gap: 24,
                padding: "0 4px 12px",
                borderBottom: "1px solid var(--fg)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              <span>Vacante</span>
              <span>Ubicación</span>
              <span>Estado</span>
              <span style={{ textAlign: "right" }}>Postulados</span>
              <span />
            </div>

            {jobs.length === 0 ? (
              <div
                style={{
                  padding: "40px 4px",
                  fontSize: 14,
                  color: "var(--fg-dim)",
                }}
              >
                Todavía no hay vacantes.{" "}
                {manager ? (
                  <Link
                    href="/empresa/vacantes/nueva"
                    style={{
                      color: "var(--fg)",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                    }}
                  >
                    Creá la primera →
                  </Link>
                ) : null}
              </div>
            ) : (
              jobs.map((j) => (
                <Link
                  key={j.id}
                  href={`/empresa/vacantes/${j.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 0.8fr 30px",
                    gap: 24,
                    padding: "20px 4px",
                    alignItems: "center",
                    borderBottom: "1px solid var(--hairline)",
                    textDecoration: "none",
                    color: "var(--fg)",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-instrument-serif), serif",
                      fontSize: 19,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {j.title}
                    {j.remote ? (
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--fg-dim)",
                          marginLeft: 8,
                          fontFamily: "var(--font-inter), sans-serif",
                        }}
                      >
                        Remoto
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                    {j.location || "—"}
                  </div>
                  <div>
                    <Tag tone={j.status === "open" ? "accent" : "default"}>
                      {STATUS_LABEL[j.status] ?? j.status}
                    </Tag>
                  </div>
                  <div
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      textAlign: "right",
                      fontSize: 16,
                    }}
                  >
                    {j.applicantCount}
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

function NoCompanyState({ userName }: { userName: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={userName} />
      <ReadOnlyBanner />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 48px",
          textAlign: "center",
          gap: 14,
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 40,
            letterSpacing: "-0.02em",
            margin: 0,
            fontWeight: 400,
          }}
        >
          Tu cuenta todavía no está vinculada a una empresa.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "var(--fg-dim)",
            maxWidth: 460,
            lineHeight: 1.6,
          }}
        >
          Pedile al HR manager que te reenvíe la invitación o que verifique que
          tu cuenta quedó asociada al equipo.
        </p>
      </main>
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  fontSize: 13,
  color: "var(--fg)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
};

const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 500,
  background: "var(--accent)",
  color: "var(--bg)",
  border: "1px solid var(--accent)",
  borderRadius: 4,
  textDecoration: "none",
};
