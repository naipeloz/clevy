import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { isCandidateProfile } from "@/lib/clevy-data";

export default async function CandidatoHome() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select({ name: users.name, culturalProfile: users.culturalProfile })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (isCandidateProfile(user?.culturalProfile)) {
    redirect("/candidato/perfil");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={user?.name ?? ""} />
      <main
        style={{
          flex: 1,
          padding: "48px 64px",
          maxWidth: 1080,
          width: "100%",
          marginInline: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 48,
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
            Paso 1 de 3
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 64,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 400,
            }}
          >
            ¿Cómo prefieres construir
            <br />
            tu perfil cultural?
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--fg-dim)",
              marginTop: 16,
              maxWidth: 560,
            }}
          >
            Ambos caminos llegan al mismo perfil. Elige el que se sienta más
            natural — puedes cambiar cuando quieras.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <MethodCard
            href="/candidato/cuestionario"
            eyebrow="Cuestionario"
            time="6 min"
            title="Preguntas guiadas"
            description="18 preguntas estructuradas, cada una te ubica en un eje cultural. Directo y claro."
            best="Si ya tienes claro lo que buscas."
          />
          <MethodCard
            href="/candidato/agente"
            eyebrow="Agente conversacional"
            time="8–12 min"
            title="Conversar con IA"
            description="Una conversación abierta donde cuentas sobre tu experiencia. El agente extrae el perfil al final."
            best="Si prefieres pensar hablando."
            featured
          />
        </div>
      </main>
    </div>
  );
}

function MethodCard({
  href,
  eyebrow,
  time,
  title,
  description,
  best,
  featured,
}: {
  href: string;
  eyebrow: string;
  time: string;
  title: string;
  description: string;
  best: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: "none",
        textAlign: "left",
        background: featured ? "var(--fg)" : "var(--bg-2)",
        color: featured ? "var(--bg)" : "var(--fg)",
        border: `1px solid ${
          featured ? "var(--fg)" : "var(--hairline-strong)"
        }`,
        padding: 32,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: `1px solid ${
              featured ? "var(--bg)" : "var(--hairline-strong)"
            }`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 22,
          }}
        >
          {featured ? "✦" : "≡"}
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            opacity: 0.7,
          }}
        >
          {eyebrow} · {time}
        </span>
      </div>
      <div>
        <div
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 38,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            marginTop: 12,
            marginBottom: 0,
            opacity: 0.8,
          }}
        >
          {description}
        </p>
      </div>
      <div
        style={{
          fontSize: 12,
          opacity: 0.65,
          paddingTop: 16,
          borderTop: `1px solid ${
            featured ? "var(--bg)" : "var(--hairline)"
          }`,
        }}
      >
        Ideal: {best}
      </div>
    </Link>
  );
}
