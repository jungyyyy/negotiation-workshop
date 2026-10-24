"use client";

import { useCallback, useEffect, useState } from "react";
import type { Action, Person, Session, Timer } from "./types";
import { PEOPLE } from "./types";

const ME_KEY = "nw.person";

/** Live session state over SSE, falling back to 2 s polling. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;

    const fetchOnce = async () => {
      try {
        const r = await fetch("/api/session", { cache: "no-store" });
        if (r.ok) setSession(await r.json());
      } catch {
        /* offline */
      }
    };

    const startPoll = () => {
      if (poll) return;
      void fetchOnce();
      poll = setInterval(fetchOnce, 2000);
    };

    const connect = () => {
      if (stopped) return;
      es = new EventSource("/api/events");
      es.onopen = () => {
        setLive(true);
        if (poll) {
          clearInterval(poll);
          poll = null;
        }
      };
      es.onmessage = (e) => setSession(JSON.parse(e.data));
      es.onerror = () => {
        setLive(false);
        es?.close();
        es = null;
        startPoll();
        retry = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      stopped = true;
      es?.close();
      if (poll) clearInterval(poll);
      if (retry) clearTimeout(retry);
    };
  }, []);

  const act = useCallback(async (action: Action) => {
    const r = await fetch("/api/session/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(action),
    });
    if (r.ok) setSession(await r.json());
  }, []);

  return { session, act, live };
}

/** Which person this device belongs to (localStorage). */
export function useMe(): {
  me: Person | null;
  setMe: (p: Person | null) => void;
  ready: boolean;
} {
  const [me, setMeState] = useState<Person | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(ME_KEY);
      if (v && PEOPLE.some((p) => p.id === v)) setMeState(v as Person);
    } catch {
      /* private mode */
    }
    setReady(true);
  }, []);

  const setMe = useCallback((p: Person | null) => {
    setMeState(p);
    try {
      if (p) localStorage.setItem(ME_KEY, p);
      else localStorage.removeItem(ME_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return { me, setMe, ready };
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

export function useJoinInfo() {
  const [info, setInfo] = useState<{ url: string; qr: string } | null>(null);
  useEffect(() => {
    fetch("/api/join-info", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setInfo(d))
      .catch(() => {});
  }, []);
  return info;
}
