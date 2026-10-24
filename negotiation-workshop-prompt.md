# Build prompt: Myda Negotiation Workshop

Build a one-day negotiation workshop app for three co-founders (Jung, Rehan, Harry) of Myda, an AI 1:1 feedback coach for TikTok Shop products, sold by direct B2B sales to TikTok Shop agencies and brands in the US, UK and EU. The three of us run the workshop ourselves, each on our own phone, in one room. The app is the facilitator: it runs the agenda and timers, assigns roles, shows each person only their confidential role sheet, collects deals, scores them, and runs the debriefs.

The curriculum is based on *Negotiation Genius* (Malhotra & Bazerman) and *Getting to Yes* (Fisher, Ury & Patton). Both PDFs are in `/reference/` for you to read. Do not paste passages or reproduce the books' cases; write every concept card in your own words and point to the chapter for reading. All scenarios below are original and written for Myda.

## Stack

- Next.js (App Router) + TypeScript, Tailwind. One server, three phone clients.
- State: start with in-memory server state plus a JSON file on disk (`/data/session.json`) so a restart does not lose the day. Realtime via SSE or polling every 2 s; no need for websockets.
- Run locally with `npm run dev`; phones join over LAN by scanning a QR code the app shows on the laptop. Print the LAN URL in the console.
- Mobile-first. Everything must be usable one-handed on a phone at 390px width.
- No auth. A person taps their name (Jung / Rehan / Harry) once; the device remembers it in localStorage.

## Core model

- `Session` with a current `block` and `step`, a shared timer, and `rounds[]`.
- `Round`: scenario id, role assignment (`seller`, `buyer`, `observer` → person), status (`prep` / `negotiating` / `submitted` / `revealed`), submitted deal, computed scores, observer rubric, each negotiator's prep answers.
- Role rotation is fixed so every person negotiates in 4 rounds and observes in at least 1:
  - R1 Jung seller, Rehan buyer, Harry observer
  - R2 Rehan seller, Harry buyer, Jung observer
  - R3 Harry seller, Jung buyer, Rehan observer
  - R4 (drills) everyone rotates per drill
  - R5 Jung buyer, Harry seller, Rehan observer, then swap if time allows
- A role sheet renders only on the device of the person it is assigned to. The observer's device shows both sheets plus the rubric. (Honor system is fine; just do not render other roles' sheets.)
- Every round has a mandatory **prep form** before the timer starts: BATNA, reservation value, estimate of the other side's BATNA and reservation value, target, first-offer plan, three questions I will ask. The app stores these and shows them next to the result at reveal.

## Reading is part of the workshop, not homework

Nobody reads five hours in advance, so the books are read at the table in timed **reading sprints**, one per block, right before the exercise that uses them. Rules the app enforces:

- Pre-work is at most one hour: *Getting to Yes* chapter 1 ("Don't Bargain Over Positions") and chapter 4 ("Invent Options for Mutual Gain"). The app shows this as a two-item checklist on the join screen.
- Each sprint names exact chapters (and page ranges from the PDFs in `/reference/`) and has a hard timer of 25–35 minutes. When the timer ends, reading stops; the concept card covers what was not finished.
- After each sprint, a **five-question quiz** (multiple choice, written so it cannot be passed from the concept card alone, e.g. "In the Hamilton-style example, what did the seller's first offer give away?", "What did Holbrooke discover by asking why?"). Everyone must pass 4/5 before the round's role sheets unlock. Failing shows the relevant page and lets you retry once.
- Chapters not read in a sprint are covered by concept cards only (NG chapters 5, 6, 8, 9, 10, 11, 12, 13; GTY chapter 7 and the Q&A section).

## Two-day agenda (facilitator view shows this with live timer)

Day 1 — claiming, creating, investigating

| Block | Time | Content |
|---|---|---|
| 0 | 09:00–09:15 | Setup, pre-work check, concept card 0: negotiation is a skill, and this is how the day works |
| 1 | 09:15–11:00 | Sprint (35 min): GTY ch. 6 + NG ch. 1. Quiz. Concept card 1. Prep, round R1 (Pilot Price), reveal, debrief |
| 2 | 11:15–13:00 | Sprint (30 min): NG ch. 2. Quiz. Concept card 2. Prep, round R2 (Annual Contract), reveal, debrief |
| — | 13:00–13:45 | Lunch |
| 3 | 13:45–15:30 | Sprint (35 min): GTY ch. 3 + NG ch. 3. Quiz. Concept card 3. Prep, round R3 (Exclusivity Clause) and the late-penalty mini-drill, reveal, debrief |
| 4 | 15:45–16:30 | Day 1 debrief: personal mistakes so far, each person writes one rule to apply tomorrow |

Day 2 — biases, influence, tough situations, capstone

| Block | Time | Content |
|---|---|---|
| 5 | 09:00–10:15 | Sprint (25 min): NG ch. 4 up to "Susceptibility to framing". Quiz. Concept card 4. Three self-experiments, reveal |
| 6 | 10:30–12:00 | Sprint (30 min): NG ch. 7. Quiz. Concept card 5. Six influence/response drills, model answers |
| — | 12:00–12:45 | Lunch |
| 7 | 12:45–14:00 | Sprint (35 min): GTY ch. 2, 5 and 8. Quiz. Concept cards 6 and 7. Four tactics drills (good-guy/bad-guy, lock-in, escalating demands, phony facts), model answers |
| 8 | 14:15–16:15 | Concept card 6 refresher (lies, weakness, ugly negotiations; no reading). Prep, round R5 (Nordlicht Beauty), reveal, debrief |
| 9 | 16:30–17:15 | Cross-case debrief across all five rounds, final personal mistakes list, overconfidence reveal, export |

Each block screen: sprint timer with the reading target → quiz → concept card (readable in 5 min, your own words) → prep form → negotiation timer (observer controls it) → deal submission (observer enters it) → reveal → debrief prompts.

## Concept cards (write these, 150–250 words each, own words)

1. Claiming value: BATNA → reservation value; estimate theirs; ZOPA; first offers anchor, so anchor only when you have information, and always with a justification; respond to their anchor by not dwelling on it; never make unilateral concessions; label concessions; silence.
2. Creating value: negotiate issues simultaneously, never one at a time; build a scoring system; logroll (give what they value more than you); add issues; contingency contracts when you disagree about the future; post-settlement settlement.
3. Investigation: ask why, not just what; reconcile interests not demands; treat a demand as information about their interests; their constraint is your problem; never let a no end the conversation without asking what it would have taken.
4. Biases: fixed-pie, vividness, escalation of commitment, framing/loss aversion, egocentrism, overconfidence. System 2 list, outsider lens.
5. Influence and defense: loss framing, disaggregate gains/aggregate losses, door-in-the-face, foot-in-the-door, justification ("because"), social proof, token concessions, reference points; defenses: scoring system, separate information from influence, no decisions under time pressure.
6. Tough situations: ultimatums (ignore first), threats, "I have a better offer", lies (ask questions you know the answer to, contingency contracts expose bluffs), face-saving.
7. From *Getting to Yes*: separate people from problem; interests not positions; invent options before deciding; objective criteria; negotiation jujitsu (don't push back, ask and pause).

## Scenarios

All money in EUR. Each scenario has a public brief (both see it), a seller sheet, a buyer sheet, a hidden solution the app reveals, and scoring.

### R1 — Pilot Price (single issue)

Public: Myda is negotiating a 3-month paid pilot with Hollowbrook Social, a UK TikTok Shop agency with ~40 creators. Ten creator seats. The only open issue is the monthly pilot fee. Comparable tools on the market cost €800–2,000/month for this seat count.

Seller (Myda) confidential: Your BATNA is a pilot with a smaller Berlin agency that offered €900/month; you think you could push them to €1,000–1,100. Your reservation value: €1,050. You believe Hollowbrook's limit is around €1,500. Myda's cash is tight; a signed pilot this week matters for the EXIST report, but Hollowbrook does not know that.

Buyer (Hollowbrook) confidential: You pay a freelance creator coach €2,400/month and he leaves in four weeks. Your BATNA is another freelancer at about €2,000/month with a six-week delay you cannot afford before Q4. Your director approved up to €2,200/month for a tool that starts within two weeks. You would like to pay as little as possible and you will mention that "there are cheaper tools" (true, but they do not do 1:1 feedback).

Hidden: ZOPA €1,050–2,200. Scoring: show each side's reservation value, the agreed price, and each side's share of the ZOPA. Debrief prompts: Who made the first offer, and did they have enough information to? What was the justification? Did the seller discover the freelancer situation? What questions would have revealed it?

### R2 — Annual Contract (four issues, scoring system)

Public: Hollowbrook wants to move from pilot to an annual deal. Four issues: price per seat per month, contract term, case-study rights, support tier. Both sides receive a points table and must negotiate all four at once. Points are private.

Points tables:

| Issue | Option | Myda | Hollowbrook |
|---|---|---|---|
| Price/seat/month | €60 | 0 | 800 |
| | €80 | 200 | 600 |
| | €100 | 400 | 400 |
| | €120 | 600 | 200 |
| | €140 | 800 | 0 |
| Term | 3 months | 0 | 200 |
| | 6 months | 150 | 150 |
| | 12 months | 400 | 100 |
| Case study | none | 0 | 100 |
| | anonymous quote | 100 | 80 |
| | named logo + case study | 400 | 0 |
| Support | email, 48h | 200 | 0 |
| | weekly live call | 0 | 500 |

Seller BATNA: 600 points (the Berlin agency). Buyer BATNA: 500 points (a freelancer). Each side's prep form must compute a package reservation value.

Hidden: the efficient trades are weekly live call (Hollowbrook +500, Myda −200), 12 months (+400 / −100) and named case study (+400 / −100). Max joint points: compute from the table. Scoring at reveal: each side's points, joint points, max joint, and "points left on the table". Also list every deal on the Pareto frontier that beats both BATNAs. Debrief: Did you negotiate issues one at a time? Did anyone make a package offer? Did you compromise in the middle on an issue where one side cared far more?

Optional extension if time: Hollowbrook claims Myda's feedback will not lift conversion by the 15% Myda projects. Prompt both sides to propose a contingency clause (e.g. a rebate if the measured uplift is under 5%, a bonus if over 15%) and let the app explain why both should accept if they believe their own numbers.

### R3 — The Exclusivity Clause (investigation)

Public: Veltra Skincare, a DTC brand selling on TikTok Shop in Germany, wants an annual contract (price already agreed). Veltra insists on one clause: Myda may not work with any other skincare brand on TikTok Shop. Myda cannot accept this; skincare is a third of its pipeline.

Seller (Myda) confidential: You will try to buy the clause out with discounts and extras. That is the trap. Your real instruction: find out why.

Buyer (Veltra) confidential: Your founder's former co-founder left and started a competing brand, "Lumea". Your real fear is that Myda's creators and feedback data would make Lumea's content better. You are not worried about other skincare brands. You will not volunteer this; you will say "it's a matter of principle" and "that's our policy" until someone asks a direct why-question or asks what specifically worries you. If they ask, tell them.

Hidden solution: a clause naming Lumea only, plus a data-separation promise. No concessions needed. Scoring: binary (found the real interest / did not), plus how many minutes it took and what question unlocked it (observer logs the question). Debrief: What did you assume the reason was? What did the first three questions you asked actually ask about?

Second mini-drill in this block (10 min, swap roles): at the end of a done deal, the buyer demands a penalty of €500 per late feedback delivery (>48h). Seller sheet: treat the demand as information; the hidden best answer is to accept a higher penalty and ask for a bonus for deliveries under 24h, because Myda's median delivery is 18h.

### Blocks 5–7 — Bias experiments and drills

Self-experiments (the app runs them; each person answers alone, then the app reveals):
1. Anchoring: each phone shows a different "list price" (€900 / €1,900 / €2,900) for a fictional tool and asks for a fair price estimate and a willingness-to-pay. Reveal all three answers side by side.
2. Fixed pie: a short 2-issue case where both sides actually want the same outcome on one issue; see who "compromised" anyway.
3. Overconfidence: each person predicts their own rank for the day (1–3) and the ZOPA share they will capture in R5. Store it; reveal at the end of the day.

Response drills: six scripted counterpart lines, 60 s to answer out loud, observer scores 0–2 on "ignored the pressure, asked a question, gave a justification":
- "Your competitor offered us the same for €700. Match it or we're done."
- "This is our final offer. Take it or leave it."
- "We need an answer by 5 pm today."
- "Honestly, I'd love to help you, but my CFO will never sign this."
- "You trust us, right? Why do we need all this in the contract?"
- (Agreed deal, then) "One more thing: we also need a free month for onboarding."
Roles rotate each drill. Show the book-derived model answer after each one.

### R5 — Capstone: Nordlicht Beauty (five issues, hidden information, a bluff)

Public: Nordlicht Beauty, a DACH cosmetics brand with 25 in-house creators, is choosing between Myda and "Clipcoach", a cheaper competitor. Issues: price per seat per month (€80–160 in steps of 20), term (6/12/24 months), payment timing (monthly / annual upfront), case-study rights (none / anonymous / named), onboarding workshop (none / one remote / two on-site). Each side has a points table (design them so the efficient trades are annual upfront payment and two on-site workshops traded for a higher price and a named case study, plus 24 months). BATNAs for both sides.

Seller (Myda) confidential: cash timing matters more than price (annual upfront is worth a lot of points); you can run on-site workshops cheaply because Hamburg is near. Buyer (Nordlicht) confidential: Clipcoach's offer is real but is €90/seat with no 1:1 feedback, only group webinars, and the head of content hates it; you plan to say "Clipcoach is at €90 and does everything you do". You also have a hidden budget deadline: money unspent by 31 December is lost, which makes annual upfront attractive to you, not costly.

Hidden reveal: the bluff and the budget deadline. Scoring as in R2 plus: did the seller probe the competitor claim (observer logs the questions)? Did anyone propose a contingency clause? Debrief: full checklist of the seven common mistakes from the claiming-value chapter, each person ticks their own.

## Observer rubric (every negotiation round, per negotiator, 0–2 each)

1. Prepared BATNA and reservation value before starting (the app checks the prep form).
2. First offer had a justification, or deliberately waited for information.
3. Asked at least three questions about interests before making an offer.
4. Did not make a unilateral concession; labeled concessions.
5. Discussed issues as a package (multi-issue rounds).
6. Handled pressure or tactics without reacting (ignored, questioned, or re-anchored).
7. Protected the relationship (no blame, gave face).
Observer also writes one sentence: "the moment that decided this negotiation".

## Debrief and export

- Reveal screen: deal, both sheets, ZOPA/frontier, scores, prep forms side by side with what actually happened.
- Personal mistakes list per person: the app accumulates each round's rubric lows and the ticked mistakes; at the end it shows each person their three most repeated mistakes and asks them to type one rule for their next real call.
- Cross-case debrief (block 6): the app asks the three of you to compare all five rounds and name patterns, not case-by-case lessons (this is the analogical-learning method from chapter 6).
- Export: one markdown file with every round, every prep form, every score and the personal lists; and a JSON dump.

Block 7 tactics drills (from GTY ch. 8): the app plays the counterpart's line, 60 s to respond, observer scores as in block 6:
- Good-guy/bad-guy: two voices, one hard, one "reasonable" offering a small concession.
- Lock-in: "I already told our CEO we'd sign at €90."
- Escalating demands: three "one more small thing" requests in a row after agreement.
- Phony facts: a claim you can verify against your prep sheet.

## Build order

1. Session model, name picking, facilitator view with two-day agenda and timer, QR join.
2. Reading sprints with page targets and hard timers; quizzes (write 5 questions per sprint from the actual chapters, with page references for the retry hint).
3. Round engine: role assignment, prep form, role sheets per device, submission, reveal.
4. Scoring: R1 ZOPA share; R2/R5 points, joint points, max joint and Pareto frontier (brute force over all option combinations).
5. Concept cards and the seven scenarios' texts.
6. Blocks 5–7 experiments and drills.
7. Debrief, mistakes list, day-1 rule, export.
8. Seed a "demo session" so I can click through both days in five minutes to test it (sprint timers skippable in demo mode).

Write all copy in English. Keep the UI plain and fast: large tap targets, one action per screen, the timer always visible.
