"use client";

import { useSession } from "@/lib/client";
import { AGENDA, getBlock, getStep, type Block } from "@/lib/agenda";
import { sprintForBlock } from "@/lib/sprints";
import { SprintCard } from "@/components/SprintCard";
import { QuizStatusPanel } from "@/components/QuizStatus";
import { TimerControls } from "@/components/TimerControls";
import { RoundPanel } from "@/components/round/RoundPanel";
import { ConceptCardView } from "@/components/ConceptCard";
import { cardForStep } from "@/lib/cards";
import { experimentForStep } from "@/lib/experiments";
import { drillSetForStep } from "@/lib/drills";
import { ExperimentReveal, ExperimentStatus } from "@/components/Experiment";
import { DrillScreen } from "@/components/Drill";
import { CrossCase, ExportCard, OverconfidenceReveal, RulesOverview } from "@/components/Debrief";
import { PEOPLE, type Action, type Session } from "@/lib/types";
import { Button, Card, Label, Page, Spinner } from "@/components/ui";
import { useState } from "react";

export default function FacilitatorPage() {
  const { session, act, live } = useSession();
  if (!session) return <Spinner />;

  const block = getBlock(session.block);
  const step = getStep(session.block, session.step);
  const sprint = sprintForBlock(block.id);

  return (
    <Page className="pt-4 flex flex-col gap-4 lg:max-w-6xl">
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="font-semibold text-fg">
          Facilitator{session.demo ? <span className="text-warn"> · DEMO</span> : null}
        </span>
        <span className={live ? "text-accent" : "text-warn"}>{live ? "● synced" : "○ reconnecting"}</span>
      </div>

      <TimerControls session={session} act={act} />

      {session.demo ? (
        <Card className="border-warn flex flex-col gap-2">
          <Label>Demo mode</Label>
          <p className="text-sm text-muted">
            Quizzes are pre-passed and prep forms pre-filled. Fill this step with sample data, then press Next step.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="primary" onClick={() => act({ type: "demo.fill" })}>
              Fill this step
            </Button>
            <Button
              onClick={() => {
                act({ type: "demo.fill" });
                setTimeout(() => act({ type: "next" }), 150);
              }}
            >
              Fill and next →
            </Button>
          </div>
        </Card>
      ) : null}

      {step.roundId ? <RoundPanel session={session} roundId={step.roundId} act={act} /> : null}
      {step.kind === "card" && cardForStep(step.id) ? <ConceptCardView card={cardForStep(step.id)!} compact /> : null}
      {experimentForStep(step.id) ? <ExperimentStatus session={session} /> : null}
      {step.id === "b5-reveal" ? <ExperimentReveal session={session} /> : null}
      {drillSetForStep(step.id) ? <DrillScreen set={drillSetForStep(step.id)!} session={session} me={null} act={act} facilitator /> : null}
      {step.id === "b4-rule" || step.id === "b9-mistakes" ? <RulesOverview session={session} /> : null}
      {step.id === "b9-cross" ? <CrossCase session={session} me={null} act={act} /> : null}
      {step.id === "b9-overconf" ? <OverconfidenceReveal session={session} /> : null}

      {step.kind === "sprint" && sprint ? <SprintCard sprint={sprint} session={session} compact /> : null}
      {step.kind === "quiz" && sprint ? <QuizStatusPanel sprint={sprint} session={session} act={act} /> : null}

      <Card>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <Label>
              Day {block.day} · {block.time}
            </Label>
            <h1 className="text-2xl font-bold">
              {block.number === "Lunch" ? "Lunch" : `Block ${block.number} · ${block.title}`}
            </h1>
          </div>
        </div>
        <ol className="mt-3 flex flex-col gap-1">
          {block.steps.map((s, i) => {
            const current = i === session.step;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => act({ type: "goto", block: session.block, step: i })}
                  className={`w-full min-h-12 flex items-center gap-3 rounded-lg px-3 text-left ${
                    current ? "bg-accent text-accent-fg font-semibold" : "hover:bg-soft"
                  }`}
                >
                  <span className={`tabular w-5 text-sm ${current ? "" : "text-muted"}`}>{i + 1}</span>
                  <span className="flex-1">{s.label}</span>
                  {s.minutes ? (
                    <span className={`tabular text-sm ${current ? "" : "text-muted"}`}>{s.minutes} min</span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Button onClick={() => act({ type: "prev" })} disabled={session.block === 0 && session.step === 0}>
            ← Previous
          </Button>
          <Button variant="primary" onClick={() => act({ type: "next" })}>
            Next step →
          </Button>
        </div>
      </Card>

      <Card>
        <Label>Who is in</Label>
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {PEOPLE.map((p) => {
            const j = session.joined[p.id];
            const read = j?.prework.filter(Boolean).length ?? 0;
            return (
              <li
                key={p.id}
                className={`rounded-xl border px-3 py-2 text-center ${
                  j ? "border-accent bg-soft" : "border-line opacity-60"
                }`}
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted">{j ? `pre-work ${read}/2` : "not joined"}</div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Agenda session={session} act={act} />

      <Card className="flex flex-col gap-3">
        <Label>Tools</Label>
        <div className="flex flex-wrap gap-3">
          <Button href="/">Join screen</Button>
          <Button href="/me">My screen</Button>
        </div>
        <ExportCard />
        <DangerZone act={act} />
      </Card>
    </Page>
  );
}

function Agenda({ session, act }: { session: Session; act: (a: Action) => void }) {
  const days: (1 | 2)[] = [1, 2];
  return (
    <Card>
      <Label>Agenda</Label>
      <div className="mt-2 md:grid md:grid-cols-2 md:gap-4">
        {days.map((day) => (
          <div key={day}>
            <div className="font-semibold mt-2 mb-1">
              Day {day} · {day === 1 ? "claiming, creating, investigating" : "biases, influence, capstone"}
            </div>
            <ul className="flex flex-col gap-1">
              {AGENDA.map((b, i) =>
                b.day === day ? (
                  <AgendaRow
                    key={b.id}
                    block={b}
                    index={i}
                    current={i === session.block}
                    onPick={() => act({ type: "goto", block: i, step: 0 })}
                  />
                ) : null,
              )}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AgendaRow({
  block,
  index,
  current,
  onPick,
}: {
  block: Block;
  index: number;
  current: boolean;
  onPick: () => void;
}) {
  const lunch = block.number === "Lunch";
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className={`w-full min-h-12 rounded-lg px-3 py-2 text-left flex gap-3 items-start ${
          current ? "bg-soft border border-accent" : "hover:bg-soft"
        } ${lunch ? "opacity-70" : ""}`}
        aria-current={current ? "step" : undefined}
        data-block={index}
      >
        <span className="tabular text-sm text-muted w-24 shrink-0 pt-0.5">{block.time}</span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold">
            {lunch ? "Lunch" : `${block.number} · ${block.title}`}
          </span>
          {block.summary ? <span className="block text-sm text-muted">{block.summary}</span> : null}
        </span>
      </button>
    </li>
  );
}

function DangerZone({ act }: { act: (a: Action) => void }) {
  const [arm, setArm] = useState(false);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {!arm ? (
        <Button variant="danger" size="sm" onClick={() => setArm(true)}>
          Reset session…
        </Button>
      ) : (
        <>
          <span className="text-sm text-warn">Wipes the whole day. Sure?</span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              act({ type: "reset" });
              setArm(false);
            }}
          >
            Yes, reset
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              act({ type: "reset", demo: true });
              setArm(false);
            }}
          >
            Start demo session
          </Button>
          <Button size="sm" onClick={() => setArm(false)}>
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
