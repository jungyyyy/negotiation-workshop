import { NextResponse } from "next/server";
import { isAllowed } from "@/lib/serverAuth";
import { supabaseAuthClient } from "@/lib/supabaseServer";

import { withJson } from "@/lib/http";
import { explainSupabaseError } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Lands here from the email. Supports both link styles Supabase can send:
 * PKCE (?code=…) and token hash (?token_hash=…&type=email).
 */
export const GET = withJson(async (req: Request) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const client = await supabaseAuthClient();
  const fail = (reason: string) => NextResponse.redirect(`${url.origin}/?auth_error=${encodeURIComponent(reason)}`);
  if (!client) return fail("Auth is not configured");

  let email: string | undefined;
  if (code) {
    const { data, error } = await client.auth.exchangeCodeForSession(code);
    if (error) return fail(explainSupabaseError(error.message));
    email = data.user?.email ?? undefined;
  } else if (tokenHash) {
    const { data, error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
    if (error) return fail(explainSupabaseError(error.message));
    email = data.user?.email ?? undefined;
  } else {
    return fail("Missing code");
  }
  if (!email || !isAllowed(email)) {
    await client.auth.signOut();
    return fail("This workshop is private");
  }
  return NextResponse.redirect(`${url.origin}/`);
});
