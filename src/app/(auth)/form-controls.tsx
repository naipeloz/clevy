"use client";

import { useId } from "react";

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: (id: string) => React.ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
        }}
      >
        {label}
      </span>
      {children(id)}
      {hint ? (
        <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>{hint}</span>
      ) : null}
    </label>
  );
}

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      style={{
        height: 44,
        padding: "10px 14px",
        background: "var(--bg)",
        color: "var(--fg)",
        border: "1px solid var(--hairline-strong)",
        borderRadius: 4,
        fontSize: 15,
        fontFamily: "inherit",
        outline: "none",
        ...props.style,
      }}
    />
  );
}

export function RoleToggle({
  value,
  onChange,
}: {
  value: "candidate" | "company";
  onChange: (v: "candidate" | "company") => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de cuenta"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 4,
        border: "1px solid var(--hairline-strong)",
        borderRadius: 999,
        padding: 3,
      }}
    >
      {(["candidate", "company"] as const).map((r) => {
        const active = value === r;
        return (
          <button
            key={r}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(r)}
            style={{
              padding: "8px 14px",
              fontSize: 13,
              border: "none",
              borderRadius: 999,
              background: active ? "var(--fg)" : "transparent",
              color: active ? "var(--bg)" : "var(--fg)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {r === "candidate" ? "Soy candidato" : "Soy empresa"}
          </button>
        );
      })}
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
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
      }}
    >
      {pending ? "Un momento…" : children}
    </button>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        padding: "10px 14px",
        border: "1px solid var(--warm)",
        color: "var(--warm)",
        borderRadius: 4,
        fontSize: 13,
        background: "var(--bg)",
      }}
    >
      {message}
    </div>
  );
}
