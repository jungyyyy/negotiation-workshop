"use client";

import { PEOPLE, type Action, type Session } from "@/lib/types";
import { PASS_MARK, type Sprint } from "@/lib/sprints";
import { quizState, quizStatus } from "@/lib/quiz";
import { Button, Card, Label } from "./ui";

/** Facilitator view of who has passed the quiz. */
export function QuizStatusPanel({ sprint, session, act }: { sprint: Sprint; session: Session; act: (a: Action) => void }) {
  return (
    <Card>
      <Label>Quiz · {sprint.title} · pass {PASS_MARK}/5</Label>
      <ul className="mt-2 flex flex-col gap-2">
        {PEOPLE.map((p) => {
          const q = quizState(session, sprint.id, p.id);
          const st = quizStatus(q);
          const cleared = st.kind === "passed" || st.kind === "unlocked";
          return (
            <li
              key={p.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                cleared ? "border-accent bg-soft" : st.kind === "locked" ? "border-warn" : "border-line"
              }`}
            >
              <span className="font-semibold w-16">{p.name}</span>
              <span className="flex-1 text-sm text-muted">
                {st.kind === "none" && "not started"}
                {st.kind === "passed" && `passed · ${st.score}/5`}
                {st.kind === "unlocked" && `unlocked · last ${st.score}/5`}
                {st.kind === "failed" && `${st.score}/5 · ${st.left} retry left`}
                {st.kind === "locked" && `${st.score}/5 · out of attempts`}
              </span>
              {st.kind === "locked" ? (
                <Button size="sm" variant="primary" onClick={() => act({ type: "quiz.unlock", sprintId: sprint.id, person: p.id })}>
                  Unlock
                </Button>
              ) : null}
              {q && st.kind !== "none" ? (
                <Button size="sm" variant="ghost" onClick={() => act({ type: "quiz.reset", sprintId: sprint.id, person: p.id })}>
                  reset
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
