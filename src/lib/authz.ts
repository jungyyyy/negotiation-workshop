import "server-only";
import type { Action, Person, Session } from "./types";

/**
 * Who may do what. Everyone signed in may run the agenda, the timer and the
 * facilitator overrides (all three are founders). Personal data may only be
 * written by its owner; a round's observer tools only by that round's observer.
 * Returns null when allowed, otherwise the reason for a 403.
 */
export function authorizeAction(a: Action, me: Person, s: Session): string | null {
  const own = (p: Person) => (p === me ? null : "You can only submit your own answers");
  const observerOf = (roundId: string) => {
    const r = s.rounds.find((x) => x.id === roundId);
    if (!r) return "No such round";
    return r.roles.observer === me ? null : "Only this round's observer can do that";
  };
  switch (a.type) {
    case "join":
    case "prework":
    case "quiz.submit":
    case "quiz.reset":
    case "prep.submit":
    case "experiment.answer":
    case "mistakes.tick":
    case "rule.set":
    case "pattern.add":
      return own(a.person);
    case "round.log":
    case "round.unlog":
    case "round.submit":
    case "round.reopen":
    case "round.rubric":
    case "round.moment":
      return observerOf(a.roundId);
    default:
      return null;
  }
}
