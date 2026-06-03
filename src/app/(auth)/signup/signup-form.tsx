"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ErrorBanner,
  Field,
  RoleToggle,
  SubmitButton,
  TextInput,
} from "../form-controls";
import { useT } from "@/components/locale-provider";

type Role = "candidate" | "company";

export function SignupForm({
  initialRole,
  invite = null,
  inviteEmail = null,
  inviteIsCandidate = false,
}: {
  initialRole: Role;
  invite?: string | null;
  inviteEmail?: string | null;
  inviteIsCandidate?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(inviteEmail ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isInvite = Boolean(invite);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const payload = isInvite
        ? { email, name, password, invite }
        : {
            email,
            name,
            password,
            // "company" self-signup becomes the HR manager (hiring_manager).
            role: role === "company" ? "hiring_manager" : "candidate",
          };
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.auth.signup.error);
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
      {!isInvite ? <RoleToggle value={role} onChange={setRole} /> : null}
      <Field label={t.auth.yourName}>
        {(id) => (
          <TextInput
            id={id}
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ana Restrepo"
          />
        )}
      </Field>
      <Field label={t.auth.fieldEmail} hint={isInvite ? t.auth.emailFromInvite : undefined}>
        {(id) => (
          <TextInput
            id={id}
            type="email"
            name="email"
            autoComplete="email"
            required
            readOnly={isInvite}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            style={isInvite ? { opacity: 0.7 } : undefined}
          />
        )}
      </Field>
      <Field label={t.auth.fieldPassword} hint={t.auth.passwordHint}>
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
      <SubmitButton pending={pending}>
        {isInvite
          ? inviteIsCandidate
            ? t.auth.signup.submitCandidate
            : t.auth.signup.submitJoin
          : role === "company"
            ? t.auth.signup.submitCompany
            : t.auth.signup.submitCandidate}
      </SubmitButton>
    </form>
  );
}
