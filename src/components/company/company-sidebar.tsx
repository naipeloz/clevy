"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClevyMark } from "@/components/brand";
import { Avatar } from "@/components/ui";
import { useT } from "@/components/locale-provider";
import { LogoutButton } from "@/components/logout-button";
import { Icon, type IconName } from "@/components/admin/icon";

const SERIF = "var(--font-instrument-serif), serif";

export function CompanySidebar({
  userName,
  companyName,
  manager,
}: {
  userName: string;
  companyName: string;
  manager: boolean;
}) {
  const t = useT();
  const pathname = usePathname();

  const allNav: {
    href: string;
    label: string;
    icon: IconName;
    exact?: boolean;
    managerOnly?: boolean;
  }[] = [
    { href: "/empresa", label: t.empresa.nav.searches, icon: "briefcase", exact: true },
    { href: "/empresa/candidatos", label: t.empresa.nav.candidates, icon: "user" },
    { href: "/empresa/cultura", label: t.empresa.nav.culture, icon: "layers", managerOnly: true },
    { href: "/empresa/equipo", label: t.empresa.nav.team, icon: "users", managerOnly: true },
    { href: "/empresa/perfil", label: t.empresa.nav.company, icon: "building", managerOnly: true },
  ];
  const nav = allNav.filter((n) => !n.managerOnly || manager);

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
        href="/empresa"
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
        <Avatar name={companyName || userName} size={28} />
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
            {companyName || userName}
          </div>
          <div style={{ fontSize: 11, color: "var(--fg-dim)" }}>
            {manager ? "HR Manager" : t.empresa.readOnlyTag}
          </div>
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
        <div style={{ padding: "8px 6px 0" }}>
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
