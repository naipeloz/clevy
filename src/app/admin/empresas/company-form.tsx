"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorBanner, Field, Input } from "@/components/admin/form";

export type CompanyValues = {
  name: string;
  industry: string;
  domain: string;
  location: string;
  city: string;
  countryCode: string;
  tagline: string;
};

const EMPTY: CompanyValues = {
  name: "",
  industry: "",
  domain: "",
  location: "",
  city: "",
  countryCode: "",
  tagline: "",
};

export function CompanyForm({
  id,
  initial,
}: {
  id?: string;
  initial?: CompanyValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<CompanyValues>(initial ?? EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (k: keyof CompanyValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(
        id ? `/api/admin/companies/${id}` : "/api/admin/companies",
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
        setError(data.error ?? "No se pudo guardar la empresa");
        return;
      }
      router.push(data.redirectTo ?? "/admin/empresas");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm(`¿Eliminar la empresa "${values.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/companies/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar la empresa");
        return;
      }
      router.push(data.redirectTo ?? "/admin/empresas");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: 640 }}
    >
      <ErrorBanner message={error} />
      <Field label="Nombre">
        {(fid) => (
          <Input id={fid} required value={values.name} onChange={set("name")} />
        )}
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Industria">
          {(fid) => (
            <Input id={fid} value={values.industry} onChange={set("industry")} />
          )}
        </Field>
        <Field label="Dominio">
          {(fid) => (
            <Input
              id={fid}
              value={values.domain}
              onChange={set("domain")}
              placeholder="empresa.com"
            />
          )}
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <Field label="Ubicación">
          {(fid) => (
            <Input id={fid} value={values.location} onChange={set("location")} />
          )}
        </Field>
        <Field label="País (ISO-2)">
          {(fid) => (
            <Input
              id={fid}
              value={values.countryCode}
              onChange={set("countryCode")}
              maxLength={2}
              placeholder="AR"
            />
          )}
        </Field>
      </div>
      <Field label="Ciudad">
        {(fid) => <Input id={fid} value={values.city} onChange={set("city")} />}
      </Field>
      <Field label="Tagline">
        {(fid) => (
          <Input id={fid} value={values.tagline} onChange={set("tagline")} />
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
          {id ? "Guardar cambios" : "Crear empresa"}
        </Button>
        {id ? (
          <Button
            type="button"
            variant="danger"
            pending={deleting}
            onClick={onDelete}
          >
            Eliminar
          </Button>
        ) : null}
      </div>
    </form>
  );
}
