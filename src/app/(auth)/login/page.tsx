import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AuthShell } from "../auth-shell";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  const t = await getDict();

  return (
    <AuthShell
      eyebrow={t.auth.login.eyebrow}
      title={<>{t.auth.login.title}</>}
      subtitle={t.auth.login.subtitle}
      footer={
        <>
          {t.auth.login.footerQuestion}{" "}
          <Link
            href="/signup"
            style={{
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t.auth.login.footerCta}
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
