"use client";

import { useSession } from "@/lib/client";
import { personName } from "@/lib/types";
import { getBlock, getStep } from "@/lib/agenda";
import { TimerBar } from "@/components/TimerBar";
import { Button, Card, Label, Page, Spinner } from "@/components/ui";
import { PreworkChecklist } from "@/components/Prework";
import { SprintCard } from "@/components/SprintCard";
import { Quiz } from "@/components/Quiz";
import { sprintForBlock } from "@/lib/sprints";
import { RoundScreen } from "@/components/round/RoundScreen";
import { ConceptCardView } from "@/components/ConceptCard";
import { cardForStep } from "@/lib/cards";
import { experimentForStep } from "@/lib/experiments";
import { drillSetForStep } from "@/lib/drills";
import { ExperimentReveal, ExperimentScreen } from "@/components/Experiment";
import { DrillScreen } from "@/components/Drill";
import { CrossCase, ExportCard, MistakesList, OverconfidenceReveal, RuleInput } from "@/components/Debrief";
import { practiceSummary } from "@/lib/practiceSummary";

export default function MePage() {
  const { session, act, live, replace } = useSession();
  if (!session) return <Spinner />;
  const me = session.me;

  const block = getBlock(session.block);
  const step = getStep(session.block, session.step);
  const sprint = sprintForBlock(block.id);
  const card = step.kind === "card" ? cardForStep(step.id) : undefined;
  const experiment = experimentForStep(step.id);
  const drillSet = drillSetForStep(step.id);

  return (
    <>
      <TimerBar session={session} size="lg" />
      <Page className="pt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {personName(me)} · Day {block.day}
          </span>
          <span className={live ? "text-accent" : "text-warn"}>{live ? "● synced" : "○ reconnecting"}</span>
        </div>

        {!step.roundId ? (
          <Card>
            <Label>Now</Label>
            <h1 className="text-2xl font-bold mt-1">{step.label}</h1>
            <p className="text-muted mt-1">
              Block {block.number} · {block.time}
            </p>
          </Card>
        ) : null}

        {step.kind === "setup" ? (
          <Card>
            <PreworkChecklist session={session} me={me} act={act} />
          </Card>
        ) : step.kind === "sprint" && sprint ? (
          <SprintCard sprint={sprint} session={session} />
        ) : step.kind === "quiz" && sprint ? (
          <Quiz sprint={sprint} session={session} me={me} act={act} />
        ) : step.roundId ? (
          <RoundScreen session={session} me={me} step={step} act={act} onView={replace} />
        ) : card ? (
          <ConceptCardView card={card} />
        ) : experiment ? (
          <ExperimentScreen exp={experiment} session={session} me={me} act={act} />
        ) : step.id === "b5-reveal" ? (
          <ExperimentReveal session={session} />
        ) : drillSet ? (
          <DrillScreen set={drillSet} session={session} me={me} act={act} />
        ) : step.id === "b4-mistakes" ? (
          <MistakesList session={session} me={me} />
        ) : step.id === "b4-rule" ? (
          <>
            <MistakesList session={session} me={me} />
            <RuleInput session={session} me={me} which="day1" act={act} />
          </>
        ) : step.id === "b9-cross" ? (
          <CrossCase session={session} me={me} act={act} />
        ) : step.id === "b9-mistakes" ? (
          <>
            <MistakesList session={session} me={me} title="Your three most repeated mistakes" />
            <RuleInput session={session} me={me} which="final" act={act} />
          </>
        ) : step.id === "b9-overconf" ? (
          <OverconfidenceReveal session={session} />
        ) : step.id === "b9-export" ? (
          <ExportCard />
        ) : (
          <Card>
            <p className="text-muted">
              This step&apos;s screen is not built yet. The facilitator view already runs the agenda and
              the timer.
            </p>
          </Card>
        )}

        <Card>
          <div className="flex items-baseline justify-between">
            <Label>Practice rounds · {(session.practice[me] ?? []).length}</Label>
            <Button variant="ghost" size="sm" href="/practice">
              Practice →
            </Button>
          </div>
          {(session.practice[me] ?? []).length === 0 ? (
            <p className="text-sm text-muted mt-1">Negotiate against an AI counterpart any time. Scores appear here over time.</p>
          ) : (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {[...(session.practice[me] ?? [])]
                .reverse()
                .slice(0, 5)
                .map((pr) => (
                  <li key={pr.id} className="flex justify-between gap-3">
                    <a href={`/practice/${pr.id}`} className="font-semibold underline-offset-4 hover:underline">
                      {pr.scenarioId} as {pr.side}
                    </a>
                    <span className="text-muted text-right">{practiceSummary(pr)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>

        <div className="flex gap-3 justify-center text-sm">
          <Button variant="ghost" size="sm" href="/">
            Join screen
          </Button>
          <Button variant="ghost" size="sm" href="/facilitator">
            Facilitator view
          </Button>
        </div>
      </Page>
    </>
  );
}
