// Tiny placeholder interpolation: fmt("Pregunta {n}", { n: 3 }) -> "Pregunta 3".
// Kept dependency-free and server/client safe (dictionaries hold plain strings,
// never functions, so they can cross the RSC boundary).
export function fmt(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}
