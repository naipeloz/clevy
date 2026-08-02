import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  candidateCulture,
  candidates as candidatesTable,
  companies as companiesTable,
  invitations as invitationsTable,
  jobs as jobsTable,
  matches as matchesTable,
  orgCulture,
  users as usersTable,
} from "@/db/schema";
import {
  computeMatch,
  CULTURAL_AXES,
  isAxisValues,
  type AxisValues,
} from "./clevy-data";
import type { RemoteScope } from "./location";

export type CompanyForUser = {
  id: string;
  name: string;
  slug: string | null;
  domain: string | null;
  tagline: string | null;
  industry: string | null;
  location: string | null;
  countryCode: string | null;
  city: string | null;
  logoUrl: string | null;
  hasCulture: boolean;
};

export type JobRow = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  countryCode: string | null;
  city: string | null;
  remote: boolean;
  remoteScope: RemoteScope | null;
  visibility: "public" | "private";
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  hardSkills: string[];
  experienceMin: number | null;
  industry: string | null;
  status: "draft" | "open" | "paused" | "closed";
  applicantCount: number;
  avgMatch: number | null;
  newCount: number;
  createdAt: Date;
};

export type ApplicantRow = {
  matchId: string;
  candidateId: string;
  name: string;
  role: string;
  location: string;
  status: "pending" | "shortlisted" | "rejected" | "hired";
  formCompleted: boolean;
  match: number | null;
  values: AxisValues | null;
};

export type InvitationRow = {
  id: string;
  email: string;
  token: string;
  role: "root" | "admin" | "user";
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "root" | "admin" | "user";
};

function fallbackAxes(): AxisValues {
  const fallback: Partial<AxisValues> = {};
  for (const a of CULTURAL_AXES) fallback[a.id] = 50;
  return fallback as AxisValues;
}

function toStringArray(raw: unknown): string[] {
  return Array.isArray(raw)
    ? raw.filter((x): x is string => typeof x === "string")
    : [];
}

export async function getCompanyForUser(
  userId: string
): Promise<CompanyForUser | null> {
  const [user] = await db
    .select({ companyId: usersTable.companyId })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user?.companyId) return null;

  const [row] = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      slug: companiesTable.slug,
      domain: companiesTable.domain,
      tagline: companiesTable.tagline,
      industry: companiesTable.industry,
      location: companiesTable.location,
      countryCode: companiesTable.countryCode,
      city: companiesTable.city,
      logoUrl: companiesTable.logoUrl,
      cultureValues: orgCulture.values,
    })
    .from(companiesTable)
    .leftJoin(orgCulture, eq(orgCulture.companyId, companiesTable.id))
    .where(eq(companiesTable.id, user.companyId))
    .limit(1);

  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    tagline: row.tagline,
    industry: row.industry,
    location: row.location,
    countryCode: row.countryCode,
    city: row.city,
    logoUrl: row.logoUrl,
    hasCulture: isAxisValues(row.cultureValues),
  };
}

export async function getOrgCultureAxes(
  companyId: string
): Promise<AxisValues> {
  const [row] = await db
    .select({ values: orgCulture.values })
    .from(orgCulture)
    .where(eq(orgCulture.companyId, companyId))
    .limit(1);
  return isAxisValues(row?.values) ? row.values : fallbackAxes();
}

export async function getCompanyCultureMeta(
  companyId: string
): Promise<{ selected: string[]; priorities: Record<string, number> } | null> {
  const [row] = await db
    .select({ workStyle: orgCulture.workStyle })
    .from(orgCulture)
    .where(eq(orgCulture.companyId, companyId))
    .limit(1);

  const ws = row?.workStyle as
    | { selected?: unknown; priorities?: unknown }
    | null
    | undefined;
  if (!ws || typeof ws !== "object") return null;
  if (!Array.isArray(ws.selected)) return null;

  const selected = ws.selected.filter(
    (x): x is string => typeof x === "string"
  );
  const priorities: Record<string, number> = {};
  if (ws.priorities && typeof ws.priorities === "object") {
    for (const [k, v] of Object.entries(ws.priorities as object)) {
      if (typeof v === "number") priorities[k] = v;
    }
  }
  return { selected, priorities };
}

export async function listJobsForCompany(
  companyId: string
): Promise<JobRow[]> {
  const jobRows = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      location: jobsTable.location,
      countryCode: jobsTable.countryCode,
      city: jobsTable.city,
      remote: jobsTable.remote,
      remoteScope: jobsTable.remoteScope,
      visibility: jobsTable.visibility,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      currency: jobsTable.currency,
      hardSkills: jobsTable.hardSkills,
      experienceMin: jobsTable.experienceMin,
      industry: jobsTable.industry,
      status: jobsTable.status,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .where(eq(jobsTable.companyId, companyId))
    .orderBy(desc(jobsTable.createdAt));

  if (jobRows.length === 0) return [];

  const ids = jobRows.map((j) => j.id);
  const countRows = await db
    .select({
      jobId: matchesTable.jobId,
      n: sql<number>`count(*)::int`,
      avg: sql<number | null>`cast(round(avg(${matchesTable.score})) as int)`,
      newN: sql<number>`cast(count(*) filter (where ${matchesTable.status} = 'pending') as int)`,
    })
    .from(matchesTable)
    .where(
      and(
        inArray(matchesTable.jobId, ids),
        eq(matchesTable.stage, "approved_by_clevy")
      )
    )
    .groupBy(matchesTable.jobId);

  const stats = new Map(countRows.map((c) => [c.jobId, c]));

  return jobRows.map((j) => ({
    ...j,
    hardSkills: toStringArray(j.hardSkills),
    applicantCount: stats.get(j.id)?.n ?? 0,
    avgMatch: stats.get(j.id)?.avg ?? null,
    newCount: stats.get(j.id)?.newN ?? 0,
  }));
}

// Admin: every vacancy across companies (for the CSV candidate upload tool).
export async function listAllJobs(): Promise<
  { id: string; title: string; company: string }[]
> {
  return db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: companiesTable.name,
    })
    .from(jobsTable)
    .innerJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .orderBy(companiesTable.name, jobsTable.title);
}

export async function getJobForCompany(
  jobId: string,
  companyId: string
): Promise<JobRow | null> {
  const [j] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      description: jobsTable.description,
      location: jobsTable.location,
      countryCode: jobsTable.countryCode,
      city: jobsTable.city,
      remote: jobsTable.remote,
      remoteScope: jobsTable.remoteScope,
      visibility: jobsTable.visibility,
      salaryMin: jobsTable.salaryMin,
      salaryMax: jobsTable.salaryMax,
      currency: jobsTable.currency,
      hardSkills: jobsTable.hardSkills,
      experienceMin: jobsTable.experienceMin,
      industry: jobsTable.industry,
      status: jobsTable.status,
      companyId: jobsTable.companyId,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .where(eq(jobsTable.id, jobId))
    .limit(1);

  if (!j || j.companyId !== companyId) return null;
  const [agg] = await db
    .select({
      n: sql<number>`count(*)::int`,
      avg: sql<number | null>`cast(round(avg(${matchesTable.score})) as int)`,
      newN: sql<number>`cast(count(*) filter (where ${matchesTable.status} = 'pending') as int)`,
    })
    .from(matchesTable)
    .where(
      and(
        eq(matchesTable.jobId, jobId),
        eq(matchesTable.stage, "approved_by_clevy")
      )
    );
  return {
    ...j,
    hardSkills: toStringArray(j.hardSkills),
    applicantCount: agg?.n ?? 0,
    avgMatch: agg?.avg ?? null,
    newCount: agg?.newN ?? 0,
  };
}

export async function listApplicantsForJob(
  jobId: string,
  companyAxes: AxisValues
): Promise<ApplicantRow[]> {
  const rows = await db
    .select({
      matchId: matchesTable.id,
      candidateId: candidatesTable.id,
      name: candidatesTable.name,
      role: candidatesTable.role,
      location: candidatesTable.location,
      status: matchesTable.status,
      values: candidateCulture.values,
    })
    .from(matchesTable)
    .innerJoin(
      candidatesTable,
      eq(matchesTable.candidateId, candidatesTable.id)
    )
    .leftJoin(
      candidateCulture,
      eq(candidateCulture.candidateId, candidatesTable.id)
    )
    // The company only sees candidates Clevy has approved.
    .where(
      and(
        eq(matchesTable.jobId, jobId),
        eq(matchesTable.stage, "approved_by_clevy")
      )
    );

  return rows
    .map((r) => {
      const formCompleted = isAxisValues(r.values);
      const values = formCompleted ? (r.values as AxisValues) : null;
      return {
        matchId: r.matchId,
        candidateId: r.candidateId,
        name: r.name,
        role: r.role ?? "",
        location: r.location ?? "",
        status: r.status,
        formCompleted,
        match: values ? computeMatch(companyAxes, values) : null,
        values,
      };
    })
    .sort((a, b) => (b.match ?? -1) - (a.match ?? -1));
}

export async function listInvitations(
  companyId: string
): Promise<InvitationRow[]> {
  return db
    .select({
      id: invitationsTable.id,
      email: invitationsTable.email,
      token: invitationsTable.token,
      role: invitationsTable.role,
      status: invitationsTable.status,
      createdAt: invitationsTable.createdAt,
    })
    .from(invitationsTable)
    .where(eq(invitationsTable.companyId, companyId))
    .orderBy(desc(invitationsTable.createdAt));
}

export async function listTeamMembers(
  companyId: string
): Promise<TeamMember[]> {
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
    })
    .from(usersTable)
    .where(eq(usersTable.companyId, companyId))
    .orderBy(desc(usersTable.createdAt));
}

function kebab(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function slugifyUnique(name: string): Promise<string> {
  const base = kebab(name) || "empresa";
  let candidate = base;
  let suffix = 2;
  // Cheap uniqueness loop; companies table is small in the MVP.
  for (;;) {
    const [existing] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(eq(companiesTable.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
