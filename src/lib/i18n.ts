import { cookies } from "next/headers";
import { es, type Dict } from "@/locales/es";
import { en } from "@/locales/en";

export type Locale = "es" | "en";
export const LOCALE_COOKIE = "locale";
export const DEFAULT_LOCALE: Locale = "es";

const DICTS: Record<Locale, Dict> = { es, en };

export function isLocale(v: unknown): v is Locale {
  return v === "es" || v === "en";
}

export function dictFor(locale: Locale): Dict {
  return DICTS[locale];
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

// Server-side translation dictionary for the current request locale.
export async function getDict(): Promise<Dict> {
  return DICTS[await getLocale()];
}

export type { Dict };
