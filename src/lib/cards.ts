/**
 * Concept cards. Written in our own words; each points to the chapter to read
 * for the full treatment. Readable in about five minutes on a phone.
 */

export interface ConceptCard {
  id: string;
  number: number;
  title: string;
  /** Agenda step ids that show this card. */
  stepIds: string[];
  /** Where the full argument lives. */
  read: string;
  /** One line to remember. */
  rule: string;
  sections: { heading: string; body: string }[];
}

export const CARDS: ConceptCard[] = [
  {
    id: "c0",
    number: 0,
    title: "Negotiation is a skill, and this is how the day works",
    stepIds: ["b0-card"],
    read: "No reading for this card. The two pre-work chapters (GTY 1 and 4) are the only homework.",
    rule: "Prepare on paper, negotiate with questions, debrief without excuses.",
    sections: [
      {
        heading: "Why we are doing this",
        body: "Myda sells by direct B2B conversations with agencies and brands. Every pilot price, every annual contract, every clause is a negotiation, and we have been running them on instinct. The research is clear that instinct is not enough: experienced people make the same handful of errors, and those errors are predictable, which means they are trainable. Two days of structured practice beats two years of accidental practice.",
      },
      {
        heading: "How a block runs",
        body: "Each block starts with a timed reading sprint from one of the two books. The clock is hard: when it ends, reading stops and the concept card covers what was left. A five-question quiz follows; you need four right before your role sheet opens, and a fail shows you the page to re-read. Then comes a round: a prep form that forces you to write down your BATNA and reservation value before you talk, a timed negotiation that the observer runs, a deal the observer enters, and a reveal that puts your preparation next to what was actually true on the other side.",
      },
      {
        heading: "Rules of the room",
        body: "Phones face up; only your own sheet is on it. The observer's phone shows both sheets and the rubric, so the observer stays quiet during the round. Nobody reads another person's sheet. In debriefs we name mistakes, not people, and each of us keeps a running list of our own. At the end of each day you write one rule to apply in your next real call. That rule is the product of the day.",
      },
    ],
  },
  {
    id: "c1",
    number: 1,
    title: "Claiming value",
    stepIds: ["b1-card"],
    read: "Negotiation Genius ch. 1 (PDF pp. 17–50); Getting to Yes ch. 6 (pp. 50–53).",
    rule: "Know your walk-away, estimate theirs, anchor only with information and a reason, never concede alone.",
    sections: [
      {
        heading: "Before you talk",
        body: "Start with your BATNA: what you will actually do if there is no deal. From it derive your reservation value, the number where you are indifferent between signing and walking. Then do the same for the other side, from their point of view, and write down what you are assuming. The gap between the two reservation values is the ZOPA, and everything you capture is a slice of it. A bottom line picked at the breakfast table is not a reservation value; it is usually too high, and it stops you from listening.",
      },
      {
        heading: "First offers",
        body: "A first offer anchors the other side's expectations, which is powerful. But an anchor made without information is a gift: if their limit is far above what you ask, you have capped your own outcome the moment you spoke. So open only when you have a good estimate of their limit, open outside the ZOPA, and always attach a justification. If you cannot finish the sentence 'I propose X because...', you are asking for too much or too little.",
      },
      {
        heading: "When they anchor",
        body: "Do not dwell on their number. Discussing an anchor makes it stronger, so acknowledge it briefly, separate the information in it from the influence, and redirect to your own view with a counter-anchor and a reason. Give them room to retreat without losing face.",
      },
      {
        heading: "Haggling",
        body: "Never concede alone: label what you give, say what you expect back, and make concessions contingent when you can. After you make an offer, the next word should not be yours.",
      },
    ],
  },
  {
    id: "c2",
    number: 2,
    title: "Creating value",
    stepIds: ["b2-card"],
    read: "Negotiation Genius ch. 2 (PDF pp. 51–82).",
    rule: "Everything on the table at once, trade what they value more than you do, and never meet in the middle on an issue only one of you cares about.",
    sections: [
      {
        heading: "Simultaneously, never sequentially",
        body: "If you settle price first and then term, every issue becomes a tug of war. Negotiating all issues at the same time is what makes trades possible: do not close any issue until all are open. Make package offers and ask for package counteroffers, so you can see which parts the other side pushes back on.",
      },
      {
        heading: "A scoring system",
        body: "Before the round, give each option on each issue a point value, then compute the value of your BATNA in those same points. That is your package reservation value. Without it you defend arbitrary limits on single issues and miss deals that are better overall.",
      },
      {
        heading: "Logroll and add issues",
        body: "If they value something more than you do, give it to them and get paid in the currency you value more. Do not give it away; sell it. More issues mean more currency, so when a deal is stuck on price, add delivery, term, support, references, or future business. If you leave the table knowing little about their priorities, you have probably left value on it.",
      },
      {
        heading: "When you disagree about the future",
        body: "If you and they believe different things about an outcome, do not argue and do not split the difference. Write a contingency clause: a payment that depends on what actually happens. Both sides expect to win the bet, so both should sign, and whoever refuses has just told you something. After signing, propose a post-settlement settlement: a second look where only improvements for both sides count.",
      },
    ],
  },
  {
    id: "c3",
    number: 3,
    title: "Investigation",
    stepIds: ["b3-card"],
    read: "Negotiation Genius ch. 3 (PDF pp. 83–103); Getting to Yes ch. 3 (pp. 23–30).",
    rule: "Ask why before you offer anything, and never let a no end the conversation.",
    sections: [
      {
        heading: "Why, not what",
        body: "A demand tells you what they want. Only the reason behind it tells you how to satisfy it, and the reason is often something you can give cheaply. When two positions are incompatible, the interests behind them usually are not. Ask the why-question early, ask it directly, and when the answer is 'policy' or 'principle', ask what specifically worries them.",
      },
      {
        heading: "Demands and constraints are information",
        body: "When they add a demand late, resist the urge to defend. Ask what it tells you about what they care about, then turn it into a trade. When they say they cannot do something, do not file it under 'their problem': their constraint shrinks your deal too, and you may be the one who can remove it.",
      },
      {
        heading: "Getting reticent people to talk",
        body: "Build trust by sharing first, in small steps. Ask indirect questions about their plans, their customers, their timeline, instead of asking for their bottom line. Share your relative priorities without devaluing any issue. If they still will not talk, make two offers of equal value to you and watch which one they prefer; their choice reveals their priorities without them saying a word.",
      },
      {
        heading: "After a no",
        body: "Ask what it would have taken. Either you learn there was no deal to be had, or you learn what you misread and get a second shot. Both are better than walking away ignorant.",
      },
    ],
  },
  {
    id: "c4",
    number: 4,
    title: "Biases of the mind",
    stepIds: ["b5-card"],
    read: "Negotiation Genius ch. 4 (PDF pp. 105–124); ch. 5 and 6 are covered by this card only.",
    rule: "Assume the pie can grow, distrust vivid numbers, decide your exit before you start, and ask how the question was framed.",
    sections: [
      {
        heading: "Fixed pie",
        body: "The default assumption is that whatever is good for them is bad for us. It makes people compromise even on issues where both sides want the same thing, and it makes them devalue any proposal simply because the other side made it. Walk in assuming there is value to create; being wrong about that is cheap, and the reverse mistake is expensive.",
      },
      {
        heading: "Vividness",
        body: "A salary figure and a famous logo travel faster through your mind than a dull list of what will actually shape your week. In deals, the headline price crowds out term, payment timing, and support. Your scoring system is the antidote: cross-check your reaction against the weights you wrote down before anyone started talking.",
      },
      {
        heading: "Escalation of commitment",
        body: "Once you have invested, admitted losses feel worse than one more bid, so people pay far more than something is worth to avoid having been wrong. Decide your exit before you enter, keep a devil's advocate who was not part of the original plan, and avoid public commitments you would have to eat.",
      },
      {
        heading: "Framing, egocentrism, overconfidence",
        body: "The same outcome described as a loss is refused and described as a gain is accepted. People judge fairness in their own favour and are more certain than they should be. Before deciding, restate the proposal the other way round, ask what a neutral outsider would say, and write down your prediction so you can be confronted with it later.",
      },
    ],
  },
  {
    id: "c5",
    number: 5,
    title: "Influence and defense",
    stepIds: ["b6-card"],
    read: "Negotiation Genius ch. 7 (PDF pp. 156–173).",
    rule: "Frame what they lose, split your gifts, bundle your demands, always say because, and never decide under time pressure.",
    sections: [
      {
        heading: "Eight ways to be persuasive",
        body: "Say what they forgo by refusing rather than what they gain by accepting. Hand out concessions in several small pieces and bundle every demand into one. Ask for more than you expect, so that your real request lands as a concession (door in the face), or get a small yes first and build on it (foot in the door). Attach a reason to every request; even a thin 'because' raises compliance. Point to what similar others have done. Make a small, visible, unconditional gift early. Choose the reference point they compare your number with.",
      },
      {
        heading: "Why these work",
        body: "None of them improves your proposal. They change how it is perceived, through loss aversion, reciprocity, consistency, social proof, and contrast. That is also why they work on you.",
      },
      {
        heading: "Defending yourself",
        body: "Prepare systematically so the merits are already settled in your head. Score every offer with your system and compare it with your BATNA, not with their last number. For every statement, ask what you actually learned and what was presentation. Rephrase a loss frame as a gain frame and see if it still tempts you. Ask whether you would do this for anyone else, or would have an hour ago. And never decide under a clock they set: sleep on it, or ask for the time to.",
      },
    ],
  },
  {
    id: "c6",
    number: 6,
    title: "Tough situations",
    stepIds: ["b7-card6", "b8-card"],
    read: "Covered by this card. For depth: Negotiation Genius ch. 9 (lies), ch. 11 (weakness), ch. 12 (ugly negotiations); Getting to Yes ch. 8.",
    rule: "Ignore the ultimatum, question the threat, verify the claim, and leave them a way out.",
    sections: [
      {
        heading: "Ultimatums and threats",
        body: "Treat the first 'final offer' as noise: keep talking as if you had not heard it, change the subject, add an issue. If you must address it, give them a change of circumstances to attach their retreat to. A threat is pressure, and pressure makes the other side close ranks. Name it calmly, ask what reasoning sits behind it, and state that you move on the merits only. Prefer warnings about consequences you do not control over threats you would have to carry out.",
      },
      {
        heading: "'I have a better offer'",
        body: "Maybe. Ask what exactly it includes, who evaluated it, and why they are still talking to you. Then offer a contingency clause that pays if their claim is true. A real alternative survives questions; a bluff does not, and refusing to bet is a tell.",
      },
      {
        heading: "Lies",
        body: "Ask questions you already know the answer to, early, to calibrate. Verify facts as routine, not as accusation. Write the uncertain claim into the contract as a condition so that lying stops paying. Do not disclose your reservation value; you can decline to answer without deceiving.",
      },
      {
        heading: "Weakness and face",
        body: "If your BATNA is poor, improve it before the meeting, and do not reveal it. Focus on what they lose without you. Whatever happens, let them back down without looking like they did: frame the final terms as consistent with something they said earlier.",
      },
    ],
  },
  {
    id: "c7",
    number: 7,
    title: "Getting to Yes in five moves",
    stepIds: ["b7-card7"],
    read: "Getting to Yes ch. 2, 5, 8 (pp. 13–23, 42–49, 64–70); ch. 7 and the Q&A section are covered by this card only.",
    rule: "Soft on the people, hard on the problem, and yield only to reasons.",
    sections: [
      {
        heading: "People and problem",
        body: "Every negotiator has two interests: the substance and the relationship. Positional bargaining trades one against the other. Instead, deal with perceptions, emotions, and communication directly, never through concessions on substance. Put yourself in their shoes, do not read your fears into their intentions, let them vent without reacting, and listen actively enough to state their case better than they can. Sit on the same side of the table, facing the problem.",
      },
      {
        heading: "Interests, options, criteria",
        body: "Behind every position is an interest, and behind opposed positions there are usually more shared and compatible interests than conflicting ones. Invent options before judging them, and look for ways to dovetail differences. When interests do collide, settle them by a standard independent of either side's will: market value, precedent, a formula, a fair procedure such as one cuts and the other chooses. Ask 'what is your theory?' whenever a number appears.",
      },
      {
        heading: "Negotiation jujitsu",
        body: "When they attack your proposal, do not defend it and do not counterattack. Treat their position as one option, ask what interest it serves, invite criticism of your own ideas, and respond to personal attacks as if they were about the problem. Ask questions and then pause. Silence after a question is pressure you did not have to pay for.",
      },
      {
        heading: "Dirty tricks",
        body: "Recognise the tactic, raise it explicitly, and negotiate about the rules of the game using the same method. Question the tactic, never the person.",
      },
    ],
  },
];

export function cardForStep(stepId: string): ConceptCard | undefined {
  return CARDS.find((c) => c.stepIds.includes(stepId));
}

export function wordCount(card: ConceptCard): number {
  return card.sections.reduce((n, s) => n + s.body.split(/\s+/).length, 0);
}
