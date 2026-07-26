"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import { Button, ErrorBanner, Select } from "@/components/admin/form";
import { useT } from "@/components/locale-provider";

const SERIF = "var(--font-instrument-serif), serif";

type UserLite = { id: string; name: string; email: string; role: string };

export function SearchUsers({
  jobId,
  assigned,
  allUsers,
}: {
  jobId: string;
  assigned: UserLite[];
  allUsers: UserLite[];
}) {
  const t = useT();
  const s = t.admin.searches.usersSection;
  const router = useRouter();
  const [pick, setPick] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const assignedIds = new Set(assigned.map((u) => u.id));
  const available = allUsers.filter((u) => !assignedIds.has(u.id));

  async function add() {
    if (!pick) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/searches/${jobId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pick }),
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "No se pudo agregar el usuario");
        return;
      }
      setPick("");
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setBusy(false);
    }
  }

  async function remove(userId: string) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(
        `/api/admin/searches/${jobId}/users?userId=${userId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? "No se pudo quitar el usuario");
        return;
      }
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 680,
        borderTop: "1px solid var(--hairline)",
        paddingTop: 28,
      }}
    >
      <div>
        <h2 style={{ fontFamily: SERIF, fontSize: 26, margin: 0, fontWeight: 400 }}>
          {s.title}
        </h2>
        <p style={{ fontSize: 13, color: "var(--fg-dim)", margin: "4px 0 0" }}>
          {s.subtitle}
        </p>
      </div>

      <ErrorBanner message={error} />

      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <Select
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          disabled={busy || available.length === 0}
          style={{ flex: 1 }}
        >
          <option value="">{s.placeholder}</option>
          {available.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} · {u.email}
            </option>
          ))}
        </Select>
        <Button type="button" onClick={add} pending={busy} disabled={!pick}>
          {s.add}
        </Button>
      </div>

      {assigned.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--fg-dim)", padding: "8px 0" }}>
          {s.empty}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {assigned.map((u) => (
            <div
              key={u.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <Avatar name={u.name} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>{u.email}</div>
              </div>
              <button
                type="button"
                onClick={() => remove(u.id)}
                disabled={busy}
                style={{
                  fontSize: 13,
                  color: "var(--warm)",
                  background: "transparent",
                  border: "1px solid var(--warm)",
                  borderRadius: 4,
                  padding: "6px 12px",
                  cursor: busy ? "wait" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {s.remove}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
