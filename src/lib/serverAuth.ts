import "server-only";
import { cookies } from "next/headers";
import { PEOPLE, type Person } from "./types";
import { supabaseAuthClient } from "./supabaseServer";

export interface CurrentUser {
  email: string;
  person: Person;
}

export function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowed(email: string): boolean {
  return allowedEmails().includes(email.trim().toLowerCase());
}

/** jungwoo.lee@… → jung, rehan.khurram@… → rehan, harry.tsang@… → harry. */
export function personForEmail(email: string): Person | null {
  const local = email.toLowerCase().split("@")[0];
  const hit = PEOPLE.find((p) => local.startsWith(p.id));
  return hit?.id ?? null;
}

/**
 * The signed-in, allowlisted participant, or null. Reading the user through
 * the cookie client also refreshes an expired access token, so a day of
 * polling keeps the session alive without re-login.
 */
export async function currentUser(): Promise<CurrentUser | null> {
  // Development only: impersonate without Supabase. Never active in production builds.
  if (process.env.NODE_ENV !== "production" && process.env.AUTH_DEV_EMAIL) {
    const store = await cookies();
    const email = store.get("nw-dev-user")?.value || process.env.AUTH_DEV_EMAIL;
    const person = personForEmail(email);
    return isAllowed(email) && person ? { email, person } : null;
  }
  const client = await supabaseAuthClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (!email || !isAllowed(email)) return null;
  const person = personForEmail(email);
  return person ? { email, person } : null;
}

export const forbidden = (msg = "This workshop is private") =>
  Response.json({ error: msg }, { status: 403, headers: { "Cache-Control": "no-store" } });
export const unauthorized = () =>
  Response.json({ error: "Sign in required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
