import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { isCompanyCulture } from "@/lib/clevy-data";

export default async function EmpresaHome() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const [user] = await db
    .select({ name: users.name, culturalProfile: users.culturalProfile })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (isCompanyCulture(user?.culturalProfile)) {
    redirect("/empresa/candidatos");
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
          Paso 1 de 2
        </span>
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 64,
            lineHeight: 1.02,
            letterSpacing: "-0.03em",
            margin: 0,
            fontWeight: 400,
            maxWidth: 760,
          }}
        >
          Definí la <em style={{ color: "var(--accent)" }}>cultura</em> de tu
          equipo.
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            maxWidth: 560,
          }}
        >
          Vamos a cuantificar los valores que definen cómo trabajan. Después
          recibís candidatos con afinidad cultural medible.
        </p>
        <Link
          href="/empresa/cultura"
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
          Comenzar
          <span aria-hidden>→</span>
        </Link>
      </main>
    </div>
  );
}
