"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClevyMark } from "@/components/brand";
import { ProgressBar } from "@/components/ui";
import { LocationPicker } from "@/components/location-picker";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "@/app/(auth)/form-controls";

type CompanyFields = {
  name: string;
  tagline: string;
  industry: string;
  countryCode: string | null;
  city: string | null;
  domain: string;
};

export function PerfilClient({ initial }: { initial: CompanyFields | null }) {
  const router = useRouter();
  const isEdit = initial !== null;
  const [fields, setFields] = useState<CompanyFields>(
    initial ?? {
      name: "",
      tagline: "",
      industry: "",
      countryCode: null,
      city: null,
      domain: "",
    }
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function update(key: "name" | "tagline" | "industry" | "domain", value: string) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la empresa");
        setPending(false);
        return;
      }
      router.push(data.redirectTo ?? "/empresa");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
      setPending(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <header
        style={{
          padding: "20px 48px",
          borderBottom: "1px solid var(--hairline)",
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}
      >
        <ClevyMark size={24} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
              fontSize: 12,
              color: "var(--fg-dim)",
            }}
          >
            <span>{isEdit ? "Editar empresa" : "Datos de la empresa"}</span>
            {!isEdit ? (
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                Paso 1 de 3
              </span>
            ) : null}
          </div>
          <ProgressBar value={isEdit ? 3 : 1} total={3} />
        </div>
        {isEdit ? (
          <Link
            href="/empresa"
            style={{
              fontSize: 13,
              color: "var(--fg-dim)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Salir
          </Link>
        ) : null}
      </header>

      <main style={{ flex: 1, overflow: "auto", padding: "48px 64px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: 12,
            }}
          >
            {isEdit ? "Perfil" : "Empecemos"}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 48,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
              margin: "0 0 32px",
              fontWeight: 400,
            }}
          >
            {isEdit ? "Actualizá los datos." : "Contanos sobre tu empresa."}
          </h1>

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            <ErrorBanner message={error} />
            <Field label="Nombre de la empresa">
              {(id) => (
                <TextInput
                  id={id}
                  required
                  value={fields.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Línea Studio"
                />
              )}
            </Field>
            <Field label="Tagline" hint="Una línea sobre quiénes son.">
              {(id) => (
                <TextInput
                  id={id}
                  value={fields.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="Estudio de producto digital · 34 personas"
                />
              )}
            </Field>
            <Field label="Industria">
              {(id) => (
                <TextInput
                  id={id}
                  value={fields.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  placeholder="Product Design"
                />
              )}
            </Field>
            <LocationPicker
              countryCode={fields.countryCode}
              city={fields.city}
              onChange={(loc) =>
                setFields((f) => ({
                  ...f,
                  countryCode: loc.countryCode,
                  city: loc.city,
                }))
              }
            />
            <Field label="Dominio" hint="Opcional.">
              {(id) => (
                <TextInput
                  id={id}
                  value={fields.domain}
                  onChange={(e) => update("domain", e.target.value)}
                  placeholder="lineastudio.com"
                />
              )}
            </Field>
            <SubmitButton pending={pending}>
              {isEdit ? "Guardar cambios" : "Continuar a cultura →"}
            </SubmitButton>
          </form>
        </div>
      </main>
    </div>
  );
}
