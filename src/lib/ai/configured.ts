import "server-only";

export function anthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}
