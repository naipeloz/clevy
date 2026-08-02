"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useT } from "@/components/locale-provider";
import { fmt } from "@/lib/fmt";

// Edit + delete straight from the search list, so removing a search doesn't
// require opening it first.
export function SearchRowActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const t = useT();
  const s = t.admin.searches;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    if (!confirm(fmt(s.confirmRemove, { title }))) return;
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/admin/searches/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? s.removeError);
        return;
      }
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 4,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link
          href={`/admin/busquedas/${id}`}
          style={{
            fontSize: 13,
            color: "var(--fg)",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {s.view}
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          style={{
            fontSize: 13,
            color: "var(--warm)",
            background: "none",
            border: "none",
            padding: 0,
            cursor: pending ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {pending ? s.removing : s.remove}
        </button>
      </div>
      {error ? (
        <span style={{ fontSize: 11, color: "var(--warm)", textAlign: "right" }}>
          {error}
        </span>
      ) : null}
    </div>
  );
}
