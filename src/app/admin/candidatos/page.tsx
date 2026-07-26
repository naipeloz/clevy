import { listAllJobs } from "@/lib/company-db";
import { UploadClient } from "./upload-client";

// Auth is enforced by the admin layout (admin-only). This page just loads the
// vacancy list for the CSV candidate uploader.
export default async function AdminCandidatosPage() {
  const jobs = await listAllJobs();

  return (
    <UploadClient
      jobs={jobs.map((j) => ({
        id: j.id,
        label: `${j.company} — ${j.title}`,
      }))}
    />
  );
}
