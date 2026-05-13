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

type Role = "candidate" | "company";

export function SignupForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password,
          role: role === "company" ? "recruiter" : "candidate",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la cuenta");
        return;
      }
      router.push(data.redirectTo ?? "/");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
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
      <RoleToggle value={role} onChange={setRole} />
      <Field label={role === "company" ? "Nombre del contacto" : "Tu nombre"}>
        {(id) => (
          <TextInput
            id={id}
            type="text"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === "company" ? "Ana de Línea Studio" : "Ana Restrepo"}
          />
        )}
      </Field>
      <Field label="Email">
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
      <Field label="Contraseña" hint="Mínimo 8 caracteres.">
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
        {role === "company" ? "Crear cuenta de empresa" : "Crear mi perfil"}
      </SubmitButton>
    </form>
  );
}
