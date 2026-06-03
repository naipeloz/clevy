"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClevyMark } from "@/components/brand";
import { ProgressBar } from "@/components/ui";
import { useT } from "@/components/locale-provider";
import { fmt } from "@/lib/fmt";
import { QUESTIONS } from "@/lib/clevy-data";

function intensityIndex(v: number) {
  if (v < 30) return 0;
  if (v < 45) return 1;
  if (v < 55) return 2;
  if (v < 70) return 3;
  return 4;
}

export function CuestionarioClient() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = QUESTIONS[step];
  const qt = t.questions[q.id as keyof typeof t.questions];
  // The current answer is the single source of truth — no synced draft state.
  const value = answers[q.id] ?? 50;

  async function commit(answersToSubmit: Record<string, number>) {
    setPending(true);
    setError(null);
    const values: Record<string, number> = {};
    for (const question of QUESTIONS) {
      const v = answersToSubmit[question.id];
      if (typeof v === "number") values[question.axis] = v;
    }
    try {
      const res = await fetch("/api/candidate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.candidato.error);
        setPending(false);
        return;
      }
      router.push(data.redirectTo ?? "/candidato/perfil");
      router.refresh();
    } catch {
      setError(t.common.networkError);
      setPending(false);
    }
  }

  function next() {
    const updated = { ...answers, [q.id]: value };
    setAnswers(updated);
    if (step === QUESTIONS.length - 1) commit(updated);
    else setStep(step + 1);
  }

  function prev() {
    if (step === 0) return;
    setStep(step - 1);
  }

  const draftLabel = t.candidato.intensity[intensityIndex(value)];

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
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>{t.candidato.quizTitle}</span>
            <span>
              {step + 1} / {QUESTIONS.length}
            </span>
          </div>
          <ProgressBar value={step + 1} total={QUESTIONS.length} />
        </div>
        <Link
          href="/candidato"
          style={{
            fontSize: 13,
            color: "var(--fg-dim)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {t.common.exit}
        </Link>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 48px",
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 56,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              {fmt(t.candidato.question, { n: step + 1 })}
            </div>
            <h2
              style={{
                fontFamily: "var(--font-instrument-serif), serif",
                fontSize: 54,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                margin: 0,
                fontWeight: 400,
              }}
            >
              {qt.title}
            </h2>
            {qt.subtitle ? (
              <p
                style={{
                  fontSize: 16,
                  color: "var(--fg-dim)",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {qt.subtitle}
              </p>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
                fontSize: 14,
              }}
            >
              <div
                style={{
                  color: value < 50 ? "var(--fg)" : "var(--fg-dim)",
                  transition: "color 200ms",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    opacity: 0.7,
                  }}
                >
                  {t.candidato.left}
                </div>
                {qt.leftLabel}
              </div>
              <div
                style={{
                  color: value >= 50 ? "var(--fg)" : "var(--fg-dim)",
                  textAlign: "right",
                  transition: "color 200ms",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 6,
                    opacity: 0.7,
                  }}
                >
                  {t.candidato.right}
                </div>
                {qt.rightLabel}
              </div>
            </div>

            <div style={{ position: "relative", padding: "24px 0" }}>
              <div
                style={{ height: 1, background: "var(--hairline-strong)" }}
              />
              {[0, 25, 50, 75, 100].map((t) => (
                <span
                  key={t}
                  style={{
                    position: "absolute",
                    left: `${t}%`,
                    top: 24,
                    width: 1,
                    height: t === 50 ? 14 : 8,
                    background: "var(--hairline-strong)",
                    transform: "translate(-0.5px, -50%)",
                  }}
                />
              ))}
              <input
                aria-label="Tu respuesta"
                type="range"
                min={0}
                max={100}
                value={value}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, [q.id]: Number(e.target.value) }))
                }
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                  margin: 0,
                }}
              />
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: `${value}%`,
                  top: "50%",
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  transform: "translate(-50%, -50%)",
                  border: "3px solid var(--bg)",
                  boxShadow: "0 0 0 1px var(--accent)",
                  pointerEvents: "none",
                }}
              />
            </div>

            <div
              style={{
                textAlign: "center",
                fontFamily: "var(--font-instrument-serif), serif",
                fontSize: 28,
                color: "var(--accent)",
                letterSpacing: "-0.01em",
              }}
            >
              {draftLabel}
            </div>
          </div>

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

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 24,
              borderTop: "1px solid var(--hairline)",
            }}
          >
            <button
              type="button"
              onClick={prev}
              disabled={step === 0 || pending}
              style={{
                padding: "11px 20px",
                background: "transparent",
                color: "var(--fg)",
                border: "1px solid var(--hairline-strong)",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                cursor: step === 0 || pending ? "not-allowed" : "pointer",
                opacity: step === 0 ? 0.4 : 1,
                fontFamily: "inherit",
              }}
            >
              {t.candidato.prev}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={pending}
              style={{
                padding: "11px 22px",
                background: "var(--accent)",
                color: "var(--bg)",
                border: "1px solid var(--accent)",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 500,
                cursor: pending ? "wait" : "pointer",
                opacity: pending ? 0.7 : 1,
                fontFamily: "inherit",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {pending
                ? t.candidato.saving
                : step === QUESTIONS.length - 1
                  ? t.candidato.finish
                  : t.candidato.next}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
