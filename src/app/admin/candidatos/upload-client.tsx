"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Job = { id: string; label: string };
type Result = {
  created: number;
  updated: number;
  matched: number;
  errors: string[];
};

const TEMPLATE_HEADER =
  "name,email,role,city,countryCode,linkedinUrl,summary,highlights,pace,autonomy,collab,hierarchy,risk,communication,worklife";

export function UploadClient({ jobs }: { jobs: Job[] }) {
  const router = useRouter();
  const [jobId, setJobId] = useState("");
  const [csv, setCsv] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setCsv(await file.text());
  }

  async function submit() {
    setError(null);
    setResult(null);
    if (!jobId) {
      setError("Elegí una vacante.");
      return;
    }
    if (!csv.trim()) {
      setError("Pegá o subí un CSV.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/admin/candidates/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, csv }),
      });
      const data = (await res.json().catch(() => ({}))) as Result & {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo procesar el CSV");
        return;
      }
      setResult(data);
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ padding: "40px 64px 80px", overflow: "auto", height: "100%" }}>
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              marginBottom: 10,
            }}
          >
            Headhunting · Admin
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 44,
              letterSpacing: "-0.03em",
              margin: 0,
              fontWeight: 400,
            }}
          >
            Cargar candidatos por CSV
          </h1>
          <p style={{ fontSize: 15, color: "var(--fg-dim)", marginTop: 12, lineHeight: 1.55 }}>
            Elegí la vacante y subí un CSV. Cada candidato queda asociado a esa
            vacante (visible para el cliente en sus postulados). Si incluís las 7
            dimensiones culturales, se calcula el match automáticamente.
          </p>
        </div>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={labelStyle}>Vacante</span>
          <select
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Seleccioná una vacante…</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
          </select>
          {jobs.length === 0 ? (
            <span style={{ fontSize: 12, color: "var(--warm)" }}>
              No hay vacantes creadas todavía.
            </span>
          ) : null}
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={labelStyle}>Archivo CSV</span>
          <input type="file" accept=".csv,text/csv" onChange={onFile} />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={labelStyle}>…o pegá el CSV</span>
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={8}
            placeholder={TEMPLATE_HEADER}
            style={{
              ...inputStyle,
              height: "auto",
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              resize: "vertical",
            }}
          />
          <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>
            Columnas (encabezado): <code>{TEMPLATE_HEADER}</code>. Obligatorias:{" "}
            <code>name</code>, <code>email</code>. <code>highlights</code> separadas
            por <code>;</code>. Ejes (pace…worklife) 0–100, opcionales.
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            style={{
              padding: "10px 14px",
              border: "1px solid var(--warm)",
              color: "var(--warm)",
              borderRadius: 4,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        ) : null}

        {result ? (
          <div
            style={{
              padding: 16,
              border: "1px solid var(--accent)",
              borderRadius: 6,
              background: "var(--bg-2)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 14,
            }}
          >
            <strong>Listo.</strong>
            <span>
              Creados: {result.created} · Actualizados: {result.updated} ·
              Asociados a la vacante: {result.matched}
            </span>
            {result.errors.length > 0 ? (
              <div style={{ color: "var(--warm)", fontSize: 13 }}>
                {result.errors.length} fila(s) con problemas:
                <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
                  {result.errors.slice(0, 10).map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={pending}
          style={{
            height: 48,
            padding: "0 28px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            fontSize: 15,
            fontWeight: 500,
            cursor: pending ? "wait" : "pointer",
            opacity: pending ? 0.7 : 1,
            fontFamily: "inherit",
            alignSelf: "flex-start",
          }}
        >
          {pending ? "Procesando…" : "Cargar candidatos"}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--fg-dim)",
};

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "10px 14px",
  background: "var(--bg)",
  color: "var(--fg)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: 4,
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  width: "100%",
};
