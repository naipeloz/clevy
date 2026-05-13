"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      style={{
        height: 36,
        padding: "0 16px",
        background: "transparent",
        color: "var(--fg)",
        border: "1px solid var(--hairline-strong)",
        borderRadius: 4,
        fontSize: 13,
        fontWeight: 500,
        cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.6 : 1,
        fontFamily: "inherit",
      }}
    >
      {pending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
