import { eq } from "drizzle-orm";
import { db } from ".";
import {
  atsIntegrations,
  candidateCulture,
  candidatePreferences,
  candidates,
  companies,
  files,
  jobs,
  matches,
  orgCulture,
  users,
} from "./schema";

// ---------- Users ----------

export function getUserById(id: string) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export function getUsersByCompany(companyId: string) {
  return db.query.users.findMany({ where: eq(users.companyId, companyId) });
}

// ---------- Companies ----------

export function getCompanyById(id: string) {
  return db.query.companies.findFirst({ where: eq(companies.id, id) });
}

// ---------- Candidates ----------

export function getCandidateById(id: string) {
  return db.query.candidates.findFirst({
    where: eq(candidates.id, id),
    with: { culture: true, preferences: true, files: true },
  });
}

export function getCandidateByEmail(email: string) {
  return db.query.candidates.findFirst({
    where: eq(candidates.email, email),
  });
}

// ---------- Jobs ----------

export function getJobById(id: string) {
  return db.query.jobs.findFirst({
    where: eq(jobs.id, id),
    with: { company: true },
  });
}

export function getJobsByCompany(companyId: string) {
  return db.query.jobs.findMany({ where: eq(jobs.companyId, companyId) });
}

// ---------- Org Culture ----------

export function getOrgCultureByCompany(companyId: string) {
  return db.query.orgCulture.findFirst({
    where: eq(orgCulture.companyId, companyId),
  });
}

// ---------- Candidate Culture ----------

export function getCandidateCulture(candidateId: string) {
  return db.query.candidateCulture.findFirst({
    where: eq(candidateCulture.candidateId, candidateId),
  });
}

// ---------- Candidate Preferences ----------

export function getCandidatePreferences(candidateId: string) {
  return db.query.candidatePreferences.findFirst({
    where: eq(candidatePreferences.candidateId, candidateId),
  });
}

// ---------- Matches ----------

export function getMatchesByCandidate(candidateId: string) {
  return db.query.matches.findMany({
    where: eq(matches.candidateId, candidateId),
    with: { job: { with: { company: true } } },
  });
}

export function getMatchesByJob(jobId: string) {
  return db.query.matches.findMany({
    where: eq(matches.jobId, jobId),
    with: { candidate: true },
  });
}

// ---------- ATS Integrations ----------

export function getAtsIntegrationsByCompany(companyId: string) {
  return db.query.atsIntegrations.findMany({
    where: eq(atsIntegrations.companyId, companyId),
  });
}

// ---------- Files ----------

export function getFilesByCandidate(candidateId: string) {
  return db.query.files.findMany({
    where: eq(files.candidateId, candidateId),
  });
}
