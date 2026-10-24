import { currentUser, unauthorized } from "@/lib/serverAuth";

import { withJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export const GET = withJson(async () => {
  const user = await currentUser();
  if (!user) return unauthorized();
  return Response.json(user, { headers: { "Cache-Control": "no-store" } });
});
