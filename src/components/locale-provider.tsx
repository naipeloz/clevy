"use client";

import { createContext, useContext } from "react";
import type { Dict } from "@/locales/es";
import type { Locale } from "@/lib/i18n";

type LocaleContextValue = { locale: Locale; t: Dict };

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dict;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, t: dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

function useLocaleContext(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useT/useLocale must be used within LocaleProvider");
  return ctx;
}

// Client-side translation dictionary for the current locale.
export function useT(): Dict {
  return useLocaleContext().t;
}

export function useLocale(): Locale {
  return useLocaleContext().locale;
}
