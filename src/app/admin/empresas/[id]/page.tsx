import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict, type Dict } from "@/lib/i18n";
import { Eyebrow, Page, PageTitle } from "@/components/admin/admin-ui";
import { AxisMeter, Tag } from "@/components/ui";
import {
  getAdminCompany,
  getAdminCompanyCulture,
  type AdminCompanyCulture,
} from "@/lib/admin-db";
import { CULTURAL_AXES } from "@/lib/clevy-data";
import { CompanyForm } from "../company-form";

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const [company, culture] = await Promise.all([
    getAdminCompany(id),
    getAdminCompanyCulture(id),
  ]);
  if (!company) notFound();

  return (
    <Page max={800}>
      <Link
        href="/admin/empresas"
        style={{ fontSize: 13, color: "var(--fg-dim)", textDecoration: "none" }}
      >
        ← {t.admin.companies.title}
      </Link>
      <PageTitle eyebrow={t.admin.companies.eyebrow} title={company.name} />
      <CompanyForm
        id={company.id}
        initial={{
          name: company.name,
          industry: company.industry ?? "",
          domain: company.domain ?? "",
          location: company.location ?? "",
          city: company.city ?? "",
          countryCode: company.countryCode ?? "",
          tagline: company.tagline ?? "",
        }}
      />
      <CultureSummary culture={culture} t={t} />
    </Page>
  );
}

function CultureSummary({
  culture,
  t,
}: {
  culture: AdminCompanyCulture | null;
  t: Dict;
}) {
  const c = t.admin.companies;
  const intensityLabel = (v: number) =>
    v < 40 ? t.cultura.present : v < 70 ? t.cultura.important : t.cultura.central;
  const valueLabel = (id: string) =>
    (t.values as Record<string, { label: string; desc: string }>)[id]?.label ?? id;

  return (
    <div
      id="cultura"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        borderTop: "1px solid var(--hairline)",
        paddingTop: 28,
        scrollMarginTop: 24,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Eyebrow>{c.cultureTitle}</Eyebrow>
        <p style={{ margin: 0, fontSize: 13, color: "var(--fg-dim)" }}>
          {c.cultureSubtitle}
        </p>
      </div>

      {!culture ? (
        <div style={{ fontSize: 14, color: "var(--fg-dim)" }}>
          {c.cultureEmpty}
        </div>
      ) : (
        <>
          {culture.selected.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>
                {c.cultureValues}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {culture.selected.map((id) => (
                  <Tag key={id} tone="accent">
                    {valueLabel(id)} ·{" "}
                    {intensityLabel(culture.priorities[id] ?? 70)}
                  </Tag>
                ))}
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{c.cultureAxes}</div>
            {CULTURAL_AXES.map((axis) => (
              <AxisMeter
                key={axis.id}
                leftLabel={t.axes[axis.id].left}
                rightLabel={t.axes[axis.id].right}
                value={culture.axes[axis.id]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
