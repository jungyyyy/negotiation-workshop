import type { Person } from "./types";

export type ExpField =
  | { key: string; label: string; type: "number"; unit?: string; min?: number; max?: number; step?: number }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[] };

export interface Experiment {
  id: string;
  stepId: string;
  title: string;
  /** Shown to everyone. */
  brief: string[];
  /** Per-person variation (the manipulation). */
  variant?: (p: Person) => string[];
  fields: ExpField[];
  /** What the reveal should say. */
  revealNote: string[];
  /** Revealed at the end of the second day instead of in block 5. */
  deferred?: boolean;
}

/** Anchoring: three different list prices, one per phone. */
export const ANCHORS: Record<Person, number> = { jung: 900, rehan: 1900, harry: 2900 };

export const EXPERIMENTS: Experiment[] = [
  {
    id: "anchoring",
    stepId: "b5-exp1",
    title: "Experiment 1 · A fair price",
    brief: [
      "A tool called ClipPilot offers TikTok Shop creators automated hook suggestions and a weekly performance report. Ten creator seats, monthly billing, cancel any time. No 1:1 feedback.",
      "Answer alone. Do not compare phones until the reveal.",
    ],
    variant: (p) => [`ClipPilot's public list price for ten seats is €${ANCHORS[p].toLocaleString("en")} per month.`],
    fields: [
      { key: "fair", label: "What is a fair monthly price for ten seats?", type: "number", unit: "€/month", min: 0, step: 50 },
      { key: "wtp", label: "The most you would pay for Myda to use it internally", type: "number", unit: "€/month", min: 0, step: 50 },
    ],
    revealNote: [
      "Each phone showed a different list price: €900, €1,900 or €2,900. Nothing else differed.",
      "If the answers line up with the list prices, the anchor did its work on people who had just read the chapter about it. That is the point: knowing about anchors does not switch them off. Only a prepared number of your own does.",
    ],
  },
  {
    id: "fixedpie",
    stepId: "b5-exp2",
    title: "Experiment 2 · Two issues with an agency",
    brief: [
      "You are Myda, closing onboarding terms with Brightline, a London agency. Two issues are open.",
      "Issue A, kickoff date: next week, in two weeks, or in a month. Issue B, who hosts the weekly creator call: Myda or Brightline.",
      "Your side: you want the kickoff next week (cash arrives sooner) and you want Brightline to host the call (it saves you three hours a week).",
      "Brightline has just said: \"We'd like to kick off next week, and we think Myda should host the weekly call.\"",
      "Answer alone with the package you would propose back.",
    ],
    fields: [
      {
        key: "date",
        label: "Kickoff date you propose",
        type: "select",
        options: [
          { value: "next", label: "Next week" },
          { value: "two", label: "In two weeks" },
          { value: "month", label: "In a month" },
        ],
      },
      {
        key: "host",
        label: "Who hosts the weekly call",
        type: "select",
        options: [
          { value: "brightline", label: "Brightline hosts" },
          { value: "alternate", label: "Alternate weeks" },
          { value: "myda", label: "Myda hosts" },
        ],
      },
      {
        key: "why",
        label: "Why that date?",
        type: "select",
        options: [
          { value: "same", label: "We both want next week, so next week" },
          { value: "trade", label: "I gave on the date to get the hosting" },
          { value: "meet", label: "Meeting them part way looked fair" },
        ],
      },
    ],
    revealNote: [
      "Both sides wanted the kickoff next week. There was nothing to negotiate on issue A.",
      "Anyone who proposed two weeks, or traded the date for the hosting, compromised on an issue where there was no conflict. In Leigh Thompson's study, about four in ten negotiators did exactly that, and many of the rest thought they had out-negotiated the other side on it.",
      "The only real issue was hosting. That is where the trade lives, against something Brightline values.",
    ],
  },
  {
    id: "overconfidence",
    stepId: "b5-exp3",
    title: "Experiment 3 · Predict yourself",
    brief: [
      "Two private predictions. They are stored now and shown to everyone at the end of day 2.",
      "Rank means where you expect to finish among the three of you on today's rubric scores plus the capstone.",
    ],
    fields: [
      {
        key: "rank",
        label: "Your rank today, out of three",
        type: "select",
        options: [
          { value: "1", label: "1st" },
          { value: "2", label: "2nd" },
          { value: "3", label: "3rd" },
        ],
      },
      { key: "share", label: "Share of the value you will capture in the capstone (R5)", type: "number", unit: "%", min: 0, max: 100, step: 5 },
    ],
    revealNote: [
      "Three people cannot all finish first, and three shares cannot all be above half. Compare the predictions with the rubric totals and the R5 result.",
      "Overconfidence is not a character flaw; it is the default setting. The fix is to write the prediction down, as you just did, and look at it afterwards.",
    ],
    deferred: true,
  },
];

export function experimentForStep(stepId: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.stepId === stepId);
}

export function getExperiment(id: string): Experiment | undefined {
  return EXPERIMENTS.find((e) => e.id === id);
}
