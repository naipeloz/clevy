import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  candidateCulture,
  candidates as candidatesTable,
  companies as companiesTable,
  jobs as jobsTable,
  matches as matchesTable,
  orgCulture,
  users as usersTable,
  type matchStageEnum,
  type roleEnum,
} from "@/db/schema";
import { isAxisValues, type AxisValues } from "./clevy-data";

type UserRole = (typeof roleEnum.enumValues)[number];

export type AdminStats = {
  companies: number;
  openJobs: number;
  candidates: number;
  applications: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const [companies, openJobs, candidates, applications] = await Promise.all([
    db.$count(companiesTable),
    db.$count(jobsTable, eq(jobsTable.status, "open")),
    db.$count(candidatesTable),
    db.$count(matchesTable),
  ]);
  return { companies, openJobs, candidates, applications };
}

export type AdminJobRow = {
  id: string;
  title: string;
  company: string;
  status: "draft" | "open" | "paused" | "closed";
  visibility: "public" | "private";
  applicants: number;
  createdAt: Date;
};

export async function listAdminJobs(limit?: number): Promise<AdminJobRow[]> {
  const applicants = sql<number>`count(${matchesTable.id})::int`;
  const q = db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      company: companiesTable.name,
      status: jobsTable.status,
      visibility: jobsTable.visibility,
      applicants,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .innerJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .leftJoin(matchesTable, eq(matchesTable.jobId, jobsTable.id))
    .groupBy(jobsTable.id, companiesTable.name)
    .orderBy(desc(jobsTable.createdAt));
  const rows = limit ? await q.limit(limit) : await q;
  return rows;
}

export type MatchStage = (typeof matchStageEnum.enumValues)[number];

export type JobCandidateRow = {
  matchId: string;
  candidateId: string;
  name: string;
  email: string;
  stage: MatchStage;
  cvUrl: string | null;
  hasCulture: boolean;
};

// Candidates on a search (all stages), for the admin candidate manager.
export async function listJobCandidates(
  jobId: string
): Promise<JobCandidateRow[]> {
  return db
    .select({
      matchId: matchesTable.id,
      candidateId: candidatesTable.id,
      name: candidatesTable.name,
      email: candidatesTable.email,
      stage: matchesTable.stage,
      cvUrl: matchesTable.cvUrl,
      hasCulture: sql<boolean>`(${candidateCulture.id} is not null)`,
    })
    .from(matchesTable)
    .innerJoin(candidatesTable, eq(matchesTable.candidateId, candidatesTable.id))
    .leftJoin(
      candidateCulture,
      eq(candidateCulture.candidateId, candidatesTable.id)
    )
    .where(eq(matchesTable.jobId, jobId))
    .orderBy(desc(matchesTable.createdAt));
}

export type CandidateOption = { id: string; name: string; email: string };

// The whole talent pool, for the "add candidates" modal.
export async function listAllCandidates(): Promise<CandidateOption[]> {
  return db
    .select({
      id: candidatesTable.id,
      name: candidatesTable.name,
      email: candidatesTable.email,
    })
    .from(candidatesTable)
    .orderBy(candidatesTable.name);
}

export async function getAdminJob(id: string) {
  const [row] = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      companyId: jobsTable.companyId,
      company: companiesTable.name,
      status: jobsTable.status,
      visibility: jobsTable.visibility,
      description: jobsTable.description,
      location: jobsTable.location,
      countryCode: jobsTable.countryCode,
      city: jobsTable.city,
      remote: jobsTable.remote,
      remoteScope: jobsTable.remoteScope,
    })
    .from(jobsTable)
    .innerJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .where(eq(jobsTable.id, id))
    .limit(1);
  return row ?? null;
}

export type AdminCompanyRow = {
  id: string;
  name: string;
  industry: string | null;
  searches: number;
  hasCulture: boolean;
};

export async function listAdminCompanies(): Promise<AdminCompanyRow[]> {
  const searches = sql<number>`count(distinct ${jobsTable.id})::int`;
  const hasCulture = sql<boolean>`bool_or(${orgCulture.id} is not null)`;
  return db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      industry: companiesTable.industry,
      searches,
      hasCulture,
    })
    .from(companiesTable)
    .leftJoin(jobsTable, eq(jobsTable.companyId, companiesTable.id))
    .leftJoin(orgCulture, eq(orgCulture.companyId, companiesTable.id))
    .groupBy(companiesTable.id)
    .orderBy(companiesTable.name);
}

export async function getAdminCompany(id: string) {
  const [row] = await db
    .select({
      id: companiesTable.id,
      name: companiesTable.name,
      industry: companiesTable.industry,
      domain: companiesTable.domain,
      location: companiesTable.location,
      city: companiesTable.city,
      countryCode: companiesTable.countryCode,
      tagline: companiesTable.tagline,
    })
    .from(companiesTable)
    .where(eq(companiesTable.id, id))
    .limit(1);
  return row ?? null;
}

export type AdminCompanyCulture = {
  axes: AxisValues;
  selected: string[];
  priorities: Record<string, number>;
};

// The company's cultural profile, for the admin read-only summary.
// Returns null when the company hasn't completed the culture form.
export async function getAdminCompanyCulture(
  companyId: string
): Promise<AdminCompanyCulture | null> {
  const [row] = await db
    .select({ values: orgCulture.values, workStyle: orgCulture.workStyle })
    .from(orgCulture)
    .where(eq(orgCulture.companyId, companyId))
    .limit(1);

  if (!row || !isAxisValues(row.values)) return null;

  const ws = row.workStyle as
    | { selected?: unknown; priorities?: unknown }
    | null
    | undefined;
  const selected = Array.isArray(ws?.selected)
    ? ws.selected.filter((x): x is string => typeof x === "string")
    : [];
  const priorities: Record<string, number> = {};
  if (ws?.priorities && typeof ws.priorities === "object") {
    for (const [k, v] of Object.entries(ws.priorities as object)) {
      if (typeof v === "number") priorities[k] = v;
    }
  }

  return { axes: row.values, selected, priorities };
}

export async function getAdminUser(id: string) {
  const [row] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      companyId: usersTable.companyId,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return row ?? null;
}

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
};

// `role` narrows the list to one group — the admin user list is split into
// company admins / candidates / super admins.
export async function listAdminUsers(role?: UserRole): Promise<AdminUserRow[]> {
  let q = db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .$dynamic();
  if (role) q = q.where(eq(usersTable.role, role));
  return q.orderBy(desc(usersTable.createdAt));
}

export type AdminUserCounts = Record<UserRole, number>;

export async function countAdminUsersByRole(): Promise<AdminUserCounts> {
  const rows = await db
    .select({ role: usersTable.role, n: sql<number>`count(*)::int` })
    .from(usersTable)
    .groupBy(usersTable.role);
  const counts: AdminUserCounts = { root: 0, admin: 0, user: 0 };
  for (const r of rows) counts[r.role] = r.n;
  return counts;
}

export type AdminActivity = {
  kind: "search" | "user" | "candidate" | "company";
  text: string;
  at: Date;
};

// A real activity feed, merged from the most recent rows across the platform.
export async function listAdminActivity(limit = 5): Promise<AdminActivity[]> {
  const [jobs, newUsers, newCandidates] = await Promise.all([
    db
      .select({
        title: jobsTable.title,
        company: companiesTable.name,
        at: jobsTable.createdAt,
      })
      .from(jobsTable)
      .innerJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
      .orderBy(desc(jobsTable.createdAt))
      .limit(limit),
    db
      .select({
        name: usersTable.name,
        role: usersTable.role,
        at: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(limit),
    db
      .select({ name: candidatesTable.name, at: candidatesTable.createdAt })
      .from(candidatesTable)
      .orderBy(desc(candidatesTable.createdAt))
      .limit(limit),
  ]);

  const items: AdminActivity[] = [
    ...jobs.map((j) => ({
      kind: "search" as const,
      text: `Nueva búsqueda · ${j.title} (${j.company})`,
      at: j.at,
    })),
    ...newUsers.map((u) => ({
      kind: "user" as const,
      text: `${u.name} se registró como ${u.role}`,
      at: u.at,
    })),
    ...newCandidates.map((c) => ({
      kind: "candidate" as const,
      text: `${c.name} se sumó al pool de talento`,
      at: c.at,
    })),
  ];

  return items
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, limit);
}
