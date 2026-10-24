"use client";

import { useEffect, useState, type ReactNode } from "react";
import { UNAUTH_EVENT } from "@/lib/client";
import { Button, Card, Label, Page } from "./ui";

type State = "checking" | "open" | "locked" | "sent";

/** Magic-link sign-in. Only allowlisted addresses get a link; the server decides. */
export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>("checking");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) {
      setError(authError);
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => !cancelled && setState(r.ok ? "open" : "locked"))
      .catch(() => !cancelled && setState("locked"));
    const relock = () => setState("locked");
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
        {state === "sent" ? (
          <>
            <h1 className="text-2xl font-bold mt-1">Check your email</h1>
            <p className="text-muted mt-2">
              A sign-in link is on its way to <span className="font-semibold text-fg">{email}</span>. Open it on this device.
            </p>
            <Button variant="ghost" size="sm" className="mt-4" onClick={() => setState("locked")}>
              Use a different address
            </Button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mt-1">Sign in</h1>
            <p className="text-sm text-muted mt-1">Enter your Myda email. We send a link; there is no password.</p>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setBusy(true);
                try {
                  const r = await fetch("/api/auth/magic-link", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if (r.ok) setState("sent");
                  else setError((await r.json().catch(() => ({}))).error ?? "Could not send the link");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <input
                type="email"
                autoFocus
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-h-14 rounded-xl border border-line bg-bg px-4 text-lg"
                aria-label="Email"
              />
              <Button type="submit" variant="primary" size="lg" disabled={!email.includes("@") || busy}>
                {busy ? "Sending…" : "Send sign-in link"}
              </Button>
              {error ? <p className="text-sm text-warn text-center">{error}</p> : null}
            </form>
          </>
        )}
      </Card>
    </Page>
  );
}
