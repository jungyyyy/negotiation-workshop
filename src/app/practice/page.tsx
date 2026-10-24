"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/client";
import { SCENARIOS } from "@/lib/scenarios";
import { practiceSummary } from "@/lib/practiceSummary";
import { Button, Card, Label, Page, Spinner } from "@/components/ui";

export default function PracticePage() {
  const { session, act } = useSession();
  const router = useRouter();
  const [scenarioId, setScenarioId] = useState("R1");
  const [side, setSide] = useState<"seller" | "buyer">("seller");
  const [starting, setStarting] = useState(false);
  if (!session) return <Spinner />;
  const list = [...(session.practice[session.me] ?? [])].reverse();

  const start = async () => {
    setStarting(true);
    await act({ type: "practice.start", person: session.me, scenarioId, side });
    setStarting(false);
  };

  // After starting, the newest round is first in the reversed list; open it.
  const newest = list[0];

  return (
    <Page className="pt-6 flex flex-col gap-4">
      <header className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-semibold text-accent uppercase tracking-wide">Practice</div>
          <h1 className="text-3xl font-bold leading-tight">Negotiate against an AI counterpart</h1>
          <p className="text-muted mt-1">Any time, on your own. Same prep form, same scoring, same reveal, plus a transcript debrief.</p>
        </div>
      </header>

      <Card>
        <Label>New practice round</Label>
        <div className="mt-2 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
          <div>
            <div className="text-sm font-semibold mb-1">Scenario</div>
            <div className="flex flex-wrap gap-2">
              {SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  type="button"
                  aria-pressed={scenarioId === sc.id}
                  onClick={() => setScenarioId(sc.id)}
                  className={`min-h-11 px-3 rounded-xl border text-sm font-semibold ${scenarioId === sc.id ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"}`}
                >
                  {sc.id} · {sc.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold mb-1">You play</div>
            <div className="grid grid-cols-2 gap-2">
              {(["seller", "buyer"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={side === s}
                  onClick={() => setSide(s)}
                  className={`min-h-11 px-4 rounded-xl border text-sm font-semibold ${side === s ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={() => void start()} disabled={starting}>
            {starting ? "Starting…" : "Start"}
          </Button>
        </div>
        {newest && Date.now() - newest.createdAt < 10_000 && newest.status !== "revealed" ? (
          <Button variant="primary" className="mt-3" onClick={() => router.push(`/practice/${newest.id}`)}>
            Open the new round →
          </Button>
        ) : null}
      </Card>

      <Card>
        <Label>Your practice rounds · {list.length}</Label>
        {list.length === 0 ? <p className="text-muted mt-1 text-sm">None yet.</p> : null}
        <ul className="mt-2 flex flex-col gap-2">
          {list.map((pr) => {
            const sc = SCENARIOS.find((x) => x.id === pr.scenarioId);
            return (
              <li key={pr.id}>
                <a href={`/practice/${pr.id}`} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2 hover:bg-soft">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">
                      {pr.scenarioId} · {sc?.title} · as {pr.side}
                    </div>
                    <div className="text-sm text-muted">
                      {new Date(pr.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {practiceSummary(pr)}
                      {pr.debrief ? " · debriefed" : ""}
                    </div>
                  </div>
                  <span className={`text-xs uppercase tracking-wide rounded-full px-2 py-1 ${pr.status === "revealed" ? "bg-soft" : "bg-accent text-accent-fg"}`}>{pr.status}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="flex gap-3 justify-center text-sm">
        <Button variant="ghost" size="sm" href="/me">
          My screen
        </Button>
        <Button variant="ghost" size="sm" href="/">
          Home
        </Button>
      </div>
    </Page>
  );
}
