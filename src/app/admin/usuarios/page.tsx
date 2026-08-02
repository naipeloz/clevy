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
import {
  countAdminUsersByRole,
  listAdminUsers,
  type AdminUserRow,
} from "@/lib/admin-db";

const SERIF = "var(--font-instrument-serif), serif";

// The list is split by role: company admins are the default view, candidates
// and super admins live behind their own tab.
const TABS = ["admin", "user", "root"] as const;
type TabRole = (typeof TABS)[number];

function isTabRole(v: unknown): v is TabRole {
  return typeof v === "string" && (TABS as readonly string[]).includes(v);
}

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

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const t = await getDict();
  const locale = await getLocale();
  const u = t.admin.users;

  const rol = (await searchParams).rol;
  const tab: TabRole = isTabRole(rol) ? rol : "admin";

  const [rows, counts] = await Promise.all([
    listAdminUsers(tab),
    countAdminUsersByRole(),
  ]);

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
        <PageTitle
          eyebrow={`${u.eyebrow} · ${counts[tab]}`}
          title={u.tabs[tab]}
        />
        <Link href="/admin/usuarios/nuevo" style={newBtnStyle}>
          + {u.newButton}
        </Link>
      </div>

      <div
        style={{
          display: "inline-flex",
          gap: 4,
          border: "1px solid var(--hairline-strong)",
          borderRadius: 999,
          padding: 3,
          alignSelf: "flex-start",
        }}
      >
        {TABS.map((id) => {
          const active = id === tab;
          return (
            <Link
              key={id}
              href={`/admin/usuarios?rol=${id}`}
              aria-current={active ? "page" : undefined}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                borderRadius: 999,
                background: active ? "var(--fg)" : "transparent",
                color: active ? "var(--bg)" : "var(--fg)",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              {u.tabs[id]} · {counts[id]}
            </Link>
          );
        })}
      </div>

      <AdminTable columns={columns} rows={rows} empty={u.emptyByTab[tab]} />
    </Page>
  );
}
