import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { hashPassword } from "@/lib/auth";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!;

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // Company
  const [company] = await db
    .insert(schema.companies)
    .values({
      name: "Acme Corp",
      domain: "acme.com",
    })
    .returning();

  // User
  await db.insert(schema.users).values({
    email: "admin@acme.com",
    name: "Admin User",
    passwordHash: await hashPassword("admin1234"),
    role: "admin",
    companyId: company.id,
  });

  // Org culture
  await db.insert(schema.orgCulture).values({
    companyId: company.id,
    values: ["innovation", "collaboration", "transparency"],
    workStyle: { flexibility: "high", remote: true },
    benefits: ["health", "equity", "unlimited_pto"],
  });

  // Job
  const [job] = await db
    .insert(schema.jobs)
    .values({
      companyId: company.id,
      title: "Senior Software Engineer",
      description: "Build amazing products.",
      location: "San Francisco, CA",
      remote: true,
      salaryMin: 150000,
      salaryMax: 220000,
      status: "open",
    })
    .returning();

  // Candidate
  const [candidate] = await db
    .insert(schema.candidates)
    .values({
      email: "jane@example.com",
      name: "Jane Doe",
      phone: "+1-555-0100",
      linkedinUrl: "https://linkedin.com/in/janedoe",
      summary: "Full-stack engineer with 8 years of experience.",
    })
    .returning();

  // Candidate culture
  await db.insert(schema.candidateCulture).values({
    candidateId: candidate.id,
    values: ["innovation", "autonomy"],
    workStyle: { flexibility: "high", remote: true },
  });

  // Candidate preferences
  await db.insert(schema.candidatePreferences).values({
    candidateId: candidate.id,
    desiredRoles: ["Senior Engineer", "Staff Engineer"],
    locations: ["San Francisco", "Remote"],
    remoteOnly: false,
    salaryMin: 160000,
  });

  // Match
  await db.insert(schema.matches).values({
    candidateId: candidate.id,
    jobId: job.id,
    score: 87,
    status: "shortlisted",
    reasoning: "Strong culture fit and matching technical skills.",
  });

  // File
  await db.insert(schema.files).values({
    candidateId: candidate.id,
    type: "resume",
    url: "https://storage.example.com/resumes/jane-doe.pdf",
    filename: "jane-doe-resume.pdf",
    mimeType: "application/pdf",
    sizeBytes: 245_000,
  });

  // ATS integration
  await db.insert(schema.atsIntegrations).values({
    companyId: company.id,
    provider: "greenhouse",
    config: { apiKey: "demo_key", webhookUrl: "https://acme.com/webhooks/ats" },
    active: true,
  });

  console.log("Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
