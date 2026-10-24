"use client";

import { fmtMs, timerRemaining, useNow } from "@/lib/client";
import type { Session } from "@/lib/types";
import { getBlock } from "@/lib/agenda";
import { useEffect, useRef } from "react";

export function TimerBar({ session, size = "md" }: { session: Session; size?: "md" | "lg" }) {
  const now = useNow();
  const t = session.timer;
  const remaining = timerRemaining(t, now);
  const running = t.endsAt != null;
  const done = running && remaining === 0;
  const low = running && remaining > 0 && remaining <= 60_000;
  const block = getBlock(session.block);

  // Buzz the phone once when a running timer hits zero.
  const buzzed = useRef(false);
  useEffect(() => {
    if (done && !buzzed.current) {
      buzzed.current = true;
      try {
        navigator.vibrate?.([200, 100, 200]);
      } catch {
        /* unsupported */
      }
    }
    if (!done) buzzed.current = false;
  }, [done]);

  const numCls = size === "lg" ? "text-6xl" : "text-3xl";

  return (
    <div
      className={`sticky top-0 z-20 safe-top border-b border-line backdrop-blur ${
        done ? "bg-warn text-white" : "bg-bg/90"
      }`}
    >
      <div className="max-w-md md:max-w-3xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-xs font-semibold uppercase tracking-wide ${done ? "text-white/80" : "text-muted"}`}>
            {session.demo ? <span className="text-warn">DEMO · </span> : null}
            {block.number === "Lunch" ? "Lunch" : `Block ${block.number}`} · {block.title}
          </div>
          <div className="truncate text-sm">{t.label}</div>
        </div>
        <div
          className={`tabular font-bold leading-none ${numCls} ${
            done ? "" : low ? "text-warn" : running ? "text-accent" : "text-muted"
          }`}
          aria-live="polite"
        >
          {t.durationMs === 0 && !running ? "—" : fmtMs(remaining)}
        </div>
      </div>
    </div>
  );
}
