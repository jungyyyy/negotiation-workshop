"use client";

import { useCallback, useEffect, useState } from "react";
import type { Action, Person, Session, Timer } from "./types";
import { PEOPLE } from "./types";

const ME_KEY = "nw.person";
const PASS_KEY = "nw.passcode";
export const PASS_HEADER = "x-passcode";
export const UNAUTH_EVENT = "nw:unauthorized";
const POLL_MS = 2000;

export function getPasscode(): string {
  try {
    return localStorage.getItem(PASS_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setPasscode(v: string) {
  try {
    if (v) localStorage.setItem(PASS_KEY, v);
    else localStorage.removeItem(PASS_KEY);
  } catch {
    /* ignore */
  }
}

/** fetch with the passcode header; a 401 locks the app again. */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const pass = getPasscode();
  if (pass) headers.set(PASS_HEADER, pass);
  const r = await fetch(url, { ...init, headers, cache: "no-store" });
  if (r.status === 401) window.dispatchEvent(new Event(UNAUTH_EVENT));
  return r;
}

/** Shared session state, polled every two seconds. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
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
