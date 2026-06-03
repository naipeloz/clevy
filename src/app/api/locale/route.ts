import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/lib/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Sets the UI language cookie. Public (no session needed) so the switcher
// works on the login/signup screens too.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { locale?: string };
  if (!isLocale(body.locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  const store = await cookies();
  store.set(LOCALE_COOKIE, body.locale, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
  });
  return NextResponse.json({ ok: true });
}
