"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLockup } from "@/components/brand";

type Role = "candidate" | "company";

const HEADLINES: Record<
  Role,
  { eyebrow: string; tail: string; lead: string; cta: string }
> = {
  candidate: {
    eyebrow: "Cultura como criterio de match",
    tail: "de verdad",
    lead:
      "Clevy mide lo que valoras en un entorno de trabajo y te conecta con empresas cuya cultura está alineada. No más aceptar ofertas y renunciar a los tres meses.",
    cta: "Construir mi perfil",
  },
  company: {
    eyebrow: "Cultura como criterio de match",
    tail: "fit cultural",
    lead:
      "Define tu cultura de forma concreta y medible. Recibe candidatos que encajan en cómo trabaja tu equipo — reducí rotación temprana desde el día uno.",
    cta: "Definir nuestra cultura",
  },
};

const AXES = [
  { left: "Autonomía", right: "Estructura", a: 62, b: 58 },
  { left: "Ritmo pausado", right: "Ritmo intenso", a: 78, b: 82 },
  { left: "Foco individual", right: "Trabajo en equipo", a: 70, b: 74 },
  { left: "Remoto", right: "Presencial", a: 30, b: 25 },
  { left: "Cauto", right: "Experimental", a: 68, b: 72 },
];

export function LandingClient() {
  const [role, setRole] = useState<Role>("candidate");
  const copy = HEADLINES[role];
  const signupHref = `/signup?role=${role}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--fg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "22px 48px",
          borderBottom: "1px solid var(--hairline)",
        }}
      >
        <BrandLockup />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            role="tablist"
            aria-label="Seleccionar rol"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              border: "1px solid var(--hairline-strong)",
              borderRadius: 999,
              padding: 3,
            }}
          >
            {(["candidate", "company"] as const).map((r) => {
              const active = role === r;
              return (
                <button
                  key={r}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRole(r)}
                  style={{
                    padding: "6px 14px",
                    fontSize: 13,
                    border: "none",
                    borderRadius: 999,
                    background: active ? "var(--fg)" : "transparent",
                    color: active ? "var(--bg)" : "var(--fg)",
                    cursor: "pointer",
                  }}
                >
                  {r === "candidate" ? "Soy candidato" : "Soy empresa"}
                </button>
              );
            })}
          </div>
          <Link
            href="/login"
            style={{
              fontSize: 13,
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Iniciar sesión
          </Link>
        </div>
      </header>

      <section
        style={{
          padding: "80px 48px 60px",
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: 80,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
            }}
          >
            {copy.eyebrow}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-instrument-serif), serif",
              fontSize: 96,
              lineHeight: 0.98,
              letterSpacing: "-0.035em",
              margin: 0,
              fontWeight: 400,
            }}
          >
            {role === "candidate" ? (
              <>
                Trabajar donde
                <br />
                <em style={{ color: "var(--accent)" }}>{copy.tail}</em> encajas.
              </>
            ) : (
              <>
                Contratar por
                <br />
                <em style={{ color: "var(--accent)" }}>{copy.tail}</em>, no
                solo CV.
              </>
            )}
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.5,
              color: "var(--fg-dim)",
              maxWidth: 520,
              margin: 0,
            }}
          >
            {copy.lead}
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link
              href={signupHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 500,
                background: "var(--accent)",
                color: "var(--bg)",
                border: "1px solid var(--accent)",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              {copy.cta}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/login"
              style={{
                fontSize: 15,
                color: "var(--fg)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Ya tengo cuenta
            </Link>
          </div>
          <div
            style={{
              display: "flex",
              gap: 36,
              paddingTop: 16,
              color: "var(--fg-dim)",
              fontSize: 13,
            }}
          >
            <div>
              <strong
                style={{
                  color: "var(--fg)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                7
              </strong>{" "}
              min en completar
            </div>
            <div>
              <strong
                style={{
                  color: "var(--fg)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                12
              </strong>{" "}
              dimensiones culturales
            </div>
            <div>
              <strong
                style={{
                  color: "var(--fg)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                2
              </strong>{" "}
              formas de completar
            </div>
          </div>
        </div>

        <aside
          style={{
            border: "1px solid var(--hairline)",
            padding: 36,
            background: "var(--bg-2)",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-dim)",
                  marginBottom: 6,
                }}
              >
                Match ejemplo
              </div>
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 28,
                  letterSpacing: "-0.01em",
                }}
              >
                Ana ↔ Línea Studio
              </div>
            </div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                border: "1px solid var(--accent)",
                borderRadius: 999,
                fontSize: 14,
                color: "var(--accent)",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />
              94% match
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {AXES.map((axis) => (
              <div key={axis.left}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    fontSize: 12,
                    color: "var(--fg-dim)",
                    marginBottom: 10,
                  }}
                >
                  <span style={{ whiteSpace: "nowrap" }}>{axis.left}</span>
                  <span style={{ whiteSpace: "nowrap" }}>{axis.right}</span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 2,
                    background: "var(--hairline)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      left: `${axis.a}%`,
                      top: "50%",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--fg)",
                      transform: "translate(-50%, -50%)",
                      boxShadow: "0 0 0 3px var(--bg-2)",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      left: `${axis.b}%`,
                      top: "50%",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                      transform: "translate(-50%, -50%)",
                      boxShadow: "0 0 0 3px var(--bg-2)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              fontSize: 12,
              color: "var(--fg-dim)",
              paddingTop: 8,
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--fg)",
                }}
              />{" "}
              Ana
            </span>
            <span
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--accent)",
                }}
              />{" "}
              Línea Studio
            </span>
          </div>
        </aside>
      </section>

      <section
        style={{
          padding: "60px 48px 80px",
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
            marginBottom: 8,
          }}
        >
          Cómo funciona
        </div>
        <h2
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 42,
            fontWeight: 400,
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          Tres pasos. Cero CVs.
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 40,
            marginTop: 48,
          }}
        >
          {[
            {
              n: "01",
              t: "Construye tu perfil",
              d: "Responde un cuestionario guiado o conversa con el agente. En menos de 10 minutos tenemos un perfil cultural cuantificado.",
            },
            {
              n: "02",
              t: "Recibe matches",
              d: "Te mostramos empresas cuya cultura encaja con lo que buscas. Ves el porcentaje de afinidad y los ejes donde coinciden.",
            },
            {
              n: "03",
              t: "Decides tú",
              d: "Revisa cada match con detalle — valores, equipo, ritmo. Solo te contactan empresas que realmente encajan.",
            },
          ].map((s) => (
            <div
              key={s.n}
              style={{
                borderTop: "1px solid var(--fg)",
                paddingTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-instrument-serif), serif",
                  fontSize: 32,
                  color: "var(--accent)",
                }}
              >
                {s.n}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: "var(--font-instrument-serif), serif",
                }}
              >
                {s.t}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--fg-dim)",
                }}
              >
                {s.d}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
