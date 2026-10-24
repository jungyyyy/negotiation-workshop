"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client";
import { getScenario, roleLabel } from "@/lib/scenarios";
import { personName, type Action, type PracticeRound, type View } from "@/lib/types";
import { Button, Card, Label } from "../ui";
import { PrepFormBase } from "../round/PrepForm";
import { DealForm, DealSummary } from "../round/DealForm";
import { ScoreCard } from "../round/ScoreCard";
import { Collapsible, Paragraphs, PointsTableView, RoleSheet } from "../round/Sheet";
import { DebriefPanel } from "../DebriefPanel";

const SOFT_LIMIT = 40;

export function PracticeScreen({
  session,
  pr,
  act,
  onView,
}: {
  session: View;
  pr: PracticeRound;
  act: (a: Action) => Promise<void> | void;
  onView: (v: View) => void;
}) {
  const router = useRouter();
  const scenario = getScenario(pr.scenarioId);
  const access = session.practiceAccess[pr.id] ?? { role: pr.side, sheets: {} };
  const me = session.me;
  if (!scenario) return <Card>Unknown scenario.</Card>;
  const aiSide = pr.side === "seller" ? "buyer" : "seller";
  const myName = personName(me);
  const aiName = aiSide === "seller" ? scenario.sellerParty : scenario.buyerParty;
  const names = { seller: pr.side === "seller" ? myName : aiName, buyer: pr.side === "buyer" ? myName : aiName };

  const resetAndRetry = async () => {
    if (pr.status !== "revealed") await act({ type: "practice.delete", id: pr.id, person: me });
    await act({ type: "practice.start", person: me, scenarioId: pr.scenarioId, side: pr.side });
    router.push("/practice");
  };

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <Label>Practice · {pr.id}</Label>
        <h1 className="text-2xl font-bold mt-1">{scenario.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-accent text-accent-fg px-3 py-1 font-semibold">You: {roleLabel(pr.side, scenario)}</span>
          <span className="rounded-full bg-soft px-3 py-1 text-muted">AI plays the {aiSide} · {aiName}</span>
        </div>
      </Card>

      {pr.status !== "revealed" ? (
        <>
          <Collapsible title="Public brief" subtitle="Both sides see this" defaultOpen={pr.status === "prep"}>
            <Paragraphs items={scenario.publicBrief} />
          </Collapsible>
          <RoleSheet scenario={scenario} role={pr.side} sheet={access.sheets[pr.side]} points={access.points} defaultOpen={pr.status === "prep"} />
        </>
      ) : null}

      {pr.status === "prep" ? (
        <PrepFormBase
          scenario={scenario}
          saved={pr.prep}
          canEdit
          onSubmit={(answers) => act({ type: "practice.prep", id: pr.id, person: me, answers })}
        />
      ) : null}

      {pr.status === "chatting" ? <Chat pr={pr} scenario={scenario} aiName={aiName} me={me} act={act} /> : null}

      {pr.status === "revealed" ? (
        <>
          <Card className="border-accent">
            <Label>The deal</Label>
            <div className="mt-2">
              <DealSummary scenario={scenario} round={pr} />
            </div>
          </Card>
          <ScoreCard scenario={scenario} round={pr} names={names} />
          {access.hidden ? (
            <Card className="bg-soft">
              <Label>What was really going on</Label>
              <Paragraphs items={access.hidden} className="mt-1" />
            </Card>
          ) : null}
          {pr.prep && access.truth ? (
            <Card>
              <Label>Your prep next to what was true</Label>
              <dl className="mt-2 flex flex-col gap-2 text-sm">
                {(
                  [
                    ["Own BATNA", pr.prep.batna, pr.side === "seller" ? access.truth.sellerBatna : access.truth.buyerBatna],
                    ["Own reservation value", pr.prep.reservation, pr.side === "seller" ? access.truth.sellerReservation : access.truth.buyerReservation],
                    [`Estimate of the ${aiSide}'s BATNA`, pr.prep.theirBatna, aiSide === "seller" ? access.truth.sellerBatna : access.truth.buyerBatna],
                    [`Estimate of the ${aiSide}'s reservation value`, pr.prep.theirReservation, aiSide === "seller" ? access.truth.sellerReservation : access.truth.buyerReservation],
                    ["Target", pr.prep.target, ""],
                    ["First-offer plan", pr.prep.firstOffer, ""],
                  ] as [string, string, string][]
                ).map(([label, mine, truth]) => (
                  <div key={label} className="rounded-xl border border-line p-2">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-medium whitespace-pre-wrap">{mine || "—"}</dd>
                    {truth ? (
                      <dd className="mt-1 text-accent">
                        <span className="text-xs uppercase tracking-wide font-semibold">Actual · </span>
                        {truth}
                      </dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </Card>
          ) : null}
          {access.sheets[aiSide] ? (
            <Collapsible title={`${aiSide === "seller" ? "Seller" : "Buyer"} sheet · ${aiName}`} subtitle="The counterpart's confidential brief">
              <Paragraphs items={access.sheets[aiSide]!} />
              {access.points?.side === "both" ? <PointsTableView table={access.points.table} side="both" highlight={pr.noDeal ? undefined : pr.deal} /> : null}
            </Collapsible>
          ) : null}
          <Collapsible title={`Transcript · ${pr.messages.length} messages`}>
            <ChatLog pr={pr} myName={myName} aiName={aiName} />
          </Collapsible>

          <DebriefPanel
            practiceId={pr.id}
            debrief={pr.debrief}
            debriefError={pr.debriefError}
            canAnalyze
            auto
            sellerName={names.seller}
            buyerName={names.buyer}
            onView={onView}
          />
        </>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button variant={pr.status === "revealed" ? "primary" : "danger"} onClick={() => void resetAndRetry()}>
          Reset and retry
        </Button>
        <Button href="/practice">All practice rounds</Button>
      </div>
    </div>
  );
}

function ChatLog({ pr, myName, aiName }: { pr: PracticeRound; myName: string; aiName: string }) {
  return (
    <ul className="flex flex-col gap-2">
      {pr.messages.map((m, i) => (
        <li key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === "user" ? "self-end bg-accent text-accent-fg" : "self-start bg-soft"}`}>
          <div className={`text-[10px] uppercase tracking-wide ${m.role === "user" ? "text-accent-fg/80" : "text-muted"}`}>{m.role === "user" ? myName : aiName}</div>
          <div className="whitespace-pre-wrap leading-snug">{m.content}</div>
        </li>
      ))}
    </ul>
  );
}

function Chat({
  pr,
  scenario,
  aiName,
  me,
  act,
}: {
  pr: PracticeRound;
  scenario: NonNullable<ReturnType<typeof getScenario>>;
  aiName: string;
  me: View["me"];
  act: (a: Action) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<{ user: string; ai: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeal, setShowDeal] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const myName = personName(me);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [pr.messages.length, pending?.ai]);

  const send = async () => {
    const text = draft.trim();
    if (!text || pending) return;
    setDraft("");
    setError(null);
    setPending({ user: text, ai: "" });
    try {
      const r = await apiFetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ practiceId: pr.id, message: text }),
      });
      if (!r.ok || !r.body) {
        const body = await r.json().catch(() => ({}));
        setError(body.error ?? `Chat failed (HTTP ${r.status})`);
        setPending(null);
        return;
      }
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setPending({ user: text, ai: acc });
      }
      const warn = acc.indexOf("\n⚠ ");
      if (warn >= 0) setError(acc.slice(warn + 3).trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      // The server stored both turns; the next poll shows them. Clear the local echo shortly after.
      setTimeout(() => setPending(null), 2200);
    }
  };

  const count = pr.messages.length + (pending ? 2 : 0);
  const over = count >= SOFT_LIMIT;

  return (
    <>
      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <Label>Call with {aiName}</Label>
          <span className={`tabular text-xs ${over ? "text-warn font-semibold" : "text-muted"}`}>
            {count}/{SOFT_LIMIT} messages{over ? " · pushing to close" : ""}
          </span>
        </div>
        <ul className="flex flex-col gap-2 max-h-[55vh] overflow-y-auto pr-1">
          {pr.messages.length === 0 && !pending ? (
            <li className="text-sm text-muted">You open the call. Say hello, or ask your first question.</li>
          ) : null}
          {pr.messages.map((m, i) => (
            <li key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 ${m.role === "user" ? "self-end bg-accent text-accent-fg" : "self-start bg-soft"}`}>
              <div className={`text-[10px] uppercase tracking-wide ${m.role === "user" ? "text-accent-fg/80" : "text-muted"}`}>{m.role === "user" ? myName : aiName}</div>
              <div className="whitespace-pre-wrap leading-snug">{m.content}</div>
            </li>
          ))}
          {pending && !pr.messages.some((m) => m.role === "user" && m.content === pending.user && pr.messages[pr.messages.length - 1]?.role === "assistant") ? (
            <>
              <li className="max-w-[85%] self-end rounded-2xl bg-accent text-accent-fg px-3 py-2 opacity-90">
                <div className="text-[10px] uppercase tracking-wide text-accent-fg/80">{myName}</div>
                <div className="whitespace-pre-wrap leading-snug">{pending.user}</div>
              </li>
              <li className="max-w-[85%] self-start rounded-2xl bg-soft px-3 py-2">
                <div className="text-[10px] uppercase tracking-wide text-muted">{aiName}</div>
                <div className="whitespace-pre-wrap leading-snug">{pending.ai.split("\n⚠ ")[0] || <span className="text-muted">…</span>}</div>
              </li>
            </>
          ) : null}
          <div ref={bottom} />
        </ul>
        {error ? <p className="text-sm text-warn font-semibold">⚠ {error}</p> : null}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={pending ? "Waiting for the reply…" : "Say something…"}
            disabled={!!pending}
            className="flex-1 min-h-12 rounded-xl border border-line bg-bg px-3"
          />
          <Button type="submit" variant="primary" disabled={!draft.trim() || !!pending}>
            Send
          </Button>
        </form>
      </Card>

      {!showDeal ? (
        <Button size="lg" onClick={() => setShowDeal(true)} disabled={pr.messages.length === 0}>
          End the call and submit the deal
        </Button>
      ) : (
        <DealForm
          scenario={scenario}
          round={{ id: pr.id, deal: pr.deal, noDeal: pr.noDeal, status: "negotiating" }}
          submitLabel="Submit and reveal"
          onSubmit={(deal, noDeal) => void act({ type: "practice.submit", id: pr.id, person: me, deal, noDeal })}
        />
      )}
    </>
  );
}
