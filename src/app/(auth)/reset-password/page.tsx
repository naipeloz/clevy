import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { AuthShell } from "../auth-shell";
import { ResetPasswordForm } from "./reset-password-form";

type SearchParams = Promise<{ token?: string }>;

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { token } = await searchParams;
  const t = await getDict();

  return (
    <AuthShell
      eyebrow={t.auth.reset.eyebrow}
      title={<>{t.auth.reset.title}</>}
      subtitle={t.auth.reset.subtitle}
      footer={
        <Link
          href="/login"
          style={{
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {t.auth.reset.backToLogin}
        </Link>
      }
    >
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div
          role="alert"
          style={{
            padding: "10px 14px",
            border: "1px solid var(--warm)",
            color: "var(--warm)",
            borderRadius: 4,
            fontSize: 13,
            background: "var(--bg)",
          }}
        >
          {t.auth.reset.missingToken}
        </div>
      )}
    </AuthShell>
  );
}
