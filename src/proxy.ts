import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

type SessionPayload = {
  userId: string;
  role: "admin" | "recruiter" | "hiring_manager" | "candidate";
};

const ROLE_ROUTES: Record<string, SessionPayload["role"][]> = {
  "/empresa": ["recruiter", "hiring_manager", "admin"],
  "/candidato": ["candidate", "recruiter", "admin"],
  "/agente": ["admin"],
};

const PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/api/auth",
];

async function getSession(
  request: NextRequest
): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  const protectedPrefix = Object.keys(ROLE_ROUTES).find((prefix) =>
    pathname.startsWith(prefix)
  );

  if (protectedPrefix || pathname.startsWith("/api")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (protectedPrefix) {
      const allowed = ROLE_ROUTES[protectedPrefix];
      if (!allowed.includes(session.role)) {
        return new Response(null, { status: 403 });
      }
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/empresa/:path*",
    "/candidato/:path*",
    "/agente/:path*",
    "/api/:path*",
  ],
};
