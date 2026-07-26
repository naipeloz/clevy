"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag } from "@/components/ui";
import { useT } from "@/components/locale-provider";

export type SearchItem = {
  id: string;
  title: string;
  meta: string;
  status: "draft" | "open" | "paused" | "closed";
  applicants: number;
  avgMatch: number | null;
  newCount: number;
};

type TabId = "all" | "open" | "draft" | "closed";

const SERIF = "var(--font-instrument-serif), serif";

export function SearchesGrid({
  items,
  manager,
}: {
  items: SearchItem[];
  manager: boolean;
}) {
  const t = useT();
  const h = t.empresa.home;
  const [tab, setTab] = useState<TabId>("all");

  const tabs: { id: TabId; label: string }[] = [
    { id: "all", label: h.tabAll },
    { id: "open", label: h.tabOpen },
    { id: "draft", label: h.tabDraft },
    { id: "closed", label: h.tabClosed },
  ];

  const filtered = items.filter((s) => (tab === "all" ? true : s.status === tab));

  return (
    <>
      <div style={{ display: "flex", borderBottom: "1px solid var(--hairline)" }}>
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            style={{
              padding: "14px 22px",
              fontSize: 14,
              fontFamily: "inherit",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderBottom:
                tab === tabItem.id
                  ? "2px solid var(--fg)"
                  : "2px solid transparent",
              marginBottom: -1,
              color: tab === tabItem.id ? "var(--fg)" : "var(--fg-dim)",
            }}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        }}
      >
        {filtered.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid var(--hairline)",
              borderRadius: 8,
              padding: 24,
              background: "var(--bg)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 24,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.1,
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: 13, color: "var(--fg-dim)", marginTop: 4 }}>
                  {s.meta}
                </div>
              </div>
              <Tag tone={s.status === "open" ? "accent" : "default"}>
                {t.statuses[s.status]}
              </Tag>
            </div>

            <div
              style={{
                display: "flex",
                gap: 32,
                paddingTop: 16,
                borderTop: "1px solid var(--hairline)",
              }}
            >
              <Stat value={String(s.applicants)} label={h.statApplicants} />
              <Stat
                value={s.avgMatch != null ? `${s.avgMatch}%` : "—"}
                label={h.statAvgMatch}
                accent
              />
              <Stat value={s.newCount ? String(s.newCount) : "—"} label={h.statNew} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {s.status === "draft" && manager ? (
                <>
                  <LinkButton href={`/empresa/vacantes/${s.id}`} variant="accent">
                    {h.publish}
                  </LinkButton>
                  <LinkButton href={`/empresa/vacantes/${s.id}`} variant="ghost">
                    {h.edit}
                  </LinkButton>
                </>
              ) : (
                <>
                  <LinkButton href={`/empresa/vacantes/${s.id}`} variant="ghost">
                    {h.viewCandidates}
                  </LinkButton>
                  {manager ? (
                    <LinkButton href={`/empresa/vacantes/${s.id}`} variant="link">
                      {h.edit}
                    </LinkButton>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 26,
          letterSpacing: "-0.02em",
          color: accent ? "var(--accent)" : "var(--fg)",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--fg-dim)" }}>{label}</div>
    </div>
  );
}

function LinkButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant: "accent" | "ghost" | "link";
  children: React.ReactNode;
}) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: variant === "link" ? "8px 0" : "8px 14px",
    fontSize: 13,
    fontWeight: 500,
    borderRadius: 4,
    textDecoration: variant === "link" ? "underline" : "none",
    textUnderlineOffset: 3,
    fontFamily: "inherit",
  };
  const variants: Record<string, React.CSSProperties> = {
    accent: {
      background: "var(--accent)",
      color: "var(--bg)",
      border: "1px solid var(--accent)",
    },
    ghost: {
      background: "transparent",
      color: "var(--fg)",
      border: "1px solid var(--hairline-strong)",
    },
    link: { background: "transparent", color: "var(--fg)", border: "none" },
  };
  return (
    <Link href={href} style={{ ...base, ...variants[variant] }}>
      {children}
    </Link>
  );
}
