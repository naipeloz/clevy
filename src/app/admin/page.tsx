import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { Tag } from "@/components/ui";
import { Eyebrow, Page, PageTitle, StatStrip } from "@/components/admin/admin-ui";
import { relativeTime } from "@/lib/relative-time";
import {
  getAdminStats,
  listAdminActivity,
  listAdminJobs,
} from "@/lib/admin-db";

const SERIF = "var(--font-instrument-serif), serif";

const DOT_COLOR: Record<string, string> = {
  search: "var(--accent)",
  user: "var(--fg)",
  candidate: "var(--warm)",
  company: "var(--fg-dim)",
};

export default async function AdminOverviewPage() {
  const t = await getDict();
  const locale = await getLocale();
  const a = t.admin.overview;

  const [stats, recentJobs, activity] = await Promise.all([
    getAdminStats(),
    listAdminJobs(4),
    listAdminActivity(5),
  ]);

  const nf = new Intl.NumberFormat(locale);
  const statItems = [
    { k: a.statCompanies, v: nf.format(stats.companies) },
    { k: a.statOpenJobs, v: nf.format(stats.openJobs) },
    { k: a.statCandidates, v: nf.format(stats.candidates) },
    { k: a.statApplications, v: nf.format(stats.applications) },
  ];

  return (
    <Page max={1240}>
      <PageTitle eyebrow={a.eyebrow} title={a.title} />
      <StatStrip items={statItems} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ marginBottom: 16 }}>
            <Eyebrow>{a.recentSearches}</Eyebrow>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            {recentJobs.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/admin/busquedas/${b.id}`}
                    style={{
                      display: "block",
                      fontSize: 14.5,
                      fontFamily: SERIF,
                      letterSpacing: "-0.005em",
                      color: "var(--fg)",
                      textDecoration: "none",
                    }}
                  >
                    {b.title}
                  </Link>
                  <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                    {b.company} · {b.applicants} {a.applicants}
                  </div>
                </div>
                <Tag tone={b.status === "open" ? "accent" : "default"}>
                  {t.statuses[b.status]}
                </Tag>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ marginBottom: 16 }}>
            <Eyebrow>{a.activity}</Eyebrow>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid var(--hairline)",
            }}
          >
            {activity.length === 0 ? (
              <div style={{ padding: "16px 0", fontSize: 13, color: "var(--fg-dim)" }}>
                {a.emptyActivity}
              </div>
            ) : (
              activity.map((n, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "16px 0",
                    borderBottom: "1px solid var(--hairline)",
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: DOT_COLOR[n.kind] ?? "var(--fg-dim)",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, lineHeight: 1.4 }}>{n.text}</div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--fg-dim)",
                        marginTop: 2,
                      }}
                    >
                      {relativeTime(n.at, locale)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}
