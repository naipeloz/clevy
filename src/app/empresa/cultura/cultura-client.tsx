"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClevyMark } from "@/components/brand";
import { ProgressBar } from "@/components/ui";
import { COMPANY_VALUES_OPTIONS } from "@/lib/clevy-data";

const DEFAULT_SELECTED = ["autonomy", "craft", "experiment", "focus", "direct"];
const DEFAULT_PRIORITIES: Record<string, number> = {
  autonomy: 85,
  craft: 75,
  experiment: 65,
  focus: 70,
  direct: 60,
};

function intensityLabel(v: number) {
  if (v < 40) return "Presente";
  if (v < 70) return "Importante";
  return "Central";
}

export function CulturaClient({
  userName,
  initialSelected,
  initialPriorities,
}: {
  userName: string;
  initialSelected: string[] | null;
  initialPriorities: Record<string, number> | null;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>(
    initialSelected ?? DEFAULT_SELECTED
  );
  const [priorities, setPriorities] = useState<Record<string, number>>(
    initialPriorities ?? DEFAULT_PRIORITIES
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((s) => {
      if (s.includes(id)) return s.filter((x) => x !== id);
      if (s.length >= 6) return s;
      return [...s, id];
    });
    setPriorities((p) => (p[id] ? p : { ...p, [id]: 70 }));
  }

  async function submit() {
    if (selected.length < 3) {
      setError("Elegí al menos 3 valores");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/company/culture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selected, priorities }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la cultura");
        setPending(false);
        return;
      }
      router.push(data.redirectTo ?? "/empresa/candidatos");
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
            <span>Definiendo la cultura · {userName}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              Paso 2 de 3
            </span>
          </div>
          <ProgressBar value={2} total={3} />
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

      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "48px 64px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
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
              Valores centrales
            </div>
            <h1
              style={{
                fontFamily: "var(--font-instrument-serif), serif",
                fontSize: 56,
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                margin: 0,
                fontWeight: 400,
              }}
            >
              Elegí hasta 6 valores que
              <br />
              definen cómo trabajan.
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--fg-dim)",
                marginTop: 16,
                maxWidth: 620,
                lineHeight: 1.55,
              }}
            >
              No es lo que quisieran ser — es cómo trabajan de verdad hoy.
              Seleccioná y ajustá la intensidad de cada uno.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {COMPANY_VALUES_OPTIONS.map((v) => {
              const active = selected.includes(v.id);
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => toggle(v.id)}
                  style={{
                    textAlign: "left",
                    background: active ? "var(--fg)" : "var(--bg)",
                    color: active ? "var(--bg)" : "var(--fg)",
                    border: `1px solid ${active ? "var(--fg)" : "var(--hairline-strong)"}`,
                    padding: "20px",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    borderRadius: 6,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-instrument-serif), serif",
                        fontSize: 22,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {v.label}
                    </div>
                    <span
                      aria-hidden
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        border: `1px solid ${active ? "var(--bg)" : "var(--hairline-strong)"}`,
                        background: active ? "var(--accent)" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--bg)",
                        fontSize: 10,
                      }}
                    >
                      {active ? "✓" : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.7,
                      lineHeight: 1.4,
                    }}
                  >
                    {v.desc}
                  </div>
                </button>
              );
            })}
          </div>

          {selected.length > 0 ? (
            <div
              style={{
                borderTop: "1px solid var(--hairline)",
                paddingTop: 32,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 20,
                }}
              >
                Intensidad · ¿Qué tan central es cada valor?
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {selected.map((id) => {
                  const v = COMPANY_VALUES_OPTIONS.find((x) => x.id === id);
                  if (!v) return null;
                  const val = priorities[id] ?? 70;
                  return (
                    <div
                      key={id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "200px 1fr 100px",
                        gap: 24,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-instrument-serif), serif",
                          fontSize: 20,
                        }}
                      >
                        {v.label}
                      </div>
                      <div style={{ position: "relative", padding: "12px 0" }}>
                        <div
                          style={{
                            height: 1,
                            background: "var(--hairline-strong)",
                          }}
                        />
                        <input
                          aria-label={`Intensidad de ${v.label}`}
                          type="range"
                          min={0}
                          max={100}
                          value={val}
                          onChange={(e) =>
                            setPriorities((p) => ({
                              ...p,
                              [id]: Number(e.target.value),
                            }))
                          }
                          style={{
                            position: "absolute",
                            inset: 0,
                            opacity: 0,
                            cursor: "pointer",
                          }}
                        />
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: `${val}%`,
                            top: "50%",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            transform: "translate(-50%, -50%)",
                            border: "2px solid var(--bg)",
                            boxShadow: "0 0 0 1px var(--accent)",
                            pointerEvents: "none",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--fg-dim)",
                          textAlign: "right",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {intensityLabel(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

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
        </div>
      </main>

      <div
        style={{
          padding: "20px 48px",
          borderTop: "1px solid var(--hairline)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>
          {selected.length} / 6 valores seleccionados
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={pending || selected.length < 3}
          style={{
            padding: "12px 24px",
            background: "var(--accent)",
            color: "var(--bg)",
            border: "1px solid var(--accent)",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            cursor: pending || selected.length < 3 ? "not-allowed" : "pointer",
            opacity: pending || selected.length < 3 ? 0.5 : 1,
            fontFamily: "inherit",
          }}
        >
          {pending ? "Guardando…" : "Generar perfil cultural →"}
        </button>
      </div>
    </div>
  );
}
