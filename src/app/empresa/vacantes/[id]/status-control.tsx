"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/locale-provider";

type Status = "draft" | "open" | "paused" | "closed";

export function JobStatusControl({
  jobId,
  status,
}: {
  jobId: string;
  status: Status;
}) {
  const router = useRouter();
  const t = useT();
  const [pending, setPending] = useState(false);

  const NEXT_ACTIONS: Record<Status, { label: string; status: Status }[]> = {
    draft: [{ label: t.vacante.statusPublish, status: "open" }],
    open: [
      { label: t.vacante.statusPause, status: "paused" },
      { label: t.vacante.statusClose, status: "closed" },
    ],
    paused: [
      { label: t.vacante.statusReopen, status: "open" },
      { label: t.vacante.statusClose, status: "closed" },
    ],
    closed: [{ label: t.vacante.statusReopen, status: "open" }],
  };

  async function setStatus(next: Status) {
    setPending(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      {NEXT_ACTIONS[status].map((a) => (
        <button
          key={a.status}
          type="button"
          disabled={pending}
          onClick={() => setStatus(a.status)}
          style={{
            padding: "8px 14px",
            fontSize: 13,
            border: "1px solid var(--hairline-strong)",
            borderRadius: 4,
            background: "var(--bg)",
            color: "var(--fg)",
            cursor: pending ? "wait" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}
