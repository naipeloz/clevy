import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession, isManager } from "@/lib/auth";
import { getDict, getLocale, type Dict } from "@/lib/i18n";
import { AppHeader } from "@/components/app-header";
import { ReadOnlyBanner } from "@/components/ui";
import { CompanyShell } from "@/components/company/company-shell";
import { Eyebrow, Page } from "@/components/admin/admin-ui";
import { getCompanyForUser, listJobsForCompany } from "@/lib/company-db";
import { formatLocation } from "@/lib/location";
import { SearchesGrid, type SearchItem } from "./searches-grid";

const SERIF = "var(--font-instrument-serif), serif";

export default async function EmpresaHome() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role === "user") redirect("/candidato");

  const t = await getDict();
  const locale = await getLocale();

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  if (!user) redirect("/login");

  const manager = isManager(session.role);
  const company = await getCompanyForUser(session.userId);
  // Onboarding (create company / define culture) is manager-only. HR support
  // never gets sent to those pages — that would bounce back into a redirect loop.
  if (!company) {
    if (manager) redirect("/empresa/perfil");
    return <NoCompanyState userName={user.name ?? ""} t={t} />;
  }
  if (!company.hasCulture && manager) redirect("/empresa/cultura");

  const jobs = await listJobsForCompany(company.id);

  const items: SearchItem[] = jobs.map((j) => {
    const loc =
      formatLocation(
        { city: j.city, countryCode: j.countryCode, location: j.location },
        locale
      ) || "";
    const meta = [j.industry, j.remote ? t.empresa.remote : loc]
      .filter(Boolean)
      .join(" · ");
    return {
      id: j.id,
      title: j.title,
      meta,
      status: j.status,
      applicants: j.applicantCount,
      avgMatch: j.avgMatch,
      newCount: j.newCount,
    };
  });

  return (
    <CompanyShell
      userName={user.name ?? ""}
      companyName={company.name}
      manager={manager}
      readOnlyMessage={t.ui.readOnlyDefault}
    >
      <Page max={1240}>
        {!company.hasCulture ? (
          <div
            style={{
              padding: "12px 16px",
              border: "1px solid var(--hairline-strong)",
              borderRadius: 6,
              background: "var(--bg-2)",
              fontSize: 13,
              color: "var(--fg-dim)",
            }}
          >
            {t.empresa.culturePending}
          </div>
        ) : null}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Eyebrow>
              {company.name} · {jobs.length} {t.empresa.home.searchesCount}
            </Eyebrow>
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
              {t.empresa.vacancies}
            </h1>
          </div>
          {manager ? (
            <Link href="/empresa/vacantes/nueva" style={primaryBtnStyle}>
              {t.empresa.newVacancy} <span aria-hidden>→</span>
            </Link>
          ) : null}
        </div>

        {jobs.length === 0 ? (
          <div style={{ padding: "40px 4px", fontSize: 14, color: "var(--fg-dim)" }}>
            {t.empresa.noVacancies}{" "}
            {manager ? (
              <Link
                href="/empresa/vacantes/nueva"
                style={{
                  color: "var(--fg)",
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                }}
              >
                {t.empresa.createFirst}
              </Link>
            ) : null}
          </div>
        ) : (
          <SearchesGrid items={items} manager={manager} />
        )}
      </Page>
    </CompanyShell>
  );
}

function NoCompanyState({ userName, t }: { userName: string; t: Dict }) {
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
      <ReadOnlyBanner message={t.ui.readOnlyDefault} />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "64px 48px",
          textAlign: "center",
          gap: 14,
        }}
      >
        <h1
          style={{
            fontFamily: SERIF,
            fontSize: 40,
            letterSpacing: "-0.02em",
            margin: 0,
            fontWeight: 400,
          }}
        >
          {t.empresa.noCompanyTitle}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "var(--fg-dim)",
            maxWidth: 460,
            lineHeight: 1.6,
          }}
        >
          {t.empresa.noCompanySubtitle}
        </p>
      </main>
    </div>
  );
}

const primaryBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "10px 18px",
  fontSize: 14,
  fontWeight: 500,
  background: "var(--accent)",
  color: "var(--bg)",
  border: "1px solid var(--accent)",
  borderRadius: 4,
  textDecoration: "none",
};
