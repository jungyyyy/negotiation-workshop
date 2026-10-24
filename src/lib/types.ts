export type Person = "jung" | "rehan" | "harry";

export const PEOPLE: { id: Person; name: string }[] = [
  { id: "jung", name: "Jung" },
  { id: "rehan", name: "Rehan" },
  { id: "harry", name: "Harry" },
];

export function personName(p: Person | null | undefined): string {
  return PEOPLE.find((x) => x.id === p)?.name ?? "—";
}

export type Role = "seller" | "buyer" | "observer";
export type RoundStatus = "prep" | "negotiating" | "submitted" | "revealed";

export interface PrepAnswers {
  batna: string;
  reservation: string;
  theirBatna: string;
  theirReservation: string;
  target: string;
  firstOffer: string;
  questions: [string, string, string];
  submittedAt: number;
}

export type DealValue = string | number | boolean;

export interface FrontierDeal {
  deal: Record<string, string>;
  seller: number;
  buyer: number;
  joint: number;
}

export type Scores =
  | {
      kind: "single";
      unit: string;
      sellerRv: number;
      buyerRv: number;
      price: number | null;
      inZopa: boolean;
      /** Share of the ZOPA each side captured, 0–1 (can exceed bounds if outside the ZOPA). */
      sellerShare: number | null;
      buyerShare: number | null;
    }
  | {
      kind: "points";
      seller: number | null;
      buyer: number | null;
      joint: number | null;
      maxJoint: number;
      leftOnTable: number | null;
      sellerBatna: number;
      buyerBatna: number;
      beatsBatna: { seller: boolean; buyer: boolean } | null;
      onFrontier: boolean;
      /** Pareto-efficient deals that beat both BATNAs, best for the seller first. */
      frontier: FrontierDeal[];
      /** Frontier deals that would have left both sides at least as well off, with more joint points. */
      improvements: FrontierDeal[];
    }
  | {
      kind: "investigation";
      found: boolean;
      minutes: number | null;
      question: string;
      concessions: string;
    }
  | {
      kind: "drill";
      penalty: number | null;
      bonus: boolean;
      bestAnswer: boolean;
    };
export type Deal = Record<string, DealValue>;

export interface Round {
  id: string; // "R1" … "R5", "R3b" for the late-penalty drill
  scenarioId: string;
  roles: Record<Role, Person>;
  status: RoundStatus;
  prep: Partial<Record<Person, PrepAnswers>>;
  deal?: Deal;
  noDeal?: boolean;
  scores?: Scores;
  /** Observer rubric per negotiator: seven items scored 0–2, −1 = not applicable. */
  rubric?: Partial<Record<Person, { scores: number[] }>>;
  /** Observer: the moment that decided this negotiation. */
  moment?: string;
  observerLog: { at: number; text: string }[];
  startedAt?: number;
  submittedAt?: number;
  revealedAt?: number;
}

export interface Timer {
  label: string;
  durationMs: number;
  /** Wall-clock end time while running; null while paused/stopped. */
  endsAt: number | null;
  /** Authoritative remaining time while paused/stopped. */
  remainingMs: number;
}

export interface JoinInfo {
  joinedAt: number;
  prework: [boolean, boolean];
}

export interface QuizAttempt {
  answers: number[];
  score: number;
  at: number;
}

export interface QuizState {
  attempts: QuizAttempt[];
  passed: boolean;
  /** Facilitator waved this person through after two failed attempts. */
  unlocked?: boolean;
}

export interface DrillResult {
  scores: number[];
  revealed: boolean;
}

export interface DrillSetState {
  index: number;
  results: Record<number, DrillResult>;
}

export interface Session {
  version: 1;
  createdAt: number;
  updatedAt: number;
  demo: boolean;
  /** Index into AGENDA. */
  block: number;
  /** Index into AGENDA[block].steps. */
  step: number;
  timer: Timer;
  joined: Partial<Record<Person, JoinInfo>>;
  /** quizzes[sprintId][person] */
  quizzes: Record<string, Partial<Record<Person, QuizState>>>;
  /** experiments[experimentId][person] = answers */
  experiments: Record<string, Partial<Record<Person, Record<string, string | number>>>>;
  /** drills[setId] = progress and per-drill results */
  drills: Record<string, DrillSetState>;
  /** mistakes[person][roundId] = ticked mistake ids */
  mistakes: Partial<Record<Person, Record<string, string[]>>>;
  /** One rule per person per day. */
  rules: Partial<Record<Person, { day1?: string; final?: string }>>;
  /** Cross-case debrief: patterns named by the group. */
  patterns: { at: number; person: Person; text: string }[];
  rounds: Round[];
}

export type Action =
  | { type: "join"; person: Person }
  | { type: "prework"; person: Person; index: 0 | 1; done: boolean }
  | { type: "goto"; block: number; step: number }
  | { type: "next" }
  | { type: "prev" }
  | { type: "timer.start"; label?: string; minutes?: number }
  | { type: "timer.pause" }
  | { type: "timer.resume" }
  | { type: "timer.reset" }
  | { type: "timer.adjust"; deltaMs: number }
  | { type: "timer.skip" }
  | { type: "demo.fill" }
  | { type: "quiz.submit"; sprintId: string; person: Person; answers: number[] }
  | { type: "quiz.reset"; sprintId: string; person: Person }
  | { type: "quiz.unlock"; sprintId: string; person: Person }
  | { type: "prep.submit"; roundId: string; person: Person; answers: Omit<PrepAnswers, "submittedAt"> }
  | { type: "round.start"; roundId: string; force?: boolean }
  | { type: "round.log"; roundId: string; text: string }
  | { type: "round.unlog"; roundId: string; at: number }
  | { type: "round.submit"; roundId: string; deal: Deal; noDeal?: boolean }
  | { type: "round.reopen"; roundId: string }
  | { type: "round.rubric"; roundId: string; person: Person; scores: number[] }
  | { type: "round.moment"; roundId: string; text: string }
  | { type: "round.reveal"; roundId: string }
  | { type: "round.reset"; roundId: string }
  | { type: "experiment.answer"; experimentId: string; person: Person; answers: Record<string, string | number> }
  | { type: "drill.goto"; setId: string; index: number }
  | { type: "drill.start"; setId: string }
  | { type: "drill.reveal"; setId: string; index: number }
  | { type: "drill.score"; setId: string; index: number; scores: number[] }
  | { type: "mistakes.tick"; person: Person; roundId: string; ids: string[] }
  | { type: "rule.set"; person: Person; which: "day1" | "final"; text: string }
  | { type: "pattern.add"; person: Person; text: string }
  | { type: "pattern.remove"; at: number }
  | { type: "reset"; demo?: boolean };

export const PREWORK: { title: string; detail: string }[] = [
  {
    title: "Getting to Yes, chapter 1",
    detail: "Don't Bargain Over Positions",
  },
  {
    title: "Getting to Yes, chapter 4",
    detail: "Invent Options for Mutual Gain",
  },
];
