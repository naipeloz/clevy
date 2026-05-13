import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Enums ----------

export const roleEnum = pgEnum("role", [
  "admin",
  "recruiter",
  "hiring_manager",
  "candidate",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "open",
  "paused",
  "closed",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "pending",
  "shortlisted",
  "rejected",
  "hired",
]);

export const fileTypeEnum = pgEnum("file_type", [
  "resume",
  "cover_letter",
  "other",
]);

// ---------- Shared columns ----------

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

// ---------- Tables ----------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("recruiter"),
  companyId: uuid("company_id").references(() => companies.id),
  culturalProfile: jsonb("cultural_profile"),
  ...timestamps,
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }),
  logoUrl: text("logo_url"),
  tagline: varchar("tagline", { length: 255 }),
  industry: varchar("industry", { length: 100 }),
  location: varchar("location", { length: 255 }),
  culturalHighlights: jsonb("cultural_highlights"),
  openRoles: jsonb("open_roles"),
  ...timestamps,
});

export const candidateStatusEnum = pgEnum("candidate_status", [
  "new",
  "reviewed",
  "contacted",
]);

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 100 }).unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  linkedinUrl: text("linkedin_url"),
  summary: text("summary"),
  role: varchar("role", { length: 255 }),
  location: varchar("location", { length: 255 }),
  highlights: jsonb("highlights"),
  signals: jsonb("signals"),
  frictions: jsonb("frictions"),
  agentNote: text("agent_note"),
  status: candidateStatusEnum("status").notNull().default("new"),
  ...timestamps,
});

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }),
  remote: boolean("remote").notNull().default(false),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  status: jobStatusEnum("status").notNull().default("draft"),
  createdById: uuid("created_by_id").references(() => users.id),
  ...timestamps,
});

export const orgCulture = pgTable("org_culture", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id)
    .unique(),
  values: jsonb("values"),
  workStyle: jsonb("work_style"),
  benefits: jsonb("benefits"),
  ...timestamps,
});

export const candidateCulture = pgTable("candidate_culture", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id)
    .unique(),
  values: jsonb("values"),
  workStyle: jsonb("work_style"),
  ...timestamps,
});

export const candidatePreferences = pgTable("candidate_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id)
    .unique(),
  desiredRoles: jsonb("desired_roles"),
  locations: jsonb("locations"),
  remoteOnly: boolean("remote_only").notNull().default(false),
  salaryMin: integer("salary_min"),
  ...timestamps,
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobs.id),
  score: integer("score"),
  status: matchStatusEnum("status").notNull().default("pending"),
  reasoning: text("reasoning"),
  ...timestamps,
});

export const atsIntegrations = pgTable("ats_integrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id),
  provider: varchar("provider", { length: 100 }).notNull(),
  config: jsonb("config"),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  type: fileTypeEnum("type").notNull(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }),
  sizeBytes: integer("size_bytes"),
  ...timestamps,
});

// ---------- Relations ----------

export const usersRelations = relations(users, ({ one }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
}));

export const companiesRelations = relations(companies, ({ many, one }) => ({
  users: many(users),
  jobs: many(jobs),
  orgCulture: one(orgCulture),
  atsIntegrations: many(atsIntegrations),
}));

export const candidatesRelations = relations(candidates, ({ one, many }) => ({
  culture: one(candidateCulture),
  preferences: one(candidatePreferences),
  matches: many(matches),
  files: many(files),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  createdBy: one(users, {
    fields: [jobs.createdById],
    references: [users.id],
  }),
  matches: many(matches),
}));

export const orgCultureRelations = relations(orgCulture, ({ one }) => ({
  company: one(companies, {
    fields: [orgCulture.companyId],
    references: [companies.id],
  }),
}));

export const candidateCultureRelations = relations(
  candidateCulture,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidateCulture.candidateId],
      references: [candidates.id],
    }),
  })
);

export const candidatePreferencesRelations = relations(
  candidatePreferences,
  ({ one }) => ({
    candidate: one(candidates, {
      fields: [candidatePreferences.candidateId],
      references: [candidates.id],
    }),
  })
);

export const matchesRelations = relations(matches, ({ one }) => ({
  candidate: one(candidates, {
    fields: [matches.candidateId],
    references: [candidates.id],
  }),
  job: one(jobs, {
    fields: [matches.jobId],
    references: [jobs.id],
  }),
}));

export const atsIntegrationsRelations = relations(
  atsIntegrations,
  ({ one }) => ({
    company: one(companies, {
      fields: [atsIntegrations.companyId],
      references: [companies.id],
    }),
  })
);

export const filesRelations = relations(files, ({ one }) => ({
  candidate: one(candidates, {
    fields: [files.candidateId],
    references: [candidates.id],
  }),
}));
