import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { dispatch } from "../store";

const g = globalThis as unknown as { __nwAnthropic?: Anthropic };

export function anthropic(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not set");
  g.__nwAnthropic ??= new Anthropic({ maxRetries: 2 });
  return g.__nwAnthropic;
}

/** Log a call's token counts to the console and the running total in state. */
export async function recordUsage(kind: string, usage: { input_tokens: number; output_tokens: number } | undefined) {
  const input = usage?.input_tokens ?? 0;
  const output = usage?.output_tokens ?? 0;
  console.log(`[ai] ${kind}: input ${input} tokens, output ${output} tokens`);
  await dispatch({ type: "ai.usage", inputTokens: input, outputTokens: output });
}

/** Turn an SDK error into a message the UI can show. */
export function describeAiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return "The Anthropic API key was rejected. Check ANTHROPIC_API_KEY.";
  if (e instanceof Anthropic.RateLimitError) return "Anthropic rate limit hit. Wait a minute and try again.";
  if (e instanceof Anthropic.APIConnectionError) return "Could not reach the Anthropic API.";
  if (e instanceof Anthropic.APIError) return `Anthropic API error ${e.status ?? ""}: ${e.message}`;
  return e instanceof Error ? e.message : String(e);
}
