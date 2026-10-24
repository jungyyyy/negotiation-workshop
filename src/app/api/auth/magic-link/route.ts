import { isAllowed, personForEmail } from "@/lib/serverAuth";
import { supabaseAuthClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

/** Sends a magic link, but only to allowlisted addresses. */
export async function POST(req: Request) {
  let email = "";
  try {
    email = String((await req.json()).email ?? "").trim().toLowerCase();
  } catch {
    /* empty body */
  }
  if (!email) return Response.json({ error: "Email required" }, { status: 400 });
  if (!isAllowed(email) || !personForEmail(email)) {
    return Response.json({ error: "This workshop is private" }, { status: 403 });
  }
  const client = await supabaseAuthClient();
  if (!client) return Response.json({ error: "Auth is not configured" }, { status: 500 });
  const origin = new URL(req.url).origin;
  const { error } = await client.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
