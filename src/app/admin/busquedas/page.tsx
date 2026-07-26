import Link from "next/link";
import { getDict } from "@/lib/i18n";
import { Tag } from "@/components/ui";
import {
  AdminTable,
  type Column,
  Page,
  PageTitle,
} from "@/components/admin/admin-ui";
import { listAdminJobs, type AdminJobRow } from "@/lib/admin-db";

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

export default async function AdminSearchesPage() {
  const t = await getDict();
  const s = t.admin.searches;
  const rows = await listAdminJobs();

  const columns: Column<AdminJobRow>[] = [
    {
      key: "title",
      label: s.thSearch,
      w: "1.6fr",
      render: (r) => (
        <span style={{ fontFamily: SERIF, fontSize: 17 }}>{r.title}</span>
      ),
    },
    {
      key: "company",
      label: s.thCompany,
      w: "1fr",
      render: (r) => (
        <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>{r.company}</span>
      ),
    },
    {
      key: "applicants",
      label: s.thApplicants,
      w: "0.8fr",
      render: (r) => (
        <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
          {r.applicants}
        </span>
      ),
    },
    {
      key: "visibility",
      label: s.thVisibility,
      w: "1fr",
      render: (r) => (
        <Tag tone={r.visibility === "public" ? "accent" : "default"}>
          {s.visibility[r.visibility]}
        </Tag>
      ),
    },
    {
      key: "status",
      label: s.thStatus,
      w: "1fr",
      render: (r) => (
        <Tag tone={r.status === "open" ? "accent" : "default"}>
          {t.statuses[r.status]}
        </Tag>
      ),
    },
    {
      key: "action",
      label: "",
      w: "80px",
      align: "right",
      render: (r) => (
        <Link
          href={`/admin/busquedas/${r.id}`}
          style={{
            fontSize: 13,
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {s.view}
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
        <PageTitle eyebrow={`${s.eyebrow} · ${rows.length}`} title={s.title} />
        <Link href="/admin/busquedas/nueva" style={newBtnStyle}>
          + {s.newButton}
        </Link>
      </div>
      <AdminTable columns={columns} rows={rows} empty={s.empty} />
    </Page>
  );
}
