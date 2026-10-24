import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import type { FullScenario } from "../scenarioSecrets";
import { personName, type Person, type PracticeRound } from "../types";
import { COUNTERPART_CLOSING_PUSH, COUNTERPART_MOVES, COUNTERPART_PERSONAS, COUNTERPART_SYSTEM, COUNTERPART_TARGETS } from "./prompts";

export const SOFT_LIMIT_MESSAGES = 40;

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

/** The AI plays the side the person did not pick. */
export function aiSide(pr: PracticeRound): "seller" | "buyer" {
  return pr.side === "seller" ? "buyer" : "seller";
}

export function counterpartPersona(scenarioId: string, side: "seller" | "buyer"): string {
  return COUNTERPART_PERSONAS[scenarioId]?.[side] ?? (side === "seller" ? "the seller" : "the buyer");
}

export function buildCounterpartSystem(sc: FullScenario, pr: PracticeRound, me: Person): string {
  const my = aiSide(pr);
  const persona = counterpartPersona(sc.id, my);
  const sheet = my === "seller" ? sc.sellerSheet : sc.buyerSheet;
  const points = sc.points
    ? "Your points (never say these numbers out loud):\n" +
      sc.points.issues.map((i) => `- ${i.label}: ${i.options.map((o) => `${o.label} = ${o[my]}`).join(", ")}`).join("\n") +
      `\nYour alternative (BATNA) is worth ${my === "seller" ? sc.points.sellerBatna : sc.points.buyerBatna} points; never sign a package worth less.`
    : "";
  let system = fill(COUNTERPART_SYSTEM, {
    persona,
    persona_short: persona.split(",")[0],
    person_name: personName(me),
    their_party: pr.side === "seller" ? sc.sellerParty : sc.buyerParty,
    their_role: pr.side,
    my_role: my,
    public_brief: sc.publicBrief.join("\n"),
    my_sheet: sheet.join("\n"),
    my_points: points,
    targets: COUNTERPART_TARGETS[sc.id]?.[my] ?? "",
    moves: COUNTERPART_MOVES[sc.id]?.[my] ?? "",
  });
  if (pr.messages.length >= SOFT_LIMIT_MESSAGES) system += `\n\n## Now\n${COUNTERPART_CLOSING_PUSH}`;
  return system;
}

/** Chat history in API shape. The model has no memory between calls. */
export function historyMessages(pr: PracticeRound): Anthropic.MessageParam[] {
  return pr.messages.map((m) => ({ role: m.role, content: m.content }));
}

/** The chat log as a transcript for the debrief. */
export function practiceTranscript(pr: PracticeRound, me: Person, sc: FullScenario): string {
  const my = pr.side;
  const ai = aiSide(pr);
  const myLabel = `${personName(me)} (${my}, ${my === "seller" ? sc.sellerParty : sc.buyerParty})`;
  const aiLabel = `${counterpartPersona(sc.id, ai).split(",")[0]} (${ai}, ${ai === "seller" ? sc.sellerParty : sc.buyerParty})`;
  return pr.messages.map((m) => `${m.role === "user" ? myLabel : aiLabel}: ${m.content}`).join("\n\n");
}
