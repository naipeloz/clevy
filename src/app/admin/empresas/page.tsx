import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Avatar, Tag } from "@/components/ui";
import {
  AdminTable,
  type Column,
  Page,
  PageTitle,
} from "@/components/admin/admin-ui";
import { listAdminCompanies, type AdminCompanyRow } from "@/lib/admin-db";

const SERIF = "var(--font-instrument-serif), serif";

const newBtnStyle: React.CSSProperties = {
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
  whiteSpace: "nowrap",
};

export default async function AdminCompaniesPage() {
  const t = await getDict();
  const c = t.admin.companies;
  const rows = await listAdminCompanies();

  const columns: Column<AdminCompanyRow>[] = [
    {
      key: "name",
      label: c.thCompany,
      w: "1.6fr",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={r.name} size={34} />
          <span style={{ fontFamily: SERIF, fontSize: 17 }}>{r.name}</span>
        </div>
      ),
    },
    {
      key: "industry",
      label: c.thIndustry,
      w: "1fr",
      render: (r) => (
        <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>
          {r.industry ?? "—"}
        </span>
      ),
    },
    {
      key: "searches",
      label: c.thSearches,
      w: "1fr",
      render: (r) => (
        <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          {r.searches}
        </span>
      ),
    },
    {
      key: "culture",
      label: c.thCulture,
      w: "1fr",
      render: (r) =>
        r.hasCulture ? (
          <Tag tone="accent">{c.cultureComplete}</Tag>
        ) : (
          <Tag>{c.culturePending}</Tag>
        ),
    },
    {
      key: "action",
      label: "",
      w: "80px",
      align: "right",
      render: (r) => (
        <Link
          href={`/admin/empresas/${r.id}`}
          style={{
            fontSize: 13,
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {c.view}
        </Link>
      ),
    },
  ];

  return (
    <Page max={1160}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <PageTitle eyebrow={`${c.eyebrow} · ${rows.length}`} title={c.title} />
        <Link href="/admin/empresas/nueva" style={newBtnStyle}>
          + {c.newButton}
        </Link>
      </div>
      <AdminTable columns={columns} rows={rows} empty={c.empty} />
    </Page>
  );
}
