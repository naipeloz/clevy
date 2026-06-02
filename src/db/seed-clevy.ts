import { randomBytes, scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number
) => Promise<Buffer>;

// Mirrors hashPassword() in src/lib/auth.ts without importing it
// (auth.ts pulls next/headers, which isn't available in this script).
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

const DEMO_MANAGER_EMAIL = "manager@linea.demo";
const DEMO_MANAGER_PASSWORD = "password123";

const DEMO_CULTURE_META = {
  selected: ["autonomy", "experiment", "collab", "focus", "direct"],
  priorities: {
    autonomy: 85,
    experiment: 70,
    collab: 75,
    focus: 60,
    direct: 55,
  },
};

const DEMO_JOBS: {
  title: string;
  description: string;
  location: string;
  remote: boolean;
  status: "draft" | "open" | "paused" | "closed";
  applicants: string[]; // candidate slugs
}[] = [
  {
    title: "Senior Product Designer",
    description:
      "Liderás el diseño de producto de extremo a extremo, con autonomía alta y mentoría cercana. Trabajamos horizontal, con experimentación constante y viernes sin reuniones.",
    location: "Remoto · LatAm",
    remote: true,
    status: "open",
    applicants: ["ana", "daniel", "marina", "rafael"],
  },
  {
    title: "UX Researcher Sr",
    description:
      "Diseñás y conducís research que alimenta decisiones de producto. Buscamos rigor, foco profundo y colaboración con diseño e ingeniería.",
    location: "Remoto · LatAm",
    remote: true,
    status: "open",
    applicants: ["lucia", "tomas"],
  },
];

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!;
const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

type AxisValues = {
  pace: number;
  autonomy: number;
  collab: number;
  hierarchy: number;
  risk: number;
  communication: number;
  worklife: number;
};

type SeedCompany = {
  slug: string;
  name: string;
  tagline: string;
  industry: string;
  location: string;
  culturalHighlights: { label: string; strong: boolean }[];
  openRoles: string[];
  values: AxisValues;
};

const COMPANIES: SeedCompany[] = [
  {
    slug: "linea",
    name: "Línea Studio",
    tagline: "Estudio de producto digital · 34 personas",
    industry: "Product Design",
    location: "Remoto · LatAm",
    culturalHighlights: [
      { label: "Autonomía alta con mentoría", strong: true },
      { label: "Cultura horizontal", strong: true },
      { label: "Experimentación constante", strong: true },
      { label: "Viernes sin reuniones", strong: false },
    ],
    openRoles: ["Product Designer", "UX Researcher Sr"],
    values: {
      pace: 58,
      autonomy: 82,
      collab: 74,
      hierarchy: 25,
      risk: 72,
      communication: 52,
      worklife: 32,
    },
  },
  {
    slug: "meridiano",
    name: "Meridiano",
    tagline: "Fintech en Serie B · 120 personas",
    industry: "Fintech",
    location: "CDMX · Híbrido",
    culturalHighlights: [
      { label: "Equipos pequeños y autónomos", strong: true },
      { label: "Experimentación con guardrails", strong: true },
      { label: "Ritmo alto en trimestre de lanzamiento", strong: false },
      { label: "Comunicación asíncrona", strong: true },
    ],
    openRoles: ["Senior Product Designer", "Design System Lead"],
    values: {
      pace: 78,
      autonomy: 75,
      collab: 65,
      hierarchy: 38,
      risk: 70,
      communication: 60,
      worklife: 48,
    },
  },
  {
    slug: "vega",
    name: "Vega Collective",
    tagline: "Plataforma creativa · 22 personas",
    industry: "Creative Tools",
    location: "Medellín · Presencial",
    culturalHighlights: [
      { label: "Colaboración profunda día a día", strong: true },
      { label: "Oficina como centro creativo", strong: false },
      { label: "Horizontal pero fundadores muy presentes", strong: true },
      { label: "Proyectos largos y detallados", strong: true },
    ],
    openRoles: ["Product Designer", "Brand Designer"],
    values: {
      pace: 45,
      autonomy: 68,
      collab: 85,
      hierarchy: 35,
      risk: 58,
      communication: 70,
      worklife: 45,
    },
  },
  {
    slug: "norte",
    name: "Norte Logistics",
    tagline: "Logística B2B · 340 personas",
    industry: "Logistics",
    location: "Ciudad de Panamá",
    culturalHighlights: [
      { label: "Procesos estables y bien definidos", strong: true },
      { label: "Jerarquía más tradicional", strong: false },
      { label: "Separación clara trabajo/vida", strong: true },
      { label: "Ritmo alto en operaciones", strong: false },
    ],
    openRoles: ["Senior Designer"],
    values: {
      pace: 72,
      autonomy: 45,
      collab: 58,
      hierarchy: 68,
      risk: 30,
      communication: 40,
      worklife: 22,
    },
  },
];

type SeedCandidate = {
  slug: string;
  email: string;
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

const CANDIDATES: SeedCandidate[] = [
  {
    slug: "ana",
    email: "ana.restrepo@clevy.demo",
    name: "Ana Restrepo",
    role: "Product Designer · 6 años",
    location: "Bogotá",
    highlights: ["Autonomía con respaldo", "Foco protegido", "Horizontal"],
    status: "new",
    signals: ["Autonomía", "Foco protegido", "Horizontal"],
    frictions: ["Ritmos intensos", "Comunicación muy directa"],
    agentNote:
      "Ana valora autonomía con respaldo cercano — ha mencionado tres veces la importancia de poder preguntar sin que eso se interprete como debilidad. Valora límites claros entre trabajo y vida personal; rechaza explícitamente culturas donde trabajar hasta tarde se vea como virtud.",
    values: {
      pace: 62,
      autonomy: 78,
      collab: 70,
      hierarchy: 30,
      risk: 68,
      communication: 55,
      worklife: 28,
    },
  },
  {
    slug: "daniel",
    email: "daniel.ospina@clevy.demo",
    name: "Daniel Ospina",
    role: "Senior Product Designer · 8 años",
    location: "Buenos Aires",
    highlights: ["Experimentación", "Ritmo enfocado", "Colaboración profunda"],
    status: "new",
    signals: ["Experimentación", "Colaboración", "Autonomía"],
    frictions: ["Procesos demasiado estructurados"],
    agentNote:
      "Daniel describe sus mejores momentos profesionales como sesiones de colaboración donde se construye en grupo. Le incomodan los procesos rígidos.",
    values: {
      pace: 64,
      autonomy: 72,
      collab: 78,
      hierarchy: 30,
      risk: 75,
      communication: 50,
      worklife: 36,
    },
  },
  {
    slug: "marina",
    email: "marina.velez@clevy.demo",
    name: "Marina Vélez",
    role: "UX Lead · 9 años",
    location: "CDMX",
    highlights: ["Horizontal", "Comunicación directa", "Autonomía alta"],
    status: "reviewed",
    signals: ["Liderazgo horizontal", "Comunicación directa"],
    frictions: ["Jerarquías muy verticales"],
    agentNote:
      "Marina busca un equipo donde pueda dejar su impronta sin pedir permiso. Comunicación directa y sin politiquerías.",
    values: {
      pace: 70,
      autonomy: 80,
      collab: 60,
      hierarchy: 22,
      risk: 65,
      communication: 40,
      worklife: 40,
    },
  },
  {
    slug: "tomas",
    email: "tomas.figueroa@clevy.demo",
    name: "Tomás Figueroa",
    role: "Product Designer · 4 años",
    location: "Santiago",
    highlights: ["Experimentación", "Colaboración", "Foco"],
    status: "contacted",
    signals: ["Aprendizaje", "Foco", "Colaboración"],
    frictions: ["Ambientes muy individualistas"],
    agentNote:
      "Tomás quiere crecer junto a referentes. Busca un mentor y proyectos retadores.",
    values: {
      pace: 60,
      autonomy: 65,
      collab: 76,
      hierarchy: 35,
      risk: 70,
      communication: 60,
      worklife: 34,
    },
  },
  {
    slug: "lucia",
    email: "lucia.arenas@clevy.demo",
    name: "Lucía Arenas",
    role: "Design Lead · 11 años",
    location: "Lima",
    highlights: ["Mentoría", "Horizontal", "Ritmo pausado"],
    status: "new",
    signals: ["Mentoría", "Ritmo sostenible"],
    frictions: ["Sprints permanentes"],
    agentNote:
      "Lucía valora la sostenibilidad del ritmo y la profundidad del trabajo sobre la cantidad de entregables.",
    values: {
      pace: 45,
      autonomy: 70,
      collab: 72,
      hierarchy: 28,
      risk: 55,
      communication: 65,
      worklife: 30,
    },
  },
  {
    slug: "rafael",
    email: "rafael.mendez@clevy.demo",
    name: "Rafael Méndez",
    role: "Product Designer · 5 años",
    location: "Remoto",
    highlights: ["Autonomía", "Asíncrono", "Experimentación"],
    status: "new",
    signals: ["Asincronía", "Autonomía"],
    frictions: ["Reuniones excesivas"],
    agentNote:
      "Rafael privilegia escribir sobre reunirse. Prefiere equipos asíncronos y distribuidos.",
    values: {
      pace: 68,
      autonomy: 80,
      collab: 55,
      hierarchy: 32,
      risk: 72,
      communication: 70,
      worklife: 42,
    },
  },
];

async function upsertCompany(c: SeedCompany) {
  const [existing] = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(eq(schema.companies.slug, c.slug))
    .limit(1);

  if (existing) {
    await db
      .update(schema.companies)
      .set({
        name: c.name,
        tagline: c.tagline,
        industry: c.industry,
        location: c.location,
        culturalHighlights: c.culturalHighlights,
        openRoles: c.openRoles,
      })
      .where(eq(schema.companies.id, existing.id));
    await db
      .update(schema.orgCulture)
      .set({ values: c.values })
      .where(eq(schema.orgCulture.companyId, existing.id));
    if (!(await hasOrgCulture(existing.id))) {
      await db
        .insert(schema.orgCulture)
        .values({ companyId: existing.id, values: c.values });
    }
    return existing.id;
  }

  const [created] = await db
    .insert(schema.companies)
    .values({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      industry: c.industry,
      location: c.location,
      culturalHighlights: c.culturalHighlights,
      openRoles: c.openRoles,
    })
    .returning({ id: schema.companies.id });
  await db.insert(schema.orgCulture).values({
    companyId: created.id,
    values: c.values,
  });
  return created.id;
}

async function hasOrgCulture(companyId: string) {
  const [row] = await db
    .select({ id: schema.orgCulture.id })
    .from(schema.orgCulture)
    .where(eq(schema.orgCulture.companyId, companyId))
    .limit(1);
  return Boolean(row);
}

async function upsertCandidate(c: SeedCandidate) {
  const [existing] = await db
    .select({ id: schema.candidates.id })
    .from(schema.candidates)
    .where(eq(schema.candidates.slug, c.slug))
    .limit(1);

  if (existing) {
    await db
      .update(schema.candidates)
      .set({
        email: c.email,
        name: c.name,
        role: c.role,
        location: c.location,
        highlights: c.highlights,
        signals: c.signals,
        frictions: c.frictions,
        agentNote: c.agentNote,
        status: c.status,
      })
      .where(eq(schema.candidates.id, existing.id));
    await db
      .update(schema.candidateCulture)
      .set({ values: c.values })
      .where(eq(schema.candidateCulture.candidateId, existing.id));
    if (!(await hasCandidateCulture(existing.id))) {
      await db
        .insert(schema.candidateCulture)
        .values({ candidateId: existing.id, values: c.values });
    }
    return existing.id;
  }

  const [created] = await db
    .insert(schema.candidates)
    .values({
      slug: c.slug,
      email: c.email,
      name: c.name,
      role: c.role,
      location: c.location,
      highlights: c.highlights,
      signals: c.signals,
      frictions: c.frictions,
      agentNote: c.agentNote,
      status: c.status,
    })
    .returning({ id: schema.candidates.id });
  await db.insert(schema.candidateCulture).values({
    candidateId: created.id,
    values: c.values,
  });
  return created.id;
}

async function hasCandidateCulture(candidateId: string) {
  const [row] = await db
    .select({ id: schema.candidateCulture.id })
    .from(schema.candidateCulture)
    .where(eq(schema.candidateCulture.candidateId, candidateId))
    .limit(1);
  return Boolean(row);
}

async function seedManagerPipeline(lineaId: string) {
  // Representative culture metadata so the culture editor prefills.
  await db
    .update(schema.orgCulture)
    .set({ workStyle: DEMO_CULTURE_META })
    .where(eq(schema.orgCulture.companyId, lineaId));

  // Demo HR manager linked to Línea Studio.
  let managerId: string;
  const [existingManager] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, DEMO_MANAGER_EMAIL))
    .limit(1);
  if (existingManager) {
    managerId = existingManager.id;
    await db
      .update(schema.users)
      .set({ companyId: lineaId, role: "hiring_manager" })
      .where(eq(schema.users.id, managerId));
  } else {
    const passwordHash = await hashPassword(DEMO_MANAGER_PASSWORD);
    const [created] = await db
      .insert(schema.users)
      .values({
        email: DEMO_MANAGER_EMAIL,
        name: "Ana — HR Manager",
        passwordHash,
        role: "hiring_manager",
        companyId: lineaId,
      })
      .returning({ id: schema.users.id });
    managerId = created.id;
  }

  // Jobs + applicants (matches). Idempotent on (companyId, title) / (jobId, candidateId).
  for (const dj of DEMO_JOBS) {
    let jobId: string;
    const [existingJob] = await db
      .select({ id: schema.jobs.id })
      .from(schema.jobs)
      .where(
        and(
          eq(schema.jobs.companyId, lineaId),
          eq(schema.jobs.title, dj.title)
        )
      )
      .limit(1);
    if (existingJob) {
      jobId = existingJob.id;
      await db
        .update(schema.jobs)
        .set({ status: dj.status, location: dj.location, remote: dj.remote })
        .where(eq(schema.jobs.id, jobId));
    } else {
      const [created] = await db
        .insert(schema.jobs)
        .values({
          companyId: lineaId,
          createdById: managerId,
          title: dj.title,
          description: dj.description,
          location: dj.location,
          remote: dj.remote,
          status: dj.status,
        })
        .returning({ id: schema.jobs.id });
      jobId = created.id;
    }

    for (const slug of dj.applicants) {
      const [cand] = await db
        .select({ id: schema.candidates.id })
        .from(schema.candidates)
        .where(eq(schema.candidates.slug, slug))
        .limit(1);
      if (!cand) continue;
      const [existingMatch] = await db
        .select({ id: schema.matches.id })
        .from(schema.matches)
        .where(
          and(
            eq(schema.matches.jobId, jobId),
            eq(schema.matches.candidateId, cand.id)
          )
        )
        .limit(1);
      if (!existingMatch) {
        await db
          .insert(schema.matches)
          .values({ jobId, candidateId: cand.id, status: "pending" });
      }
    }
  }
}

async function main() {
  console.log("Seeding Clevy demo data…");
  for (const c of COMPANIES) await upsertCompany(c);
  for (const c of CANDIDATES) await upsertCandidate(c);

  const [linea] = await db
    .select({ id: schema.companies.id })
    .from(schema.companies)
    .where(eq(schema.companies.slug, "linea"))
    .limit(1);
  if (linea) await seedManagerPipeline(linea.id);
  const [{ companyCount }] = await db
    .select({ companyCount: sql<number>`count(*)::int` })
    .from(schema.companies);
  const [{ candidateCount }] = await db
    .select({ candidateCount: sql<number>`count(*)::int` })
    .from(schema.candidates);
  console.log(
    `Seed complete. companies=${companyCount} candidates=${candidateCount}`
  );
  console.log(
    `Demo HR manager: ${DEMO_MANAGER_EMAIL} / ${DEMO_MANAGER_PASSWORD}`
  );
  await client.end();
}

main().catch(async (err) => {
  console.error("Clevy seed failed:", err);
  await client.end();
  process.exit(1);
});
