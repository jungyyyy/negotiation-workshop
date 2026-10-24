import { supabaseUrlProblem } from "@/lib/config";
import { allowedEmails } from "@/lib/serverAuth";
import { storage } from "@/lib/storage";
import { withJson } from "@/lib/http";

export const dynamic = "force-dynamic";

/**
 * Configuration check, safe to expose: it reports booleans and problems,
 * never secret values. Open /api/health after setting the Vercel variables.
 */
export const GET = withJson(async () => {
  const url = process.env.SUPABASE_URL;
  const urlProblem = supabaseUrlProblem(url);
  const checks: Record<string, unknown> = {
    SUPABASE_URL: urlProblem ?? "ok",
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "set" : "missing",
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? "set" : "missing",
    SUPABASE_TABLE: process.env.SUPABASE_TABLE?.trim() || "workshop_sessions (default)",
    ALLOWED_EMAILS: allowedEmails().length ? `${allowedEmails().length} addresses` : "missing",
    storage: storage().kind,
  };

  // Does the Auth API answer with JSON at this URL?
  if (!urlProblem && url) {
    try {
      const r = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
        headers: { apikey: process.env.SUPABASE_ANON_KEY ?? "" },
        cache: "no-store",
      });
      const text = await r.text();
      let ok = false;
      try {
        JSON.parse(text);
        ok = true;
      } catch {
        /* not JSON */
      }
      checks.authEndpoint = ok ? `ok (HTTP ${r.status})` : `HTTP ${r.status}, not JSON: ${text.slice(0, 60).replace(/\s+/g, " ")}…`;
    } catch (e) {
      checks.authEndpoint = `unreachable: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  // Can the service-role client read the workshop table?
  if (storage().kind === "supabase") {
    try {
      const loaded = await storage().load();
      checks.table = loaded ? `ok (rev ${loaded.rev})` : "ok (empty; the row is created on first use)";
    } catch (e) {
      checks.table = `error: ${e instanceof Error ? e.message : String(e)}`;
    }
  }

  const healthy = Object.values(checks).every((v) => typeof v !== "string" || !/missing|error|not JSON|unreachable|wrong|must|points at|not set|not a valid/i.test(v));
  return Response.json({ healthy, checks }, { status: healthy ? 200 : 500, headers: { "Cache-Control": "no-store" } });
});
