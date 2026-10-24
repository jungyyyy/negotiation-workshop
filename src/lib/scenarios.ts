import type { Person, Role } from "./types";

/** Fixed role rotation. Every person negotiates in four rounds and observes in at least one. */
export const ROLES: Record<string, Record<Role, Person>> = {
  R1: { seller: "jung", buyer: "rehan", observer: "harry" },
  R2: { seller: "rehan", buyer: "harry", observer: "jung" },
  R3: { seller: "harry", buyer: "jung", observer: "rehan" },
  // Late-penalty mini-drill: R3 with seller and buyer swapped.
  R3b: { seller: "jung", buyer: "harry", observer: "rehan" },
  R5: { seller: "harry", buyer: "jung", observer: "rehan" },
};

export type DealField =
  | { key: string; label: string; type: "number"; unit?: string; required?: boolean; min?: number; max?: number; step?: number }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; required?: boolean }
  | { key: string; label: string; type: "boolean"; required?: boolean }
  | { key: string; label: string; type: "text"; placeholder?: string; required?: boolean };

export interface PointsIssue {
  key: string;
  label: string;
  options: { value: string; label: string; seller: number; buyer: number }[];
}

export interface PointsTable {
  issues: PointsIssue[];
  sellerBatna: number;
  buyerBatna: number;
  /** Which side's points a given person sees is decided by their role. */
  note?: string;
}

export interface PrepLabels {
  batna?: string;
  reservation?: string;
  theirBatna?: string;
  theirReservation?: string;
  target?: string;
  firstOffer?: string;
}

export interface Truth {
  sellerBatna: string;
  sellerReservation: string;
  buyerBatna: string;
  buyerReservation: string;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  kind: "single" | "points" | "investigation" | "drill";
  negotiateMinutes: number;
  requiresPrep: boolean;
  sellerParty: string;
  buyerParty: string;
  publicBrief: string[];
  prepLabels?: PrepLabels;
  dealFields: DealField[];
  debrief: string[];
  /** Observer: what to log during the round. */
  observerFocus?: string;
}

const CASE_STUDY = [
  { value: "none", label: "No case study" },
  { value: "anon", label: "Anonymous quote" },
  { value: "named", label: "Named logo + case study" },
];

/** Public parts only. Confidential parts live in scenarioSecrets.ts and are served per user. */
export const SCENARIOS: Scenario[] = [
  {
    id: "R1",
    title: "Pilot Price",
    subtitle: "Single issue · 3-month paid pilot with Hollowbrook Social",
    kind: "single",
    negotiateMinutes: 20,
    requiresPrep: true,
    sellerParty: "Myda",
    buyerParty: "Hollowbrook Social",
    publicBrief: [
      "Myda is negotiating a 3-month paid pilot with Hollowbrook Social, a UK TikTok Shop agency with about 40 creators. The pilot covers ten creator seats.",
      "The only open issue is the monthly pilot fee. Comparable tools on the market cost €800–2,000 per month for this seat count.",
      "All money in EUR.",
    ],
    dealFields: [{ key: "price", label: "Agreed monthly pilot fee", type: "number", unit: "€/month", required: true, min: 0, step: 10 }],
    debrief: [
      "Who made the first offer, and did they have enough information to make it?",
      "What was the justification attached to the first offer?",
      "Did the seller discover the freelancer situation and the four-week deadline?",
      "Which questions would have revealed it?",
    ],
    observerFocus: "Log the first offer, its justification, and every question about the other side's situation.",
  },
  {
    id: "R2",
    title: "Annual Contract",
    subtitle: "Four issues · points table · Hollowbrook moves from pilot to annual",
    kind: "points",
    negotiateMinutes: 25,
    requiresPrep: true,
    sellerParty: "Myda",
    buyerParty: "Hollowbrook Social",
    publicBrief: [
      "Hollowbrook wants to move from the pilot to an annual deal. Four issues are open: price per seat per month, contract term, case-study rights, and support tier.",
      "Both sides have a private points table and must negotiate all four issues at once. Points are confidential. Your prep form must compute a package reservation value from your BATNA.",
    ],
    prepLabels: {
      reservation: "Package reservation value (points) — the value of your BATNA",
      theirReservation: "Their package reservation value (your estimate, in their points)",
      target: "Target package (points) and the deal that gets you there",
      firstOffer: "First package offer you plan to make, with justification",
    },
    dealFields: [
      { key: "price", label: "Price per seat per month", type: "select", required: true, options: [60, 80, 100, 120, 140].map((v) => ({ value: String(v), label: `€${v}` })) },
      { key: "term", label: "Term", type: "select", required: true, options: [{ value: "3", label: "3 months" }, { value: "6", label: "6 months" }, { value: "12", label: "12 months" }] },
      { key: "caseStudy", label: "Case study", type: "select", required: true, options: CASE_STUDY },
      { key: "support", label: "Support", type: "select", required: true, options: [{ value: "email", label: "Email, 48h" }, { value: "weekly", label: "Weekly live call" }] },
      { key: "contingency", label: "Contingency clause agreed (if any)", type: "text", placeholder: "e.g. rebate if measured uplift < 5%, bonus if > 15%" },
    ],
    debrief: [
      "Did you negotiate the issues one at a time?",
      "Did anyone make a package offer across all four issues?",
      "Did you compromise in the middle on an issue where one side cared far more than the other?",
      "Extension: Hollowbrook doubts the 15% conversion uplift Myda projects. What contingency clause would both of you sign if you each believe your own number?",
    ],
    observerFocus: "Log whether offers were packages or single issues, and any moment of 'let's split the difference'.",
  },
  {
    id: "R3",
    title: "The Exclusivity Clause",
    subtitle: "Investigation · Veltra Skincare insists on one clause",
    kind: "investigation",
    negotiateMinutes: 15,
    requiresPrep: true,
    sellerParty: "Myda",
    buyerParty: "Veltra Skincare",
    publicBrief: [
      "Veltra Skincare, a DTC brand selling on TikTok Shop in Germany, wants an annual contract. Price is already agreed.",
      "Veltra insists on one clause: Myda may not work with any other skincare brand on TikTok Shop.",
      "Myda cannot accept this. Skincare is a third of its pipeline.",
    ],
    prepLabels: {
      batna: "Your BATNA if Veltra walks (and what the clause would cost you)",
      reservation: "What you will not accept, and what you could accept",
      theirBatna: "Veltra's BATNA (your estimate)",
      theirReservation: "What you think Veltra really needs",
      target: "Target outcome",
      firstOffer: "Your opening move (hint: it does not have to be an offer)",
    },
    dealFields: [
      { key: "found", label: "Did Myda find the real interest (Lumea)?", type: "boolean", required: true },
      { key: "question", label: "The question that unlocked it", type: "text", placeholder: "Quote it as closely as you can", required: false },
      { key: "clause", label: "Clause agreed", type: "text", placeholder: "e.g. non-compete limited to Lumea + data separation" },
      { key: "concessions", label: "Concessions Myda gave (if any)", type: "text", placeholder: "Discounts, extras… ideally none" },
    ],
    debrief: [
      "What did you assume the reason for the clause was?",
      "What did the first three questions you asked actually ask about?",
      "How many minutes passed before the first why-question, and what did the seller offer before that?",
    ],
    observerFocus: "Log every question the seller asks, with the time. Mark the one that unlocked the real interest.",
  },
  {
    id: "R3b",
    title: "Late Penalty",
    subtitle: "Mini-drill · 10 minutes · roles swapped",
    kind: "drill",
    negotiateMinutes: 10,
    requiresPrep: false,
    sellerParty: "Myda",
    buyerParty: "Veltra Skincare",
    publicBrief: [
      "The Veltra deal is done. At the very end, the buyer adds one demand: a penalty of €500 for every feedback delivery later than 48 hours.",
    ],
    dealFields: [
      { key: "penalty", label: "Penalty agreed per late delivery", type: "number", unit: "€", min: 0, step: 50, required: true },
      { key: "bonus", label: "Bonus for fast delivery agreed?", type: "boolean", required: true },
      { key: "bonusAmount", label: "Bonus amount and threshold", type: "text", placeholder: "e.g. €300 per delivery under 24h" },
    ],
    debrief: [
      "Did the seller defend, or ask what the demand was about?",
      "Who said the number 18 hours first, and when?",
    ],
    observerFocus: "Log the seller's first reaction word for word.",
  },
  {
    id: "R5",
    title: "Nordlicht Beauty",
    subtitle: "Capstone · five issues · hidden information · a bluff",
    kind: "points",
    negotiateMinutes: 30,
    requiresPrep: true,
    sellerParty: "Myda",
    buyerParty: "Nordlicht Beauty",
    publicBrief: [
      "Nordlicht Beauty, a DACH cosmetics brand with 25 in-house creators, is choosing between Myda and \"Clipcoach\", a cheaper competitor.",
      "Five issues: price per seat per month (€80–160 in steps of €20), term (6, 12 or 24 months), payment timing (monthly or annual upfront), case-study rights (none, anonymous, named), and onboarding workshops (none, one remote, two on-site).",
      "Each side has a private points table and a BATNA. Negotiate all five issues as a package.",
    ],
    prepLabels: {
      reservation: "Package reservation value (points) — the value of your BATNA",
      theirReservation: "Their package reservation value (your estimate, in their points)",
      target: "Target package (points) and the deal that gets you there",
      firstOffer: "First package offer you plan to make, with justification",
    },
    dealFields: [
      { key: "price", label: "Price per seat per month", type: "select", required: true, options: [80, 100, 120, 140, 160].map((v) => ({ value: String(v), label: `€${v}` })) },
      { key: "term", label: "Term", type: "select", required: true, options: [{ value: "6", label: "6 months" }, { value: "12", label: "12 months" }, { value: "24", label: "24 months" }] },
      { key: "payment", label: "Payment timing", type: "select", required: true, options: [{ value: "monthly", label: "Monthly" }, { value: "upfront", label: "Annual upfront" }] },
      { key: "caseStudy", label: "Case study", type: "select", required: true, options: CASE_STUDY },
      { key: "workshop", label: "Onboarding workshops", type: "select", required: true, options: [{ value: "none", label: "None" }, { value: "remote1", label: "One remote" }, { value: "onsite2", label: "Two on-site" }] },
      { key: "probed", label: "Did the seller probe the Clipcoach claim?", type: "boolean", required: true },
      { key: "contingency", label: "Did anyone propose a contingency clause?", type: "boolean", required: true },
      { key: "contingencyText", label: "Contingency clause (if proposed)", type: "text", placeholder: "What was proposed, and was it accepted?" },
    ],
    debrief: [
      "Go through the seven common mistakes from the claiming-value chapter. Tick your own.",
      "Which questions did the seller ask about Clipcoach, and when?",
      "Payment timing: did you discover you both wanted the same thing, or did someone 'win' it?",
    ],
    observerFocus: "Log every question about Clipcoach, every package offer, and any contingency proposal.",
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function roleLabel(role: Role, scenario: Scenario): string {
  if (role === "seller") return `Seller · ${scenario.sellerParty}`;
  if (role === "buyer") return `Buyer · ${scenario.buyerParty}`;
  return "Observer";
}

export function roleOf(roles: Record<Role, Person>, person: Person): Role | null {
  for (const r of ["seller", "buyer", "observer"] as Role[]) if (roles[r] === person) return r;
  return null;
}

/** Points a side gets for a given deal under a points table. */
export function pointsFor(table: PointsTable, deal: Record<string, unknown>, side: "seller" | "buyer"): number | null {
  let total = 0;
  for (const issue of table.issues) {
    const opt = issue.options.find((o) => o.value === String(deal[issue.key]));
    if (!opt) return null;
    total += opt[side];
  }
  return total;
}
