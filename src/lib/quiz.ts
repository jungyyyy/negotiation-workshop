import type { Person, QuizState, Session } from "./types";
import { MAX_ATTEMPTS } from "./sprints";

export function quizState(session: Session, sprintId: string, person: Person): QuizState | undefined {
  return session.quizzes?.[sprintId]?.[person];
}

/** True when this person may open the round's role sheets. */
export function quizCleared(session: Session, sprintId: string, person: Person): boolean {
  const q = quizState(session, sprintId, person);
  return !!q && (q.passed || !!q.unlocked);
}

export function attemptsLeft(q: QuizState | undefined): number {
  return MAX_ATTEMPTS - (q?.attempts.length ?? 0);
}

export type QuizStatus =
  | { kind: "none" }
  | { kind: "passed"; score: number }
  | { kind: "unlocked"; score: number }
  | { kind: "failed"; score: number; left: number }
  | { kind: "locked"; score: number };

export function quizStatus(q: QuizState | undefined): QuizStatus {
  if (!q || q.attempts.length === 0) return q?.unlocked ? { kind: "unlocked", score: 0 } : { kind: "none" };
  const last = q.attempts[q.attempts.length - 1];
  if (q.passed) return { kind: "passed", score: last.score };
  if (q.unlocked) return { kind: "unlocked", score: last.score };
  const left = attemptsLeft(q);
  if (left > 0) return { kind: "failed", score: last.score, left };
  return { kind: "locked", score: last.score };
}
