"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClevyMark } from "@/components/brand";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "@/app/(auth)/form-controls";

export function NuevaVacanteClient({ companyName }: { companyName: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [publish, setPublish] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          location: location || null,
          remote,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          status: publish ? "open" : "draft",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo crear la vacante");
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
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <ClevyMark size={24} />
          <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>
            Nueva vacante · {companyName}
          </span>
        </div>
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
      </header>

      <main style={{ flex: 1, overflow: "auto", padding: "48px 64px" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
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
            Publicá una vacante.
          </h1>

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            <ErrorBanner message={error} />
            <Field label="Título">
              {(id) => (
                <TextInput
                  id={id}
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Product Designer"
                />
              )}
            </Field>
            <Field label="Descripción" hint="Opcional.">
              {(id) => (
                <textarea
                  id={id}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Qué van a hacer, qué buscan, cómo trabajan…"
                  style={{
                    padding: "10px 14px",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    border: "1px solid var(--hairline-strong)",
                    borderRadius: 4,
                    fontSize: 15,
                    fontFamily: "inherit",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              )}
            </Field>
            <Field label="Ubicación">
              {(id) => (
                <TextInput
                  id={id}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="CDMX · Híbrido"
                />
              )}
            </Field>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "var(--fg)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
              />
              Trabajo remoto
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Salario mín. (opcional)">
                {(id) => (
                  <TextInput
                    id={id}
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="2000"
                  />
                )}
              </Field>
              <Field label="Salario máx. (opcional)">
                {(id) => (
                  <TextInput
                    id={id}
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="3500"
                  />
                )}
              </Field>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "var(--fg)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              Publicar de inmediato (si no, queda como borrador)
            </label>
            <SubmitButton pending={pending}>Crear vacante</SubmitButton>
          </form>
        </div>
      </main>
    </div>
  );
}
