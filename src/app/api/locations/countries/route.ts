import { NextResponse } from "next/server";
import { Country } from "country-state-city";
import { countryName } from "@/lib/location";

// Full country list, localized to the requested locale (default Spanish).
export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") || "es";
  const countries = Country.getAllCountries().map((c) => ({
    code: c.isoCode,
    name: countryName(c.isoCode, locale) || c.name,
  }));
  countries.sort((a, b) => a.name.localeCompare(b.name, locale));
  return NextResponse.json({ countries });
}
