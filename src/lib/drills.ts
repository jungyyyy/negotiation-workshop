import { PEOPLE, type Person } from "./types";

export interface Drill {
  id: string;
  title: string;
  /** Who you are in this exchange. */
  setup: string;
  /** What the counterpart says. Several entries = several voices or escalating lines. */
  lines: { who?: string; text: string }[];
  /** Shown only to the responder, when the drill needs a fact to check against. */
  factCard?: string[];
  model: string[];
  source: string;
}

export interface DrillSet {
  id: string;
  stepId: string;
  title: string;
  seconds: number;
  criteria: string[];
  drills: Drill[];
}

export const DRILL_CRITERIA = ["Ignored the pressure", "Asked a question", "Gave a justification"];

export const DRILL_SETS: DrillSet[] = [
  {
    id: "response",
    stepId: "b6-drills",
    title: "Six response drills",
    seconds: 60,
    criteria: DRILL_CRITERIA,
    drills: [
      {
        id: "match",
        title: "Match it or we're done",
        setup: "You sell Myda to a UK agency. You have quoted €1,400 per month for ten seats.",
        lines: [{ text: "Your competitor offered us the same for €700. Match it or we're done." }],
        model: [
          "Do not match, and do not argue about the €700. Treat it as information to check: ask what exactly the competitor offer includes, whether it has 1:1 feedback and who evaluated it, and why they are still in the room with you if it does everything.",
          "Then re-anchor on your own value with a reason, and if the claim stays vague, offer a contingency: a rebate if the competitor really delivers the measured result.",
        ],
        source: "NG ch. 1 (separate information from influence), ch. 7 (reference points), ch. 9 (lies), GTY ch. 8 (phony facts).",
      },
      {
        id: "final",
        title: "Take it or leave it",
        setup: "A brand has offered €90 per seat for an annual deal. You are at €120.",
        lines: [{ text: "This is our final offer. Take it or leave it." }],
        model: [
          "Ignore the ultimatum the first time: keep talking as if it had not been said, and change the subject to an issue you have not discussed, such as term, payment timing or a case study.",
          "If it comes back, ask what would need to change for them to look at it again, and leave them a face-saving route: 'that was your final offer before we talked about annual upfront payment'.",
        ],
        source: "GTY ch. 8 (take it or leave it), NG ch. 1 (give them time to moderate without losing face).",
      },
      {
        id: "deadline",
        title: "By 5 pm",
        setup: "Mid-negotiation on an annual contract with four open issues.",
        lines: [{ text: "We need an answer by 5 pm today." }],
        model: [
          "Ask why 5 pm: what happens at 5 pm, and for whom. Most deadlines are someone else's constraint, and knowing whose turns it into an issue you can trade on.",
          "Do not decide under their clock. Say what you can confirm today and what needs until tomorrow, and remember that influence works best on people who must answer fast.",
        ],
        source: "NG ch. 7 (defense: do not negotiate under time pressure), ch. 3 (ask why).",
      },
      {
        id: "cfo",
        title: "My CFO will never sign this",
        setup: "You have agreed terms in principle with a head of content.",
        lines: [{ text: "Honestly, I'd love to help you, but my CFO will never sign this." }],
        model: [
          "This is the hardhearted-partner move. Do not negotiate against the absent CFO. Ask what specifically the CFO objects to and what the CFO has signed before, then get your counterpart's agreement to the principle in writing and ask to talk to the CFO directly.",
          "Offer to help them make the case internally: the numbers, the comparison, the clause that protects the budget.",
        ],
        source: "GTY ch. 8 (hardhearted partner, ambiguous authority), NG ch. 3 (their constraint is your problem).",
      },
      {
        id: "trust",
        title: "You trust us, right?",
        setup: "You have asked for the data-separation and penalty clauses to be written into the contract.",
        lines: [{ text: "You trust us, right? Why do we need all this in the contract?" }],
        model: [
          "Separate trust from the problem: 'Trust is a separate matter; the clause is about what happens if plans change.' Say it warmly and keep the clause.",
          "If they are certain nothing will go wrong, the clause costs them nothing, so ask them to confirm that and make it contingent. Reluctance to put it in writing is itself information.",
        ],
        source: "GTY ch. 5 (never yield to pressure, only to principle), ch. 8 (dubious intentions).",
      },
      {
        id: "onemore",
        title: "One more thing",
        setup: "You have just shaken hands on an annual deal.",
        lines: [{ text: "Great, we're agreed. One more thing: we also need a free month for onboarding." }],
        model: [
          "Name it and ask about it: 'That's new. What is the onboarding month for?' If the interest is real, trade for it rather than give it: a free month against a longer term, a named case study, or upfront payment.",
          "Never concede unilaterally after agreement; if you do, the next 'one more thing' is already on its way. Reopening means the whole package is open.",
        ],
        source: "NG ch. 1 (no unilateral concessions), ch. 3 (demands as information), GTY ch. 8 (escalating demands).",
      },
    ],
  },
  {
    id: "tactics",
    stepId: "b7-drills",
    title: "Four tactics drills",
    seconds: 60,
    criteria: DRILL_CRITERIA,
    drills: [
      {
        id: "goodbad",
        title: "Good guy, bad guy",
        setup: "Two people from a brand are across the table. You have proposed €130 per seat.",
        lines: [
          { who: "Hard voice", text: "€130 is absurd. We pay €60 for tools like this and we have three other vendors waiting. I don't see why we're still talking." },
          { who: "Reasonable voice", text: "Hang on, let's not be like that. Look, I think we could get to €75 if you can meet us there today. That's me sticking my neck out for you." },
        ],
        model: [
          "Treat both voices as one side. Ask the reasonable voice the same question you would ask the hard one: 'I appreciate that. What makes €75 the fair number? What is it based on?'",
          "Name the pattern lightly if it continues: 'If you two need a minute to agree between yourselves, take it.' Then return to criteria: comparable tools, what the seat includes, measured results.",
        ],
        source: "GTY ch. 8 (good-guy/bad-guy), ch. 5 (ask for the theory behind the number).",
      },
      {
        id: "lockin",
        title: "Lock-in",
        setup: "A head of content at a DACH brand. You are at €120 per seat.",
        lines: [{ text: "I already told our CEO we'd sign at €90. I can't go back on that." }],
        model: [
          "Do not make the commitment the centre of the conversation. Downplay it: 'We all have aspirations; let me show you mine,' or 'Then let's find something that makes €90 look like the right call to your CEO.'",
          "Shift to the merits and build a package that lets them keep their word in form while you keep your value: €90 on a shorter list of seats, or €90 with annual upfront and a named case study. Give them a story for the CEO.",
        ],
        source: "GTY ch. 8 (lock-in tactics, face-saving), ch. 2 (face-saving).",
      },
      {
        id: "escalate",
        title: "Escalating demands",
        setup: "You have agreed a deal. The counterpart will add three requests in a row; answer each.",
        lines: [
          { who: "1", text: "Perfect, we're agreed. Just one small thing: we need the case study to stay anonymous after all." },
          { who: "2", text: "Great. And one more small thing: support should be the weekly call, not email." },
          { who: "3", text: "Almost there. Last small thing: can we pay quarterly instead of annually?" },
        ],
        model: [
          "After the first request, treat it as a reopening: 'If we change that, the package is open again; what would you give for it?' After the second, name the pattern and propose a break: 'Each time we agree, something new arrives. Let's pause and list everything that is still open, then settle it once.'",
          "Insist on principle: changes to the deal are trades, not gifts. Anyone serious about settling will come back more serious after the break.",
        ],
        source: "GTY ch. 8 (escalating demands), NG ch. 1 (reciprocity, contingent concessions).",
      },
      {
        id: "phony",
        title: "Phony facts",
        setup: "An agency buyer disputes Myda's results. Check your fact card before you answer.",
        lines: [{ text: "We looked at your own pilot numbers: a 3% uplift in conversion, not the 15% you keep quoting. So the price has to come down." }],
        factCard: [
          "Your prep sheet: across the three completed pilots, measured conversion uplift was 11%, 14% and 17% after eight weeks. The 3% figure is from week two of one pilot, before the first feedback cycle finished.",
          "You have the week-by-week report with you.",
        ],
        model: [
          "Do not accept the premise and do not call anyone a liar. Make the negotiation independent of trust: 'Let's look at the numbers together,' and show the report. Ask where the 3% came from and which pilot and week it refers to.",
          "Then offer the contingency clause: if measured uplift after eight weeks is under 5%, they get a rebate. If they believe 3%, they should love it; if they refuse, the claim was influence, not information.",
        ],
        source: "GTY ch. 8 (phony facts: verify, proceed independent of trust), NG ch. 1 and 2 (contingency contracts expose bluffs).",
      },
    ],
  },
];

export function drillSetForStep(stepId: string): DrillSet | undefined {
  return DRILL_SETS.find((d) => d.stepId === stepId);
}

export function getDrillSet(id: string): DrillSet | undefined {
  return DRILL_SETS.find((d) => d.id === id);
}

export type DrillRole = "responder" | "counterpart" | "observer";

/** Roles rotate every drill; the set offset keeps the second set from repeating the first. */
export function drillRoles(setId: string, index: number): Record<DrillRole, Person> {
  const offset = setId === "tactics" ? 1 : 0;
  const i = index + offset;
  return {
    responder: PEOPLE[i % 3].id,
    counterpart: PEOPLE[(i + 1) % 3].id,
    observer: PEOPLE[(i + 2) % 3].id,
  };
}

export function drillRoleOf(roles: Record<DrillRole, Person>, p: Person): DrillRole | null {
  for (const r of ["responder", "counterpart", "observer"] as DrillRole[]) if (roles[r] === p) return r;
  return null;
}
