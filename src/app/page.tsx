"use client";

import { useMe, useSession } from "@/lib/client";
import { PEOPLE, personName, type Person } from "@/lib/types";
import { Button, Card, Label, Page, Spinner } from "@/components/ui";
import { PreworkChecklist } from "@/components/Prework";

export default function JoinPage() {
  const { session, act } = useSession();
  const { me, setMe, ready } = useMe();

  const pick = (p: Person) => {
    setMe(p);
    void act({ type: "join", person: p });
  };

  return (
    <Page className="pt-10">
      <header className="mb-8">
        <div className="text-sm font-semibold text-accent uppercase tracking-wide">Myda</div>
        <h1 className="text-3xl font-bold leading-tight">Negotiation Workshop</h1>
        <p className="text-muted mt-1">Two days · three founders · one call</p>
      </header>

      <div className="md:grid md:grid-cols-[1fr_280px] md:gap-6 md:items-start">
        <div className="flex flex-col gap-6">
          {!ready || !session ? (
            <Spinner />
          ) : !me ? (
            <Card>
              <Label>Who are you?</Label>
              <p className="text-sm text-muted mt-1 mb-3">Tap your name once. This device will remember it.</p>
              <div className="flex flex-col gap-3">
                {PEOPLE.map((p) => (
                  <Button key={p.id} size="lg" variant="primary" onClick={() => pick(p.id)}>
                    {p.name}
                  </Button>
                ))}
              </div>
            </Card>
          ) : (
            <>
              <Card>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold">Hi {personName(me)}</div>
                  <button
                    type="button"
                    className="text-sm text-muted underline underline-offset-4 min-h-10 px-2"
                    onClick={() => setMe(null)}
                  >
                    Not {personName(me)}?
                  </button>
                </div>
                <p className="text-sm text-muted mt-1">
                  Tick what you have read. The whole group sees it on the facilitator screen.
                </p>
                <div className="mt-4">
                  <PreworkChecklist session={session} me={me} act={act} />
                </div>
              </Card>
              <Button size="lg" variant="primary" href="/me">
                Go to my screen
              </Button>
            </>
          )}

          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Button variant="ghost" size="sm" href="/facilitator">
              Facilitator view
            </Button>
          </div>
        </div>

        <Card className="hidden md:block text-sm text-muted">
          <Label>How this works</Label>
          <p className="mt-2">Everyone opens this same address. Your screen shows only your own role sheet; the observer sees both.</p>
          <p className="mt-2">One of you also keeps the facilitator view open to run the agenda and the timer.</p>
        </Card>
      </div>
    </Page>
  );
}
