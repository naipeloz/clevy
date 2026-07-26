import type { ReactNode } from "react";
import { ReadOnlyBanner } from "@/components/ui";
import { CompanySidebar } from "./company-sidebar";

// Shared company chrome: sidebar + main column, with the HR-support read-only
// banner surfaced once at the top instead of per-page.
export function CompanyShell({
  userName,
  companyName,
  manager,
  readOnlyMessage,
  children,
}: {
  userName: string;
  companyName: string;
  manager: boolean;
  readOnlyMessage?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <CompanySidebar
        userName={userName}
        companyName={companyName}
        manager={manager}
      />
      <main
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg)",
        }}
      >
        {!manager && readOnlyMessage ? (
          <ReadOnlyBanner message={readOnlyMessage} />
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
      </main>
    </div>
  );
}
