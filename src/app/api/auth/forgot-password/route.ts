import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/mailer";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

// The reset link must be built server-side (the token never reaches the browser
// until the user clicks it), so derive the public origin from the request.
function originFrom(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) return origin;
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : new URL(request.url).origin;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email } = (body ?? {}) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase() ?? "";

  // Always respond the same way whether or not the email exists, so this
  // endpoint can't be used to discover which addresses have accounts.
  if (normalizedEmail.includes("@")) {
    const [user] = await db
      .select({ id: users.id, name: users.name })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (user) {
      // Invalidate any earlier unused tokens so only the newest link works.
      await db
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.userId, user.id),
            isNull(passwordResetTokens.usedAt)
          )
        );

      const token = randomBytes(32).toString("hex");
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      });

      const resetUrl = `${originFrom(request)}/reset-password?token=${token}`;
      try {
        await sendPasswordResetEmail({
          to: normalizedEmail,
          name: user.name,
          resetUrl,
        });
      } catch (err) {
        // Don't surface delivery failures to the caller — that would both break
        // the generic response and reveal that the account exists. Log for ops.
        console.error("[forgot-password] failed to send reset email", err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
