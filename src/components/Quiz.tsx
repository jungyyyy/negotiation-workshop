"use client";

import { useEffect, useState } from "react";
import { BOOKS, MAX_ATTEMPTS, PASS_MARK, type Sprint } from "@/lib/sprints";
import { quizState, quizStatus } from "@/lib/quiz";
import type { Action, Person, Session } from "@/lib/types";
import { Button, Card, Label } from "./ui";

export function Quiz({
  sprint,
  session,
  me,
  act,
}: {
  sprint: Sprint;
  session: Session;
  me: Person;
  act: (a: Action) => void;
}) {
  const q = quizState(session, sprint.id, me);
  const status = quizStatus(q);
  const [answers, setAnswers] = useState<(number | null)[]>(() => sprint.quiz.map(() => null));
  const [idx, setIdx] = useState(0);
  const [retrying, setRetrying] = useState(false);

  // A new attempt starts from a clean sheet.
  const attemptCount = q?.attempts.length ?? 0;
  useEffect(() => {
    setAnswers(sprint.quiz.map(() => null));
    setIdx(0);
    setRetrying(false);
  }, [attemptCount, sprint.id, sprint.quiz]);

  if (status.kind === "passed" || status.kind === "unlocked") {
    return (
      <Card className="text-center border-accent">
        <div className="text-5xl">✓</div>
        <div className="text-2xl font-bold mt-2">
          {status.kind === "passed" ? `Passed · ${status.score}/5` : "Unlocked by the facilitator"}
        </div>
        <p className="text-muted mt-1">Your role sheet opens when the round starts.</p>
      </Card>
    );
  }

  if (status.kind === "locked") {
    return (
      <Card className="border-warn">
        <div className="text-xl font-bold">
          {status.score}/5 · no attempts left
        </div>
        <p className="text-muted mt-1">
          Ask the facilitator to unlock you. Meanwhile, re-read the pages below.
        </p>
        <Hints sprint={sprint} answers={q!.attempts[q!.attempts.length - 1].answers} />
      </Card>
    );
  }

  if (status.kind === "failed" && !retrying) {
    const last = q!.attempts[q!.attempts.length - 1];
    return (
      <Card className="border-warn">
        <div className="text-xl font-bold">
          {status.score}/5 · not yet
        </div>
        <p className="text-muted mt-1">
          You need {PASS_MARK}. Re-read the pages below, then retry once.
        </p>
        <Hints sprint={sprint} answers={last.answers} />
        <Button variant="primary" size="lg" className="mt-4" onClick={() => setRetrying(true)}>
          Retry ({status.left} left)
        </Button>
      </Card>
    );
  }

  const question = sprint.quiz[idx];
  const chosen = answers[idx];
  const allAnswered = answers.every((a) => a != null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Question {idx + 1} of {sprint.quiz.length}
        </span>
        <span>
          Attempt {attemptCount + 1} of {MAX_ATTEMPTS}
        </span>
      </div>
      <div className="flex gap-1">
        {sprint.quiz.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Question ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-2 flex-1 rounded-full ${
              i === idx ? "bg-accent" : answers[i] != null ? "bg-accent/40" : "bg-line"
            }`}
          />
        ))}
      </div>

      <Card>
        <p className="text-lg font-semibold leading-snug">{question.q}</p>
        <ul className="mt-4 flex flex-col gap-2">
          {question.options.map((opt, i) => {
            const on = chosen === i;
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    const next = [...answers];
                    next[idx] = i;
                    setAnswers(next);
                  }}
                  aria-pressed={on}
                  className={`w-full min-h-14 text-left rounded-xl border px-4 py-3 flex gap-3 items-start transition active:scale-[0.99] ${
                    on ? "border-accent bg-soft" : "border-line bg-card"
                  }`}
                >
                  <span
                    className={`shrink-0 mt-0.5 h-6 w-6 rounded-full border-2 text-xs font-bold flex items-center justify-center ${
                      on ? "bg-accent border-accent text-accent-fg" : "border-line text-muted"
                    }`}
                  >
                    {"ABCD"[i]}
                  </span>
                  <span>{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}>
          ← Back
        </Button>
        {idx < sprint.quiz.length - 1 ? (
          <Button variant="primary" onClick={() => setIdx((i) => i + 1)} disabled={chosen == null}>
            Next →
          </Button>
        ) : (
          <Button
            variant="primary"
            disabled={!allAnswered}
            onClick={() =>
              act({
                type: "quiz.submit",
                sprintId: sprint.id,
                person: me,
                answers: answers.map((a) => a ?? -1),
              })
            }
          >
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}

function Hints({ sprint, answers }: { sprint: Sprint; answers: number[] }) {
  const missed = sprint.quiz.map((item, i) => ({ item, i })).filter(({ item, i }) => answers[i] !== item.answer);
  return (
    <div className="mt-3">
      <Label>Re-read</Label>
      <ul className="mt-1 flex flex-col gap-2">
        {missed.map(({ item, i }) => (
          <li key={i} className="rounded-xl bg-soft p-3">
            <div className="text-sm font-semibold">Q{i + 1} · {item.q}</div>
            <div className="tabular text-accent font-semibold mt-1">
              {BOOKS[item.hint.book].short} {item.hint.pages}
            </div>
            <div className="text-sm text-muted">{item.hint.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
