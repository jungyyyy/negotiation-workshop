# Add two AI features to the negotiation workshop app

Add the two features below using the Anthropic API. Work through everything, run the build, and commit and push to main when it passes. I will test it tomorrow; leave a short TESTING.md at the repo root telling me exactly how to try each feature.

## Shared setup

- Use the official `@anthropic-ai/sdk` package. Model: `claude-sonnet-5-5`. Read `ANTHROPIC_API_KEY` from env on the server only; never expose it to the client. Add it to `.env.example` and the README's Vercel env var list.
- All calls go through Next.js API routes that first check the signed-in user against `ALLOWED_EMAILS`, exactly like the existing session routes. Return 403 otherwise.
- Store every AI result in the session state (the existing `workshop_sessions` jsonb), so results survive reloads and appear in the final export.
- Show a visible error in the UI if the API call fails (rate limit, missing key); never fail silently.
- Keep a `lib/ai/prompts.ts` file with every prompt as a plain string so I can edit wording later without touching logic.

## Feature 1 — Transcript debrief

On every round's reveal screen (R1, R2, R3, R5 and the practice rounds from feature 2), add a "Debrief from transcript" section with a textarea where the observer pastes the call transcript, plus a "Analyze" button. Transcripts come from Wispr Flow; speaker labels may be missing or wrong, so the prompt must infer who is who from the role sheets.

The API route sends to the model: the public brief, both confidential role sheets, the hidden solution (ZOPA or Pareto frontier, bluffs, hidden interests), the submitted deal and its scores, the observer rubric definitions, and the transcript. Ask for a JSON object with these fields and render each as its own card:

1. `decisive_moment`: the one exchange that decided the outcome, quoted, with one sentence on why.
2. `questions`: every question each negotiator asked, with what it actually asked about (price / interests / BATNA / constraints / small talk) and whether it moved the deal.
3. `information`: what hidden information was revealed, by whom, at which point; what stayed hidden and the question that would have surfaced it.
4. `offers_and_concessions`: each offer and concession in order, with: who, amount, justification given (yes/no), labeled (yes/no), reciprocated (yes/no), unilateral (yes/no).
5. `tactics`: any pressure tactic, anchor, ultimatum, bluff or time pressure used, and how the other side responded (ignored / reacted / questioned / re-anchored).
6. `rubric`: a 0–2 score per rubric item for each negotiator with a one-line reason, to compare with the human observer's scores. Show both side by side.
7. `one_rule_each`: for each negotiator, the single most useful rule for their next real sales call, based on this transcript only.

Rules for the prompt: cite the transcript, never invent lines; if the transcript is too short or ambiguous, say so in the field instead of guessing; keep every field concrete; no generic negotiation advice.

Add the AI rubric scores to each person's personal mistakes list (tagged "AI") so the end-of-day list uses both human and AI scores.

Add a fixture `fixtures/demo-transcript-r1.txt` with a plausible 15-minute R1 transcript so I can test without a real recording.

## Feature 2 — AI counterpart for solo practice

Add a "Practice" area, available anytime (not tied to the agenda), where one signed-in person negotiates a scenario against an AI counterpart in a chat.

Flow:
1. Pick a scenario (R1, R2, R3, R5, and the late-penalty mini-drill) and a side (seller or buyer). The AI plays the other side.
2. The person fills the same prep form as in a live round (BATNA, reservation value, estimates, target, first-offer plan, three questions).
3. Chat view. Streaming responses. A visible counter of exchanges; soft limit 40 messages, then the AI pushes toward closing or walking away.
4. The person ends the round by submitting the deal through the same deal form as live rounds (or marking "no deal"). The existing scoring engine scores it and shows the same reveal screen, including the hidden solution and the counterpart's confidential sheet.
5. Feature 1 runs automatically on the practice transcript (the chat log is the transcript) and shows the debrief under the reveal.
6. Practice rounds are stored per person under a separate `practice` list, shown on their personal page with scores over time, and included in the export. They do not count toward the live-day rotation or the day-1/day-2 rubric averages.

Counterpart behavior (system prompt, built per scenario from the confidential sheet of the side the AI plays):
- Stay fully in character as the named counterpart (e.g. Hollowbrook's head of creator ops). Never mention being an AI, never reveal the hidden solution, never summarize the exercise.
- Hidden information (true BATNA, reservation value, budget deadline, the real reason behind a demand, the weakness of the competitor's offer) is revealed only when the person asks a direct question about that topic or asks why. Vague or leading questions get a true but partial answer. "What is your maximum?" is always deflected.
- Execute the scenario's scripted moves: anchor on the first offer, claim "there are cheaper tools" where the sheet says so, bluff where the sheet says so, make the late demand in the mini-drill, resist exclusivity with "it's our policy" in R3 until asked why.
- Concede slowly and only in response to a concession, a justification, or new information; never accept an offer worse than the sheet's reservation value; accept quickly if the offer beats the sheet's target.
- In multi-issue scenarios, prefer to negotiate issue by issue unless the person proposes a package, and trade according to the points table (accept trades that improve the AI's own points).
- Replies are short and conversational, 1–4 sentences, like a real call.
- Keep the full conversation history in the request each turn (the model has no memory between calls).

Add a "Reset and retry" button that starts the same scenario fresh with a new prep form.

## Cost control

- Use streaming for the chat; no system prompt caching needed.
- Log the input and output token counts of every call to the server console and keep a running total per session in the state so I can see the day's spend in the export.

## Finish

- `npm run build` must pass.
- Update README (features, env var) and write TESTING.md.
- Commit: "Add transcript debrief and AI practice counterpart" and push to main.
