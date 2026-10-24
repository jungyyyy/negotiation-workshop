import { getSession, subscribe } from "@/lib/store";
import type { Session } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const enc = new TextEncoder();
  let unsub: () => void = () => {};
  let heartbeat: NodeJS.Timeout | undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (s: Session) => {
        try {
          controller.enqueue(enc.encode(`data: ${JSON.stringify(s)}\n\n`));
        } catch {
          /* closed */
        }
      };
      send(getSession());
      unsub = subscribe(send);
      heartbeat = setInterval(() => {
        try {
          controller.enqueue(enc.encode(`: ping\n\n`));
        } catch {
          /* closed */
        }
      }, 15_000);
      req.signal.addEventListener("abort", () => {
        unsub();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
    cancel() {
      unsub();
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
