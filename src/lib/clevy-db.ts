import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  candidateCulture,
  candidates as candidatesTable,
  companies as companiesTable,
  orgCulture,
} from "@/db/schema";
import {
  computeMatch,
  CULTURAL_AXES,
  isAxisValues,
  type AxisValues,
} from "./clevy-data";

export type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  culturalHighlights: { label: string; strong: boolean }[];
  openRoles: string[];
  values: AxisValues;
};

export type CandidateRow = {
  id: string;
  slug: string;
  name: string;
  role: string;
  location: string;
  highlights: string[];
  status: "new" | "reviewed" | "contacted";
  signals: string[];
  frictions: string[];
  agentNote: string;
  values: AxisValues;
};

function toAxisValues(raw: unknown): AxisValues {
  if (isAxisValues(raw)) return raw;
  const fallback: Partial<AxisValues> = {};
  for (const a of CULTURAL_AXES) fallback[a.id] = 50;
  return fallback as AxisValues;
}

function toStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
}

function toHighlightArray(
  raw: unknown
): { label: string; strong: boolean }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is { label: string; strong: boolean } =>
        !!x &&
        typeof x === "object" &&
        typeof (x as Record<string, unknown>).label === "string" &&
        typeof (x as Record<string, unknown>).strong === "boolean"
    )
    .map((x) => ({ label: x.label, strong: x.strong }));
}

export async function listCompanies(): Promise<CompanyRow[]> {
  const rows = await db
    .select({
      id: companiesTable.id,
      slug: companiesTable.slug,
      name: companiesTable.name,
      tagline: companiesTable.tagline,
      industry: companiesTable.industry,
      location: companiesTable.location,
      culturalHighlights: companiesTable.culturalHighlights,
      openRoles: companiesTable.openRoles,
      values: orgCulture.values,
    })
    .from(companiesTable)
    .leftJoin(orgCulture, eq(orgCulture.companyId, companiesTable.id))
    .where(sql`${companiesTable.slug} is not null`);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug ?? "",
    name: r.name,
    tagline: r.tagline ?? "",
    industry: r.industry ?? "",
    location: r.location ?? "",
    culturalHighlights: toHighlightArray(r.culturalHighlights),
    openRoles: toStringArray(r.openRoles),
    values: toAxisValues(r.values),
  }));
}

export async function getCompanyBySlug(slug: string): Promise<CompanyRow | null> {
  const [row] = await db
    .select({
      id: companiesTable.id,
      slug: companiesTable.slug,
      name: companiesTable.name,
      tagline: companiesTable.tagline,
      industry: companiesTable.industry,
      location: companiesTable.location,
      culturalHighlights: companiesTable.culturalHighlights,
      openRoles: companiesTable.openRoles,
      values: orgCulture.values,
    })
    .from(companiesTable)
    .leftJoin(orgCulture, eq(orgCulture.companyId, companiesTable.id))
    .where(eq(companiesTable.slug, slug))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug ?? slug,
    name: row.name,
    tagline: row.tagline ?? "",
    industry: row.industry ?? "",
    location: row.location ?? "",
    culturalHighlights: toHighlightArray(row.culturalHighlights),
    openRoles: toStringArray(row.openRoles),
    values: toAxisValues(row.values),
  };
}

export async function listCandidates(): Promise<CandidateRow[]> {
  const rows = await db
    .select({
      id: candidatesTable.id,
      slug: candidatesTable.slug,
      name: candidatesTable.name,
      role: candidatesTable.role,
      location: candidatesTable.location,
      highlights: candidatesTable.highlights,
      status: candidatesTable.status,
      signals: candidatesTable.signals,
      frictions: candidatesTable.frictions,
      agentNote: candidatesTable.agentNote,
      values: candidateCulture.values,
    })
    .from(candidatesTable)
    .leftJoin(
      candidateCulture,
      eq(candidateCulture.candidateId, candidatesTable.id)
    )
    .where(sql`${candidatesTable.slug} is not null`);

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug ?? "",
    name: r.name,
    role: r.role ?? "",
    location: r.location ?? "",
    highlights: toStringArray(r.highlights),
    status: r.status,
    signals: toStringArray(r.signals),
    frictions: toStringArray(r.frictions),
    agentNote: r.agentNote ?? "",
    values: toAxisValues(r.values),
  }));
}

export async function getCandidateBySlug(
  slug: string
): Promise<CandidateRow | null> {
  const [row] = await db
    .select({
      id: candidatesTable.id,
      slug: candidatesTable.slug,
      name: candidatesTable.name,
      role: candidatesTable.role,
      location: candidatesTable.location,
      highlights: candidatesTable.highlights,
      status: candidatesTable.status,
      signals: candidatesTable.signals,
      frictions: candidatesTable.frictions,
      agentNote: candidatesTable.agentNote,
      values: candidateCulture.values,
    })
    .from(candidatesTable)
    .leftJoin(
      candidateCulture,
      eq(candidateCulture.candidateId, candidatesTable.id)
    )
    .where(and(eq(candidatesTable.slug, slug)))
    .limit(1);

  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug ?? slug,
    name: row.name,
    role: row.role ?? "",
    location: row.location ?? "",
    highlights: toStringArray(row.highlights),
    status: row.status,
    signals: toStringArray(row.signals),
    frictions: toStringArray(row.frictions),
    agentNote: row.agentNote ?? "",
    values: toAxisValues(row.values),
  };
}

export type ScoredCompany = CompanyRow & { match: number };
export type ScoredCandidate = CandidateRow & { match: number };

export async function listCompaniesScored(
  userValues: AxisValues
): Promise<ScoredCompany[]> {
  const rows = await listCompanies();
  return rows
    .map((c) => ({ ...c, match: computeMatch(userValues, c.values) }))
    .sort((a, b) => b.match - a.match);
}

export async function listCandidatesScored(
  companyAxes: AxisValues
): Promise<ScoredCandidate[]> {
  const rows = await listCandidates();
  return rows.map((c) => ({ ...c, match: computeMatch(companyAxes, c.values) }));
}
