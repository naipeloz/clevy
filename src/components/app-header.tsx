import { BrandLockup } from "@/components/brand";
import { LogoutButton } from "@/components/logout-button";

export function AppHeader({ userName }: { userName: string }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 48px",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <BrandLockup />
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontSize: 13, color: "var(--fg-dim)" }}>{userName}</span>
        <LogoutButton />
      </div>
    </header>
  );
}
