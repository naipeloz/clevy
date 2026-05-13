import { redirect } from "next/navigation";
import { getCurrentSession, homeForRole } from "@/lib/auth";
import { LandingClient } from "./landing-client";

export default async function HomePage() {
  const session = await getCurrentSession();
  if (session) {
    redirect(homeForRole(session.role));
  }
  return <LandingClient />;
}
