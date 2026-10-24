import { anthropic, describeAiError, recordUsage } from "@/lib/ai/client";
import { anthropicConfigured } from "@/lib/ai/configured";
import { buildCounterpartSystem, historyMessages } from "@/lib/ai/counterpart";
import { MODEL } from "@/lib/ai/prompts";
import { getFullScenario } from "@/lib/scenarioSecrets";
import { currentUser, unauthorized } from "@/lib/serverAuth";
import { dispatch, getSession } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * POST { practiceId, message } → streams the counterpart's reply as plain text.
 * The user's message is stored before the call, the reply after it, so a reload
 * mid-stream never loses the user's turn. Errors after the stream has started
 * are sent as a final line beginning with "⚠ ".
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (!anthropicConfigured()) return Response.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { practiceId?: string; message?: string };
  const text = String(body.message ?? "").trim();
  if (!body.practiceId || !text) return Response.json({ error: "practiceId and message required" }, { status: 400 });

  const s0 = await getSession();
  const pr0 = s0.practice[user.person]?.find((x) => x.id === body.practiceId);
  const sc = pr0 && getFullScenario(pr0.scenarioId);
  if (!pr0 || !sc) return Response.json({ error: "No such practice round" }, { status: 404 });
  if (pr0.status !== "chatting") return Response.json({ error: "This round is not open for chat" }, { status: 400 });
  if (text.length > 4000) return Response.json({ error: "Message too long" }, { status: 400 });

  const s1 = await dispatch({ type: "practice.message", id: pr0.id, person: user.person, role: "user", content: text });
  const pr = s1.practice[user.person]!.find((x) => x.id === pr0.id)!;

  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reply = "";
      try {
        const run = anthropic().beta.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: buildCounterpartSystem(sc, pr, user.person),
          messages: historyMessages(pr),
          output_config: { effort: "low" },
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        for await (const event of run) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            reply += event.delta.text;
            controller.enqueue(enc.encode(event.delta.text));
          }
        }
        const final = await run.finalMessage();
        await recordUsage(`chat ${pr.id}`, final.usage);
        if (final.stop_reason === "refusal" && !reply.trim()) {
          reply = "Sorry, I lost you there. Can you say that again?";
          controller.enqueue(enc.encode(reply));
        }
      } catch (e) {
        const msg = describeAiError(e);
        console.error("[ai] chat failed:", msg);
        controller.enqueue(enc.encode(`\n⚠ ${msg}`));
      }
      if (reply.trim()) {
        await dispatch({ type: "practice.message", id: pr.id, person: user.person, role: "assistant", content: reply.trim() });
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
