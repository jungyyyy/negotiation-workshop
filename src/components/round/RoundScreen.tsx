"use client";

import type { Step } from "@/lib/agenda";
import { getBlock } from "@/lib/agenda";
import { quizCleared } from "@/lib/quiz";
import { getScenario, roleLabel, roleOf } from "@/lib/scenarios";
import { sprintForBlock } from "@/lib/sprints";
import { personName, type Action, type Person, type Session } from "@/lib/types";
import { Card, Label } from "../ui";
import { ObserverPanel } from "./ObserverPanel";
import { PrepForm } from "./PrepForm";
import { DebriefView, RevealView } from "./Reveal";
import { Collapsible, Paragraphs, RoleSheet } from "./Sheet";
import { MistakesChecklist } from "../Debrief";

export function RoundScreen({
  session,
  me,
  step,
  act,
}: {
  session: Session;
  me: Person;
  step: Step;
  act: (a: Action) => void;
}) {
  const round = session.rounds.find((r) => r.id === step.roundId);
  const scenario = round && getScenario(round.scenarioId);
  if (!round || !scenario) {
    return (
      <Card>
        <p className="text-muted">The round opens when the facilitator reaches this step.</p>
      </Card>
    );
  }
  const role = roleOf(round.roles, me);
  const block = getBlock(session.block);
  const sprint = sprintForBlock(block.id);
  const cleared = !sprint || quizCleared(session, sprint.id, me);

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Label>
          {round.id} · {scenario.subtitle}
        </Label>
        <h1 className="text-2xl font-bold mt-1">{scenario.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-accent text-accent-fg px-3 py-1 font-semibold">
            You: {role ? roleLabel(role, scenario) : "not in this round"}
          </span>
          <span className="rounded-full bg-soft px-3 py-1 text-muted">
            {personName(round.roles.seller)} sells · {personName(round.roles.buyer)} buys · {personName(round.roles.observer)} observes
          </span>
        </div>
      </Card>

      {round.status === "revealed" || step.kind === "reveal" ? (
        round.status === "revealed" ? (
          <RevealView scenario={scenario} round={round} me={me} act={act} />
        ) : (
          <Card>
            <p className="text-muted">Waiting for the observer or facilitator to reveal.</p>
          </Card>
        )
      ) : step.kind === "debrief" ? (
        <>
          <DebriefView scenario={scenario} round={round} me={me} act={act} />
          {role !== "observer" && scenario.requiresPrep ? <MistakesChecklist session={session} me={me} roundId={round.id} act={act} /> : null}
        </>
      ) : (
        <>
          <Collapsible title="Public brief" subtitle="Both sides see this" defaultOpen={round.status === "prep"}>
            <Paragraphs items={scenario.publicBrief} />
          </Collapsible>

          {role === "observer" ? (
            <ObserverPanel scenario={scenario} round={round} session={session} act={act} cleared={cleared} />
          ) : role ? (
            <>
              <RoleSheet scenario={scenario} role={role} locked={!cleared} defaultOpen={round.status !== "negotiating"} />
              {scenario.requiresPrep && cleared && round.status === "prep" ? (
                <PrepForm scenario={scenario} round={round} me={me} act={act} />
              ) : null}
              {!cleared ? (
                <Card className="border-warn">
                  <p className="font-semibold">Pass the quiz first.</p>
                  <p className="text-sm text-muted">Your sheet and prep form unlock at 4 of 5. The facilitator can unlock you.</p>
                </Card>
              ) : null}
              {round.status === "negotiating" ? (
                <>
                  <Card className="bg-soft text-center">
                    <div className="text-xl font-bold">Negotiating</div>
                    <p className="text-sm text-muted">The clock is at the top. {personName(round.roles.observer)} enters the deal.</p>
                  </Card>
                  {scenario.requiresPrep ? <PrepForm scenario={scenario} round={round} me={me} act={act} /> : null}
                </>
              ) : null}
              {round.status === "submitted" ? (
                <Card className="text-center">
                  <div className="text-xl font-bold">Deal submitted</div>
                  <p className="text-sm text-muted">Waiting for the reveal.</p>
                </Card>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
