import { exportMarkdown } from "@/lib/export";
import { getSession } from "@/lib/store";
import { currentUser, unauthorized } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await currentUser())) return unauthorized();
  const format = new URL(req.url).searchParams.get("format") ?? "md";
  const s = await getSession();
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === "json") {
    return new Response(JSON.stringify(s, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="negotiation-workshop-${stamp}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return new Response(exportMarkdown(s), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="negotiation-workshop-${stamp}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
