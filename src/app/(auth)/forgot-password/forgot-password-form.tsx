"use client";

import { useState } from "react";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "../form-controls";
import { useT } from "@/components/locale-provider";

export function ForgotPasswordForm() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.auth.forgot.error);
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
        {t.auth.forgot.success}
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
      <Field label={t.auth.fieldEmail}>
        {(id) => (
          <TextInput
            id={id}
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
          />
        )}
      </Field>
      <SubmitButton pending={pending}>{t.auth.forgot.submit}</SubmitButton>
    </form>
  );
}
