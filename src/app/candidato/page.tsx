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
  if (session.role !== "candidate") redirect("/empresa");

  const [user] = await db
    .select({ name: users.name, culturalProfile: users.culturalProfile })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  // Already completed → go straight to the result.
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 48px",
          textAlign: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          Tu perfil cultural
        </span>
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            margin: 0,
            fontWeight: 400,
            maxWidth: 720,
          }}
        >
          Descubrí <em style={{ color: "var(--accent)" }}>cómo trabajás</em> mejor.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            maxWidth: 520,
          }}
        >
          Respondé un formulario corto de 6 preguntas. Vas a obtener tu perfil
          cultural en 7 dimensiones — lo podés editar cuando quieras.
        </p>
        <Link
          href="/candidato/cuestionario"
          style={{
            marginTop: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "14px 28px",
            fontSize: 15,
            fontWeight: 500,
            background: "var(--accent)",
            color: "var(--bg)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          Completar formulario
          <span aria-hidden>→</span>
        </Link>
      </main>
    </div>
  );
}
