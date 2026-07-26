"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClevyMark } from "@/components/brand";
import { Avatar } from "@/components/ui";
import { useT } from "@/components/locale-provider";
import { LogoutButton } from "@/components/logout-button";
import { Icon, type IconName } from "./icon";

const SERIF = "var(--font-instrument-serif), serif";

export function AdminSidebar({ userName }: { userName: string }) {
  const t = useT();
  const pathname = usePathname();

  const nav: { href: string; label: string; icon: IconName; exact?: boolean }[] =
    [
      { href: "/admin", label: t.admin.nav.overview, icon: "grid", exact: true },
      { href: "/admin/empresas", label: t.admin.nav.companies, icon: "building" },
      { href: "/admin/busquedas", label: t.admin.nav.searches, icon: "briefcase" },
      { href: "/admin/usuarios", label: t.admin.nav.users, icon: "user" },
      { href: "/admin/candidatos", label: t.admin.nav.upload, icon: "upload" },
    ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 240,
        borderRight: "1px solid var(--hairline)",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <Link
        href="/admin"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 10px 20px",
          textDecoration: "none",
          color: "var(--fg)",
        }}
      >
        <ClevyMark size={26} />
        <span style={{ fontFamily: SERIF, fontSize: 22, letterSpacing: "-0.01em" }}>
          Clevy
        </span>
      </Link>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: "var(--bg-2)",
          borderRadius: 6,
          marginBottom: 16,
        }}
      >
        <Avatar name={userName} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-dim)" }}>{t.admin.role}</div>
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={"sidebar-item " + (isActive(n.href, n.exact) ? "active" : "")}
          >
            <Icon name={n.icon} size={15} />
            {n.label}
          </Link>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          borderTop: "1px solid var(--hairline)",
          paddingTop: 14,
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div className="sidebar-item">
          <Icon name="bell" size={15} /> {t.admin.notifications}
        </div>
        <div className="sidebar-item">
          <Icon name="settings" size={15} /> {t.admin.settings}
        </div>
        <div style={{ padding: "8px 6px 0" }}>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
