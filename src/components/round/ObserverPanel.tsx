"use client";

import { useState } from "react";
import { fmtMs } from "@/lib/client";
import type { Scenario } from "@/lib/scenarios";
import { personName, type Action, type Round, type RoundAccess, type Session } from "@/lib/types";
import { Button, Card, Label } from "../ui";
import { TimerControls } from "../TimerControls";
import { DealForm, DealSummary } from "./DealForm";
import { RubricForm } from "./Rubric";
import { RoleSheet } from "./Sheet";

export function ObserverPanel({
  scenario,
  round,
  session,
  act,
  access,
}: {
  scenario: Scenario;
  round: Round;
  session: Session;
  act: (a: Action) => void;
  access: RoundAccess;
}) {
  const seller = round.roles.seller;
  const buyer = round.roles.buyer;
  const sellerReady = !!round.prep[seller];
  const buyerReady = !!round.prep[buyer];
  const ready = !scenario.requiresPrep || (sellerReady && buyerReady);

  return (
    <div className="flex flex-col gap-3">
      {scenario.observerFocus ? (
        <Card className="bg-soft">
          <Label>Your job</Label>
          <p className="mt-1">{scenario.observerFocus}</p>
          <p className="text-sm text-muted mt-1">You control the clock, enter the deal, and score both negotiators.</p>
        </Card>
      ) : null}

      {round.status === "prep" ? (
        <Card>
          <Label>Before the clock starts</Label>
          {scenario.requiresPrep ? (
            <ul className="mt-2 flex flex-col gap-1">
              {[
                [seller, sellerReady, "seller"],
                [buyer, buyerReady, "buyer"],
              ].map(([p, ok, r]) => (
                <li key={String(p)} className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${ok ? "bg-accent text-accent-fg" : "bg-line"}`}>
                    {ok ? "✓" : ""}
                  </span>
                  <span className="font-semibold">{personName(p as never)}</span>
                  <span className="text-muted text-sm">
                    ({String(r)}) · {ok ? "prep submitted" : "still preparing"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-muted">No prep form for this drill. Start when both are ready.</p>
          )}
          <Button
            variant="primary"
            size="lg"
            className="mt-3"
            disabled={!ready}
            onClick={() => act({ type: "round.start", roundId: round.id })}
          >
            Start negotiation · {scenario.negotiateMinutes} min
          </Button>
          {!ready ? <p className="text-xs text-muted text-center mt-2">Both prep forms must be in. The facilitator can override.</p> : null}
        </Card>
      ) : null}

      {round.status === "negotiating" ? (
        <>
          <TimerControls session={session} act={act} title="Negotiation clock" showBig={false} />
          <LogCard round={round} act={act} />
          <DealForm scenario={scenario} round={round} act={act} />
        </>
      ) : null}

      {round.status === "submitted" ? (
        <>
          <Card className="border-accent">
            <div className="flex items-baseline justify-between">
              <Label>Deal submitted</Label>
              <Button size="sm" variant="ghost" onClick={() => act({ type: "round.reopen", roundId: round.id })}>
                Reopen
              </Button>
            </div>
            <div className="mt-2">
              <DealSummary scenario={scenario} round={round} />
            </div>
          </Card>
          <RubricForm scenario={scenario} round={round} act={act} />
          <Button variant="primary" size="lg" onClick={() => act({ type: "round.reveal", roundId: round.id })}>
            Reveal to everyone
          </Button>
        </>
      ) : null}

      {round.status !== "negotiating" ? (
        <div className="flex flex-col gap-2">
          <RoleSheet scenario={scenario} role="seller" defaultOpen={false} sheet={access.sheets.seller} points={access.points} />
          <RoleSheet scenario={scenario} role="buyer" defaultOpen={false} sheet={access.sheets.buyer} points={access.points} />
        </div>
      ) : (
        <details className="rounded-2xl border border-line bg-card">
          <summary className="list-none cursor-pointer min-h-12 px-4 py-3 font-semibold">Both sheets</summary>
          <div className="px-2 pb-3 flex flex-col gap-2">
            <RoleSheet scenario={scenario} role="seller" defaultOpen={false} sheet={access.sheets.seller} points={access.points} />
            <RoleSheet scenario={scenario} role="buyer" defaultOpen={false} sheet={access.sheets.buyer} points={access.points} />
          </div>
        </details>
      )}
    </div>
  );
}

export function LogCard({ round, act, readOnly = false }: { round: Round; act: (a: Action) => void; readOnly?: boolean }) {
  const [text, setText] = useState("");
  const t0 = round.startedAt ?? 0;
  return (
    <Card>
      <Label>Observer log</Label>
      {!readOnly ? (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            act({ type: "round.log", roundId: round.id, text });
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="A question asked, an offer, a moment…"
            className="flex-1 min-h-12 rounded-xl border border-line bg-bg px-3"
          />
          <Button type="submit" variant="primary" disabled={!text.trim()}>
            Log
          </Button>
        </form>
      ) : null}
      <ul className="mt-2 flex flex-col gap-1 text-sm">
        {round.observerLog.length === 0 ? <li className="text-muted">Nothing logged yet.</li> : null}
        {round.observerLog.map((e) => (
          <li key={e.at} className="flex items-start gap-2">
            <span className="tabular text-muted w-12 shrink-0">{t0 ? fmtMs(Math.max(0, e.at - t0)) : "—"}</span>
            <span className="flex-1">{e.text}</span>
            {!readOnly ? (
              <button type="button" className="text-muted min-h-8 px-2" aria-label="Delete" onClick={() => act({ type: "round.unlog", roundId: round.id, at: e.at })}>
                ×
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  );
}
