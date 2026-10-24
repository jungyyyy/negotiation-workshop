/**
 * Reading sprints and their quizzes.
 *
 * Page numbers: Getting to Yes (GTY) — the PDF's page numbers equal the printed
 * ones. Negotiation Genius (NG) — the PDF has no printed numbers, so pages are
 * PDF pages (the number your reader shows).
 */

export type Book = "ng" | "gty";

export const BOOKS: Record<Book, { short: string; title: string; file: string; pageNote: string }> = {
  ng: {
    short: "NG",
    title: "Negotiation Genius",
    file: "NegotiationGeniusMalhotra.pdf",
    pageNote: "PDF page numbers",
  },
  gty: {
    short: "GTY",
    title: "Getting to Yes",
    file: "fisher-getting-to-yes.pdf",
    pageNote: "printed page numbers (same as PDF)",
  },
};

export interface Reading {
  book: Book;
  chapter: string;
  title: string;
  /** Inclusive page range. */
  from: number;
  to: number;
  /** Optional: where to stop inside the chapter. */
  stopAt?: string;
  /** Optional: what to make sure you read if time runs short. */
  priority?: string;
}

export interface Question {
  q: string;
  options: [string, string, string, string];
  /** Index into options. */
  answer: 0 | 1 | 2 | 3;
  hint: { book: Book; pages: string; note: string };
}

export interface Sprint {
  id: string;
  blockId: string;
  minutes: number;
  title: string;
  readings: Reading[];
  order?: string;
  quiz: Question[];
}

export const PASS_MARK = 4;
export const MAX_ATTEMPTS = 2;

export const SPRINTS: Sprint[] = [
  {
    id: "s1",
    blockId: "b1",
    minutes: 35,
    title: "Claiming value",
    order: "Read the short GTY chapter first, then NG chapter 1.",
    readings: [
      {
        book: "gty",
        chapter: "Chapter 6",
        title: "What If They Are More Powerful? (Develop Your BATNA)",
        from: 50,
        to: 53,
      },
      {
        book: "ng",
        chapter: "Chapter 1",
        title: "Claiming Value in Negotiation",
        from: 17,
        to: 50,
        priority: "If you run short: pp. 21–38 (preparing, the postmortem, first offers) matter most for R1.",
      },
    ],
    quiz: [
      {
        q: "In the Hamilton Real Estate case, what did the seller's first offer of $49 million give away?",
        options: [
          "It revealed the existence of the Quincy offer.",
          "It was so aggressive that Connie nearly walked away.",
          "It capped the deal far below Estate One's true $60 million limit, because it landed inside the real ZOPA.",
          "It let Connie set the anchor for the rest of the talk.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 27–28 and 31–32", note: "Re-read the postmortem and the passage on premature first offers." },
      },
      {
        q: "How did Roosevelt's campaign manager turn the photograph problem around?",
        options: [
          "He focused on the photographer's weak BATNA and asked how much the photographer would pay for the publicity.",
          "He threatened to reprint all three million brochures.",
          "He offered a flat $250 and the photographer accepted.",
          "He had the copyright claim dismissed in court.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "pp. 17 and 23–24", note: "The telegram, and the discussion of assessing the other party's BATNA." },
      },
      {
        q: "In the Northcraft and Neale study, real-estate agents were shown the same house with different list prices. What happened?",
        options: [
          "Experienced agents were unaffected by the list price.",
          "Only the willingness-to-pay measure moved; appraisals did not.",
          "Agents' valuations moved with whichever list price they were given, yet more than 80% said the list price had not influenced them.",
          "Agents gave higher appraisals when the list price was lower.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 30–31", note: "The real-estate anchoring study and Figure 1.2." },
      },
      {
        q: "According to the chapter, what is the risk of pressing the other side to justify their aggressive anchor?",
        options: [
          "They will take it as a concession from you.",
          "The more an anchor is discussed, the more powerful it becomes.",
          "They will walk away from the table.",
          "It reveals your own reservation value.",
        ],
        answer: 1,
        hint: { book: "ng", pages: "p. 34", note: "Strategy 3: avoid dwelling on their anchor." },
      },
      {
        q: "The Hamilton seller set a reservation value of $42.65 million. Where did that number come from?",
        options: [
          "The $27 million purchase price plus seven years of appreciation.",
          "The midpoint of the $36–44 million comparable-sales range.",
          "Estate One's estimated willingness to pay, minus a safety margin.",
          "Quincy's $38 million offer improved by the 10–15% the seller believed could still be negotiated, taking the midpoint.",
        ],
        answer: 3,
        hint: { book: "ng", pages: "p. 22", note: "Step 2: calculate your reservation value." },
      },
    ],
  },
  {
    id: "s2",
    blockId: "b2",
    minutes: 30,
    title: "Creating value",
    readings: [
      {
        book: "ng",
        chapter: "Chapter 2",
        title: "Creating Value in Negotiation",
        from: 51,
        to: 82,
        priority: "If you run short: pp. 51–72 (Holbrooke, Moms.com, logrolling, adding issues, contingency contracts) before the preparation strategies.",
      },
    ],
    quiz: [
      {
        q: "What did Ambassador Holbrooke discover by asking UN member states why they could not pay more?",
        options: [
          "They were waiting for Japan to move first.",
          "Their 2001 budgets were already fixed, so the timing of the increase, not its size, was the obstacle.",
          "They wanted a seat on the Security Council in return.",
          "They insisted the US pay its arrears before any talks.",
        ],
        answer: 1,
        hint: { book: "ng", pages: "pp. 52–53", note: "How the two-issue structure (size and timing) emerged." },
      },
      {
        q: "In Moms.com, why was settling on six runs a mistake even though it split the difference?",
        options: [
          "Each extra run was worth $800,000 to WCHI but cost Hollyville only $250,000, so eight runs plus a higher fee made both sides better off.",
          "Six runs was below the industry standard for the market.",
          "Hollyville's analysts actually preferred eight runs all along.",
          "WCHI's reservation value on runs was exactly six.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "pp. 59–60", note: "Table 2.3 and 'Creating value through logrolling'." },
      },
      {
        q: "Why should both Hollyville and WCHI accept the ratings clause (rebate if ratings fall under 4, surcharge if over 5)?",
        options: [
          "Because Nielsen required a clause of that form.",
          "Because the clause replaced the licensing fee entirely.",
          "Because each side believed its own projection, so each expected to gain about $500,000 from the bet.",
          "Because it was zero-sum and one side was certain to lose.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 68–70", note: "Agreement Z, Table 2.6 and the expected-value calculation." },
      },
      {
        q: "Easy issues first, or hard issues first? What is the chapter's answer?",
        options: [
          "Easy first, to build trust and momentum.",
          "Hard first, because they are make-or-break.",
          "It depends on the relationship.",
          "Neither: negotiate the issues simultaneously, because one at a time eliminates logrolling.",
        ],
        answer: 3,
        hint: { book: "ng", pages: "pp. 76–77", note: "Execution strategy 1." },
      },
      {
        q: "What is a post-settlement settlement, and how should it be framed?",
        options: [
          "A second look after signing, where the signed deal is the new BATNA and only changes that improve both sides' outcomes are accepted.",
          "A renegotiation requested when one side regrets the deal.",
          "Arbitration after the negotiation has broken down.",
          "A side letter the lawyers add after the handshake.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "pp. 79–82", note: "Post-negotiation strategies for value creation." },
      },
    ],
  },
  {
    id: "s3",
    blockId: "b3",
    minutes: 35,
    title: "Investigation",
    order: "GTY chapter 3 first (8 pages), then NG chapter 3.",
    readings: [
      {
        book: "gty",
        chapter: "Chapter 3",
        title: "Focus on Interests, Not Positions",
        from: 23,
        to: 30,
      },
      {
        book: "ng",
        chapter: "Chapter 3",
        title: "Investigative Negotiation",
        from: 83,
        to: 103,
        priority: "If you run short: the seven principles (pp. 83–95) before the five strategies for reticent negotiators.",
      },
    ],
    quiz: [
      {
        q: "Why did the European supplier refuse exclusivity, as revealed by Chris's one-word question?",
        options: [
          "He was holding out for a higher price per pound.",
          "He feared exclusivity would block more profitable future deals.",
          "Exclusivity would break a promise to his cousin, who bought about 250 pounds a year.",
          "He had already promised the ingredient to another US buyer.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 83–84", note: "The opening story and principle 1." },
      },
      {
        q: "In the HomeStuff and Kogs story, what was the supplier's real constraint on fast delivery?",
        options: [
          "High short-notice freight costs, which HomeStuff could solve with its own shipping rates.",
          "Manufacturing capacity for the parts.",
          "A shortage of raw material.",
          "Legal liability for late delivery.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "pp. 91–92", note: "Principle 5: don't dismiss anything as 'their problem'." },
      },
      {
        q: "To learn a reticent real-estate agent's priorities, the chapter suggests making two offers at once. What must be true of them?",
        options: [
          "One must be clearly more generous than the other.",
          "Both must exceed what the agent has asked for.",
          "They must be made on different days.",
          "They must be of equal value to you but differ in mix, such as 2.5% for three months versus 3.5% for two months.",
        ],
        answer: 3,
        hint: { book: "ng", pages: "pp. 101–102", note: "Strategy 5: make multiple offers simultaneously." },
      },
      {
        q: "In Getting to Yes, two men in a library want the window open and closed. What did the librarian do?",
        options: [
          "Opened it halfway as a compromise.",
          "Asked each man why, then opened a window in the next room: fresh air without a draft.",
          "Moved one of them to another room.",
          "Asked a third reader to decide.",
        ],
        answer: 1,
        hint: { book: "gty", pages: "p. 23", note: "The opening of chapter 3." },
      },
      {
        q: "Linda lost a gift-items deal to a competitor and called the VP of purchasing anyway. What did she learn, and what came of it?",
        options: [
          "Price was all that mattered, and the loss stood.",
          "The client wanted exclusivity she could not offer.",
          "She had cut product features the client valued in order to lower price; she revised her offer and won the deal a week later.",
          "The competitor had a personal relationship with the VP.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 93–94", note: "Principle 6: don't let negotiations end with a rejection of your offer." },
      },
    ],
  },
  {
    id: "s4",
    blockId: "b5",
    minutes: 25,
    title: "Biases of the mind",
    readings: [
      {
        book: "ng",
        chapter: "Chapter 4",
        title: "When Rationality Fails: Biases of the Mind",
        from: 105,
        to: 120,
        stopAt: "Stop at the heading 'Susceptibility to Framing' on p. 120. The concept card covers the rest.",
      },
    ],
    quiz: [
      {
        q: "In Leigh Thompson's simulation with two compatible issues (both sides wanted the same outcome), what share of negotiators failed to agree on the mutually preferred outcome on at least one of them?",
        options: ["About 5%", "About 39%", "About 70%", "About 95%"],
        answer: 1,
        hint: { book: "ng", pages: "p. 110", note: "The fixed-pie bias, compatible issues." },
      },
      {
        q: "In the arms-reduction study, how did US respondents judge the same proposal depending on who was said to have made it?",
        options: [
          "Identically, since the text was the same.",
          "Most refused to answer either version.",
          "They thought it favored the US more when attributed to Gorbachev.",
          "Attributed to Gorbachev, 56% said it favored the USSR; attributed to Reagan, only 27% did.",
        ],
        answer: 3,
        hint: { book: "ng", pages: "pp. 110–111", note: "Reactive devaluation." },
      },
      {
        q: "In the $100 auction, why do the last two bidders go past $100?",
        options: [
          "The second-highest bidder must also pay, so one more bid looks cheaper than a sure loss; the need to justify earlier bids and rivalry push it further.",
          "They lose count of the bids.",
          "The professor refunds the loser afterwards.",
          "The rules require bidding to continue until someone reaches $200.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "pp. 115–116", note: "Nonrational escalation of commitment." },
      },
      {
        q: "What did Sebenius and Wheeler propose for sports lockouts like the NHL's?",
        options: [
          "Binding arbitration with a neutral judge.",
          "Resume play, with revenues and pay held in escrow and a sizable share going to charity if no deal is reached in time.",
          "Government-imposed salary caps.",
          "A fan referendum on the terms.",
        ],
        answer: 1,
        hint: { book: "ng", pages: "pp. 117–118", note: "The escrow proposal, and the ACELA brake dispute." },
      },
      {
        q: "In the vividness-bias example, which two features of a job offer do MBA students over-weight?",
        options: [
          "Office location and travel load.",
          "Medical benefits and office space.",
          "Salary and the prestige of the firm, such as an offer from McKinsey.",
          "Control over assignments and collegiality.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "pp. 112–113", note: "The Spangler conversation list." },
      },
    ],
  },
  {
    id: "s5",
    blockId: "b6",
    minutes: 30,
    title: "Strategies of influence",
    readings: [
      {
        book: "ng",
        chapter: "Chapter 7",
        title: "Strategies of Influence",
        from: 156,
        to: 173,
        priority: "Read the eight strategies and then the six defense strategies (pp. 170–172); the drills test the defenses.",
      },
    ],
    quiz: [
      {
        q: "In the Santa Cruz energy-audit study, which pitch sold more insulation?",
        options: [
          "'If you insulate, you will save X cents per day.'",
          "'If you fail to insulate, you will lose X cents per day.'",
          "A free thermostat with every order.",
          "'Most of your neighbors have already insulated.'",
        ],
        answer: 1,
        hint: { book: "ng", pages: "p. 157", note: "Strategy 1: highlight their potential losses." },
      },
      {
        q: "In Cialdini's zoo-trip study, what raised agreement to chaperone from 17% to 50%?",
        options: [
          "Offering a small payment.",
          "Asking in groups rather than individually.",
          "First asking for a two-hours-a-week, three-year counselor commitment, then asking for the zoo trip.",
          "Showing photographs of the children.",
        ],
        answer: 2,
        hint: { book: "ng", pages: "p. 161", note: "Strategy 3: door in the face." },
      },
      {
        q: "In Langer's copy-machine study, what did adding 'because I have to make some copies' do?",
        options: [
          "Raised compliance from 60% to 93%, even though the justification was empty.",
          "Made no difference compared with asking without a reason.",
          "Annoyed people and lowered compliance.",
          "Worked only when the request was for many pages.",
        ],
        answer: 0,
        hint: { book: "ng", pages: "p. 164", note: "Strategy 5: the power of justification." },
      },
      {
        q: "In the subcontractors' survey experiment, which approach produced the highest response rate?",
        options: [
          "A promised $50 payment on completion (23.3%).",
          "No incentive at all (20.7%).",
          "A promised $100 payment.",
          "A single $1 bill enclosed with the questionnaire (40.7%).",
        ],
        answer: 3,
        hint: { book: "ng", pages: "pp. 167–168", note: "Strategy 7: token unilateral concessions." },
      },
      {
        q: "Colleen Szot changed three words in the standard infomercial line and calls skyrocketed. What was the new line?",
        options: [
          "'Operators are standing by, please call now.'",
          "'If operators are busy, please call again.'",
          "'Call in the next ten minutes for a discount.'",
          "'Stock is strictly limited.'",
        ],
        answer: 1,
        hint: { book: "ng", pages: "p. 166", note: "Strategy 6: social proof." },
      },
    ],
  },
  {
    id: "s6",
    blockId: "b7",
    minutes: 35,
    title: "Getting to Yes: people, criteria, tricks",
    order: "Chapter 8 first (the drills use it), then chapter 5, then chapter 2.",
    readings: [
      {
        book: "gty",
        chapter: "Chapter 8",
        title: "What If They Use Dirty Tricks? (Taming the Hard Bargainer)",
        from: 64,
        to: 70,
      },
      {
        book: "gty",
        chapter: "Chapter 5",
        title: "Insist on Using Objective Criteria",
        from: 42,
        to: 49,
      },
      {
        book: "gty",
        chapter: "Chapter 2",
        title: "Separate the People from the Problem",
        from: 13,
        to: 23,
        priority: "If you run short: perception (pp. 15–19) and communication (pp. 20–22).",
      },
    ],
    quiz: [
      {
        q: "In the 'company policy' case, the adjuster offered Tom $3,500, take it or leave it. What did Tom do?",
        options: [
          "Accepted, since company policy could not be changed.",
          "Threatened an immediate lawsuit for $5,000.",
          "Said he would do better in court unless the adjuster could state objectively why that was fair, set a follow-up meeting, then priced a comparable car from a newspaper ad adjusting for mileage, radio and air conditioning, and left with $8,024.",
          "Asked for exactly $4,000 and split the difference.",
        ],
        answer: 2,
        hint: { book: "gty", pages: "pp. 48–49", note: "The dialogue with the insurance adjuster." },
      },
      {
        q: "How did the Law of the Sea conference get past the deadlock between a $60 million mining fee and no fee at all?",
        options: [
          "An MIT economic model of seabed mining that both sides accepted as objective, which changed both positions.",
          "They split the difference at $30 million.",
          "The United States walked out and the fee was dropped.",
          "India withdrew its proposal under pressure.",
        ],
        answer: 0,
        hint: { book: "gty", pages: "p. 44", note: "The case for objective criteria." },
      },
      {
        q: "What does chapter 8 recommend when you spot a good-guy/bad-guy routine?",
        options: [
          "Deal only with the good guy and ignore the bad guy.",
          "Stage the same routine back at them.",
          "Walk out immediately.",
          "Ask the good guy the same question you asked the bad guy: what principle makes that a fair price?",
        ],
        answer: 3,
        hint: { book: "gty", pages: "p. 68", note: "Psychological warfare: the good-guy/bad-guy routine." },
      },
      {
        q: "The Prime Minister of Malta's repeated 'Yes, agreed, but there is still one small problem' illustrates which tactic, and what is the response?",
        options: [
          "Phony facts: verify every claim.",
          "Escalating demands: call it to their attention, take a break, then insist on principle.",
          "Lock-in: make a joke and move on.",
          "Hardhearted partner: ask to speak with the partner.",
        ],
        answer: 1,
        hint: { book: "gty", pages: "p. 69", note: "Positional pressure tactics: escalating demands." },
      },
      {
        q: "According to chapter 2, what is the cheapest concession you can make to the other side?",
        options: [
          "A small discount early on.",
          "An apology, even without admitting fault.",
          "Letting them know they have been heard.",
          "Agreeing to meet at their office.",
        ],
        answer: 2,
        hint: { book: "gty", pages: "p. 21", note: "Communication: listen actively and acknowledge what is being said." },
      },
    ],
  },
];

export function getSprint(id: string): Sprint | undefined {
  return SPRINTS.find((s) => s.id === id);
}

export function sprintForBlock(blockId: string): Sprint | undefined {
  return SPRINTS.find((s) => s.blockId === blockId);
}

export function pageLabel(r: Reading): string {
  const b = BOOKS[r.book];
  const prefix = r.book === "ng" ? "PDF pp." : "pp.";
  return `${b.short} ${prefix} ${r.from}–${r.to}`;
}

export function pageCount(r: Reading): number {
  return r.to - r.from + 1;
}
