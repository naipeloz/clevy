import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { AxisMeter } from "@/components/ui";
import {
  CULTURAL_AXES,
  isCandidateProfile,
  type AxisId,
} from "@/lib/clevy-data";

function describe(axis: AxisId, v: number): string {
  const labels: Record<AxisId, [string, string, string]> = {
    pace: [
      "Necesita ritmo pausado, con tiempo para pensar.",
      "Ritmo enfocado, no frenético.",
      "Energizado por la intensidad y la acción.",
    ],
    autonomy: [
      "Le funciona la estructura clara y procesos definidos.",
      "Busca autonomía con respaldo.",
      "Quiere decidir el cómo sin pedir permiso.",
    ],
    collab: [
      "Rinde solo, con foco protegido.",
      "Colaborativa con espacios de foco.",
      "Mejor versión en colaboración constante.",
    ],
    hierarchy: [
      "Prefiere estructuras horizontales.",
      "Algo de jerarquía cuando ayuda.",
      "Le funciona una cadena clara de mando.",
    ],
    risk: [
      "Valora la estabilidad y la predictibilidad.",
      "Abierto a experimentar con guardrails.",
      "Quiere probar rápido aunque algo falle.",
    ],
    communication: [
      "Comunicación directa y concisa.",
      "Directa pero con contexto.",
      "Contextual y empática por encima de la velocidad.",
    ],
    worklife: [
      "Límites claros entre trabajo y vida.",
      "Algo de mezcla puntual cuando hace sentido.",
      "Trabajo y vida personal se mezclan con naturalidad.",
    ],
  };
  const idx = v < 35 ? 0 : v < 65 ? 1 : 2;
  return labels[axis][idx];
}

export default async function PerfilPage() {
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
                Tu perfil cultural · Recién generado
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
                Así trabajás
                <br />
                mejor,{" "}
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
                Volver a refinar
              </Link>
              <Link
                href="/candidato/matches"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "11px 22px",
                  background: "var(--accent)",
                  color: "var(--bg)",
                  border: "1px solid var(--accent)",
                  borderRadius: 4,
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                Ver mis matches →
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
              7 dimensiones culturales
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
                      leftLabel={axis.left}
                      rightLabel={axis.right}
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
                      &ldquo;{describe(axis.id, v)}&rdquo;
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
