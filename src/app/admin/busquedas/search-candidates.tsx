"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Tag } from "@/components/ui";
import { Button, ErrorBanner, Input } from "@/components/admin/form";
import { useT } from "@/components/locale-provider";

const SERIF = "var(--font-instrument-serif), serif";

type MatchStage =
  | "self_applied"
  | "presented_by_admin"
  | "approved_by_clevy"
  | "suggested_by_ai"
  | "pending_cultural_match";

export type JobCandidate = {
  matchId: string;
  candidateId: string;
  name: string;
  email: string;
  stage: MatchStage;
  cvUrl: string | null;
  hasCulture: boolean;
};

type CandidateOption = { id: string; name: string; email: string };

const stageTone = (s: MatchStage): "accent" | "default" =>
  s === "approved_by_clevy" ? "accent" : "default";

export function SearchCandidates({
  jobId,
  candidates,
  allCandidates,
}: {
  jobId: string;
  candidates: JobCandidate[];
  allCandidates: CandidateOption[];
}) {
  const t = useT();
  const c = t.admin.searches.candidates;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const onJob = new Set(candidates.map((x) => x.candidateId));

  async function call(url: string, method: string, body?: unknown) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setError(d.error ?? t.common.networkError);
        return false;
      }
      router.refresh();
      return true;
    } catch {
      setError(t.common.networkError);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const approve = (matchId: string) =>
    call(`/api/admin/matches/${matchId}`, "PATCH", { stage: "approved_by_clevy" });
  const remove = (matchId: string) =>
    call(`/api/admin/matches/${matchId}`, "DELETE");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        borderTop: "1px solid var(--hairline)",
        paddingTop: 28,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontFamily: SERIF, fontSize: 26, margin: 0, fontWeight: 400 }}>
            {c.title} · {candidates.length}
          </h2>
          <p style={{ fontSize: 13, color: "var(--fg-dim)", margin: "4px 0 0" }}>
            {c.subtitle}
          </p>
        </div>
        <Button type="button" onClick={() => setModalOpen(true)}>
          + {c.addButton}
        </Button>
      </div>

      <ErrorBanner message={error} />

      {candidates.length === 0 ? (
        <div style={{ fontSize: 14, color: "var(--fg-dim)", padding: "8px 0" }}>
          {c.empty}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {candidates.map((cand) => (
            <div
              key={cand.matchId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderBottom: "1px solid var(--hairline)",
              }}
            >
              <Avatar name={cand.name} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{cand.name}</div>
                <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>
                  {cand.email}
                  {cand.cvUrl ? (
                    <>
                      {" · "}
                      <a
                        href={cand.cvUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        style={{ color: "var(--fg)", textDecoration: "underline" }}
                      >
                        {c.cv}
                      </a>
                    </>
                  ) : null}
                </div>
              </div>
              <Tag tone={stageTone(cand.stage)}>{c.stages[cand.stage]}</Tag>
              <div style={{ display: "flex", gap: 8 }}>
                {cand.stage !== "approved_by_clevy" ? (
                  <button
                    type="button"
                    onClick={() => approve(cand.matchId)}
                    disabled={busy}
                    style={btn("var(--accent)", "var(--bg)", "var(--accent)")}
                  >
                    {c.approve}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(cand.matchId)}
                  disabled={busy}
                  style={btn("transparent", "var(--warm)", "var(--warm)")}
                >
                  {c.remove}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <AddCandidatesModal
          available={allCandidates.filter((a) => !onJob.has(a.id))}
          onClose={() => setModalOpen(false)}
          onAdd={async (ids) => {
            const ok = await call(
              `/api/admin/searches/${jobId}/candidates`,
              "POST",
              { candidateIds: ids }
            );
            if (ok) setModalOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function btn(bg: string, color: string, border: string): React.CSSProperties {
  return {
    fontSize: 13,
    color,
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 4,
    padding: "6px 12px",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function AddCandidatesModal({
  available,
  onClose,
  onAdd,
}: {
  available: CandidateOption[];
  onClose: () => void;
  onAdd: (ids: string[]) => void;
}) {
  const t = useT();
  const c = t.admin.searches.candidates;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const filtered = q
    ? available.filter(
        (a) =>
          a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      )
    : available;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 50,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)",
          border: "1px solid var(--hairline-strong)",
          borderRadius: 10,
          width: "100%",
          maxWidth: 520,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          padding: 24,
          gap: 16,
        }}
      >
        <div style={{ fontFamily: SERIF, fontSize: 24 }}>{c.modalTitle}</div>
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={c.search}
        />
        <div style={{ overflow: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
          {filtered.length === 0 ? (
            <div style={{ fontSize: 14, color: "var(--fg-dim)", padding: "16px 0" }}>
              {c.noResults}
            </div>
          ) : (
            filtered.map((a) => (
              <label
                key={a.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 4px",
                  borderBottom: "1px solid var(--hairline)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(a.id)}
                  onChange={() => toggle(a.id)}
                />
                <Avatar name={a.name} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--fg-dim)" }}>{a.email}</div>
                </div>
              </label>
            ))
          )}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {c.cancel}
          </Button>
          <Button
            type="button"
            disabled={selected.size === 0}
            onClick={() => onAdd([...selected])}
          >
            {c.addSelected} ({selected.size})
          </Button>
        </div>
      </div>
    </div>
  );
}
