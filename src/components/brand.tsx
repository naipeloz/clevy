export function ClevyMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        border: "1px solid var(--fg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-instrument-serif), serif",
        fontSize: size * 0.62,
        color: "var(--fg)",
        letterSpacing: "-0.02em",
        lineHeight: 1,
      }}
    >
      c
    </div>
  );
}

export function BrandLockup({ size = 28 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ClevyMark size={size} />
      <span
        style={{
          fontFamily: "var(--font-instrument-serif), serif",
          fontSize: size * 0.8,
          letterSpacing: "-0.01em",
          color: "var(--fg)",
        }}
      >
        Clevy
      </span>
    </div>
  );
}
