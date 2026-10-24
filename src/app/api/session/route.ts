import { getSession } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(getSession(), {
    headers: { "Cache-Control": "no-store" },
  });
}
