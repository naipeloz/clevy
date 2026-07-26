"use client";

import { useId, type ReactNode } from "react";

const inputStyle: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  fontSize: 14,
  border: "1px solid var(--hairline-strong)",
  borderRadius: 6,
  background: "var(--bg)",
  color: "var(--fg)",
  fontFamily: "inherit",
  width: "100%",
  outline: "none",
};

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      style={{ display: "flex", flexDirection: "column", gap: 8 }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {children(id)}
      {hint ? (
        <span style={{ fontSize: 12, color: "var(--fg-dim)" }}>{hint}</span>
      ) : null}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, ...props.style }} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <textarea
      {...props}
      style={{
        ...inputStyle,
        height: 110,
        padding: "12px 14px",
        resize: "vertical",
        lineHeight: 1.5,
        ...props.style,
      }}
    />
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

export function Button({
  variant = "accent",
  pending,
  children,
  ...props
}: {
  variant?: "accent" | "ghost" | "danger";
  pending?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
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
    danger: {
      background: "transparent",
      color: "var(--warm)",
      border: "1px solid var(--warm)",
    },
  };
  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      style={{
        height: 44,
        padding: "0 22px",
        fontSize: 14,
        fontWeight: 500,
        borderRadius: 6,
        cursor: pending ? "wait" : "pointer",
        opacity: pending || props.disabled ? 0.6 : 1,
        fontFamily: "inherit",
        ...variants[variant],
        ...props.style,
      }}
    >
      {children}
    </button>
  );
}
