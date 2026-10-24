"use client";

import { fmtMs } from "@/lib/client";
import { pointsFor, type Scenario } from "@/lib/scenarios";
import { personName, type Action, type Person, type Round } from "@/lib/types";
import { Card, Label } from "../ui";
import { DealSummary } from "./DealForm";
import { LogCard } from "./ObserverPanel";
import { RubricForm } from "./Rubric";
import { Collapsible, Paragraphs, PointsTableView } from "./Sheet";
import { ScoreCard } from "./ScoreCard";

export function RevealView({
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
  const observer = round.roles.observer === me;
  const elapsed = round.startedAt && round.submittedAt ? round.submittedAt - round.startedAt : null;
  const deal = round.deal ?? {};
  const sellerPts = scenario.points && !round.noDeal ? pointsFor(scenario.points, deal, "seller") : null;
  const buyerPts = scenario.points && !round.noDeal ? pointsFor(scenario.points, deal, "buyer") : null;

  return (
    <div className="flex flex-col gap-3">
      <Card className="border-accent">
        <div className="flex items-baseline justify-between">
          <Label>The deal</Label>
          {elapsed != null ? <span className="tabular text-sm text-muted">{fmtMs(elapsed)} on the clock</span> : null}
        </div>
        <div className="mt-2">
          <DealSummary scenario={scenario} round={round} />
        </div>
        {scenario.points && sellerPts != null && buyerPts != null ? (
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-soft p-2">
              <div className="text-xs text-muted">{personName(round.roles.seller)} · seller</div>
              <div className="tabular text-2xl font-bold">{sellerPts}</div>
              <div className="text-xs text-muted">BATNA {scenario.points.sellerBatna}</div>
            </div>
            <div className="rounded-xl bg-soft p-2">
              <div className="text-xs text-muted">{personName(round.roles.buyer)} · buyer</div>
              <div className="tabular text-2xl font-bold">{buyerPts}</div>
              <div className="text-xs text-muted">BATNA {scenario.points.buyerBatna}</div>
            </div>
          </div>
        ) : null}
      </Card>

      <ScoreCard scenario={scenario} round={round} />

      <Card className="bg-soft">
        <Label>What was really going on</Label>
        <Paragraphs items={scenario.hidden} className="mt-1" />
      </Card>

      <PrepVersusTruth scenario={scenario} round={round} />

      <Collapsible title={`Seller sheet · ${scenario.sellerParty}`} subtitle={personName(round.roles.seller)}>
        <Paragraphs items={scenario.sellerSheet} />
      </Collapsible>
      <Collapsible title={`Buyer sheet · ${scenario.buyerParty}`} subtitle={personName(round.roles.buyer)}>
        <Paragraphs items={scenario.buyerSheet} />
      </Collapsible>
      {scenario.points ? (
        <Collapsible title="Both points tables" subtitle="The agreed options are highlighted">
          <PointsTableView table={scenario.points} side="both" highlight={round.noDeal ? undefined : deal} />
        </Collapsible>
      ) : null}

      <LogCard round={round} act={act} readOnly={!observer} />

      <RubricForm scenario={scenario} round={round} act={act} readOnly={!observer} />
    </div>
  );
}

function PrepVersusTruth({ scenario, round }: { scenario: Scenario; round: Round }) {
  if (!scenario.requiresPrep) return null;
  const sides: { person: Person; role: "seller" | "buyer" }[] = [
    { person: round.roles.seller, role: "seller" },
    { person: round.roles.buyer, role: "buyer" },
  ];
  const t = scenario.truth;
  return (
    <Card>
      <Label>Prep forms next to what was true</Label>
      <div className="mt-2 grid md:grid-cols-2 gap-4">
        {sides.map(({ person, role }) => {
          const p = round.prep[person];
          const other = role === "seller" ? "buyer" : "seller";
          const rows: [string, string | undefined, string | undefined][] = [
            ["Own BATNA", p?.batna, t ? (role === "seller" ? t.sellerBatna : t.buyerBatna) : undefined],
            ["Own reservation value", p?.reservation, t ? (role === "seller" ? t.sellerReservation : t.buyerReservation) : undefined],
            [`Estimate of ${other}'s BATNA`, p?.theirBatna, t ? (other === "seller" ? t.sellerBatna : t.buyerBatna) : undefined],
            [`Estimate of ${other}'s reservation value`, p?.theirReservation, t ? (other === "seller" ? t.sellerReservation : t.buyerReservation) : undefined],
            ["Target", p?.target, undefined],
            ["First-offer plan", p?.firstOffer, undefined],
          ];
          return (
            <div key={person}>
              <div className="font-semibold">
                {personName(person)} · {role}
              </div>
              {!p ? (
                <p className="text-sm text-muted mt-1">No prep form submitted.</p>
              ) : (
                <dl className="mt-1 flex flex-col gap-2 text-sm">
                  {rows.map(([label, mine, truth]) => (
                    <div key={label} className="rounded-xl border border-line p-2">
                      <dt className="text-muted">{label}</dt>
                      <dd className="font-medium whitespace-pre-wrap">{mine || "—"}</dd>
                      {truth ? (
                        <dd className="mt-1 text-accent">
                          <span className="text-xs uppercase tracking-wide font-semibold">Actual · </span>
                          {truth}
                        </dd>
                      ) : null}
                    </div>
                  ))}
                  <div className="rounded-xl border border-line p-2">
                    <dt className="text-muted">Planned questions</dt>
                    <dd>
                      <ol className="list-decimal pl-5 font-medium">
                        {p.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ol>
                    </dd>
                  </div>
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function DebriefView({
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
  const observer = round.roles.observer === me;
  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Label>Debrief · talk through these</Label>
        <ol className="mt-2 flex flex-col gap-2 list-decimal pl-5">
          {scenario.debrief.map((d, i) => (
            <li key={i} className="leading-snug">
              {d}
            </li>
          ))}
        </ol>
      </Card>
      <RubricForm scenario={scenario} round={round} act={act} readOnly={!observer} />
      <LogCard round={round} act={act} readOnly />
    </div>
  );
}
