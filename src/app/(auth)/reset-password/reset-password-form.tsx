"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "../form-controls";
import { useT } from "@/components/locale-provider";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useT();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.auth.reset.error);
        return;
      }
      setDone(true);
    } catch {
      setError(t.common.networkError);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div
          role="status"
          style={{
            padding: "12px 16px",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 4,
            fontSize: 14,
            lineHeight: 1.5,
            color: "var(--fg-dim)",
            background: "var(--bg)",
          }}
        >
          {t.auth.reset.success}
        </div>
        <Link
          href="/login"
          style={{
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 28px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            fontSize: 15,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          {t.auth.login.submit}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 18 }}
      noValidate
    >
      <ErrorBanner message={error} />
      <Field label={t.auth.reset.fieldPassword} hint={t.auth.passwordHint}>
        {(id) => (
          <TextInput
            id={id}
            type="password"
            name="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        )}
      </Field>
      <SubmitButton pending={pending}>{t.auth.reset.submit}</SubmitButton>
    </form>
  );
}
