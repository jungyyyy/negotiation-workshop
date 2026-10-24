import { RUBRIC } from "./rubric";
import { getScenario } from "./scenarios";
import { PEOPLE, type Person, type Session } from "./types";

/** The seven common mistakes from the claiming-value chapter, in our words. */
export const COMMON_MISTAKES: { id: string; text: string }[] = [
  { id: "earlyOffer", text: "Made the first offer before I had enough information" },
  { id: "softOffer", text: "My first offer was not aggressive enough, or had no justification" },
  { id: "talked", text: "Talked more than I listened" },
  { id: "influenced", text: "Tried to influence them instead of learning from them" },
  { id: "assumed", text: "Did not challenge my assumptions about the other side" },
  { id: "zopa", text: "Misjudged the ZOPA and never updated it during the talk" },
  { id: "conceded", text: "Conceded more than the other side did" },
];

export interface MistakeCount {
  id: string;
  text: string;
  count: number;
  rounds: string[];
}

/** Rubric lows (0 of 2) plus self-ticked mistakes, counted per person. */
export function mistakesFor(session: Session, person: Person): MistakeCount[] {
  const counts = new Map<string, MistakeCount>();
  const bump = (id: string, text: string, roundId: string) => {
    const c = counts.get(id) ?? { id, text, count: 0, rounds: [] };
    c.count += 1;
    c.rounds.push(roundId);
    counts.set(id, c);
  };
  for (const r of session.rounds) {
    const scores = r.rubric?.[person]?.scores;
    if (scores && r.status === "revealed") {
      RUBRIC.forEach((item, i) => {
        if (scores[i] === 0) bump(`rubric:${item.id}`, item.miss, r.id);
      });
    }
  }
  for (const [roundId, ids] of Object.entries(session.mistakes?.[person] ?? {})) {
    for (const id of ids) {
      const m = COMMON_MISTAKES.find((x) => x.id === id);
      if (m) bump(`tick:${id}`, m.text, roundId);
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count);
}

/** Rubric points per person across revealed rounds. */
export function rubricTotals(session: Session): Record<Person, { pts: number; max: number }> {
  const out = Object.fromEntries(PEOPLE.map((p) => [p.id, { pts: 0, max: 0 }])) as Record<Person, { pts: number; max: number }>;
  for (const r of session.rounds) {
    if (r.status !== "revealed" || !r.rubric) continue;
    for (const p of PEOPLE) {
      const scores = r.rubric[p.id]?.scores;
      if (!scores) continue;
      const valid = scores.filter((v) => v >= 0);
      out[p.id].pts += valid.reduce((a, b) => a + b, 0);
      out[p.id].max += valid.length * 2;
    }
  }
  return out;
}

/** Actual rank by rubric share, 1 = best. Ties share a rank. */
export function actualRanks(session: Session): Record<Person, number> {
  const t = rubricTotals(session);
  const share = (p: Person) => (t[p].max ? t[p].pts / t[p].max : 0);
  const sorted = [...PEOPLE].map((p) => p.id).sort((a, b) => share(b) - share(a));
  const ranks = {} as Record<Person, number>;
  sorted.forEach((p, i) => {
    ranks[p] = i > 0 && share(p) === share(sorted[i - 1]) ? ranks[sorted[i - 1]] : i + 1;
  });
  return ranks;
}

/** Share of the capstone points captured by each side, from the R5 scores. */
export function capstoneShare(session: Session): Partial<Record<Person, number>> {
  const r = session.rounds.find((x) => x.id === "R5");
  const sc = r?.scores;
  if (!r || !sc || sc.kind !== "points" || sc.seller == null || sc.buyer == null) return {};
  const scenario = getScenario(r.scenarioId);
  if (!scenario?.points) return {};
  const sGain = Math.max(0, sc.seller - sc.sellerBatna);
  const bGain = Math.max(0, sc.buyer - sc.buyerBatna);
  const total = sGain + bGain;
  if (!total) return {};
  return { [r.roles.seller]: sGain / total, [r.roles.buyer]: bGain / total };
}
