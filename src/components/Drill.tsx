"use client";

import { DRILL_CRITERIA, drillRoleOf, drillRoles, type DrillSet } from "@/lib/drills";
import { personName, type Action, type Person, type Session } from "@/lib/types";
import { Button, Card, Label } from "./ui";
import { Paragraphs } from "./round/Sheet";
import { TimerControls } from "./TimerControls";

export function DrillScreen({
  set,
  session,
  me,
  act,
  facilitator = false,
}: {
  set: DrillSet;
  session: Session;
  me: Person | null;
  act: (a: Action) => void;
  facilitator?: boolean;
}) {
  const st = session.drills?.[set.id] ?? { index: 0, results: {} };
  const drill = set.drills[st.index];
  const roles = drillRoles(set.id, st.index);
  const role = me ? drillRoleOf(roles, me) : null;
  const result = st.results[st.index];
  const revealed = !!result?.revealed;
  const scores = result?.scores ?? [0, 0, 0];
  const canControl = facilitator || role === "observer";
  const running = session.timer.endsAt != null;

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <div className="flex items-baseline justify-between">
          <Label>
            {set.title} · {st.index + 1} of {set.drills.length}
          </Label>
          <div className="flex gap-1">
            {set.drills.map((d, i) => (
              <span
                key={d.id}
                className={`h-2 w-4 rounded-full ${i === st.index ? "bg-accent" : st.results[i]?.revealed ? "bg-accent/40" : "bg-line"}`}
              />
            ))}
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-1">{drill.title}</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          {role ? (
            <span className="rounded-full bg-accent text-accent-fg px-3 py-1 font-semibold">You: {role}</span>
          ) : null}
          <span className="rounded-full bg-soft px-3 py-1 text-muted">
            {personName(roles.responder)} answers · {personName(roles.counterpart)} reads · {personName(roles.observer)} scores
          </span>
        </div>
      </Card>

      <Card>
        <Label>Situation</Label>
        <p className="mt-1">{drill.setup}</p>
      </Card>

      {role === "responder" && !revealed ? (
        <Card className="bg-soft text-center">
          <div className="text-xl font-bold">Listen, then answer out loud.</div>
          <p className="text-sm text-muted mt-1">{set.seconds} seconds. The clock is at the top.</p>
        </Card>
      ) : (
        <Card className="border-accent">
          <Label>{role === "counterpart" ? "Read this out, in character" : "The counterpart says"}</Label>
          <div className="mt-2 flex flex-col gap-2">
            {drill.lines.map((l, i) => (
              <div key={i} className="rounded-xl bg-soft p-3">
                {l.who ? <div className="text-xs uppercase tracking-wide text-muted font-semibold">{l.who}</div> : null}
                <div className="text-lg leading-snug">&ldquo;{l.text}&rdquo;</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {drill.factCard && (role === "responder" || role === "observer" || facilitator || revealed) ? (
        <Card className="border-warn">
          <Label>Fact card · responder only</Label>
          <Paragraphs items={drill.factCard} className="mt-1 text-sm" />
        </Card>
      ) : null}

      {canControl ? (
        <>
          {!revealed ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="primary" size="lg" onClick={() => act({ type: "drill.start", setId: set.id })} disabled={running}>
                {running ? "Running…" : `Start ${set.seconds} s`}
              </Button>
              <Button size="lg" onClick={() => act({ type: "drill.reveal", setId: set.id, index: st.index })}>
                Show model answer
              </Button>
            </div>
          ) : null}
          <Card>
            <Label>Score {personName(roles.responder)} · 0–2 each</Label>
            <ul className="mt-2 flex flex-col gap-2">
              {DRILL_CRITERIA.map((c, i) => (
                <li key={c} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{c}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((n) => (
                      <button
                        key={n}
                        type="button"
                        aria-pressed={scores[i] === n}
                        onClick={() => {
                          const next = [...scores];
                          next[i] = n;
                          act({ type: "drill.score", setId: set.id, index: st.index, scores: next });
                        }}
                        className={`h-10 w-10 rounded-lg border text-sm font-bold tabular ${
                          scores[i] === n ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          {facilitator ? <TimerControls session={session} act={act} title="Drill clock" showBig={false} /> : null}
        </>
      ) : null}

      {revealed ? (
        <Card className="border-accent">
          <Label>Model answer</Label>
          <Paragraphs items={drill.model} className="mt-1" />
          <p className="text-xs text-muted mt-2">{drill.source}</p>
          {result ? (
            <p className="text-sm mt-2">
              {personName(roles.responder)} scored <span className="tabular font-semibold">{scores.reduce((a, b) => a + b, 0)}/6</span>
            </p>
          ) : null}
        </Card>
      ) : null}

      {canControl ? (
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => act({ type: "drill.goto", setId: set.id, index: st.index - 1 })} disabled={st.index === 0}>
            ← Previous
          </Button>
          <Button
            variant="primary"
            onClick={() => act({ type: "drill.goto", setId: set.id, index: st.index + 1 })}
            disabled={st.index >= set.drills.length - 1}
          >
            Next drill →
          </Button>
        </div>
      ) : null}

      {st.index === set.drills.length - 1 && revealed ? <DrillSummary set={set} session={session} /> : null}
    </div>
  );
}

export function DrillSummary({ set, session }: { set: DrillSet; session: Session }) {
  const st = session.drills?.[set.id];
  if (!st) return null;
  const totals: Record<string, { pts: number; max: number }> = {};
  set.drills.forEach((_, i) => {
    const r = st.results[i];
    if (!r) return;
    const who = drillRoles(set.id, i).responder;
    totals[who] ??= { pts: 0, max: 0 };
    totals[who].pts += r.scores.reduce((a, b) => a + b, 0);
    totals[who].max += 6;
  });
  return (
    <Card>
      <Label>{set.title} · totals</Label>
      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {Object.entries(totals).map(([p, t]) => (
          <li key={p} className="flex justify-between">
            <span className="font-semibold">{personName(p as Person)}</span>
            <span className="tabular">
              {t.pts}/{t.max}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
