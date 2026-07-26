import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, jobs } from "@/db/schema";

export type PublicJob = {
  id: string;
  title: string;
  company: string;
  companyId: string;
  industry: string | null;
  location: string | null;
  countryCode: string | null;
  city: string | null;
  remote: boolean;
  description: string | null;
  createdAt: Date;
};

// Only searches that are public AND actively open are shown on the public board.
const publicOpen = and(eq(jobs.visibility, "public"), eq(jobs.status, "open"));

export async function listPublicJobs(): Promise<PublicJob[]> {
  return db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: companies.name,
      companyId: companies.id,
      industry: jobs.industry,
      location: jobs.location,
      countryCode: jobs.countryCode,
      city: jobs.city,
      remote: jobs.remote,
      description: jobs.description,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(publicOpen)
    .orderBy(desc(jobs.createdAt));
}

export async function getPublicJob(id: string): Promise<PublicJob | null> {
  const [row] = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      company: companies.name,
      companyId: companies.id,
      industry: jobs.industry,
      location: jobs.location,
      countryCode: jobs.countryCode,
      city: jobs.city,
      remote: jobs.remote,
      description: jobs.description,
      createdAt: jobs.createdAt,
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .where(and(eq(jobs.id, id), publicOpen))
    .limit(1);
  return row ?? null;
}
