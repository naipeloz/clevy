import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentSession } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";
import { listAllJobs } from "@/lib/company-db";
import { UploadClient } from "./upload-client";

export default async function AdminCandidatosPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/login");

  const [user] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const jobs = await listAllJobs();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
      }}
    >
      <AppHeader userName={user?.name ?? "Admin"} />
      <UploadClient
        jobs={jobs.map((j) => ({
          id: j.id,
          label: `${j.company} — ${j.title}`,
        }))}
      />
    </div>
  );
}
