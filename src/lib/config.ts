import "server-only";

/**
 * Sanity checks for the Supabase settings. A wrong SUPABASE_URL (for example
 * the dashboard page instead of the API base) makes the client library fetch
 * HTML and fail with "Unexpected token '<' … is not valid JSON". Catch it
 * here with a message that says what to fix.
 */
export function supabaseUrlProblem(url: string | undefined): string | null {
  if (!url) return "SUPABASE_URL is not set.";
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return `SUPABASE_URL is not a valid URL: "${url}".`;
  }
  if (u.protocol !== "https:") return `SUPABASE_URL must start with https:// (got "${url}").`;
  if (u.hostname === "supabase.com" || u.hostname.endsWith(".supabase.com")) {
    return `SUPABASE_URL points at the Supabase website ("${u.hostname}"). Use the project's API URL from Settings → API, which looks like https://<project-ref>.supabase.co.`;
  }
  if (u.pathname !== "/" && u.pathname !== "") {
    return `SUPABASE_URL must be the bare project URL without a path (got "${url}"). Expected https://<project-ref>.supabase.co.`;
  }
  return null;
}

/** Rewrites the library's JSON-parse failure into something actionable. */
export function explainSupabaseError(message: string): string {
  if (/not valid JSON|Unexpected token '<'|<!DOCTYPE/i.test(message)) {
    return `Supabase answered with a web page instead of JSON. SUPABASE_URL is probably wrong: it must be the project's API URL (https://<project-ref>.supabase.co), not a dashboard or app link. (${message})`;
  }
  if (/Invalid API key|JWT/i.test(message)) {
    return `Supabase rejected the key. Check SUPABASE_ANON_KEY (anon public key) and SUPABASE_SERVICE_KEY (service_role key) in Settings → API. (${message})`;
  }
  return message;
}
