import { supabaseAuthClient } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST() {
  const client = await supabaseAuthClient();
  if (client) await client.auth.signOut();
  return Response.json({ ok: true });
}
