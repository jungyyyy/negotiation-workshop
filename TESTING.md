# Testing the AI features

Both features need `ANTHROPIC_API_KEY` on the server (Vercel env var, or
`.env.local` for local runs). Model: `claude-sonnet-5-5`. Every call logs
`[ai] <kind>: input N tokens, output M tokens` to the server console, and the
running total appears in the export under "AI usage".

## Feature 1 · Debrief from transcript (live rounds)

1. Sign in as the **observer** of the round you want to debrief. For R1 that
   is Harry (Jung sells, Rehan buys).
2. On the facilitator view, bring the session to R1's reveal: either run the
   round for real, or use **Start demo session** → **Fill and next** until
   "Reveal · Pilot Price" shows (the demo fills a sample deal and rubric).
3. Open `/me` as the observer. Under the rubric there is a card
   **Debrief from transcript · AI** with a textarea.
4. Paste the contents of `fixtures/demo-transcript-r1.txt` (a plausible
   15-minute R1 call with automatic, unreliable speaker labels) and press
   **Analyze**. Expect 30–60 seconds.
5. Seven cards appear: decisive moment, questions, information, offers and
   concessions, tactics, rubric (AI score next to the observer's score, with
   differences in red), and one rule each. A "Caveats" card appears when the
   model had to infer speakers or found the transcript thin.
6. Reload the page: the debrief is still there (it is in the session state).
   The other two people see it read-only on their reveal screen.
7. Go to block 4 or block 9 as Jung or Rehan: AI rubric zeros now appear in
   the personal mistakes list, prefixed "AI:".
8. Export (facilitator Tools → Markdown): the debrief is under the round.

Error path: remove `ANTHROPIC_API_KEY` and press Analyze → a red message
"ANTHROPIC_API_KEY is not set on the server." Nothing fails silently; rate
limits and rejected keys show their own messages.

## Feature 2 · Practice against the AI counterpart

1. Sign in as anyone and open `/practice` (also linked from the home page
   and from "My screen").
2. Pick a scenario (R1, R2, R3, R3b, R5) and a side, press **Start**, then
   **Open the new round**.
3. Fill the prep form (same fields as a live round; for R3b there is none)
   and submit. The chat opens. You speak first.
4. Negotiate. Replies stream in; the counter shows messages out of 40. After
   40 the counterpart pushes toward closing or walking away. Suggested checks:
   - R1 as seller: the buyer should mention "cheaper tools" early and open
     around €800; ask "what are you using today?" and "when do you need to
     start?" to surface the departing coach and the deadline; "what's your
     maximum?" is always deflected.
   - R3 as seller: the buyer says "it's our policy" until you ask why or what
     specifically worries them; then Lumea comes out.
   - R5 as seller: "Clipcoach is at €90 and does everything you do"; ask what
     Clipcoach includes to expose the bluff.
   - R3b as seller: the buyer opens with the €500 penalty demand.
5. Press **End the call and submit the deal**, fill the same deal form as a
   live round (or tick "No deal"), **Submit and reveal**.
6. The reveal shows the deal, the scoring (ZOPA share or points, frontier),
   the hidden solution, your prep next to the truth, the counterpart's
   confidential sheet, the transcript, and then the debrief runs
   automatically on the chat log (30–60 s).
7. **Reset and retry** starts the same scenario and side fresh (an unfinished
   round is discarded; a revealed one is kept in history).
8. `/practice` lists your rounds with a one-line score; `/me` shows the last
   five. The export has a "Practice rounds" section per person with
   transcript, scores and debrief.

Error path: without the key, sending a message shows a red error under the
chat; mid-stream failures appear as a "⚠ …" line.

## Choices I made (not specified in the prompt)

- **Counterpart targets.** "Accept quickly if the offer beats the target"
  needed concrete targets; they are in `COUNTERPART_TARGETS` in
  `src/lib/ai/prompts.ts` (e.g. R1 buyer accepts at or below €1,300, seller at
  or above €1,700). Edit freely.
- **Personas.** Named counterparts per scenario (`COUNTERPART_PERSONAS`), e.g.
  Priya Nair at Hollowbrook, Lena Hartmann at Veltra, Tobias Brandt at
  Nordlicht. When you play the buyer, the AI plays a Myda founder.
- **Who may run the live debrief.** Only the round's observer (the person who
  has both sheets). Everyone sees the result.
- **Practice debrief names.** The transcript labels you by name and the
  counterpart by persona, so "seller"/"buyer" in the debrief map to those.
- **Structured output.** The debrief uses the API's JSON-schema output format,
  so the seven fields always parse. A refusal or a non-JSON answer is shown
  as an error with a retry.
- **Refusal fallback.** Requests opt into Anthropic's server-side fallback
  (`fallbacks: "default"`) so a safety-classifier false positive on a
  negotiation transcript does not become an outage. Tell me if you would
  rather not.
- **Effort.** Chat replies use `effort: "low"` (fast, conversational);
  the debrief uses the model default.
- **Soft limit.** 40 messages counts both sides. The closing push is a system
  instruction appended from message 40 on.
- **Mistakes list.** AI rubric zeros count like observer zeros, tagged "AI",
  for live rounds only. Practice rounds never enter the mistakes list or the
  rubric totals.
- **Export.** Practice transcripts are included in full; frontier lists are
  omitted from the practice score JSON to keep the file readable.
- **Prompt caching** is not used, as requested; the system prompt is rebuilt
  per call from the scenario.
