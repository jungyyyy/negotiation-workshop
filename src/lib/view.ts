import "server-only";
import { AGENDA } from "./agenda";
import { quizCleared } from "./quiz";
import { getFullScenario } from "./scenarioSecrets";
import { roleOf } from "./scenarios";
import { sprintForBlock } from "./sprints";
import { PEOPLE, type Person, type RoundAccess, type Session, type View } from "./types";

/** Has the facilitator reached (block, step) yet? */
function reached(s: Session, blockId: string, stepId: string): boolean {
  const b = AGENDA.findIndex((x) => x.id === blockId);
  if (b < 0) return false;
  const st = AGENDA[b].steps.findIndex((x) => x.id === stepId);
  return s.block > b || (s.block === b && s.step >= st);
}

/** Which block a round belongs to (for the quiz gate). */
function blockOfRound(roundId: string): string | undefined {
  return AGENDA.find((b) => b.steps.some((st) => st.roundId === roundId))?.id;
}

const EXPERIMENT_REVEAL: Record<string, [string, string]> = {
  anchoring: ["b5", "b5-reveal"],
  fixedpie: ["b5", "b5-reveal"],
  overconfidence: ["b9", "b9-overconf"],
};

export function buildView(s: Session, me: Person, email: string): View {
  const v: View = { ...structuredClone(s), me, email, access: {}, practiceAccess: {} };

  // Quizzes: other people's answers are theirs; scores and status stay visible.
  for (const bySprint of Object.values(v.quizzes)) {
    for (const p of PEOPLE) {
      const q = bySprint[p.id];
      if (q && p.id !== me) q.attempts = q.attempts.map((a) => ({ ...a, answers: [] }));
    }
  }

  // Experiments: others' answers appear once the reveal step is reached.
  for (const [expId, byPerson] of Object.entries(v.experiments)) {
    const gate = EXPERIMENT_REVEAL[expId];
    const open = gate ? reached(s, gate[0], gate[1]) : false;
    if (!open) for (const p of PEOPLE) if (p.id !== me) delete byPerson[p.id];
  }

  // Personal mistakes lists and practice rounds: own only.
  v.mistakes = { [me]: v.mistakes[me] ?? {} };
  v.practice = { [me]: v.practice[me] ?? [] };
  for (const pr of v.practice[me] ?? []) {
    const full = getFullScenario(pr.scenarioId);
    if (!full) continue;
    const revealed = pr.status === "revealed";
    const mine = pr.side;
    const theirs = mine === "seller" ? "buyer" : "seller";
    const access: RoundAccess = { role: mine, sheets: {} };
    access.sheets[mine] = mine === "seller" ? full.sellerSheet : full.buyerSheet;
    if (revealed) {
      access.sheets[theirs] = theirs === "seller" ? full.sellerSheet : full.buyerSheet;
      access.hidden = full.hidden;
      access.truth = full.truth;
    }
    if (full.points) access.points = { table: full.points, side: revealed ? "both" : mine };
    v.practiceAccess[pr.id] = access;
  }

  // Rounds: sheets, points, hidden material and other people's prep forms.
  for (const r of v.rounds) {
    const full = getFullScenario(r.scenarioId);
    const role = roleOf(r.roles, me);
    const blockId = blockOfRound(r.id);
    const sprint = blockId ? sprintForBlock(blockId) : undefined;
    const cleared = !sprint || quizCleared(s, sprint.id, me);
    const revealed = r.status === "revealed";
    const access: RoundAccess = { role, sheets: {} };

    if (full) {
      const seeSeller = revealed || (cleared && (role === "seller" || role === "observer"));
      const seeBuyer = revealed || (cleared && (role === "buyer" || role === "observer"));
      if (seeSeller) access.sheets.seller = full.sellerSheet;
      if (seeBuyer) access.sheets.buyer = full.buyerSheet;
      if (full.points) {
        if (seeSeller && seeBuyer) access.points = { table: full.points, side: "both" };
        else if (seeSeller) access.points = { table: full.points, side: "seller" };
        else if (seeBuyer) access.points = { table: full.points, side: "buyer" };
      }
      if (revealed) {
        access.hidden = full.hidden;
        access.truth = full.truth;
      }
    }
    v.access[r.id] = access;

    // Prep forms: yours always; both for the observer; everyone's after the reveal.
    for (const p of PEOPLE) {
      const prep = r.prep[p.id];
      if (!prep || p.id === me || role === "observer" || revealed) continue;
      r.prep[p.id] = {
        batna: "", reservation: "", theirBatna: "", theirReservation: "", target: "", firstOffer: "",
        questions: ["", "", ""], submittedAt: prep.submittedAt,
      };
    }
  }
  return v;
}
