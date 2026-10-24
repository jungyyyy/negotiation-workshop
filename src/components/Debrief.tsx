"use client";

import { useEffect, useState } from "react";
import { EXPERIMENTS } from "@/lib/experiments";
import { actualRanks, capstoneShare, COMMON_MISTAKES, mistakesFor, rubricTotals } from "@/lib/mistakes";
import { getScenario } from "@/lib/scenarios";
import { PEOPLE, personName, type Action, type Person, type Session } from "@/lib/types";
import { Button, Card, Label } from "./ui";
import { downloadFile } from "@/lib/client";
import { DealSummary } from "./round/DealForm";
import { ExperimentReveal } from "./Experiment";

/** Self-tick checklist shown in a round's debrief. Only your own ticks are on your phone. */
export function MistakesChecklist({ session, me, roundId, act }: { session: Session; me: Person; roundId: string; act: (a: Action) => void }) {
  const ticked = session.mistakes?.[me]?.[roundId] ?? [];
  return (
    <Card>
      <Label>Tick your own mistakes · {roundId}</Label>
      <p className="text-sm text-muted mt-1">The seven common ways to lose value when claiming it. Nobody else sees your ticks until the mistakes list.</p>
      <ul className="mt-2 flex flex-col gap-2">
        {COMMON_MISTAKES.map((m) => {
          const on = ticked.includes(m.id);
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() =>
                  act({
                    type: "mistakes.tick",
                    person: me,
                    roundId,
                    ids: on ? ticked.filter((x) => x !== m.id) : [...ticked, m.id],
                  })
                }
                className={`w-full min-h-12 flex items-center gap-3 rounded-xl border px-3 text-left ${on ? "border-warn bg-warn/10" : "border-line bg-card"}`}
              >
                <span className={`shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${on ? "bg-warn border-warn text-white" : "border-line"}`}>
                  {on ? "✓" : ""}
                </span>
                <span className="text-sm">{m.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function MistakesList({ session, me, title = "Your mistakes so far" }: { session: Session; me: Person; title?: string }) {
  const list = mistakesFor(session, me);
  const top = list.slice(0, 3);
  return (
    <Card>
      <Label>{title}</Label>
      {list.length === 0 ? (
        <p className="text-muted mt-1">Nothing recorded yet. Rubric zeros and your own ticks land here.</p>
      ) : (
        <>
          <ol className="mt-2 flex flex-col gap-2">
            {top.map((m, i) => (
              <li key={m.id} className="rounded-xl bg-warn/10 border border-warn p-3">
                <div className="flex items-baseline gap-2">
                  <span className="tabular text-2xl font-bold text-warn">{i + 1}</span>
                  <span className="font-semibold leading-snug">{m.text}</span>
                </div>
                <div className="text-xs text-muted mt-1">
                  {m.count}× · {m.rounds.join(", ")}
                </div>
              </li>
            ))}
          </ol>
          {list.length > 3 ? (
            <details className="mt-2">
              <summary className="text-sm text-muted cursor-pointer min-h-8">Everything recorded ({list.length})</summary>
              <ul className="mt-1 text-sm flex flex-col gap-1">
                {list.slice(3).map((m) => (
                  <li key={m.id} className="flex justify-between gap-3">
                    <span>{m.text}</span>
                    <span className="tabular text-muted shrink-0">{m.count}×</span>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </>
      )}
    </Card>
  );
}

export function RuleInput({ session, me, which, act }: { session: Session; me: Person; which: "day1" | "final"; act: (a: Action) => void }) {
  const saved = session.rules?.[me]?.[which] ?? "";
  const [text, setText] = useState(saved);
  useEffect(() => {
    if (text === saved) return;
    const t = setTimeout(() => act({ type: "rule.set", person: me, which, text }), 600);
    return () => clearTimeout(t);
  }, [text, saved, me, which, act]);
  return (
    <Card className="border-accent">
      <Label>{which === "day1" ? "One rule for tomorrow" : "One rule for your next real call"}</Label>
      <p className="text-sm text-muted mt-1">
        {which === "day1"
          ? "Look at your list above. Write the one rule that would have fixed the most of it."
          : "Specific enough to check after the call. Starts with a verb."}
      </p>
      <textarea
        value={text}
        rows={3}
        onChange={(e) => setText(e.target.value)}
        placeholder={which === "day1" ? "e.g. Ask three questions before I name any number." : "e.g. Write my package reservation value before every call."}
        className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2 text-lg"
      />
      <div className="text-xs text-muted mt-1">{text === saved && text ? "Saved" : text ? "Saving…" : ""}</div>
    </Card>
  );
}

export function RulesOverview({ session }: { session: Session }) {
  return (
    <Card>
      <Label>Rules written</Label>
      <ul className="mt-2 flex flex-col gap-2 text-sm">
        {PEOPLE.map((p) => (
          <li key={p.id}>
            <div className="font-semibold">{p.name}</div>
            <div className="text-muted">Day 1: {session.rules?.[p.id]?.day1 || "—"}</div>
            <div className="text-muted">Final: {session.rules?.[p.id]?.final || "—"}</div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CrossCase({ session, me, act }: { session: Session; me: Person | null; act: (a: Action) => void }) {
  const [text, setText] = useState("");
  const rounds = session.rounds.filter((r) => r.status === "revealed");
  const totals = rubricTotals(session);
  return (
    <div className="flex flex-col gap-3">
      <Card className="bg-soft">
        <Label>Cross-case debrief</Label>
        <p className="mt-1">
          Look across all the rounds at once, not one by one. Name patterns: things that happened in three different cases, under three different labels. A lesson that only fits one case is not what we are after.
        </p>
        <ul className="mt-2 text-sm list-disc pl-5 flex flex-col gap-1">
          <li>Where did the first offer come from, each time, and who had the information?</li>
          <li>Which questions got asked in every round, and which never did?</li>
          <li>Where did a demand turn out to be information, and how long did it take us to treat it that way?</li>
          <li>Which rubric item was lowest for each of us, across rounds?</li>
        </ul>
      </Card>

      <Card>
        <Label>All rounds</Label>
        <ul className="mt-2 flex flex-col gap-3">
          {rounds.length === 0 ? <li className="text-muted text-sm">No revealed rounds yet.</li> : null}
          {rounds.map((r) => {
            const sc = getScenario(r.scenarioId)!;
            const s = r.scores;
            return (
              <li key={r.id} className="rounded-xl border border-line p-3">
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold">
                    {r.id} · {sc.title}
                  </div>
                  <div className="text-xs text-muted">
                    {personName(r.roles.seller)} / {personName(r.roles.buyer)} / obs {personName(r.roles.observer)}
                  </div>
                </div>
                <div className="mt-1">
                  <DealSummary scenario={sc} round={r} />
                </div>
                <div className="text-sm text-muted mt-1 tabular">
                  {s?.kind === "single" && s.sellerShare != null ? `ZOPA share: seller ${Math.round(s.sellerShare * 100)}% · buyer ${Math.round(s.buyerShare! * 100)}%` : null}
                  {s?.kind === "points" && s.joint != null ? `Joint ${s.joint}/${s.maxJoint} · ${s.leftOnTable} left on the table${s.onFrontier ? " · efficient" : ""}` : null}
                  {s?.kind === "investigation" ? (s.found ? `Found the interest in ${s.minutes ?? "?"} min` : "Did not find the interest") : null}
                  {s?.kind === "drill" ? (s.bestAnswer ? "Turned the demand into a trade" : "Did not trade") : null}
                </div>
                {r.moment ? <div className="text-sm mt-1 italic">“{r.moment}”</div> : null}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <Label>Rubric totals</Label>
        <ul className="mt-2 grid grid-cols-3 gap-2 text-center">
          {PEOPLE.map((p) => (
            <li key={p.id} className="rounded-xl bg-soft p-2">
              <div className="text-xs text-muted">{p.name}</div>
              <div className="tabular text-xl font-bold">
                {totals[p.id].pts}/{totals[p.id].max}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <Label>Patterns we named</Label>
        {me ? (
          <form
            className="mt-2 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              act({ type: "pattern.add", person: me, text });
              setText("");
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="A pattern across rounds…" className="flex-1 min-h-12 rounded-xl border border-line bg-bg px-3" />
            <Button type="submit" variant="primary" disabled={!text.trim()}>
              Add
            </Button>
          </form>
        ) : null}
        <ul className="mt-2 flex flex-col gap-1 text-sm">
          {session.patterns.length === 0 ? <li className="text-muted">Nothing yet.</li> : null}
          {session.patterns.map((p) => (
            <li key={p.at} className="flex items-start gap-2">
              <span className="text-muted shrink-0">{personName(p.person)}:</span>
              <span className="flex-1">{p.text}</span>
              <button type="button" className="text-muted min-h-8 px-2" aria-label="Remove" onClick={() => act({ type: "pattern.remove", at: p.at })}>
                ×
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

export function OverconfidenceReveal({ session }: { session: Session }) {
  const exp = EXPERIMENTS.find((e) => e.id === "overconfidence")!;
  const answers = session.experiments?.[exp.id] ?? {};
  const ranks = actualRanks(session);
  const totals = rubricTotals(session);
  const shares = capstoneShare(session);
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Label>Predicted versus actual</Label>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm tabular">
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
              <tr className="border-t border-line">
                <td className="py-1 pr-2 text-muted">Predicted rank</td>
                {PEOPLE.map((p) => (
                  <td key={p.id} className="py-1 pr-2 font-semibold">
                    {answers[p.id]?.rank ? `${answers[p.id]!.rank}.` : "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-line">
                <td className="py-1 pr-2 text-muted">Actual rank (rubric)</td>
                {PEOPLE.map((p) => (
                  <td key={p.id} className="py-1 pr-2 font-semibold">
                    {totals[p.id].max ? `${ranks[p.id]}.` : "—"} <span className="text-muted font-normal">{totals[p.id].pts}/{totals[p.id].max}</span>
                  </td>
                ))}
              </tr>
              <tr className="border-t border-line">
                <td className="py-1 pr-2 text-muted">Predicted R5 share</td>
                {PEOPLE.map((p) => (
                  <td key={p.id} className="py-1 pr-2 font-semibold">
                    {answers[p.id]?.share != null ? `${answers[p.id]!.share}%` : "—"}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-line">
                <td className="py-1 pr-2 text-muted">Actual R5 share</td>
                {PEOPLE.map((p) => (
                  <td key={p.id} className="py-1 pr-2 font-semibold">
                    {shares[p.id] != null ? `${Math.round(shares[p.id]! * 100)}%` : <span className="text-muted font-normal">observer / no deal</span>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-2">R5 share = your gain above BATNA as a fraction of both gains above BATNA.</p>
      </Card>
      <ExperimentReveal session={session} deferredOnly />
    </div>
  );
}

export function ExportCard() {
  return (
    <Card>
      <Label>Export</Label>
      <p className="text-sm text-muted mt-1">Every round, prep form, score, drill result and personal list.</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button variant="primary" size="lg" onClick={() => downloadFile("/api/export?format=md", `negotiation-workshop-${new Date().toISOString().slice(0, 10)}.md`)}>
          Markdown
        </Button>
        <Button size="lg" onClick={() => downloadFile("/api/export?format=json", `negotiation-workshop-${new Date().toISOString().slice(0, 10)}.json`)}>
          JSON
        </Button>
      </div>
    </Card>
  );
}
