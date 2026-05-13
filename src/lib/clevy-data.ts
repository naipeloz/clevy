export type AxisId =
  | "pace"
  | "autonomy"
  | "collab"
  | "hierarchy"
  | "risk"
  | "communication"
  | "worklife";

export type Axis = {
  id: AxisId;
  left: string;
  right: string;
};

export const CULTURAL_AXES: readonly Axis[] = [
  { id: "pace", left: "Ritmo pausado", right: "Ritmo intenso" },
  { id: "autonomy", left: "Estructura clara", right: "Autonomía total" },
  { id: "collab", left: "Trabajo individual", right: "Colaboración profunda" },
  { id: "hierarchy", left: "Jerarquía clara", right: "Horizontal" },
  { id: "risk", left: "Estabilidad", right: "Experimentación" },
  { id: "communication", left: "Directa y concisa", right: "Contextual y empática" },
  { id: "worklife", left: "Separación estricta", right: "Trabajo y vida mezclados" },
];

export type Question = {
  id: string;
  axis: AxisId;
  title: string;
  subtitle?: string;
  leftLabel: string;
  rightLabel: string;
};

export const QUESTIONS: readonly Question[] = [
  {
    id: "q1",
    axis: "autonomy",
    title: "En tu día ideal de trabajo, ¿quién decide qué haces?",
    subtitle: "No hay respuesta correcta — busca la posición más honesta.",
    leftLabel: "Alguien planea mi día",
    rightLabel: "Yo decido cada hora",
  },
  {
    id: "q2",
    axis: "collab",
    title: "Rindes mejor cuando...",
    subtitle: "Piensa en los momentos donde de verdad fluyes.",
    leftLabel: "Estoy solo, en silencio",
    rightLabel: "Pienso en voz alta con alguien",
  },
  {
    id: "q3",
    axis: "pace",
    title: "¿Qué ritmo de trabajo te deja con energía al final de la semana?",
    leftLabel: "Pausado y reflexivo",
    rightLabel: "Intenso con mucha acción",
  },
  {
    id: "q4",
    axis: "hierarchy",
    title: "Una decisión importante se debe tomar. Prefieres que...",
    leftLabel: "La tome quien tiene autoridad",
    rightLabel: "La tome el equipo en conjunto",
  },
  {
    id: "q5",
    axis: "risk",
    title: "Tu equipo propone algo que podría ser genial o un desastre. Tú...",
    leftLabel: "Pido validar antes",
    rightLabel: "Digo: probemos rápido",
  },
  {
    id: "q6",
    axis: "worklife",
    title: "El viernes a las 7pm, ¿qué es lo más probable?",
    leftLabel: "Cerrada la compu, sin revisar",
    rightLabel: "Aún pensando en un problema del trabajo",
  },
];

export type ValueOption = {
  id: string;
  label: string;
  desc: string;
};

export const COMPANY_VALUES_OPTIONS: readonly ValueOption[] = [
  { id: "autonomy", label: "Autonomía", desc: "Los equipos deciden el cómo." },
  { id: "craft", label: "Maestría del oficio", desc: "Calidad por encima de velocidad." },
  { id: "speed", label: "Velocidad", desc: "Envío rápido, iteración constante." },
  { id: "transparency", label: "Transparencia", desc: "Toda la información es pública internamente." },
  { id: "experiment", label: "Experimentación", desc: "Fallar pronto, aprender más." },
  { id: "focus", label: "Foco profundo", desc: "Tiempo sin interrupciones, protegido." },
  { id: "collab", label: "Colaboración", desc: "Trabajamos mejor en conjunto que solos." },
  { id: "care", label: "Cuidado mutuo", desc: "Las personas antes que los deadlines." },
  { id: "ambition", label: "Ambición", desc: "Pensamos en grande, sin techo." },
  { id: "stability", label: "Estabilidad", desc: "Procesos claros, resultados predecibles." },
  { id: "direct", label: "Comunicación directa", desc: "Feedback sin rodeos, con respeto." },
  { id: "async", label: "Trabajo asíncrono", desc: "Menos reuniones, más escritura." },
];

export type AxisValues = Record<AxisId, number>;

export function computeMatch(
  user: AxisValues,
  other: AxisValues
): number {
  const diffs = CULTURAL_AXES.map((a) => Math.abs(user[a.id] - other[a.id]));
  const avgDiff = diffs.reduce((s, d) => s + d, 0) / diffs.length;
  return Math.round(100 - avgDiff);
}

export function isAxisValues(raw: unknown): raw is AxisValues {
  if (!raw || typeof raw !== "object") return false;
  return CULTURAL_AXES.every(
    (a) => typeof (raw as Record<string, unknown>)[a.id] === "number"
  );
}

export function isCandidateProfile(
  raw: unknown
): raw is { values: AxisValues } {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as { values?: unknown };
  return isAxisValues(obj.values);
}

export type CompanyCulture = {
  selected: string[];
  priorities: Record<string, number>;
  axes: AxisValues;
};

export function isCompanyCulture(raw: unknown): raw is CompanyCulture {
  if (!raw || typeof raw !== "object") return false;
  const obj = raw as { selected?: unknown; priorities?: unknown; axes?: unknown };
  return (
    Array.isArray(obj.selected) &&
    !!obj.priorities &&
    typeof obj.priorities === "object" &&
    isAxisValues(obj.axes)
  );
}

const VALUE_TO_AXIS: Record<string, { axis: AxisId; polarity: 1 | -1 }> = {
  autonomy: { axis: "autonomy", polarity: 1 },
  craft: { axis: "pace", polarity: -1 },
  speed: { axis: "pace", polarity: 1 },
  transparency: { axis: "communication", polarity: -1 },
  experiment: { axis: "risk", polarity: 1 },
  stability: { axis: "risk", polarity: -1 },
  focus: { axis: "collab", polarity: -1 },
  collab: { axis: "collab", polarity: 1 },
  care: { axis: "communication", polarity: 1 },
  ambition: { axis: "pace", polarity: 1 },
  direct: { axis: "communication", polarity: -1 },
  async: { axis: "worklife", polarity: -1 },
};

export function valuesToAxes(
  selected: string[],
  priorities: Record<string, number>
): AxisValues {
  const axes: Record<AxisId, { sum: number; weight: number }> = Object.fromEntries(
    CULTURAL_AXES.map((a) => [a.id, { sum: 0, weight: 0 }])
  ) as Record<AxisId, { sum: number; weight: number }>;
  for (const id of selected) {
    const map = VALUE_TO_AXIS[id];
    if (!map) continue;
    const intensity = priorities[id] ?? 70;
    const target = map.polarity === 1 ? intensity : 100 - intensity;
    const weight = intensity / 100;
    axes[map.axis].sum += target * weight;
    axes[map.axis].weight += weight;
  }
  const result: Partial<AxisValues> = {};
  for (const a of CULTURAL_AXES) {
    const bucket = axes[a.id];
    result[a.id] = bucket.weight > 0 ? Math.round(bucket.sum / bucket.weight) : 50;
  }
  return result as AxisValues;
}
