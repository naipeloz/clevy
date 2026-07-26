"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  ErrorBanner,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/admin/form";
import { useT } from "@/components/locale-provider";

export type SearchValues = {
  title: string;
  companyId: string;
  status: "draft" | "open" | "paused" | "closed";
  visibility: "public" | "private";
  description: string;
  location: string;
  remote: boolean;
};

const EMPTY: SearchValues = {
  title: "",
  companyId: "",
  status: "draft",
  visibility: "public",
  description: "",
  location: "",
  remote: false,
};

const STATUS_ORDER = ["draft", "open", "paused", "closed"] as const;

export function SearchForm({
  id,
  initial,
  companies,
}: {
  id?: string;
  initial?: SearchValues;
  companies: { id: string; name: string }[];
}) {
  const router = useRouter();
  const t = useT();
  const f = t.admin.searches.form;
  const [values, setValues] = useState<SearchValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function upd<K extends keyof SearchValues>(k: K, v: SearchValues[K]) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(
        id ? `/api/admin/searches/${id}` : "/api/admin/searches",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar la búsqueda");
        return;
      }
      router.push(data.redirectTo ?? "/admin/busquedas");
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm(`¿Eliminar la búsqueda "${values.title}"? Se borrarán también sus postulaciones.`)) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/searches/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar la búsqueda");
        return;
      }
      router.push(data.redirectTo ?? "/admin/busquedas");
      router.refresh();
    } catch {
      setError(t.common.networkError);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 680 }}
    >
      <ErrorBanner message={error} />
      <Field label={f.title}>
        {(fid) => (
          <Input
            id={fid}
            required
            value={values.title}
            onChange={(e) => upd("title", e.target.value)}
          />
        )}
      </Field>
      <Field label={f.company}>
        {(fid) => (
          <Select
            id={fid}
            required
            value={values.companyId}
            onChange={(e) => upd("companyId", e.target.value)}
          >
            <option value="">{f.pickCompany}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label={f.status}>
          {(fid) => (
            <Select
              id={fid}
              value={values.status}
              onChange={(e) =>
                upd("status", e.target.value as SearchValues["status"])
              }
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {t.statuses[s]}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label={f.visibility}>
          {(fid) => (
            <Select
              id={fid}
              value={values.visibility}
              onChange={(e) =>
                upd("visibility", e.target.value as SearchValues["visibility"])
              }
            >
              <option value="public">{t.admin.searches.visibility.public}</option>
              <option value="private">
                {t.admin.searches.visibility.private}
              </option>
            </Select>
          )}
        </Field>
      </div>
      <Field label={f.location}>
        {(fid) => (
          <Input
            id={fid}
            value={values.location}
            onChange={(e) => upd("location", e.target.value)}
          />
        )}
      </Field>
      <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
        <input
          type="checkbox"
          checked={values.remote}
          onChange={(e) => upd("remote", e.target.checked)}
        />
        {f.remote}
      </label>
      <Field label={f.description}>
        {(fid) => (
          <Textarea
            id={fid}
            value={values.description}
            onChange={(e) => upd("description", e.target.value)}
          />
        )}
      </Field>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "space-between",
          paddingTop: 8,
        }}
      >
        <Button type="submit" pending={pending}>
          {id ? f.save : f.create}
        </Button>
        {id ? (
          <Button
            type="button"
            variant="danger"
            pending={deleting}
            onClick={onDelete}
          >
            {f.remove}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
