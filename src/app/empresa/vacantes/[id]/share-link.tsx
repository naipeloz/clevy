"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/locale-provider";

// The public posting link for a vacancy, so the company can send it to its own
// candidates. The absolute URL is built on the client — the server doesn't know
// which host the browser is on.
export function ShareLink({
  jobId,
  status,
  visibility,
}: {
  jobId: string;
  status: "draft" | "open" | "paused" | "closed";
  visibility: "public" | "private";
}) {
  const t = useT();
  const v = t.vacante;
  const path = `/busquedas/${jobId}`;
  const [url, setUrl] = useState(path);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  // The posting is only reachable while the search is public and open.
  const warning =
    visibility !== "public"
      ? v.sharePrivate
      : status !== "open"
        ? v.shareDraft
        : null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; the link is still selectable on screen.
    }
  }

  return (
    <div
      style={{
        border: "1px solid var(--hairline-strong)",
        borderRadius: 8,
        padding: 18,
        background: "var(--bg-2)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--fg-dim)",
        }}
      >
        {v.shareTitle}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <code
          style={{
            flex: 1,
            fontSize: 13,
            wordBreak: "break-all",
            color: "var(--fg)",
          }}
        >
          {url}
        </code>
        <button type="button" onClick={copy} style={copyBtn}>
          {copied ? v.shareCopied : v.shareCopy}
        </button>
        <a href={path} target="_blank" rel="noreferrer noopener" style={openLink}>
          {v.shareOpen} ↗
        </a>
      </div>
      <div style={{ fontSize: 12, color: warning ? "var(--warm)" : "var(--fg-dim)" }}>
        {warning ?? v.shareHint}
      </div>
    </div>
  );
}

const copyBtn: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  border: "1px solid var(--accent)",
  borderRadius: 4,
  background: "var(--accent)",
  color: "var(--bg)",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const openLink: React.CSSProperties = {
  fontSize: 13,
  color: "var(--fg)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  whiteSpace: "nowrap",
};
