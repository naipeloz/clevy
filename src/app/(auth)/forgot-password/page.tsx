import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { AuthShell } from "../auth-shell";
import { ForgotPasswordForm } from "./forgot-password-form";

export default async function ForgotPasswordPage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  const t = await getDict();

  return (
    <AuthShell
      eyebrow={t.auth.forgot.eyebrow}
      title={<>{t.auth.forgot.title}</>}
      subtitle={t.auth.forgot.subtitle}
      footer={
        <Link
          href="/login"
          style={{
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {t.auth.forgot.backToLogin}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
