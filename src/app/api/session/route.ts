import { currentUser, unauthorized } from "@/lib/serverAuth";
import { getSession } from "@/lib/store";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  const s = await getSession();
  return Response.json(buildView(s, user.person, user.email), { headers: { "Cache-Control": "no-store" } });
}
