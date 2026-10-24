import { currentUser, unauthorized } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await currentUser();
  if (!user) return unauthorized();
  return Response.json(user, { headers: { "Cache-Control": "no-store" } });
}
