import "server-only";
import { explainSupabaseError } from "./config";

/**
 * Wrap a route handler so that any thrown error becomes a JSON 500 with a
 * readable message, instead of the platform's HTML error page.
 */
export function withJson<T extends unknown[]>(handler: (...args: T) => Promise<Response>) {
  return async (...args: T): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("API error:", message);
      return Response.json({ error: explainSupabaseError(message) }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
  };
}
