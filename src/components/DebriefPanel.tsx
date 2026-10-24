"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/client";
import { RUBRIC } from "@/lib/rubric";
import type { Debrief, View } from "@/lib/types";
import { Button, Card, Label } from "./ui";

interface Props {
  /** Live round id or practice id (one of them). */
  roundId?: string;
  practiceId?: string;
  debrief?: Debrief;
  debriefError?: string;
  /** Live rounds: only the observer can paste and analyse. */
  canAnalyze: boolean;
  /** Practice: run as soon as the panel mounts. */
  auto?: boolean;
  sellerName: string;
  buyerName: string;
  /** Human observer rubric, for the side-by-side (live rounds). */
  humanRubric?: { seller?: number[]; buyer?: number[] };
  onView: (v: View) => void;
}

export function DebriefPanel(p: Props) {
  const [transcript, setTranscript] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(p.debriefError ?? null);
  const ran = useRef(false);

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = await apiFetch("/api/ai/debrief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(p.practiceId ? { practiceId: p.practiceId } : { roundId: p.roundId, transcript }),
      });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) setError(body.error ?? `Debrief failed (HTTP ${r.status})`);
      else p.onView(body as View);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  // Practice rounds: analyse automatically once.
  useEffect(() => {
    if (p.auto && !p.debrief && !p.debriefError && !ran.current) {
      ran.current = true;
      void run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.auto, p.debrief, p.debriefError]);

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-accent">
        <Label>Debrief from transcript · AI</Label>
        {p.practiceId ? (
          <p className="text-sm text-muted mt-1">The chat log is the transcript. {busy ? "Analysing…" : p.debrief ? "Done." : ""}</p>
        ) : p.canAnalyze ? (
          <>
            <p className="text-sm text-muted mt-1">
              Paste the Wispr Flow transcript. Speaker labels can be missing or wrong; the analysis infers who is who from the role sheets.
            </p>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste the call transcript here…"
              className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm font-mono"
            />
            <Button variant="primary" size="lg" className="mt-3" disabled={busy || transcript.trim().length < 40} onClick={() => void run()}>
              {busy ? "Analysing… (30–60 s)" : p.debrief ? "Analyze again" : "Analyze"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted mt-1">{p.debrief ? "Analysed by the observer." : "The observer pastes the transcript and runs the analysis."}</p>
        )}
        {error ? <p className="mt-2 text-sm text-warn font-semibold">⚠ {error}</p> : null}
        {p.practiceId && error ? (
          <Button size="sm" className="mt-2" onClick={() => void run()} disabled={busy}>
            Try again
          </Button>
        ) : null}
      </Card>
      {p.debrief ? <DebriefCards d={p.debrief} sellerName={p.sellerName} buyerName={p.buyerName} humanRubric={p.humanRubric} /> : null}
    </div>
  );
}

const yn = (b: boolean) => (b ? "yes" : "no");

export function DebriefCards({
  d,
  sellerName,
  buyerName,
  humanRubric,
}: {
  d: Debrief;
  sellerName: string;
  buyerName: string;
  humanRubric?: { seller?: number[]; buyer?: number[] };
}) {
  return (
    <div className="flex flex-col gap-3">
      {d.caveats ? (
        <Card className="bg-soft text-sm">
          <Label>Caveats</Label>
          <p className="mt-1">{d.caveats}</p>
        </Card>
      ) : null}

      <Card>
        <Label>1 · The decisive moment</Label>
        <blockquote className="mt-2 border-l-4 border-accent pl-3 italic">“{d.decisive_moment.quote}”</blockquote>
        <p className="mt-2">{d.decisive_moment.why}</p>
      </Card>

      <Card>
        <Label>2 · Questions asked ({d.questions.length})</Label>
        {d.questions.length === 0 ? <p className="text-muted mt-1 text-sm">None found in the transcript.</p> : null}
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          {d.questions.map((q, i) => (
            <li key={i} className="rounded-xl border border-line p-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">{q.who}</span>
                <span className="text-xs text-muted">
                  about {q.about.replace("_", " ")} · {q.moved_deal ? "moved the deal" : "did not move it"}
                </span>
              </div>
              <div>“{q.question}”</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <Label>3 · Information</Label>
        <div className="mt-2 grid md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-semibold">Revealed</div>
            {d.information.revealed.length === 0 ? <p className="text-muted">Nothing hidden came out.</p> : null}
            <ul className="mt-1 flex flex-col gap-1">
              {d.information.revealed.map((r, i) => (
                <li key={i} className="rounded-xl bg-soft p-2">
                  <span className="font-semibold">{r.what}</span> <span className="text-muted">· by {r.by} · {r.when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold">Stayed hidden</div>
            {d.information.stayed_hidden.length === 0 ? <p className="text-muted">Everything relevant surfaced.</p> : null}
            <ul className="mt-1 flex flex-col gap-1">
              {d.information.stayed_hidden.map((r, i) => (
                <li key={i} className="rounded-xl border border-warn p-2">
                  <div className="font-semibold">{r.what}</div>
                  <div className="text-muted">Would have surfaced it: “{r.question_that_would_have_surfaced_it}”</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <Label>4 · Offers and concessions, in order</Label>
        {d.offers_and_concessions.length === 0 ? <p className="text-muted mt-1 text-sm">No offers found.</p> : null}
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-2 font-semibold">Who</th>
                <th className="py-1 pr-2 font-semibold">Amount</th>
                <th className="py-1 pr-2 font-semibold">Justified</th>
                <th className="py-1 pr-2 font-semibold">Labeled</th>
                <th className="py-1 pr-2 font-semibold">Reciprocated</th>
                <th className="py-1 font-semibold">Unilateral</th>
              </tr>
            </thead>
            <tbody>
              {d.offers_and_concessions.map((o, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="py-1 pr-2 font-semibold">{o.who}</td>
                  <td className="py-1 pr-2">{o.amount}</td>
                  <td className="py-1 pr-2">{yn(o.justification)}</td>
                  <td className="py-1 pr-2">{yn(o.labeled)}</td>
                  <td className="py-1 pr-2">{yn(o.reciprocated)}</td>
                  <td className={`py-1 ${o.unilateral ? "text-warn font-semibold" : ""}`}>{yn(o.unilateral)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <Label>5 · Tactics and responses</Label>
        {d.tactics.length === 0 ? <p className="text-muted mt-1 text-sm">No pressure tactics found.</p> : null}
        <ul className="mt-2 flex flex-col gap-2 text-sm">
          {d.tactics.map((t, i) => (
            <li key={i} className="rounded-xl border border-line p-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-semibold">
                  {t.who} · {t.tactic}
                </span>
                <span className={`text-xs ${t.response === "reacted" ? "text-warn" : "text-accent"}`}>other side: {t.response}</span>
              </div>
              <div className="text-muted">“{t.quote}”</div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <Label>6 · Rubric · AI next to the observer</Label>
        <div className="mt-2 grid md:grid-cols-2 gap-3">
          {(["seller", "buyer"] as const).map((side) => {
            const items = d.rubric[side] ?? [];
            const human = humanRubric?.[side];
            const aiTotal = items.reduce((n, it) => n + it.score, 0);
            return (
              <div key={side}>
                <div className="font-semibold">
                  {side === "seller" ? sellerName : buyerName} · {side}
                  <span className="tabular text-muted font-normal"> · AI {aiTotal}/{items.length * 2}</span>
                </div>
                <ul className="mt-1 flex flex-col gap-1 text-sm">
                  {items.map((it) => {
                    const def = RUBRIC.find((r) => r.id === it.id);
                    const idx = RUBRIC.findIndex((r) => r.id === it.id);
                    const h = human && idx >= 0 ? human[idx] : undefined;
                    return (
                      <li key={it.id} className="rounded-xl border border-line p-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold">{def?.short ?? it.id}</span>
                          <span className="tabular text-xs">
                            AI <b>{it.score}</b>
                            {h != null && h >= 0 ? (
                              <>
                                {" "}
                                · observer <b className={h !== it.score ? "text-warn" : ""}>{h}</b>
                              </>
                            ) : null}
                          </span>
                        </div>
                        <div className="text-muted">{it.reason}</div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="border-accent">
        <Label>7 · One rule each, for the next real call</Label>
        <dl className="mt-2 grid md:grid-cols-2 gap-3">
          <div className="rounded-xl bg-soft p-3">
            <dt className="text-xs text-muted">{sellerName} · seller</dt>
            <dd className="font-semibold">{d.one_rule_each.seller}</dd>
          </div>
          <div className="rounded-xl bg-soft p-3">
            <dt className="text-xs text-muted">{buyerName} · buyer</dt>
            <dd className="font-semibold">{d.one_rule_each.buyer}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
