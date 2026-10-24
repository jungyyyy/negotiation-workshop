"use client";

import { useState } from "react";
import { EXPERIMENTS, type Experiment } from "@/lib/experiments";
import { PEOPLE, personName, type Action, type Person, type Session } from "@/lib/types";
import { Button, Card, Label } from "./ui";
import { Paragraphs } from "./round/Sheet";

export function ExperimentScreen({
  exp,
  session,
  me,
  act,
}: {
  exp: Experiment;
  session: Session;
  me: Person;
  act: (a: Action) => void;
}) {
  const saved = session.experiments?.[exp.id]?.[me];
  const [answers, setAnswers] = useState<Record<string, string | number>>(() => ({ ...(saved ?? {}) }));
  const [editing, setEditing] = useState(!saved);
  const complete = exp.fields.every((f) => answers[f.key] !== undefined && answers[f.key] !== "");

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Label>{exp.title}</Label>
        <Paragraphs items={exp.brief} className="mt-2" />
        {exp.variant ? (
          <div className="mt-3 rounded-xl bg-soft p-3 font-semibold">
            <Paragraphs items={exp.variant(me)} />
          </div>
        ) : null}
      </Card>

      {saved && !editing ? (
        <Card className="border-accent">
          <Label>Your answers · saved</Label>
          <dl className="mt-2 text-sm flex flex-col gap-1">
            {exp.fields.map((f) => (
              <div key={f.key} className="flex justify-between gap-3">
                <dt className="text-muted">{f.label}</dt>
                <dd className="font-semibold tabular text-right">{formatAnswer(f, saved[f.key])}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm text-muted mt-3">
            {exp.deferred ? "Sealed until the end of day 2." : "Wait for the reveal."}{" "}
            <button type="button" className="underline underline-offset-4 min-h-8" onClick={() => setEditing(true)}>
              Change
            </button>
          </p>
        </Card>
      ) : (
        <Card>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!complete) return;
              act({ type: "experiment.answer", experimentId: exp.id, person: me, answers });
              setEditing(false);
            }}
          >
            {exp.fields.map((f) => (
              <div key={f.key}>
                <div className="text-sm font-semibold mb-1">{f.label}</div>
                {f.type === "number" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={answers[f.key] === undefined ? "" : String(answers[f.key])}
                      onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-40 min-h-12 rounded-xl border border-line bg-bg px-3 tabular"
                    />
                    {f.unit ? <span className="text-muted">{f.unit}</span> : null}
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {f.options.map((o) => {
                      const on = answers[f.key] === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setAnswers({ ...answers, [f.key]: o.value })}
                          className={`min-h-12 px-3 rounded-xl border text-left font-semibold ${
                            on ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
            <Button type="submit" variant="primary" size="lg" disabled={!complete}>
              {saved ? "Save" : "Lock in my answers"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

function formatAnswer(f: Experiment["fields"][number], v: string | number | undefined): string {
  if (v === undefined || v === "") return "—";
  if (f.type === "select") return f.options.find((o) => o.value === v)?.label ?? String(v);
  return `${f.unit?.startsWith("€") ? "€" : ""}${Number(v).toLocaleString("en")}${f.unit && !f.unit.startsWith("€") ? ` ${f.unit}` : ""}`;
}

/** Side-by-side reveal. Pass `deferredOnly` for the day-2 overconfidence reveal. */
export function ExperimentReveal({ session, deferredOnly = false }: { session: Session; deferredOnly?: boolean }) {
  const list = EXPERIMENTS.filter((e) => (deferredOnly ? e.deferred : !e.deferred));
  return (
    <div className="flex flex-col gap-3">
      {list.map((exp) => {
        const answers = session.experiments?.[exp.id] ?? {};
        return (
          <Card key={exp.id}>
            <Label>{exp.title}</Label>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="py-1 pr-2 font-semibold"></th>
                    {PEOPLE.map((p) => (
                      <th key={p.id} className="py-1 pr-2 font-semibold">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exp.variant ? (
                    <tr className="border-t border-line">
                      <td className="py-1 pr-2 text-muted">Shown</td>
                      {PEOPLE.map((p) => (
                        <td key={p.id} className="py-1 pr-2 tabular text-xs">
                          {exp.variant!(p.id).join(" ").replace(/^.*?(€[\d,]+).*$/, "$1")}
                        </td>
                      ))}
                    </tr>
                  ) : null}
                  {exp.fields.map((f) => (
                    <tr key={f.key} className="border-t border-line">
                      <td className="py-1 pr-2 text-muted">{f.label}</td>
                      {PEOPLE.map((p) => (
                        <td key={p.id} className="py-1 pr-2 font-semibold tabular">
                          {formatAnswer(f, answers[p.id]?.[f.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 rounded-xl bg-soft p-3 text-sm">
              <Paragraphs items={exp.revealNote} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function ExperimentStatus({ session }: { session: Session }) {
  return (
    <Card>
      <Label>Experiments · answers in</Label>
      <ul className="mt-2 text-sm flex flex-col gap-1">
        {EXPERIMENTS.map((e) => (
          <li key={e.id} className="flex justify-between">
            <span>{e.title}</span>
            <span className="tabular">
              {PEOPLE.map((p) => (
                <span key={p.id} className={session.experiments?.[e.id]?.[p.id] ? "text-accent" : "text-muted"}>
                  {" "}
                  {personName(p.id).slice(0, 1)}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
