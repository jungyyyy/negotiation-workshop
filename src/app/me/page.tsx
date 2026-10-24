"use client";

import { useMe, useSession } from "@/lib/client";
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
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MePage() {
  const { session, act, live } = useSession();
  const { me, ready } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (ready && !me) router.replace("/");
  }, [ready, me, router]);

  if (!ready || !session || !me) return <Spinner />;

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
          <span className={live ? "text-accent" : ""}>{live ? "● live" : "○ polling"}</span>
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
          <RoundScreen session={session} me={me} step={step} act={act} />
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
