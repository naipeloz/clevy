import type { ReactNode } from "react";

const SERIF = "var(--font-instrument-serif), serif";

export function Page({
  children,
  max = 1160,
}: {
  children: ReactNode;
  max?: number;
}) {
  return (
    <div style={{ padding: "40px 64px 80px", overflow: "auto", height: "100%" }}>
      <div
        style={{
          maxWidth: max,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--fg-dim)",
      }}
    >
      {children}
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1
        style={{
          fontFamily: SERIF,
          fontSize: 56,
          letterSpacing: "-0.03em",
          margin: 0,
          fontWeight: 400,
          lineHeight: 1.02,
        }}
      >
        {title}
      </h1>
    </div>
  );
}

export function StatStrip({ items }: { items: { k: string; v: string }[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        borderTop: "1px solid var(--fg)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      {items.map((s, i) => (
        <div
          key={s.k}
          style={{
            padding: "24px 28px",
            borderRight:
              i < items.length - 1 ? "1px solid var(--hairline)" : "none",
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
            {s.k}
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 42,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {s.v}
          </div>
        </div>
      ))}
    </div>
  );
}

export type Column<T> = {
  key: string;
  label: string;
  w: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function AdminTable<T>({
  columns,
  rows,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  empty?: string;
}) {
  const template = columns.map((c) => c.w).join(" ");
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: template,
          gap: 24,
          padding: "12px 4px",
          borderBottom: "1px solid var(--fg)",
        }}
      >
        {columns.map((c) => (
          <div
            key={c.key}
            style={{
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--fg-dim)",
              textAlign: c.align ?? "left",
            }}
          >
            {c.label}
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <div style={{ padding: "40px 4px", fontSize: 14, color: "var(--fg-dim)" }}>
          {empty ?? "—"}
        </div>
      ) : (
        rows.map((r, i) => (
          <div
            key={i}
            style={{
              display: "grid",
              gridTemplateColumns: template,
              gap: 24,
              padding: "18px 4px",
              alignItems: "center",
              borderBottom: "1px solid var(--hairline)",
            }}
          >
            {columns.map((c) => (
              <div key={c.key} style={{ textAlign: c.align ?? "left" }}>
                {c.render(r)}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
