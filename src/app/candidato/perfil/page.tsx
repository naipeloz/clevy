import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { AxisMeter } from "@/components/ui";
import { CULTURAL_AXES, isCandidateProfile } from "@/lib/clevy-data";

function describeIndex(v: number): 0 | 1 | 2 {
  return v < 35 ? 0 : v < 65 ? 1 : 2;
}

export default async function PerfilPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "candidate") redirect("/empresa");

  const t = await getDict();

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
  const firstName = (user.name ?? "").split(" ")[0] || "tú";

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
            maxWidth: 1040,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 12,
                }}
              >
                {t.candidato.perfilEyebrow}
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 72,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.02,
                  margin: 0,
                  fontWeight: 400,
                }}
              >
                {t.candidato.perfilTitlePre}
                <em style={{ color: "var(--accent)" }}>{firstName}</em>.
              </h1>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Link
                href="/candidato/cuestionario"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "11px 20px",
                  background: "transparent",
                  color: "var(--fg)",
                  border: "1px solid var(--hairline-strong)",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                {t.candidato.perfilEdit}
              </Link>
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
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 24,
              }}
            >
              {t.candidato.perfilDimensions}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              {CULTURAL_AXES.map((axis) => {
                const v = profile.values[axis.id];
                return (
                  <div
                    key={axis.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.6fr 1fr",
                      gap: 40,
                      alignItems: "center",
                    }}
                  >
                    <AxisMeter
                      leftLabel={t.axes[axis.id].left}
                      rightLabel={t.axes[axis.id].right}
                      value={v}
                    />
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--fg-dim)",
                        fontStyle: "italic",
                        lineHeight: 1.4,
                      }}
                    >
                      &ldquo;{t.describe[axis.id][describeIndex(v)]}&rdquo;
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
