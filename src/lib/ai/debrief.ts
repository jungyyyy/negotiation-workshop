import "server-only";
import { RUBRIC } from "../rubric";
import type { FullScenario } from "../scenarioSecrets";
import type { Debrief, Deal, Scores } from "../types";
import { anthropic, recordUsage } from "./client";
import { DEBRIEF_SYSTEM, DEBRIEF_USER, MODEL } from "./prompts";

const rubricItem = {
  type: "object",
  properties: {
    id: { type: "string", description: "Rubric item id" },
    score: { type: "integer", enum: [0, 1, 2] },
    reason: { type: "string" },
  },
  required: ["id", "score", "reason"],
  additionalProperties: false,
} as const;

/** JSON schema for the structured output. Mirrors the Debrief type (minus createdAt/transcriptChars). */
export const DEBRIEF_SCHEMA = {
  type: "object",
  properties: {
    decisive_moment: {
      type: "object",
      properties: { quote: { type: "string" }, why: { type: "string" } },
      required: ["quote", "why"],
      additionalProperties: false,
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          who: { type: "string" },
          question: { type: "string" },
          about: { type: "string", enum: ["price", "interests", "batna", "constraints", "small_talk", "other"] },
          moved_deal: { type: "boolean" },
        },
        required: ["who", "question", "about", "moved_deal"],
        additionalProperties: false,
      },
    },
    information: {
      type: "object",
      properties: {
        revealed: {
          type: "array",
          items: {
            type: "object",
            properties: { what: { type: "string" }, by: { type: "string" }, when: { type: "string" } },
            required: ["what", "by", "when"],
            additionalProperties: false,
          },
        },
        stayed_hidden: {
          type: "array",
          items: {
            type: "object",
            properties: { what: { type: "string" }, question_that_would_have_surfaced_it: { type: "string" } },
            required: ["what", "question_that_would_have_surfaced_it"],
            additionalProperties: false,
          },
        },
      },
      required: ["revealed", "stayed_hidden"],
      additionalProperties: false,
    },
    offers_and_concessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          who: { type: "string" },
          amount: { type: "string" },
          justification: { type: "boolean" },
          labeled: { type: "boolean" },
          reciprocated: { type: "boolean" },
          unilateral: { type: "boolean" },
        },
        required: ["who", "amount", "justification", "labeled", "reciprocated", "unilateral"],
        additionalProperties: false,
      },
    },
    tactics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          who: { type: "string" },
          tactic: { type: "string" },
          quote: { type: "string" },
          response: { type: "string", enum: ["ignored", "reacted", "questioned", "re-anchored", "not visible"] },
        },
        required: ["who", "tactic", "quote", "response"],
        additionalProperties: false,
      },
    },
    rubric: {
      type: "object",
      properties: {
        seller: { type: "array", items: rubricItem },
        buyer: { type: "array", items: rubricItem },
      },
      required: ["seller", "buyer"],
      additionalProperties: false,
    },
    one_rule_each: {
      type: "object",
      properties: { seller: { type: "string" }, buyer: { type: "string" } },
      required: ["seller", "buyer"],
      additionalProperties: false,
    },
    caveats: { type: "string", description: "Anything the transcript did not allow you to judge, or speaker inference you had to make. Empty string if none." },
  },
  required: ["decisive_moment", "questions", "information", "offers_and_concessions", "tactics", "rubric", "one_rule_each", "caveats"],
  additionalProperties: false,
} as const;

export interface DebriefInput {
  scenario: FullScenario;
  roundId: string;
  sellerName: string;
  buyerName: string;
  deal?: Deal;
  noDeal?: boolean;
  scores?: Scores;
  transcript: string;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

export function buildDebriefPrompt(input: DebriefInput): string {
  const sc = input.scenario;
  const applicable = RUBRIC.filter((r) => !(r.multiIssueOnly && sc.kind !== "points"));
  const notApplicable = RUBRIC.filter((r) => r.multiIssueOnly && sc.kind !== "points");
  const rubric =
    applicable.map((r) => `- ${r.id}: ${r.text}`).join("\n") +
    (notApplicable.length ? `\nNot applicable for this scenario (omit): ${notApplicable.map((r) => r.id).join(", ")}` : "");
  const dealText = input.noDeal
    ? "No deal (impasse)."
    : input.deal
      ? sc.dealFields
          .map((f) => {
            const v = input.deal![f.key];
            if (v === undefined || v === "") return null;
            const shown = f.type === "select" ? (f.options.find((o) => o.value === v)?.label ?? String(v)) : f.type === "boolean" ? (v ? "yes" : "no") : String(v);
            return `- ${f.label}: ${shown}`;
          })
          .filter(Boolean)
          .join("\n")
      : "No deal entered.";
  const points = sc.points
    ? "Points tables (confidential to each side):\n" +
      sc.points.issues
        .map((i) => `- ${i.label}: ${i.options.map((o) => `${o.label} (seller ${o.seller}, buyer ${o.buyer})`).join("; ")}`)
        .join("\n") +
      `\nBATNAs: seller ${sc.points.sellerBatna} points, buyer ${sc.points.buyerBatna} points.`
    : "";
  const truth = sc.truth
    ? `Actual BATNAs and reservation values: seller BATNA ${sc.truth.sellerBatna}; seller reservation ${sc.truth.sellerReservation}; buyer BATNA ${sc.truth.buyerBatna}; buyer reservation ${sc.truth.buyerReservation}.`
    : "";
  return fill(DEBRIEF_USER, {
    title: sc.title,
    round_id: input.roundId,
    public_brief: sc.publicBrief.join("\n"),
    seller_party: sc.sellerParty,
    seller_name: input.sellerName,
    seller_sheet: sc.sellerSheet.join("\n"),
    buyer_party: sc.buyerParty,
    buyer_name: input.buyerName,
    buyer_sheet: sc.buyerSheet.join("\n"),
    hidden: sc.hidden.join("\n"),
    truth,
    points_table: points,
    deal: dealText,
    scores: input.scores ? `Scores: ${JSON.stringify(input.scores)}` : "",
    rubric,
    transcript: input.transcript.trim(),
  });
}

/** Call the model and return a Debrief. Throws with a readable message on failure. */
export async function runDebrief(input: DebriefInput): Promise<Debrief> {
  if (input.transcript.trim().length < 40) throw new Error("The transcript is too short to analyse.");
  const client = anthropic();
  const response = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: DEBRIEF_SYSTEM,
    messages: [{ role: "user", content: buildDebriefPrompt(input) }],
    output_config: { format: { type: "json_schema", schema: DEBRIEF_SCHEMA as unknown as Record<string, unknown> } },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  await recordUsage(`debrief ${input.roundId}`, response.usage);
  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to analyse this transcript.");
  }
  const text = response.content
    .filter((b): b is Extract<(typeof response.content)[number], { type: "text" }> => b.type === "text")
    .map((b) => b.text)
    .join("");
  let parsed: Omit<Debrief, "createdAt" | "transcriptChars">;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("The model's answer was not valid JSON. Try again.");
  }
  return { ...parsed, createdAt: Date.now(), transcriptChars: input.transcript.length };
}
