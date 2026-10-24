"use client";

import { useCallback, useEffect, useState } from "react";
import type { Action, Timer, View } from "./types";

export const UNAUTH_EVENT = "nw:unauthorized";
const POLL_MS = 2000;

/** fetch for the API; a 401 locks the app back to the sign-in screen. */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const r = await fetch(url, { ...init, cache: "no-store" });
  if (r.status === 401) window.dispatchEvent(new Event(UNAUTH_EVENT));
  return r;
}

export async function signOut() {
  await fetch("/api/auth/signout", { method: "POST" });
  window.dispatchEvent(new Event(UNAUTH_EVENT));
}

/** Shared session state, polled every two seconds. */
export function useSession() {
  const [session, setSession] = useState<View | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async () => {
      try {
        const r = await apiFetch("/api/session");
        if (r.ok) {
          setSession(await r.json());
          setLive(true);
        } else if (r.status !== 401) {
          setLive(false);
        }
      } catch {
        setLive(false);
      }
      if (!stopped) timer = setTimeout(tick, document.hidden ? POLL_MS * 3 : POLL_MS);
    };
    void tick();

    const onVisible = () => {
      if (!document.hidden && !stopped) {
        if (timer) clearTimeout(timer);
        void tick();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const act = useCallback(async (action: Action) => {
    const r = await apiFetch("/api/session/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action),
    });
    if (r.ok) setSession(await r.json());
  }, []);

  return { session, act, live };
}

export function useNow(intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function timerRemaining(t: Timer, now: number): number {
  if (t.endsAt != null) return Math.max(0, t.endsAt - now);
  return Math.max(0, t.remainingMs);
}

export function fmtMs(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Download an authenticated API response as a file. */
export async function downloadFile(url: string, filename: string) {
  const r = await apiFetch(url);
  if (!r.ok) return;
  const blob = await r.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
