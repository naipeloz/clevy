import Link from "next/link";
import { getDict, getLocale } from "@/lib/i18n";
import { Avatar, Tag } from "@/components/ui";
import {
  AdminTable,
  type Column,
  Page,
  PageTitle,
} from "@/components/admin/admin-ui";
import { relativeTime } from "@/lib/relative-time";
import { listAdminUsers, type AdminUserRow } from "@/lib/admin-db";

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

export default async function AdminUsersPage() {
  const t = await getDict();
  const locale = await getLocale();
  const u = t.admin.users;
  const rows = await listAdminUsers();

  const columns: Column<AdminUserRow>[] = [
    {
      key: "name",
      label: u.thUser,
      w: "1.4fr",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={r.name} size={34} />
          <span style={{ fontFamily: SERIF, fontSize: 17 }}>{r.name}</span>
        </div>
      ),
    },
    {
      key: "role",
      label: u.thRole,
      w: "1fr",
      render: (r) => (
        <Tag tone={r.role === "admin" ? "accent" : "default"}>
          {u.roles[r.role]}
        </Tag>
      ),
    },
    {
      key: "email",
      label: u.thEmail,
      w: "1.2fr",
      render: (r) => (
        <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>{r.email}</span>
      ),
    },
    {
      key: "joined",
      label: u.thJoined,
      w: "1fr",
      render: (r) => (
        <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>
          {relativeTime(r.createdAt, locale)}
        </span>
      ),
    },
    {
      key: "action",
      label: "",
      w: "80px",
      align: "right",
      render: (r) => (
        <Link
          href={`/admin/usuarios/${r.id}`}
          style={{
            fontSize: 13,
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {u.view}
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
        <PageTitle eyebrow={`${u.eyebrow} · ${rows.length}`} title={u.title} />
        <Link href="/admin/usuarios/nuevo" style={newBtnStyle}>
          + {u.newButton}
        </Link>
      </div>
      <AdminTable columns={columns} rows={rows} empty={u.empty} />
    </Page>
  );
}
