import { authorizeAction } from "@/lib/authz";
import { currentUser, forbidden, unauthorized } from "@/lib/serverAuth";
import { dispatch, getSession } from "@/lib/store";
import type { Action } from "@/lib/types";
import { buildView } from "@/lib/view";

import { withJson } from "@/lib/http";

export const dynamic = "force-dynamic";

export const POST = withJson(async (req: Request) => {
  const user = await currentUser();
  if (!user) return unauthorized();
  let action: Action;
  try {
    action = (await req.json()) as Action;
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!action || typeof action.type !== "string") {
    return Response.json({ error: "Missing action type" }, { status: 400 });
  }
  const denied = authorizeAction(action, user.person, await getSession());
  if (denied) return forbidden(denied);
  const next = await dispatch(action);
  return Response.json(buildView(next, user.person, user.email), { headers: { "Cache-Control": "no-store" } });
});
