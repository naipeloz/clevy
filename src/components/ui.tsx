export function ReadOnlyBanner({
  message = "Modo solo lectura · HR Support. Podés monitorear vacantes y postulaciones, pero no editarlas.",
}: {
  message?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 16px",
        background: "var(--bg-2)",
        borderBottom: "1px solid var(--hairline)",
        fontSize: 12,
        color: "var(--fg-dim)",
        letterSpacing: "0.01em",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "var(--warm)",
          flexShrink: 0,
        }}
      />
      {message}
    </div>
  );
}

export function ProgressBar({ value, total }: { value: number; total: number }) {
  return (
    <div
      style={{
        height: 2,
        background: "var(--hairline)",
        borderRadius: 999,
        width: "100%",
      }}
    >
      <div
        style={{
          height: "100%",
          background: "var(--accent)",
          borderRadius: 999,
          width: `${(value / total) * 100}%`,
          transition: "width 400ms ease",
        }}
      />
    </div>
  );
}

export function AxisMeter({
  leftLabel,
  rightLabel,
  value,
}: {
  leftLabel: string;
  rightLabel: string;
  value: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          fontSize: 12,
          color: "var(--fg-dim)",
          letterSpacing: "0.02em",
        }}
      >
        <span style={{ whiteSpace: "nowrap" }}>{leftLabel}</span>
        <span style={{ whiteSpace: "nowrap" }}>{rightLabel}</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 2,
          background: "var(--hairline)",
          marginTop: 4,
        }}
      >
        {[0, 25, 50, 75, 100].map((t) => (
          <span
            key={t}
            style={{
              position: "absolute",
              left: `${t}%`,
              top: -2,
              width: 1,
              height: 6,
              background: "var(--hairline)",
              transform: "translateX(-0.5px)",
            }}
          />
        ))}
        <span
          style={{
            position: "absolute",
            left: `${value}%`,
            top: "50%",
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "var(--accent)",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 4px var(--bg)",
          }}
        />
      </div>
    </div>
  );
}

export function MatchPill({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { pad: "3px 8px", fs: 11, dot: 5 },
    md: { pad: "4px 10px", fs: 12, dot: 6 },
    lg: { pad: "6px 14px", fs: 14, dot: 8 },
  }[size];
  const tone =
    value >= 85 ? "var(--accent)" : value >= 70 ? "var(--fg)" : "var(--fg-dim)";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: sizes.pad,
        border: `1px solid ${tone}`,
        borderRadius: 999,
        fontSize: sizes.fs,
        color: tone,
        fontVariantNumeric: "tabular-nums",
        fontWeight: 500,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: sizes.dot,
          height: sizes.dot,
          borderRadius: "50%",
          background: tone,
        }}
      />
      {value}% match
    </span>
  );
}

export function Tag({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "filled" | "accent";
}) {
  const tones = {
    default: {
      bg: "transparent",
      color: "var(--fg-dim)",
      border: "var(--hairline-strong)",
    },
    filled: { bg: "var(--fg)", color: "var(--bg)", border: "var(--fg)" },
    accent: {
      bg: "transparent",
      color: "var(--accent)",
      border: "var(--accent)",
    },
  }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        fontSize: 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        fontWeight: 500,
        background: tones.bg,
        color: tones.color,
        border: `1px solid ${tones.border}`,
        borderRadius: 3,
      }}
    >
      {children}
    </span>
  );
}

export function Avatar({
  name,
  size = 36,
}: {
  name: string;
  size?: number;
}) {
  const initial = (name || "?").trim()[0]?.toUpperCase() ?? "?";
  let h = 0;
  for (const c of name || "") h = (h * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: `oklch(0.88 0.04 ${h})`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-instrument-serif), serif",
        fontSize: size * 0.44,
        color: "var(--fg)",
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  );
}

export function ComparisonBar({
  userValue,
  otherValue,
  userColor = "var(--fg)",
  otherColor = "var(--accent)",
}: {
  userValue: number;
  otherValue: number;
  userColor?: string;
  otherColor?: string;
}) {
  const diff = Math.abs(userValue - otherValue);
  return (
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
          top: "50%",
          height: 1,
          background: diff < 15 ? "var(--accent)" : "var(--hairline-strong)",
          left: `${Math.min(userValue, otherValue)}%`,
          width: `${diff}%`,
          transform: "translateY(-50%)",
        }}
      />
      <span
        style={{
          position: "absolute",
          left: `${userValue}%`,
          top: "50%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: userColor,
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 0 3px var(--bg)",
          zIndex: 2,
        }}
      />
      <span
        style={{
          position: "absolute",
          left: `${otherValue}%`,
          top: "50%",
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: otherColor,
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 0 3px var(--bg)",
          zIndex: 2,
        }}
      />
    </div>
  );
}
