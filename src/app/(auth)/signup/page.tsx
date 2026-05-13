import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ role?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  const { role } = await searchParams;
  const initialRole = role === "company" ? "company" : "candidate";

  return (
    <AuthShell
      eyebrow="Crear cuenta"
      title={<>Empezá tu perfil cultural.</>}
      subtitle="En menos de 10 minutos vas a tener un perfil cuantificado y matches con afinidad real."
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
      <SignupForm initialRole={initialRole} />
    </AuthShell>
  );
}
