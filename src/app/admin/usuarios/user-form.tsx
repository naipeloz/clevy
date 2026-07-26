"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  ErrorBanner,
  Field,
  Input,
  Select,
} from "@/components/admin/form";

export type UserValues = {
  name: string;
  email: string;
  role: string;
  companyId: string;
};

export function UserForm({
  id,
  initial,
  roles,
  companies,
}: {
  id?: string;
  initial?: UserValues;
  roles: { value: string; label: string }[];
  companies: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [values, setValues] = useState<UserValues>(
    initial ?? { name: "", email: "", role: "user", companyId: "" }
  );
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set =
    (k: keyof UserValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(
        id ? `/api/admin/users/${id}` : "/api/admin/users",
        {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, password }),
        }
      );
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el usuario");
        return;
      }
      router.push(data.redirectTo ?? "/admin/usuarios");
      router.refresh();
    } catch {
      setError("Error de red. Intentalo de nuevo.");
    } finally {
      setPending(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm(`¿Eliminar al usuario "${values.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        redirectTo?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo eliminar el usuario");
        return;
      }
      router.push(data.redirectTo ?? "/admin/usuarios");
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Nombre">
          {(fid) => (
            <Input id={fid} required value={values.name} onChange={set("name")} />
          )}
        </Field>
        <Field label="Email">
          {(fid) => (
            <Input
              id={fid}
              type="email"
              required
              value={values.email}
              onChange={set("email")}
            />
          )}
        </Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Rol">
          {(fid) => (
            <Select id={fid} value={values.role} onChange={set("role")}>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
        <Field label="Empresa" hint="Opcional">
          {(fid) => (
            <Select id={fid} value={values.companyId} onChange={set("companyId")}>
              <option value="">— Sin empresa —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
      <Field
        label={id ? "Nueva contraseña" : "Contraseña"}
        hint={id ? "Dejá en blanco para mantener la actual." : "Mínimo 8 caracteres."}
      >
        {(fid) => (
          <Input
            id={fid}
            type="password"
            autoComplete="new-password"
            required={!id}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
          {id ? "Guardar cambios" : "Crear usuario"}
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
