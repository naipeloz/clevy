import Link from "next/link";
import { BrandLockup } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getDict } from "@/lib/i18n";

export async function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const t = await getDict();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      <div
        style={{
          padding: "32px 48px",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--hairline)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <BrandLockup />
          </Link>
          <LanguageSwitcher />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 440,
            marginInline: "auto",
            width: "100%",
            gap: 32,
            paddingBlock: 48,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
                lineHeight: 1.02,
                letterSpacing: "-0.03em",
                margin: 0,
                fontWeight: 400,
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 15,
                lineHeight: 1.5,
                color: "var(--fg-dim)",
              }}
            >
              {subtitle}
            </p>
          </div>
          {children}
          <div style={{ fontSize: 13, color: "var(--fg-dim)" }}>{footer}</div>
        </div>
      </div>

      <aside
        style={{
          background: "var(--bg-2)",
          padding: "48px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 48,
          borderLeft: "1px solid var(--hairline)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--fg-dim)",
          }}
        >
          {t.shell.eyebrow}
        </div>
        <blockquote
          style={{
            margin: 0,
            fontFamily: "var(--font-instrument-serif), serif",
            fontSize: 40,
            lineHeight: 1.12,
            letterSpacing: "-0.02em",
          }}
        >
          {t.shell.quotePre}
          <em style={{ color: "var(--accent)" }}>{t.shell.quoteEm}</em>
          {t.shell.quotePost}
        </blockquote>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 24,
            borderTop: "1px solid var(--hairline)",
            color: "var(--fg-dim)",
            fontSize: 13,
          }}
        >
          <div>
            <strong
              style={{ color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
            >
              7
            </strong>{" "}
            {t.shell.stat1}
          </div>
          <div>
            <strong
              style={{ color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
            >
              7
            </strong>{" "}
            {t.shell.stat2}
          </div>
          <div>
            <strong
              style={{ color: "var(--fg)", fontVariantNumeric: "tabular-nums" }}
            >
              2
            </strong>{" "}
            {t.shell.stat3}
          </div>
        </div>
      </aside>
    </div>
  );
}
