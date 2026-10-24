"use client";

import { useState } from "react";
import { getScenario } from "@/lib/scenarios";
import { personName, type Action, type Round, type Session } from "@/lib/types";
import { Button, Card, Label } from "../ui";
import { DealSummary } from "./DealForm";

/** Facilitator controls for the current round. */
export function RoundPanel({ session, roundId, act }: { session: Session; roundId: string; act: (a: Action) => void }) {
  const round = session.rounds.find((r) => r.id === roundId);
  const scenario = round && getScenario(round.scenarioId);
  const [arm, setArm] = useState(false);
  if (!round || !scenario) return null;
  const prepOk = (p: Round["roles"]["seller"]) => !!round.prep[p];

  return (
    <Card>
      <div className="flex items-baseline justify-between gap-2">
        <Label>
          Round {round.id} · {scenario.title}
        </Label>
        <span className="text-xs font-semibold uppercase tracking-wide rounded-full bg-soft px-2 py-1">{round.status}</span>
      </div>
      <div className="mt-2 text-sm">
        <span className="font-semibold">{personName(round.roles.seller)}</span> sells
        {scenario.requiresPrep ? <span className="text-muted"> ({prepOk(round.roles.seller) ? "prep ✓" : "prep …"})</span> : null}
        {" · "}
        <span className="font-semibold">{personName(round.roles.buyer)}</span> buys
        {scenario.requiresPrep ? <span className="text-muted"> ({prepOk(round.roles.buyer) ? "prep ✓" : "prep …"})</span> : null}
        {" · "}
        <span className="font-semibold">{personName(round.roles.observer)}</span> observes
      </div>

      {round.deal || round.noDeal ? (
        <div className="mt-3">
          <DealSummary scenario={scenario} round={round} />
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {round.status === "prep" ? (
          <Button size="sm" onClick={() => act({ type: "round.start", roundId: round.id, force: true })}>
            Start clock (override)
          </Button>
        ) : null}
        {round.status === "submitted" ? (
          <Button size="sm" onClick={() => act({ type: "round.reopen", roundId: round.id })}>
            Reopen
          </Button>
        ) : null}
        {round.status === "negotiating" || round.status === "submitted" ? (
          <Button size="sm" variant="primary" onClick={() => act({ type: "round.reveal", roundId: round.id })}>
            Reveal
          </Button>
        ) : null}
        <span className="flex-1" />
        {!arm ? (
          <Button size="sm" variant="danger" onClick={() => setArm(true)}>
            Reset round…
          </Button>
        ) : (
          <>
            <Button
              size="sm"
              variant="danger"
              onClick={() => {
                act({ type: "round.reset", roundId: round.id });
                setArm(false);
              }}
            >
              Yes, wipe {round.id}
            </Button>
            <Button size="sm" onClick={() => setArm(false)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
