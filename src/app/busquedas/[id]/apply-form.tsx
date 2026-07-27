"use client";

import { useState } from "react";
import { Button, ErrorBanner, Field, Input, Textarea } from "@/components/admin/form";
import { useT } from "@/components/locale-provider";

export function ApplyForm({ jobId }: { jobId: string }) {
  const t = useT();
  const p = t.publicJobs;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedin] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | "sent" | "already">(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, name, email, linkedinUrl, cvUrl, message }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        already?: boolean;
      };
      if (!res.ok) {
        setError(data.error ?? p.error);
        return;
      }
      setDone(data.already ? "already" : "sent");
    } catch {
      setError(t.common.networkError);
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        style={{
          padding: "16px 18px",
          border: `1px solid ${done === "sent" ? "var(--accent)" : "var(--hairline-strong)"}`,
          background: "var(--bg-2)",
          borderRadius: 8,
          fontSize: 14,
          lineHeight: 1.5,
          color: "var(--fg)",
        }}
      >
        {done === "sent" ? p.success : p.already}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ErrorBanner message={error} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label={p.fieldName}>
          {(id) => (
            <Input id={id} required value={name} onChange={(e) => setName(e.target.value)} />
          )}
        </Field>
        <Field label={p.fieldEmail}>
          {(id) => (
            <Input
              id={id}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
            />
          )}
        </Field>
      </div>
      <Field label={p.fieldLinkedin}>
        {(id) => (
          <Input
            id={id}
            value={linkedinUrl}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/…"
          />
        )}
      </Field>
      <Field label={p.fieldCv}>
        {(id) => (
          <Input
            id={id}
            type="url"
            value={cvUrl}
            onChange={(e) => setCvUrl(e.target.value)}
            placeholder="https://…/mi-cv.pdf"
          />
        )}
      </Field>
      <Field label={p.fieldMessage}>
        {(id) => (
          <Textarea
            id={id}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        )}
      </Field>
      <Button type="submit" pending={pending} style={{ alignSelf: "flex-start" }}>
        {p.submit}
      </Button>
    </form>
  );
}
