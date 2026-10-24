import { supabaseAuthClient } from "@/lib/supabaseServer";

import { withJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export const POST = withJson(async () => {
  const client = await supabaseAuthClient();
  if (client) await client.auth.signOut();
  return Response.json({ ok: true });
});
