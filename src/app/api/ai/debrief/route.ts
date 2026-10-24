import { anthropicConfigured } from "@/lib/ai/configured";
import { describeAiError } from "@/lib/ai/client";
import { counterpartPersona, practiceTranscript } from "@/lib/ai/counterpart";
import { runDebrief } from "@/lib/ai/debrief";
import { withJson } from "@/lib/http";
import { getFullScenario } from "@/lib/scenarioSecrets";
import { currentUser, forbidden, unauthorized } from "@/lib/serverAuth";
import { dispatch, getSession } from "@/lib/store";
import { personName } from "@/lib/types";
import { buildView } from "@/lib/view";

export const dynamic = "force-dynamic";

/**
 * POST { roundId, transcript }  — live round; only that round's observer.
 * POST { practiceId }           — own practice round; the chat log is the transcript.
 */
export const POST = withJson(async (req: Request) => {
  const user = await currentUser();
  if (!user) return unauthorized();
  if (!anthropicConfigured()) return Response.json({ error: "ANTHROPIC_API_KEY is not set on the server." }, { status: 500 });
  const body = (await req.json().catch(() => ({}))) as { roundId?: string; transcript?: string; practiceId?: string };
  const s = await getSession();

  if (body.practiceId) {
    const pr = s.practice[user.person]?.find((x) => x.id === body.practiceId);
    const sc = pr && getFullScenario(pr.scenarioId);
    if (!pr || !sc) return Response.json({ error: "No such practice round" }, { status: 404 });
    if (pr.status !== "revealed") return Response.json({ error: "Submit the deal first" }, { status: 400 });
    const me = personName(user.person);
    const ai = counterpartPersona(sc.id, pr.side === "seller" ? "buyer" : "seller").split(",")[0];
    try {
      const debrief = await runDebrief({
        scenario: sc,
        roundId: `practice ${pr.id}`,
        sellerName: pr.side === "seller" ? me : ai,
        buyerName: pr.side === "buyer" ? me : ai,
        deal: pr.deal,
        noDeal: pr.noDeal,
        scores: pr.scores,
        transcript: practiceTranscript(pr, user.person, sc),
      });
      const next = await dispatch({ type: "practice.debrief", id: pr.id, person: user.person, debrief });
      return Response.json(buildView(next, user.person, user.email));
    } catch (e) {
      const error = describeAiError(e);
      await dispatch({ type: "practice.debrief", id: pr.id, person: user.person, error });
      return Response.json({ error }, { status: 502 });
    }
  }

  if (!body.roundId) return Response.json({ error: "roundId or practiceId required" }, { status: 400 });
  const r = s.rounds.find((x) => x.id === body.roundId);
  const sc = r && getFullScenario(r.scenarioId);
  if (!r || !sc) return Response.json({ error: "No such round" }, { status: 404 });
  if (r.roles.observer !== user.person) return forbidden("Only this round's observer can run the debrief");
  const transcript = String(body.transcript ?? "");
  try {
    const debrief = await runDebrief({
      scenario: sc,
      roundId: r.id,
      sellerName: personName(r.roles.seller),
      buyerName: personName(r.roles.buyer),
      deal: r.deal,
      noDeal: r.noDeal,
      scores: r.scores,
      transcript,
    });
    const next = await dispatch({ type: "round.debrief", roundId: r.id, debrief });
    return Response.json(buildView(next, user.person, user.email));
  } catch (e) {
    const error = describeAiError(e);
    await dispatch({ type: "round.debrief", roundId: r.id, error });
    return Response.json({ error }, { status: 502 });
  }
});
