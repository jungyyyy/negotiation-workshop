"use client";

import { timerRemaining, useNow } from "@/lib/client";
import { BOOKS, PASS_MARK, pageCount, pageLabel, type Sprint } from "@/lib/sprints";
import type { Session } from "@/lib/types";
import { Card, Label } from "./ui";

export function SprintCard({ sprint, session, compact = false }: { sprint: Sprint; session: Session; compact?: boolean }) {
  const now = useNow(1000);
  const t = session.timer;
  const remaining = timerRemaining(t, now);
  const started = t.endsAt != null || t.remainingMs < t.durationMs;
  const over = started && remaining === 0;
  const total = sprint.readings.reduce((n, r) => n + pageCount(r), 0);

  return (
    <div className="flex flex-col gap-3">
      {over ? (
        <div className="rounded-2xl bg-warn text-white p-4 text-center">
          <div className="text-2xl font-bold">Time. Put the book down.</div>
          <div className="text-sm opacity-90 mt-1">Whatever you did not finish is covered by the concept card.</div>
        </div>
      ) : !started ? (
        <div className="rounded-2xl bg-soft p-3 text-sm text-center">
          Hard stop at {sprint.minutes} minutes. The facilitator starts the clock.
        </div>
      ) : null}

      <Card>
        <Label>Read now · {total} pages</Label>
        <ol className="mt-2 flex flex-col gap-3">
          {sprint.readings.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="tabular shrink-0 h-7 w-7 rounded-full bg-soft flex items-center justify-center text-sm font-bold">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="font-semibold leading-snug">
                  {BOOKS[r.book].title} · {r.chapter}
                </div>
                <div className={compact ? "text-sm" : ""}>{r.title}</div>
                <div className="tabular text-accent font-semibold mt-0.5">
                  {pageLabel(r)} <span className="text-muted font-normal">· {pageCount(r)} pages</span>
                </div>
                {r.stopAt ? <div className="text-sm text-warn mt-1">{r.stopAt}</div> : null}
                {r.priority && !compact ? <div className="text-sm text-muted mt-1">{r.priority}</div> : null}
              </div>
            </li>
          ))}
        </ol>
        {sprint.order && !compact ? <p className="text-sm text-muted mt-3">{sprint.order}</p> : null}
      </Card>

      {!compact ? (
        <Card className="text-sm text-muted">
          <div className="text-fg font-semibold">Then: a five-question quiz</div>
          Pass {PASS_MARK} of 5 to unlock your role sheet. If you fail, you see the page to re-read and get one retry.
          <div className="mt-2 text-xs">
            Page numbers: {BOOKS.ng.short} = {BOOKS.ng.pageNote}; {BOOKS.gty.short} = {BOOKS.gty.pageNote}.
          </div>
        </Card>
      ) : null}
    </div>
  );
}
