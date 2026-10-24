"use client";

import { useState } from "react";
import { fmtMs, timerRemaining, useNow } from "@/lib/client";
import type { Action, Session } from "@/lib/types";
import { Button, Card, Label } from "./ui";

/** Shared timer controls, used by the facilitator and by the observer during a round. */
export function TimerControls({
  session,
  act,
  title = "Timer",
  showBig = true,
}: {
  session: Session;
  act: (a: Action) => void;
  title?: string;
  showBig?: boolean;
}) {
  const now = useNow();
  const t = session.timer;
  const remaining = timerRemaining(t, now);
  const running = t.endsAt != null;
  const done = running && remaining === 0;
  const [custom, setCustom] = useState("");

  return (
    <Card className={done ? "border-warn" : ""}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <Label>{title}</Label>
          <div className="truncate font-semibold">{t.label}</div>
        </div>
        {showBig ? (
          <div
            className={`tabular text-6xl font-bold leading-none ${
              done ? "text-warn" : running ? "text-accent" : "text-muted"
            }`}
          >
            {fmtMs(remaining)}
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {!running ? (
          remaining > 0 && remaining < t.durationMs ? (
            <Button variant="primary" size="lg" onClick={() => act({ type: "timer.resume" })}>
              Resume
            </Button>
          ) : (
            <Button variant="primary" size="lg" onClick={() => act({ type: "timer.start" })}>
              Start {t.durationMs ? `${Math.round(t.durationMs / 60000)} min` : ""}
            </Button>
          )
        ) : (
          <Button size="lg" onClick={() => act({ type: "timer.pause" })}>
            Pause
          </Button>
        )}
        <Button size="lg" onClick={() => act({ type: "timer.reset" })}>
          Reset
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => act({ type: "timer.adjust", deltaMs: -60_000 })}>
          −1 min
        </Button>
        <Button size="sm" onClick={() => act({ type: "timer.adjust", deltaMs: 60_000 })}>
          +1 min
        </Button>
        <Button size="sm" onClick={() => act({ type: "timer.adjust", deltaMs: 5 * 60_000 })}>
          +5 min
        </Button>
        {session.demo ? (
          <Button size="sm" variant="danger" onClick={() => act({ type: "timer.skip" })}>
            Skip
          </Button>
        ) : null}
        <form
          className="flex items-center gap-2 ml-auto"
          onSubmit={(e) => {
            e.preventDefault();
            const m = Number(custom);
            if (m > 0) {
              act({ type: "timer.start", minutes: m });
              setCustom("");
            }
          }}
        >
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="min"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-16 min-h-10 rounded-lg border border-line bg-card px-2 text-center tabular"
            aria-label="Custom minutes"
          />
          <Button size="sm" type="submit" disabled={!(Number(custom) > 0)}>
            Start
          </Button>
        </form>
      </div>
    </Card>
  );
}
