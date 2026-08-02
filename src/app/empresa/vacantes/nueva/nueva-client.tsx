"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ClevyMark } from "@/components/brand";
import { LocationPicker } from "@/components/location-picker";
import { useT } from "@/components/locale-provider";
import {
  REMOTE_SCOPES,
  SUPPORTED_CURRENCIES,
  type RemoteScope,
} from "@/lib/location";
import {
  ErrorBanner,
  Field,
  SubmitButton,
  TextInput,
} from "@/app/(auth)/form-controls";

const selectStyle: React.CSSProperties = {
  height: 44,
  padding: "10px 14px",
  background: "var(--bg)",
  color: "var(--fg)",
  border: "1px solid var(--hairline-strong)",
  borderRadius: 4,
  fontSize: 15,
  fontFamily: "inherit",
  outline: "none",
  cursor: "pointer",
};

export function NuevaVacanteClient({ companyName }: { companyName: string }) {
  const router = useRouter();
  const t = useT();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [remote, setRemote] = useState(false);
  const [remoteScope, setRemoteScope] = useState<RemoteScope | "">("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [hardSkills, setHardSkills] = useState<string[]>([]);
  const [skillDraft, setSkillDraft] = useState("");
  const [experienceMin, setExperienceMin] = useState("");
  const [industry, setIndustry] = useState("");
  const [publish, setPublish] = useState(true);

  function addSkill(raw: string) {
    const s = raw.trim();
    if (!s) return;
    setHardSkills((prev) =>
      prev.includes(s) || prev.length >= 30 ? prev : [...prev, s]
    );
    setSkillDraft("");
  }
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
          countryCode,
          city,
          remote,
          remoteScope: remote ? remoteScope || null : null,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          currency,
          hardSkills,
          experienceMin: experienceMin ? Number(experienceMin) : null,
          industry: industry || null,
          status: publish ? "open" : "draft",
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? t.vacante.error);
        setPending(false);
        return;
      }
      router.push(data.redirectTo ?? "/empresa");
      router.refresh();
    } catch {
      setError(t.common.networkError);
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
            {t.vacante.newHeader} · {companyName}
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
          {t.common.exit}
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
            {t.vacante.postTitle}
          </h1>

          <form
            onSubmit={onSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
            noValidate
          >
            <ErrorBanner message={error} />
            <Field label={t.vacante.titleLabel}>
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
            <Field label={t.vacante.descLabel} hint={t.common.optional}>
              {(id) => (
                <textarea
                  id={id}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder={t.vacante.descPlaceholder}
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
            <LocationPicker
              countryCode={countryCode}
              city={city}
              onChange={(loc) => {
                setCountryCode(loc.countryCode);
                setCity(loc.city);
              }}
            />
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
              {t.vacante.remoteLabel}
            </label>
            {remote ? (
              <Field label={t.remoteWork.scopeLabel}>
                {(id) => (
                  <select
                    id={id}
                    value={remoteScope}
                    onChange={(e) =>
                      setRemoteScope(e.target.value as RemoteScope | "")
                    }
                    style={selectStyle}
                  >
                    <option value="">{t.remoteWork.scopePlaceholder}</option>
                    {REMOTE_SCOPES.map((s) => (
                      <option key={s} value={s}>
                        {t.remoteWork.scopes[s]}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label={t.vacante.currencyLabel}>
                {(id) => (
                  <select
                    id={id}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={selectStyle}
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c === "USD" ? t.vacante.currencyUsd : t.vacante.currencyUyu}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label={t.vacante.salaryMinLabel}>
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
              <Field label={t.vacante.salaryMaxLabel}>
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label={t.vacante.industryLabel}>
                {(id) => (
                  <TextInput
                    id={id}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder={t.vacante.industryPlaceholder}
                  />
                )}
              </Field>
              <Field label={t.vacante.experienceLabel}>
                {(id) => (
                  <TextInput
                    id={id}
                    type="number"
                    min={0}
                    value={experienceMin}
                    onChange={(e) => setExperienceMin(e.target.value)}
                    placeholder="3"
                  />
                )}
              </Field>
            </div>

            <Field label={t.vacante.hardSkillsLabel} hint={t.vacante.hardSkillsHint}>
              {(id) => (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    alignItems: "center",
                    border: "1px solid var(--hairline-strong)",
                    borderRadius: 4,
                    padding: "8px 10px",
                    minHeight: 44,
                  }}
                >
                  {hardSkills.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 10px",
                        background: "var(--accent)",
                        color: "var(--bg)",
                        borderRadius: 999,
                        fontSize: 13,
                      }}
                    >
                      {s}
                      <button
                        type="button"
                        aria-label={`Quitar ${s}`}
                        onClick={() =>
                          setHardSkills((prev) => prev.filter((x) => x !== s))
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--bg)",
                          cursor: "pointer",
                          fontSize: 13,
                          lineHeight: 1,
                          padding: 0,
                          fontFamily: "inherit",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    id={id}
                    value={skillDraft}
                    onChange={(e) => setSkillDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addSkill(skillDraft);
                      } else if (
                        e.key === "Backspace" &&
                        skillDraft === "" &&
                        hardSkills.length > 0
                      ) {
                        setHardSkills((prev) => prev.slice(0, -1));
                      }
                    }}
                    onBlur={() => addSkill(skillDraft)}
                    placeholder={hardSkills.length === 0 ? t.vacante.hardSkillsPlaceholder : ""}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      color: "var(--fg)",
                      fontSize: 15,
                      fontFamily: "inherit",
                    }}
                  />
                </div>
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
                checked={publish}
                onChange={(e) => setPublish(e.target.checked)}
              />
              {t.vacante.publishLabel}
            </label>
            <SubmitButton pending={pending}>{t.vacante.submit}</SubmitButton>
          </form>
        </div>
      </main>
    </div>
  );
}
