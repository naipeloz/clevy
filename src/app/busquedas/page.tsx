import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { Avatar, Tag } from "@/components/ui";
import { PublicHeader } from "@/components/public-header";
import { listPublicJobs } from "@/lib/public-db";
import { formatLocation } from "@/lib/location";

const SERIF = "var(--font-instrument-serif), serif";

export default async function PublicJobsPage() {
  const t = await getDict();
  const locale = await getLocale();
  const p = t.publicJobs;
  const jobs = await listPublicJobs();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <PublicHeader />
      <main style={{ padding: "48px 64px 96px" }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-dim)",
              }}
            >
              {p.eyebrow} · {jobs.length} {p.open}
            </div>
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
              {p.title}
            </h1>
            <p style={{ margin: 0, fontSize: 15, color: "var(--fg-dim)", maxWidth: 620, lineHeight: 1.5 }}>
              {p.subtitle}
            </p>
          </div>

          {jobs.length === 0 ? (
            <div style={{ padding: "48px 4px", fontSize: 15, color: "var(--fg-dim)" }}>
              {p.empty}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {jobs.map((j) => {
                const loc =
                  formatLocation(
                    { city: j.city, countryCode: j.countryCode, location: j.location },
                    locale
                  ) || "";
                const place = j.remote ? p.remote : loc;
                return (
                  <div
                    key={j.id}
                    style={{
                      border: "1px solid var(--hairline)",
                      borderRadius: 8,
                      padding: 26,
                      background: "var(--bg)",
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <Avatar name={j.company} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontSize: 24,
                            letterSpacing: "-0.01em",
                            lineHeight: 1.1,
                          }}
                        >
                          {j.title}
                        </div>
                        <div style={{ fontSize: 13, color: "var(--fg-dim)", marginTop: 4 }}>
                          {j.company}
                          {place ? ` · ${place}` : ""}
                        </div>
                      </div>
                    </div>
                    {j.description ? (
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "var(--fg-dim)",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {j.description}
                      </div>
                    ) : null}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {j.industry ? <Tag>{j.industry}</Tag> : null}
                      {j.remote ? <Tag>{p.remote}</Tag> : null}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 10,
                        paddingTop: 16,
                        borderTop: "1px solid var(--hairline)",
                      }}
                    >
                      <Link href={`/busquedas/${j.id}`} style={ghostBtn}>
                        {p.viewDetail}
                      </Link>
                      <Link href={`/busquedas/${j.id}#aplicar`} style={accentBtn}>
                        {p.apply} <span aria-hidden>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const baseBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 500,
  borderRadius: 4,
  textDecoration: "none",
};
const ghostBtn: React.CSSProperties = {
  ...baseBtn,
  background: "transparent",
  color: "var(--fg)",
  border: "1px solid var(--hairline-strong)",
};
const accentBtn: React.CSSProperties = {
  ...baseBtn,
  background: "var(--accent)",
  color: "var(--bg)",
  border: "1px solid var(--accent)",
};
