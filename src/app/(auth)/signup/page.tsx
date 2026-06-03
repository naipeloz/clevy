import { redirect } from "next/navigation";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { companies, invitations } from "@/db/schema";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { getDict } from "@/lib/i18n";
import { fmt } from "@/lib/fmt";
import { AuthShell } from "../auth-shell";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ role?: string; invite?: string }>;

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }

  const { role, invite } = await searchParams;

  // Invitation flow: prefill the invited email and the company name.
  let inviteEmail: string | null = null;
  let inviteCompany: string | null = null;
  let inviteValid = false;
  let inviteIsCandidate = false;
  if (invite) {
    const [inv] = await db
      .select({
        email: invitations.email,
        role: invitations.role,
        status: invitations.status,
        expiresAt: invitations.expiresAt,
        companyName: companies.name,
      })
      .from(invitations)
      .leftJoin(companies, eq(companies.id, invitations.companyId))
      .where(eq(invitations.token, invite))
      .limit(1);
    // Expiry is enforced by the signup route on submit; here we only prefill.
    if (inv && inv.status === "pending") {
      inviteEmail = inv.email;
      inviteCompany = inv.companyName ?? null;
      inviteIsCandidate = inv.role === "candidate";
      inviteValid = true;
    }
  }

  const initialRole = role === "company" ? "company" : "candidate";
  const t = await getDict();
  const s = t.auth.signup;

  return (
    <AuthShell
      eyebrow={inviteValid ? s.eyebrowInvite : s.eyebrowCreate}
      title={
        inviteValid ? (
          inviteIsCandidate ? (
            <>{s.titleCandidate}</>
          ) : inviteCompany ? (
            <>{fmt(s.titleTeam, { company: inviteCompany })}</>
          ) : (
            <>{s.titleTeamNoCompany}</>
          )
        ) : (
          <>{s.titleDefault}</>
        )
      }
      subtitle={
        inviteValid
          ? inviteIsCandidate
            ? s.subtitleCandidate
            : s.subtitleTeam
          : s.subtitleDefault
      }
      footer={
        <>
          {s.footerQuestion}{" "}
          <Link
            href="/login"
            style={{
              color: "var(--fg)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {s.footerCta}
          </Link>
        </>
      }
    >
      <SignupForm
        initialRole={initialRole}
        invite={inviteValid ? (invite ?? null) : null}
        inviteEmail={inviteEmail}
        inviteIsCandidate={inviteIsCandidate}
      />
    </AuthShell>
  );
}
