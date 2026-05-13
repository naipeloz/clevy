import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { Tag } from "@/components/ui";
import { isCandidateProfile } from "@/lib/clevy-data";
import { listCompaniesScored } from "@/lib/clevy-db";

export default async function MatchesPage() {
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
  const scored = await listCompaniesScored(profile.values);
  const newThisWeek = scored.filter((c) => c.match >= 70).length;

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
          padding: "40px 64px 80px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
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
                Matches · {newThisWeek} compatibles esta semana
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
                Empresas donde encajás.
              </h1>
            </div>
            <Link
              href="/candidato/perfil"
              style={{
                fontSize: 13,
                color: "var(--fg)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Ver mi perfil
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid var(--fg)",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            {scored.map((c) => (
              <Link
                key={c.id}
                href={`/candidato/matches/${c.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1.4fr 1fr 1fr auto",
                  gap: 24,
                  padding: "28px 4px",
                  alignItems: "center",
                  borderBottom: "1px solid var(--hairline)",
                  textDecoration: "none",
                  color: "var(--fg)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-instrument-serif), serif",
                    fontSize: 40,
                    color:
                      c.match >= 85 ? "var(--accent)" : "var(--fg)",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {c.match}
                  <span style={{ fontSize: 20 }}>%</span>
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-instrument-serif), serif",
                      fontSize: 26,
                      letterSpacing: "-0.01em",
                      marginBottom: 4,
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
                    {c.tagline}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--fg-dim)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div>{c.location}</div>
                  <div>{c.industry}</div>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
                >
                  {c.culturalHighlights
                    .filter((h) => h.strong)
                    .slice(0, 2)
                    .map((h) => (
                      <Tag
                        key={h.label}
                        tone={c.match >= 85 ? "accent" : "default"}
                      >
                        {h.label}
                      </Tag>
                    ))}
                </div>
                <span style={{ fontSize: 20, color: "var(--fg-dim)" }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
