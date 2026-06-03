"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "../form-controls";
import { useT } from "@/components/locale-provider";

export function LoginForm() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.auth.login.error);
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setPending(false);
    }
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
      <Field label={t.auth.fieldPassword}>
        {(id) => (
          <TextInput
            id={id}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        )}
      </Field>
      <SubmitButton pending={pending}>{t.auth.login.submit}</SubmitButton>
    </form>
  );
}
