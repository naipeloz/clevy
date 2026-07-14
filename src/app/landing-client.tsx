"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLockup } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useT } from "@/components/locale-provider";

type Role = "candidate" | "company";

// Marker positions for the sample-match visual (candidate vs. company dots).
// The axis labels themselves come from the translation dictionary.
const AXIS_POSITIONS = [
  { key: "autonomy", a: 62, b: 58 },
  { key: "pace", a: 78, b: 82 },
  { key: "focus", a: 70, b: 74 },
  { key: "location", a: 30, b: 25 },
  { key: "risk", a: 68, b: 72 },
] as const;

export function LandingClient() {
  const t = useT();
  const [role, setRole] = useState<Role>("candidate");
  const copy = t.landing[role];
  const signupHref = `/signup?role=${role}`;
  const axes = AXIS_POSITIONS.map((p) => ({ ...p, ...t.landing.axes[p.key] }));

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
            aria-label={t.landing.candidate.eyebrow}
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
                  {t.roleToggle[r]}
                </button>
              );
            })}
          </div>
          <LanguageSwitcher />
          <Link
            href="/login"
            style={{
              fontSize: 13,
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {t.landing.signIn}
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
            {copy.headPre}
            <br />
            <em style={{ color: "var(--accent)" }}>{copy.headEm}</em>
            {copy.headPost}
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
              {t.landing.haveAccount}
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
              {t.landing.stat1}
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
              {t.landing.stat2}
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
              {t.landing.stat3}
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
                {t.landing.matchExample}
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
              94% {t.landing.matchLabel}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {axes.map((axis) => (
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
          {t.landing.howEyebrow}
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
          {t.landing.howTitle}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 40,
            marginTop: 48,
          }}
        >
          {t.landing.steps.map((step, i) => (
            <div
              key={step.title}
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
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontFamily: "var(--font-instrument-serif), serif",
                }}
              >
                {step.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "var(--fg-dim)",
                }}
              >
                {step.desc}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
