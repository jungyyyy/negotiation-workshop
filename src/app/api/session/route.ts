import { currentUser, unauthorized } from "@/lib/serverAuth";
import { getSession } from "@/lib/store";
import { buildView } from "@/lib/view";

import { withJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export const GET = withJson(async () => {
  const user = await currentUser();
  if (!user) return unauthorized();
  const s = await getSession();
  return Response.json(buildView(s, user.person, user.email), { headers: { "Cache-Control": "no-store" } });
});
