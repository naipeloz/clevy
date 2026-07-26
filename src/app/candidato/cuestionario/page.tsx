import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { CuestionarioClient } from "./cuestionario-client";

export default async function CuestionarioPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "user") redirect("/empresa");
  return <CuestionarioClient />;
}
