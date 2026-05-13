import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  return (
    <AuthShell
      eyebrow="Iniciar sesión"
      title={<>Hola de nuevo.</>}
      subtitle="Entra a tu cuenta para ver tus matches y seguir construyendo tu perfil cultural."
      footer={
        <>
          ¿Todavía no tenés cuenta?{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Crear cuenta
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
