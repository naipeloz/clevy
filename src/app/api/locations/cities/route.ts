import { NextResponse } from "next/server";
import { City } from "country-state-city";

const MAX = 50;

// Cities for a country, optionally filtered by query. Kept server-side so the
// (large) dataset never ships to the client.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const country = (params.get("country") || "").toUpperCase();
  const q = (params.get("q") || "").trim().toLowerCase();

  if (!/^[A-Z]{2}$/.test(country)) {
    return NextResponse.json({ cities: [] });
  }

  const all = City.getCitiesOfCountry(country) ?? [];
  const seen = new Set<string>();
  const names: string[] = [];
  for (const c of all) {
    const name = c.name;
    if (q && !name.toLowerCase().includes(q)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  names.sort((a, b) => a.localeCompare(b, "es"));
  return NextResponse.json({ cities: names.slice(0, MAX) });
}
