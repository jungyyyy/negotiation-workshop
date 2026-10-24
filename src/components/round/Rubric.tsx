"use client";

import { useEffect, useState } from "react";
import { NOT_APPLICABLE, RUBRIC } from "@/lib/rubric";
import type { Scenario } from "@/lib/scenarios";
import { personName, type Action, type Person, type Round } from "@/lib/types";
import { Card, Label } from "../ui";

export function defaultRubric(scenario: Scenario, round: Round, person: Person): number[] {
  const prep = round.prep[person];
  const prepared = prep && prep.batna.trim() && prep.reservation.trim() ? 2 : 0;
  return RUBRIC.map((item) => {
    if (item.multiIssueOnly && scenario.kind !== "points") return NOT_APPLICABLE;
    if (item.autoFromPrep) return scenario.requiresPrep ? prepared : NOT_APPLICABLE;
    return 0;
  });
}

export function RubricForm({
  scenario,
  round,
  act,
  readOnly = false,
}: {
  scenario: Scenario;
  round: Round;
  act: (a: Action) => void;
  readOnly?: boolean;
}) {
  const negotiators: Person[] = [round.roles.seller, round.roles.buyer];
  return (
    <div className="flex flex-col gap-3">
      {negotiators.map((p) => {
        const scores = round.rubric?.[p]?.scores ?? defaultRubric(scenario, round, p);
        const total = scores.filter((v) => v >= 0).reduce((a, b) => a + b, 0);
        const max = scores.filter((v) => v >= 0).length * 2;
        return (
          <Card key={p}>
            <div className="flex items-baseline justify-between">
              <Label>
                Rubric · {personName(p)} ({p === round.roles.seller ? "seller" : "buyer"})
              </Label>
              <span className="tabular text-sm font-semibold">
                {total}/{max}
              </span>
            </div>
            <ul className="mt-2 flex flex-col gap-2">
              {RUBRIC.map((item, i) => {
                const v = scores[i];
                if (v === NOT_APPLICABLE) return null;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className="flex-1 text-sm leading-snug">
                      <span className="font-semibold">{item.short}.</span> {item.text}
                      {item.autoFromPrep ? <span className="text-muted"> (from the prep form)</span> : null}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {[0, 1, 2].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={readOnly}
                          aria-pressed={v === n}
                          onClick={() => {
                            const next = [...scores];
                            next[i] = n;
                            act({ type: "round.rubric", roundId: round.id, person: p, scores: next });
                          }}
                          className={`h-10 w-10 rounded-lg border text-sm font-bold tabular ${
                            v === n ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"
                          } disabled:opacity-70`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        );
      })}
      <Card>
        <Label>The moment that decided this negotiation</Label>
        {readOnly ? (
          <p className="mt-1 font-medium">{round.moment || <span className="text-muted">Not written yet.</span>}</p>
        ) : (
          <MomentInput round={round} act={act} />
        )}
      </Card>
    </div>
  );
}

function MomentInput({ round, act }: { round: Round; act: (a: Action) => void }) {
  const [text, setText] = useState(round.moment ?? "");
  // Save shortly after typing stops, so nothing is lost if the observer taps away.
  useEffect(() => {
    if (text === (round.moment ?? "")) return;
    const t = setTimeout(() => act({ type: "round.moment", roundId: round.id, text }), 600);
    return () => clearTimeout(t);
  }, [text, round.moment, round.id, act]);
  return (
    <textarea
      value={text}
      rows={2}
      placeholder="One sentence."
      onChange={(e) => setText(e.target.value)}
      className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2"
    />
  );
}
