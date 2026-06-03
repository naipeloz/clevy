"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const [pending, setPending] = useState(false);

  async function setLocale(next: Locale) {
    if (next === locale || pending) return;
    setPending(true);
    try {
      await fetch("/api/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: next }),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      role="group"
      aria-label="Idioma / Language"
      style={{
        display: "inline-flex",
        border: "1px solid var(--hairline-strong)",
        borderRadius: 999,
        padding: 2,
        gap: 2,
      }}
    >
      {OPTIONS.map((o) => {
        const active = o.value === locale;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => setLocale(o.value)}
            style={{
              padding: "4px 10px",
              fontSize: 12,
              fontWeight: 500,
              border: "none",
              borderRadius: 999,
              background: active ? "var(--fg)" : "transparent",
              color: active ? "var(--bg)" : "var(--fg-dim)",
              cursor: active || pending ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
