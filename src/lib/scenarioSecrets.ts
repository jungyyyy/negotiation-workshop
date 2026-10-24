/**
 * SERVER ONLY. Confidential role sheets, points tables, hidden solutions and
 * reservation values. Never import this from a client component: the API
 * serves each signed-in participant only the parts they may see.
 */
import "server-only";
import type { DealField, PointsTable, PrepLabels, Scenario, Truth } from "./scenarios";

/** Fixed role rotation. Every person negotiates in four rounds and observes in at least one. */

export interface FullScenario extends Scenario {
  sellerSheet: string[];
  buyerSheet: string[];
  hidden: string[];
  truth?: Truth;
  single?: { sellerRv: number; buyerRv: number; unit: string };
  points?: PointsTable;
}

const CASE_STUDY = [
  { value: "none", label: "No case study" },
  { value: "anon", label: "Anonymous quote" },
  { value: "named", label: "Named logo + case study" },
];

export const FULL_SCENARIOS: FullScenario[] = [
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
    sellerSheet: [
      "You sell for Myda.",
      "Your BATNA is a pilot with a smaller Berlin agency that has offered €900/month. You think you could push them to €1,000–1,100.",
      "Your reservation value is €1,050/month. Below that, walk away and take Berlin.",
      "You believe Hollowbrook's limit is around €1,500/month.",
      "Myda's cash is tight, and a signed pilot this week matters for the EXIST report. Hollowbrook does not know that, and you do not have to tell them.",
    ],
    buyerSheet: [
      "You buy for Hollowbrook Social.",
      "You currently pay a freelance creator coach €2,400/month, and he leaves in four weeks.",
      "Your BATNA is another freelancer at about €2,000/month, but with a six-week delay you cannot afford before Q4.",
      "Your director has approved up to €2,200/month for a tool that starts within two weeks. That is your reservation value.",
      "You would like to pay as little as possible. You will mention that \"there are cheaper tools\". That is true, but they do not do 1:1 feedback.",
    ],
    hidden: [
      "ZOPA: €1,050 (Myda's reservation value) to €2,200 (Hollowbrook's approved limit).",
      "Hollowbrook's real situation: a €2,400/month coach leaving in four weeks, a slower and still expensive fallback, and a director already signed off at €2,200. Every one of those facts was discoverable with a question about their current setup and timeline.",
    ],
    single: { sellerRv: 1050, buyerRv: 2200, unit: "€/month" },
    truth: {
      sellerBatna: "Berlin agency at €900/month, probably pushable to €1,000–1,100",
      sellerReservation: "€1,050/month",
      buyerBatna: "Another freelancer at about €2,000/month, with a six-week delay",
      buyerReservation: "€2,200/month (director's approval)",
    },
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
    sellerSheet: [
      "You sell for Myda. Your points are in the table below.",
      "Your BATNA is the Berlin agency deal, worth 600 points to you. Any package below 600 points is worse than walking away.",
    ],
    buyerSheet: [
      "You buy for Hollowbrook. Your points are in the table below.",
      "Your BATNA is hiring a freelancer, worth 500 points to you. Any package below 500 points is worse than walking away.",
    ],
    hidden: [
      "The efficient trades: weekly live call (Hollowbrook +500, Myda −200), 12 months (Myda +400, Hollowbrook −100) and the named case study (Myda +400, Hollowbrook −100). Price is the issue where you claim value; the other three are where you create it.",
      "Splitting the difference on an issue where one side cares far more than the other burns points for both.",
      "Extension, the conversion dispute: Myda projects a 15% uplift, Hollowbrook doubts it. A clause such as 'rebate of one month's fees if measured uplift is under 5%, bonus of one month if over 15%' costs nothing to argue about. If Myda believes its number, it expects to collect the bonus; if Hollowbrook believes its number, it expects the rebate. Both expect to win, so both should sign, and a side that refuses has told you what it really believes.",
    ],
    points: {
      sellerBatna: 600,
      buyerBatna: 500,
      issues: [
        {
          key: "price",
          label: "Price per seat per month",
          options: [
            { value: "60", label: "€60", seller: 0, buyer: 800 },
            { value: "80", label: "€80", seller: 200, buyer: 600 },
            { value: "100", label: "€100", seller: 400, buyer: 400 },
            { value: "120", label: "€120", seller: 600, buyer: 200 },
            { value: "140", label: "€140", seller: 800, buyer: 0 },
          ],
        },
        {
          key: "term",
          label: "Contract term",
          options: [
            { value: "3", label: "3 months", seller: 0, buyer: 200 },
            { value: "6", label: "6 months", seller: 150, buyer: 150 },
            { value: "12", label: "12 months", seller: 400, buyer: 100 },
          ],
        },
        {
          key: "caseStudy",
          label: "Case study",
          options: [
            { value: "none", label: "None", seller: 0, buyer: 100 },
            { value: "anon", label: "Anonymous quote", seller: 100, buyer: 80 },
            { value: "named", label: "Named logo + case study", seller: 400, buyer: 0 },
          ],
        },
        {
          key: "support",
          label: "Support",
          options: [
            { value: "email", label: "Email, 48h", seller: 200, buyer: 0 },
            { value: "weekly", label: "Weekly live call", seller: 0, buyer: 500 },
          ],
        },
      ],
    },
    truth: {
      sellerBatna: "The Berlin agency deal",
      sellerReservation: "600 points",
      buyerBatna: "Hiring a freelancer",
      buyerReservation: "500 points",
    },
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
    sellerSheet: [
      "You sell for Myda.",
      "Your instinct will be to buy the clause out with discounts and extras. That is the trap.",
      "Your real instruction: find out why Veltra wants this clause. Do not offer anything until you know.",
    ],
    buyerSheet: [
      "You buy for Veltra.",
      "Your founder's former co-founder left and started a competing brand, \"Lumea\". Your real fear is that Myda's creators and feedback data would make Lumea's content better.",
      "You are not worried about other skincare brands at all.",
      "You will not volunteer this. Say \"it's a matter of principle\" and \"that's our policy\" until someone asks a direct why-question or asks what specifically worries you. If they ask, tell them.",
    ],
    hidden: [
      "The solution needs no concession: a clause naming Lumea only, plus a promise to keep Veltra's data separate.",
      "The clause was information about an interest (fear of one specific competitor), not a demand to be bought off.",
    ],
    truth: {
      sellerBatna: "Lose Veltra but keep a third of the pipeline open",
      sellerReservation: "No blanket skincare exclusivity, whatever the sweetener",
      buyerBatna: "Another tool, or none; the real need is protection from Lumea",
      buyerReservation: "A clause that keeps Myda's creators and data away from Lumea",
    },
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
    sellerSheet: [
      "You sell for Myda.",
      "Treat the demand as information. What does it tell you about what Veltra cares about?",
      "A fact you know: Myda's median delivery time is 18 hours.",
    ],
    buyerSheet: [
      "You buy for Veltra.",
      "Insist on the €500 penalty per late delivery (over 48 hours). Your content calendar depends on fast turnaround, and a slow tool is useless to you.",
      "You have no instruction to refuse other ideas, but do not propose any yourself.",
    ],
    hidden: [
      "The best answer: accept a higher penalty than asked, and ask for a bonus for deliveries under 24 hours. Myda's median delivery is 18 hours, so the penalty costs almost nothing and the bonus pays.",
      "The demand revealed Veltra's interest in speed. Speed is cheap for Myda. Interests that differ in cost are where value is created.",
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
    sellerSheet: [
      "You sell for Myda. Your points are in the table below.",
      "Cash timing matters more to you than price: annual upfront payment is worth a lot of points.",
      "You can run on-site workshops cheaply because Hamburg is near, so the two on-site workshops cost you very little.",
      "Your BATNA is a slower pilot with another DACH brand, worth 700 points.",
    ],
    buyerSheet: [
      "You buy for Nordlicht. Your points are in the table below.",
      "Clipcoach's offer is real, but it is €90 per seat with no 1:1 feedback, only group webinars, and your head of content hates it. You plan to say: \"Clipcoach is at €90 and does everything you do.\"",
      "Hidden budget deadline: money unspent by 31 December is lost. That makes annual upfront payment attractive to you, not costly. Do not volunteer this.",
      "Your BATNA is Clipcoach, worth 650 points.",
    ],
    hidden: [
      "The bluff: Clipcoach does not do what Myda does, and Nordlicht's head of content hates it. Any question about what Clipcoach actually delivers, or who evaluated it, would have exposed that.",
      "The budget deadline: Nordlicht preferred annual upfront payment too. Both sides wanted the same thing on that issue. Did anyone 'compromise' on it anyway?",
      "Efficient trades: annual upfront (both gain), two on-site workshops (Nordlicht +500, Myda −100), named case study (Myda +400, Nordlicht −150), 24 months (Myda +400, Nordlicht −200).",
    ],
    points: {
      sellerBatna: 700,
      buyerBatna: 650,
      issues: [
        {
          key: "price",
          label: "Price per seat per month",
          options: [
            { value: "80", label: "€80", seller: 0, buyer: 600 },
            { value: "100", label: "€100", seller: 150, buyer: 450 },
            { value: "120", label: "€120", seller: 300, buyer: 300 },
            { value: "140", label: "€140", seller: 450, buyer: 150 },
            { value: "160", label: "€160", seller: 600, buyer: 0 },
          ],
        },
        {
          key: "term",
          label: "Term",
          options: [
            { value: "6", label: "6 months", seller: 0, buyer: 200 },
            { value: "12", label: "12 months", seller: 150, buyer: 120 },
            { value: "24", label: "24 months", seller: 400, buyer: 0 },
          ],
        },
        {
          key: "payment",
          label: "Payment timing",
          options: [
            { value: "monthly", label: "Monthly", seller: 0, buyer: 150 },
            { value: "upfront", label: "Annual upfront", seller: 500, buyer: 300 },
          ],
        },
        {
          key: "caseStudy",
          label: "Case study",
          options: [
            { value: "none", label: "None", seller: 0, buyer: 150 },
            { value: "anon", label: "Anonymous quote", seller: 100, buyer: 100 },
            { value: "named", label: "Named logo + case study", seller: 400, buyer: 0 },
          ],
        },
        {
          key: "workshop",
          label: "Onboarding workshops",
          options: [
            { value: "none", label: "None", seller: 100, buyer: 0 },
            { value: "remote1", label: "One remote", seller: 60, buyer: 200 },
            { value: "onsite2", label: "Two on-site", seller: 0, buyer: 500 },
          ],
        },
      ],
    },
    truth: {
      sellerBatna: "A slower pilot with another DACH brand",
      sellerReservation: "700 points",
      buyerBatna: "Clipcoach: €90, group webinars only, and the head of content hates it",
      buyerReservation: "650 points",
    },
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

export function getFullScenario(id: string): FullScenario | undefined {
  return FULL_SCENARIOS.find((s) => s.id === id);
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
