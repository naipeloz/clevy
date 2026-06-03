// Helpers for the country/city pickers. Country names are localized via
// Intl.DisplayNames (no extra data needed); the city list comes from
// country-state-city (server-side only, see /api/locations/*).

export const SUPPORTED_CURRENCIES = ["USD", "UYU"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (SUPPORTED_CURRENCIES as readonly string[]).includes(v);
}

export function countryName(code: string | null | undefined, locale = "es"): string {
  if (!code) return "";
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    return dn.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

// "Ciudad, País" with sensible fallbacks to the legacy free-text location.
export function formatLocation(
  opts: { city?: string | null; countryCode?: string | null; location?: string | null },
  locale = "es"
): string {
  const parts: string[] = [];
  if (opts.city) parts.push(opts.city);
  const country = countryName(opts.countryCode, locale);
  if (country) parts.push(country);
  if (parts.length > 0) return parts.join(", ");
  return opts.location ?? "";
}

export function formatSalary(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined
): string | null {
  if (min == null && max == null) return null;
  const cur = currency || "USD";
  const fmt = (n: number) => n.toLocaleString("es-UY");
  const range =
    min != null && max != null
      ? `${fmt(min)} – ${fmt(max)}`
      : min != null
        ? `desde ${fmt(min)}`
        : `hasta ${fmt(max as number)}`;
  return `${cur} ${range}`;
}
