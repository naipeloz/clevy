import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, invitations } from "@/db/schema";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ role?: string; invite?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  const { role, invite } = await searchParams;

  // Invitation flow: prefill the invited email and the company name.
  let inviteEmail: string | null = null;
  let inviteCompany: string | null = null;
  let inviteValid = false;
  let inviteIsCandidate = false;
  if (invite) {
    const [inv] = await db
      .select({
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        companyName: companies.name,
      })
      .from(invitations)
      .leftJoin(companies, eq(companies.id, invitations.companyId))
      .where(eq(invitations.token, invite))
      .limit(1);
    // Expiry is enforced by the signup route on submit; here we only prefill.
    if (inv && inv.status === "pending") {
      inviteEmail = inv.email;
      inviteCompany = inv.companyName ?? null;
      inviteIsCandidate = inv.role === "candidate";
      inviteValid = true;
    }
  }

  const initialRole = role === "company" ? "company" : "candidate";

  return (
    <AuthShell
      eyebrow={inviteValid ? "Aceptar invitación" : "Crear cuenta"}
      title={
        inviteValid ? (
          inviteIsCandidate ? (
            <>Completá tu perfil cultural.</>
          ) : inviteCompany ? (
            <>Unite al equipo de {inviteCompany}.</>
          ) : (
            <>Unite al equipo.</>
          )
        ) : (
          <>Empezá tu perfil cultural.</>
        )
      }
      subtitle={
        inviteValid
          ? inviteIsCandidate
            ? "Creá tu cuenta y respondé un formulario corto para ver tu perfil cultural."
            : "Creá tu cuenta para colaborar monitoreando vacantes y postulaciones."
          : "En menos de 10 minutos vas a tener un perfil cuantificado y matches con afinidad real."
      }
      footer={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Iniciar sesión
          </Link>
        </>
      }
    >
      <SignupForm
        initialRole={initialRole}
        invite={inviteValid ? (invite ?? null) : null}
        inviteEmail={inviteEmail}
        inviteIsCandidate={inviteIsCandidate}
      />
    </AuthShell>
  );
}
