import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client bound to the request's cookies (anon key). Used for auth
 * only: reading the signed-in user, sending magic links, exchanging codes.
 * Session state uses the service-role client in storage.ts instead.
 */
export async function supabaseAuthClient() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component render: cookies cannot be set there.
          // Route handlers (where we refresh) can set them.
        }
      },
    },
  });
}
