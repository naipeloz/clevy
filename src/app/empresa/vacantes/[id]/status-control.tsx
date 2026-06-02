"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "draft" | "open" | "paused" | "closed";

const NEXT_ACTIONS: Record<Status, { label: string; status: Status }[]> = {
  draft: [{ label: "Publicar", status: "open" }],
  open: [
    { label: "Pausar", status: "paused" },
    { label: "Cerrar", status: "closed" },
  ],
  paused: [
    { label: "Reabrir", status: "open" },
    { label: "Cerrar", status: "closed" },
  ],
  closed: [{ label: "Reabrir", status: "open" }],
};

export function JobStatusControl({
  jobId,
  status,
}: {
  jobId: string;
  status: Status;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

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
