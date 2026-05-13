import Link from "next/link";
import { AppHeader } from "@/components/app-header";

export function PlaceholderPage({
  userName,
  eyebrow,
  title,
  subtitle,
  backHref,
  backLabel,
}: {
  userName: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={userName} />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 48px",
          textAlign: "center",
          gap: 18,
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          {eyebrow}
        </span>
        <h1
          style={{
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 56,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            margin: 0,
            fontWeight: 400,
            maxWidth: 720,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.6,
            color: "var(--fg-dim)",
            maxWidth: 520,
          }}
        >
          {subtitle}
        </p>
        <Link
          href={backHref}
          style={{
            marginTop: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "11px 22px",
            fontSize: 14,
            fontWeight: 500,
            background: "transparent",
            color: "var(--fg)",
            border: "1px solid var(--hairline-strong)",
            borderRadius: 4,
            textDecoration: "none",
          }}
        >
          ← {backLabel}
        </Link>
      </main>
    </div>
  );
}
