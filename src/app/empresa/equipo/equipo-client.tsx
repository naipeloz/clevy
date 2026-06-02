"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, Tag } from "@/components/ui";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "@/app/(auth)/form-controls";

type Member = { id: string; name: string; email: string; isManager: boolean };
type InviteRole = "recruiter" | "candidate";
type Pending = {
  id: string;
  email: string;
  token: string;
  role: "candidate" | "support";
};

function absoluteInviteUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/signup?invite=${token}`;
}

export function EquipoClient({
  manager,
  members,
  pending,
}: {
  manager: boolean;
  members: Member[];
  pending: Pending[];
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  // Support can only invite candidates; managers default to inviting support.
  const [role, setRole] = useState<InviteRole>(
    manager ? "recruiter" : "candidate"
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastInvite, setLastInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    setLastInvite(null);
    try {
      const res = await fetch("/api/company/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        inviteUrl?: string;
      };
      if (!res.ok || !data.inviteUrl) {
        setError(data.error ?? "No se pudo generar la invitación");
        return;
      }
      const token = data.inviteUrl.split("invite=")[1] ?? "";
      setLastInvite(absoluteInviteUrl(token));
      setEmail("");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; the link is still selectable on screen.
    }
  }

  async function revoke(id: string) {
    await fetch(`/api/company/invitations/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main style={{ flex: 1, padding: "40px 64px 80px", overflow: "auto" }}>
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <div>
          <Link
            href="/empresa"
            style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
          >
            ← Vacantes
          </Link>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 48,
              letterSpacing: "-0.03em",
              margin: "16px 0 0",
              fontWeight: 400,
            }}
          >
            Equipo
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "var(--fg-dim)",
              marginTop: 12,
              lineHeight: 1.55,
            }}
          >
            {manager
              ? "Invitá colegas de HR como soporte (solo lectura), o invitá candidatos a completar su perfil cultural."
              : "Invitá candidatos a completar su perfil cultural."}
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            borderTop: "1px solid var(--hairline)",
            paddingTop: 28,
          }}
        >
          {manager ? (
            <Field label="A quién invitás">
              {() => (
                <div
                  role="tablist"
                  aria-label="Tipo de invitación"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 4,
                    border: "1px solid var(--hairline-strong)",
                    borderRadius: 999,
                    padding: 3,
                    maxWidth: 360,
                  }}
                >
                  {(
                    [
                      ["recruiter", "HR Support"],
                      ["candidate", "Candidato"],
                    ] as const
                  ).map(([value, label]) => {
                    const active = role === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setRole(value)}
                        style={{
                          padding: "8px 14px",
                          fontSize: 13,
                          border: "none",
                          borderRadius: 999,
                          background: active ? "var(--fg)" : "transparent",
                          color: active ? "var(--bg)" : "var(--fg)",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </Field>
          ) : null}

          <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <Field
                label={role === "candidate" ? "Email del candidato" : "Email del colega"}
              >
                {(id) => (
                  <TextInput
                    id={id}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      role === "candidate"
                        ? "candidato@correo.com"
                        : "colega@empresa.com"
                    }
                  />
                )}
              </Field>
            </div>
            <SubmitButton pending={submitting}>Generar invitación</SubmitButton>
          </div>
        </form>

        {error ? <ErrorBanner message={error} /> : null}

        {lastInvite ? (
          <div
            style={{
              border: "1px solid var(--accent)",
              borderRadius: 6,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "var(--bg-2)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              Link de invitación — compartilo
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <code
                style={{
                  flex: 1,
                  fontSize: 13,
                  wordBreak: "break-all",
                  color: "var(--fg)",
                }}
              >
                {lastInvite}
              </code>
              <button
                type="button"
                onClick={() => copy(lastInvite)}
                style={{
                  padding: "8px 14px",
                  fontSize: 13,
                  border: "1px solid var(--accent)",
                  borderRadius: 4,
                  background: "var(--accent)",
                  color: "var(--bg)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        ) : null}

        {pending.length > 0 ? (
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 12,
              }}
            >
              Invitaciones pendientes
            </div>
            {pending.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 4px",
                  borderBottom: "1px solid var(--hairline)",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 14 }}>{p.email}</span>
                  <Tag tone={p.role === "candidate" ? "default" : "accent"}>
                    {p.role === "candidate" ? "Candidato" : "HR Support"}
                  </Tag>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => copy(absoluteInviteUrl(p.token))}
                    style={{
                      fontSize: 12,
                      color: "var(--fg)",
                      background: "none",
                      border: "none",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Copiar link
                  </button>
                  {manager ? (
                    <button
                      type="button"
                      onClick={() => revoke(p.id)}
                      style={{
                        fontSize: 12,
                        color: "var(--warm)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      Revocar
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {manager ? (
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
                marginBottom: 12,
              }}
            >
              Miembros
            </div>
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 4px",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <Avatar name={m.name} size={36} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                    {m.email}
                  </div>
                </div>
                <Tag tone={m.isManager ? "accent" : "default"}>
                  {m.isManager ? "HR Manager" : "HR Support"}
                </Tag>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
