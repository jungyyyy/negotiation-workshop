"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getPasscode, setPasscode, UNAUTH_EVENT } from "@/lib/client";
import { Button, Card, Label, Page } from "./ui";

type State = "checking" | "open" | "locked";

/** Asks for the shared passcode once per device; everything behind it is confidential. */
export function PasscodeGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const info = await fetch("/api/auth", { cache: "no-store" }).then((r) => r.json());
        if (cancelled) return;
        if (!info.required) return setState("open");
        const stored = getPasscode();
        if (!stored) return setState("locked");
        const r = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: stored }) });
        if (cancelled) return;
        setState(r.ok ? "open" : "locked");
      } catch {
        if (!cancelled) setState("locked");
      }
    })();
    const relock = () => {
      setPasscode("");
      setState("locked");
      setError("That passcode no longer works.");
    };
    window.addEventListener(UNAUTH_EVENT, relock);
    return () => {
      cancelled = true;
      window.removeEventListener(UNAUTH_EVENT, relock);
    };
  }, []);

  if (state === "open") return <>{children}</>;
  if (state === "checking") return <div className="text-muted text-center py-16">Connecting…</div>;

  return (
    <Page className="pt-16 flex flex-col items-center">
      <Card className="w-full max-w-sm">
        <Label>Myda Negotiation Workshop</Label>
        <h1 className="text-2xl font-bold mt-1">Passcode</h1>
        <p className="text-sm text-muted mt-1">Shared in the call. Asked once per device.</p>
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const r = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ passcode: value }) });
            if (r.ok) {
              setPasscode(value);
              setState("open");
            } else {
              setError("Wrong passcode.");
            }
          }}
        >
          <input
            type="password"
            autoFocus
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full min-h-14 rounded-xl border border-line bg-bg px-4 text-xl tracking-widest"
            aria-label="Passcode"
          />
          <Button type="submit" variant="primary" size="lg" disabled={!value}>
            Enter
          </Button>
          {error ? <p className="text-sm text-warn text-center">{error}</p> : null}
        </form>
      </Card>
    </Page>
  );
}
