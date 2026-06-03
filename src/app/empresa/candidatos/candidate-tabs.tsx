import Link from "next/link";

type TabId = "new" | "reviewed" | "contacted";

export function CandidateTabs({
  counts,
  activeTab,
  labels,
}: {
  counts: Record<TabId, number>;
  activeTab: TabId;
  labels: Record<TabId, string>;
}) {
  const TABS: { id: TabId; label: string }[] = [
    { id: "new", label: labels.new },
    { id: "reviewed", label: labels.reviewed },
    { id: "contacted", label: labels.contacted },
  ];
  return (
    <div
      style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      {TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <Link
            key={t.id}
            href={t.id === "new" ? "/empresa/candidatos" : `/empresa/candidatos?tab=${t.id}`}
            style={{
              padding: "14px 24px",
              fontSize: 14,
              borderBottom: active
                ? "2px solid var(--fg)"
                : "2px solid transparent",
              color: active ? "var(--fg)" : "var(--fg-dim)",
              marginBottom: -1,
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: 11,
                padding: "2px 7px",
                borderRadius: 999,
                background: active ? "var(--fg)" : "var(--hairline)",
                color: active ? "var(--bg)" : "var(--fg-dim)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {counts[t.id]}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
