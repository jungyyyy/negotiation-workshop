import { dispatch } from "@/lib/store";
import type { Action } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let action: Action;
  try {
    action = (await req.json()) as Action;
  } catch {
    return Response.json({ error: "Bad JSON" }, { status: 400 });
  }
  if (!action || typeof action.type !== "string") {
    return Response.json({ error: "Missing action type" }, { status: 400 });
  }
  return Response.json(dispatch(action), {
    headers: { "Cache-Control": "no-store" },
  });
}
