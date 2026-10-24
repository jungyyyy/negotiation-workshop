"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/scenarios";
import type { Action, Person, PrepAnswers, Round } from "@/lib/types";
import { Button, Card, Label } from "../ui";

type Draft = Omit<PrepAnswers, "submittedAt">;

const EMPTY: Draft = {
  batna: "",
  reservation: "",
  theirBatna: "",
  theirReservation: "",
  target: "",
  firstOffer: "",
  questions: ["", "", ""],
};

const DEFAULT_LABELS = {
  batna: "My BATNA — what I do if there is no deal",
  reservation: "My reservation value — the point where I walk",
  theirBatna: "Their BATNA (my estimate)",
  theirReservation: "Their reservation value (my estimate)",
  target: "My target — ambitious but justifiable",
  firstOffer: "First-offer plan: who opens, at what, with which justification",
};

/** Prep form for a live round: saves to the round's prep map. */
export function PrepForm({
  scenario,
  round,
  me,
  act,
}: {
  scenario: Scenario;
  round: Round;
  me: Person;
  act: (a: Action) => void;
}) {
  return (
    <PrepFormBase
      scenario={scenario}
      saved={round.prep[me]}
      canEdit={round.status === "prep"}
      waitingText="Waiting for the observer to start the clock."
      onSubmit={(answers) => act({ type: "prep.submit", roundId: round.id, person: me, answers })}
    />
  );
}

/** The form itself, reusable for practice rounds. */
export function PrepFormBase({
  scenario,
  saved,
  canEdit,
  waitingText,
  onSubmit,
}: {
  scenario: Scenario;
  saved?: PrepAnswers;
  canEdit: boolean;
  waitingText?: string;
  onSubmit: (answers: Draft) => void;
}) {
  const [editing, setEditing] = useState(!saved);
  const [d, setD] = useState<Draft>(() =>
    saved ? { ...saved } : { ...EMPTY, questions: ["", "", ""] },
  );
  const labels = { ...DEFAULT_LABELS, ...(scenario.prepLabels ?? {}) };

  const required: (keyof typeof DEFAULT_LABELS)[] = ["batna", "reservation", "theirBatna", "theirReservation", "target", "firstOffer"];
  const complete = required.every((k) => d[k].trim().length > 0) && d.questions.every((q) => q.trim().length > 0);

  if (saved && !editing) {
    return (
      <Card className="border-accent">
        <div className="flex items-baseline justify-between">
          <Label>Prep form · submitted</Label>
          {canEdit ? (
            <button type="button" className="text-sm text-accent underline underline-offset-4 min-h-10 px-2" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : null}
        </div>
        <dl className="mt-2 flex flex-col gap-2 text-sm">
          {required.map((k) => (
            <div key={k}>
              <dt className="text-muted">{labels[k]}</dt>
              <dd className="font-medium whitespace-pre-wrap">{saved[k]}</dd>
            </div>
          ))}
          <div>
            <dt className="text-muted">Three questions I will ask</dt>
            <dd>
              <ol className="list-decimal pl-5 font-medium">
                {saved.questions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </dd>
          </div>
        </dl>
        {canEdit && waitingText ? <p className="text-sm text-muted mt-3">{waitingText}</p> : null}
      </Card>
    );
  }

  return (
    <Card>
      <Label>Prep form · required before the clock starts</Label>
      <form
        className="mt-2 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!complete) return;
          onSubmit(d);
          setEditing(false);
        }}
      >
        {required.map((k) => (
          <Field key={k} label={labels[k]} value={d[k]} onChange={(v) => setD({ ...d, [k]: v })} />
        ))}
        <div>
          <div className="text-sm font-semibold mb-1">Three questions I will ask about their interests</div>
          <div className="flex flex-col gap-2">
            {d.questions.map((q, i) => (
              <input
                key={i}
                value={q}
                onChange={(e) => {
                  const qs = [...d.questions] as [string, string, string];
                  qs[i] = e.target.value;
                  setD({ ...d, questions: qs });
                }}
                placeholder={`Question ${i + 1}`}
                className="w-full min-h-12 rounded-xl border border-line bg-bg px-3"
              />
            ))}
          </div>
        </div>
        <Button type="submit" variant="primary" size="lg" disabled={!complete}>
          {saved ? "Save changes" : "Submit prep"}
        </Button>
        {!complete ? <p className="text-xs text-muted text-center">Every field is required.</p> : null}
      </form>
    </Card>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-line bg-bg px-3 py-2 leading-snug"
      />
    </label>
  );
}
