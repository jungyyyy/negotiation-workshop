import { authorized, unauthorized } from "@/lib/auth";
import { getSession } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!authorized(req)) return unauthorized();
  return Response.json(await getSession(), { headers: { "Cache-Control": "no-store" } });
}
