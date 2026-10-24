export type StepKind =
  | "setup"
  | "sprint"
  | "quiz"
  | "card"
  | "prep"
  | "negotiate"
  | "reveal"
  | "debrief"
  | "experiment"
  | "drill"
  | "lunch"
  | "rule"
  | "export";

export interface Step {
  id: string;
  label: string;
  kind: StepKind;
  /** Default timer length when the facilitator presses Start. */
  minutes?: number;
  detail?: string;
  roundId?: string;
}

export interface Block {
  id: string;
  /** Display number ("0"–"9") or "Lunch". */
  number: string;
  day: 1 | 2;
  time: string;
  title: string;
  summary: string;
  steps: Step[];
}

const round = (id: string, name: string, extra: Step[] = []): Step[] => [
  { id: `${id}-prep`, label: `Prep form · ${name}`, kind: "prep", minutes: 10, roundId: id },
  { id: `${id}-neg`, label: `Negotiate · ${name}`, kind: "negotiate", minutes: 20, roundId: id },
  { id: `${id}-reveal`, label: `Reveal · ${name}`, kind: "reveal", roundId: id },
  { id: `${id}-debrief`, label: `Debrief · ${name}`, kind: "debrief", minutes: 10, roundId: id },
  ...extra,
];

export const AGENDA: Block[] = [
  {
    id: "b0",
    number: "0",
    day: 1,
    time: "09:00–09:15",
    title: "Setup",
    summary: "Pre-work check and how the day works",
    steps: [
      { id: "b0-setup", label: "Join and pre-work check", kind: "setup", minutes: 5 },
      { id: "b0-card", label: "Concept card 0 · How the day works", kind: "card", minutes: 5 },
    ],
  },
  {
    id: "b1",
    number: "1",
    day: 1,
    time: "09:15–11:00",
    title: "Claiming value",
    summary: "GTY ch. 6 + NG ch. 1 · Round R1 Pilot Price",
    steps: [
      { id: "b1-sprint", label: "Reading sprint · GTY ch. 6 + NG ch. 1", kind: "sprint", minutes: 35 },
      { id: "b1-quiz", label: "Quiz · claiming value", kind: "quiz", minutes: 5 },
      { id: "b1-card", label: "Concept card 1 · Claiming value", kind: "card", minutes: 5 },
      ...round("R1", "Pilot Price"),
    ],
  },
  {
    id: "b2",
    number: "2",
    day: 1,
    time: "11:15–13:00",
    title: "Creating value",
    summary: "NG ch. 2 · Round R2 Annual Contract",
    steps: [
      { id: "b2-sprint", label: "Reading sprint · NG ch. 2", kind: "sprint", minutes: 30 },
      { id: "b2-quiz", label: "Quiz · creating value", kind: "quiz", minutes: 5 },
      { id: "b2-card", label: "Concept card 2 · Creating value", kind: "card", minutes: 5 },
      ...round("R2", "Annual Contract", [
        { id: "R2-ext", label: "Extension · contingency clause", kind: "drill", minutes: 10, roundId: "R2" },
      ]),
    ],
  },
  {
    id: "lunch1",
    number: "Lunch",
    day: 1,
    time: "13:00–13:45",
    title: "Lunch",
    summary: "",
    steps: [{ id: "lunch1", label: "Lunch", kind: "lunch", minutes: 45 }],
  },
  {
    id: "b3",
    number: "3",
    day: 1,
    time: "13:45–15:30",
    title: "Investigation",
    summary: "GTY ch. 3 + NG ch. 3 · Round R3 Exclusivity Clause + late-penalty drill",
    steps: [
      { id: "b3-sprint", label: "Reading sprint · GTY ch. 3 + NG ch. 3", kind: "sprint", minutes: 35 },
      { id: "b3-quiz", label: "Quiz · investigation", kind: "quiz", minutes: 5 },
      { id: "b3-card", label: "Concept card 3 · Investigation", kind: "card", minutes: 5 },
      ...round("R3", "Exclusivity Clause", [
        { id: "R3b-neg", label: "Mini-drill · Late penalty (swap roles)", kind: "drill", minutes: 10, roundId: "R3b" },
        { id: "R3b-reveal", label: "Reveal · Late penalty", kind: "reveal", roundId: "R3b" },
      ]),
    ],
  },
  {
    id: "b4",
    number: "4",
    day: 1,
    time: "15:45–16:30",
    title: "Day 1 debrief",
    summary: "Personal mistakes so far; one rule for tomorrow",
    steps: [
      { id: "b4-mistakes", label: "Personal mistakes so far", kind: "debrief", minutes: 25 },
      { id: "b4-rule", label: "Write one rule for tomorrow", kind: "rule", minutes: 10 },
    ],
  },
  {
    id: "b5",
    number: "5",
    day: 2,
    time: "09:00–10:15",
    title: "Biases",
    summary: "NG ch. 4 (to \"Susceptibility to framing\") · three self-experiments",
    steps: [
      { id: "b5-sprint", label: "Reading sprint · NG ch. 4", kind: "sprint", minutes: 25 },
      { id: "b5-quiz", label: "Quiz · biases", kind: "quiz", minutes: 5 },
      { id: "b5-card", label: "Concept card 4 · Biases", kind: "card", minutes: 5 },
      { id: "b5-exp1", label: "Experiment 1 · Anchoring", kind: "experiment", minutes: 5 },
      { id: "b5-exp2", label: "Experiment 2 · Fixed pie", kind: "experiment", minutes: 10 },
      { id: "b5-exp3", label: "Experiment 3 · Overconfidence", kind: "experiment", minutes: 5 },
      { id: "b5-reveal", label: "Reveal · experiments", kind: "reveal" },
    ],
  },
  {
    id: "b6",
    number: "6",
    day: 2,
    time: "10:30–12:00",
    title: "Influence",
    summary: "NG ch. 7 · six response drills",
    steps: [
      { id: "b6-sprint", label: "Reading sprint · NG ch. 7", kind: "sprint", minutes: 30 },
      { id: "b6-quiz", label: "Quiz · influence", kind: "quiz", minutes: 5 },
      { id: "b6-card", label: "Concept card 5 · Influence and defense", kind: "card", minutes: 5 },
      { id: "b6-drills", label: "Six response drills", kind: "drill", minutes: 30 },
    ],
  },
  {
    id: "lunch2",
    number: "Lunch",
    day: 2,
    time: "12:00–12:45",
    title: "Lunch",
    summary: "",
    steps: [{ id: "lunch2", label: "Lunch", kind: "lunch", minutes: 45 }],
  },
  {
    id: "b7",
    number: "7",
    day: 2,
    time: "12:45–14:00",
    title: "Tactics",
    summary: "GTY ch. 2, 5, 8 · four tactics drills",
    steps: [
      { id: "b7-sprint", label: "Reading sprint · GTY ch. 2, 5 and 8", kind: "sprint", minutes: 35 },
      { id: "b7-quiz", label: "Quiz · Getting to Yes", kind: "quiz", minutes: 5 },
      { id: "b7-card6", label: "Concept card 6 · Tough situations", kind: "card", minutes: 5 },
      { id: "b7-card7", label: "Concept card 7 · Getting to Yes", kind: "card", minutes: 5 },
      { id: "b7-drills", label: "Four tactics drills", kind: "drill", minutes: 20 },
    ],
  },
  {
    id: "b8",
    number: "8",
    day: 2,
    time: "14:15–16:15",
    title: "Capstone",
    summary: "Card 6 refresher · Round R5 Nordlicht Beauty",
    steps: [
      { id: "b8-card", label: "Concept card 6 refresher", kind: "card", minutes: 5 },
      ...round("R5", "Nordlicht Beauty"),
    ],
  },
  {
    id: "b9",
    number: "9",
    day: 2,
    time: "16:30–17:15",
    title: "Cross-case debrief",
    summary: "Patterns across all rounds · mistakes · overconfidence reveal · export",
    steps: [
      { id: "b9-cross", label: "Cross-case debrief", kind: "debrief", minutes: 20 },
      { id: "b9-mistakes", label: "Final personal mistakes list", kind: "debrief", minutes: 10 },
      { id: "b9-overconf", label: "Overconfidence reveal", kind: "reveal" },
      { id: "b9-export", label: "Export", kind: "export" },
    ],
  },
];

export function getBlock(i: number): Block {
  return AGENDA[Math.min(Math.max(i, 0), AGENDA.length - 1)];
}

export function getStep(block: number, step: number): Step {
  const b = getBlock(block);
  return b.steps[Math.min(Math.max(step, 0), b.steps.length - 1)];
}

export function clampPosition(block: number, step: number): { block: number; step: number } {
  const b = Math.min(Math.max(block, 0), AGENDA.length - 1);
  const s = Math.min(Math.max(step, 0), AGENDA[b].steps.length - 1);
  return { block: b, step: s };
}

export function nextPosition(block: number, step: number) {
  if (step + 1 < AGENDA[block].steps.length) return { block, step: step + 1 };
  if (block + 1 < AGENDA.length) return { block: block + 1, step: 0 };
  return { block, step };
}

export function prevPosition(block: number, step: number) {
  if (step > 0) return { block, step: step - 1 };
  if (block > 0) return { block: block - 1, step: AGENDA[block - 1].steps.length - 1 };
  return { block, step };
}
