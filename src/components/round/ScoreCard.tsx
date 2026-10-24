"use client";

import type { Scenario } from "@/lib/scenarios";
import { personName, type FrontierDeal, type Round } from "@/lib/types";
import { Card, Label } from "../ui";
import { Collapsible } from "./Sheet";

const pct = (x: number) => `${Math.round(x * 100)}%`;
const eur = (n: number) => `€${n.toLocaleString("en")}`;

export function ScoreCard({
  scenario,
  round,
  names,
}: {
  scenario: Scenario;
  round: Pick<Round, "scores"> & Partial<Pick<Round, "roles">>;
  /** Display names when there are no live roles (practice rounds). */
  names?: { seller: string; buyer: string };
}) {
  // Scores are computed on the server at reveal, from the confidential tables.
  const s = round.scores;
  if (!s) return null;
  const sellerName = names?.seller ?? (round.roles ? personName(round.roles.seller) : "Seller");
  const buyerName = names?.buyer ?? (round.roles ? personName(round.roles.buyer) : "Buyer");

  if (s.kind === "single") {
    const width = s.buyerRv - s.sellerRv;
    const pos = s.price != null ? Math.min(1, Math.max(0, (s.price - s.sellerRv) / width)) : null;
    return (
      <Card>
        <Label>Scoring · share of the ZOPA</Label>
        <div className="mt-3 relative h-10">
          <div className="absolute inset-x-0 top-4 h-2 rounded-full bg-line" />
          {pos != null ? (
            <>
              <div className="absolute top-4 h-2 rounded-l-full bg-accent" style={{ left: 0, width: `${pos * 100}%` }} />
              <div
                className="absolute top-1 h-8 w-1 rounded bg-fg"
                style={{ left: `calc(${pos * 100}% - 2px)` }}
                aria-label="agreed price"
              />
            </>
          ) : null}
          <div className="absolute left-0 top-7 text-xs text-muted tabular">{eur(s.sellerRv)}</div>
          <div className="absolute right-0 top-7 text-xs text-muted tabular">{eur(s.buyerRv)}</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <Tile title={`${sellerName} · seller`} big={s.sellerShare != null ? pct(s.sellerShare) : "—"} sub={`walks below ${eur(s.sellerRv)}`} />
          <Tile title={`${buyerName} · buyer`} big={s.buyerShare != null ? pct(s.buyerShare) : "—"} sub={`walks above ${eur(s.buyerRv)}`} />
        </div>
        <p className="text-sm text-muted mt-3">
          {s.price == null
            ? `No deal. The ZOPA was ${eur(width)} wide, from ${eur(s.sellerRv)} to ${eur(s.buyerRv)}. Both sides left with their BATNA.`
            : s.inZopa
              ? `Agreed at ${eur(s.price)} ${s.unit}. The ZOPA ran from ${eur(s.sellerRv)} to ${eur(s.buyerRv)}, ${eur(width)} of value to split.`
              : `Agreed at ${eur(s.price)}, which is outside the ZOPA (${eur(s.sellerRv)}–${eur(s.buyerRv)}). One side accepted a deal worse than its BATNA.`}
        </p>
      </Card>
    );
  }

  if (s.kind === "points") {
    return (
      <div className="flex flex-col gap-3">
        <Card>
          <Label>Scoring · points</Label>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <Tile
              title={`${sellerName} · seller`}
              big={s.seller != null ? String(s.seller) : "—"}
              sub={`BATNA ${s.sellerBatna}${s.beatsBatna ? (s.beatsBatna.seller ? " · beaten" : " · NOT beaten") : ""}`}
              warn={s.beatsBatna ? !s.beatsBatna.seller : false}
            />
            <Tile
              title={`${buyerName} · buyer`}
              big={s.buyer != null ? String(s.buyer) : "—"}
              sub={`BATNA ${s.buyerBatna}${s.beatsBatna ? (s.beatsBatna.buyer ? " · beaten" : " · NOT beaten") : ""}`}
              warn={s.beatsBatna ? !s.beatsBatna.buyer : false}
            />
            <Tile title="Joint points" big={s.joint != null ? String(s.joint) : "—"} sub={`max possible ${s.maxJoint}`} />
            <Tile
              title="Left on the table"
              big={s.leftOnTable != null ? String(s.leftOnTable) : "—"}
              sub={s.joint == null ? "no deal" : s.onFrontier ? "on the Pareto frontier" : "not Pareto-efficient"}
              warn={s.leftOnTable != null && s.leftOnTable > 0}
            />
          </div>
          {s.joint != null && s.leftOnTable != null ? (
            <div className="mt-3 h-2 rounded-full bg-line overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${(s.joint / s.maxJoint) * 100}%` }} />
            </div>
          ) : null}
        </Card>

        {s.improvements.length > 0 ? (
          <Card className="border-warn">
            <Label>Both of you could have had more</Label>
            <p className="text-sm text-muted mt-1">
              Frontier deals that leave neither side worse off than what you signed.
            </p>
            <FrontierTable scenario={scenario} deals={s.improvements.slice(0, 6)} sellerName={sellerName} buyerName={buyerName} />
          </Card>
        ) : null}

        <Collapsible
          title={`Pareto frontier · ${s.frontier.length} deals`}
          subtitle="Efficient deals that beat both BATNAs, best for the seller first"
        >
          <FrontierTable scenario={scenario} deals={s.frontier} sellerName={sellerName} buyerName={buyerName} />
        </Collapsible>
      </div>
    );
  }

  if (s.kind === "investigation") {
    return (
      <Card className={s.found ? "border-accent" : "border-warn"}>
        <Label>Scoring · investigation</Label>
        <div className="mt-2 text-2xl font-bold">{s.found ? "Found the real interest" : "Did not find the real interest"}</div>
        <dl className="mt-2 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="text-muted">Minutes on the clock</dt>
          <dd className="tabular font-semibold">{s.minutes ?? "—"}</dd>
          <dt className="text-muted">The question that unlocked it</dt>
          <dd className="font-semibold">{s.question || "—"}</dd>
          <dt className="text-muted">Concessions given</dt>
          <dd className={`font-semibold ${s.concessions ? "text-warn" : ""}`}>{s.concessions || "none"}</dd>
        </dl>
      </Card>
    );
  }

  return (
    <Card className={s.bestAnswer ? "border-accent" : "border-warn"}>
      <Label>Scoring · drill</Label>
      <div className="mt-2 text-2xl font-bold">
        {s.bestAnswer ? "Turned the demand into a trade" : s.bonus ? "Asked for a bonus, but softened the penalty" : "Defended instead of trading"}
      </div>
      <dl className="mt-2 text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted">Penalty agreed</dt>
        <dd className="tabular font-semibold">{s.penalty != null ? eur(s.penalty) : "—"}</dd>
        <dt className="text-muted">Bonus for fast delivery</dt>
        <dd className="font-semibold">{s.bonus ? "yes" : "no"}</dd>
      </dl>
    </Card>
  );
}

function Tile({ title, big, sub, warn = false }: { title: string; big: string; sub: string; warn?: boolean }) {
  return (
    <div className={`rounded-xl p-2 ${warn ? "bg-warn/10" : "bg-soft"}`}>
      <div className="text-xs text-muted">{title}</div>
      <div className={`tabular text-2xl font-bold ${warn ? "text-warn" : ""}`}>{big}</div>
      <div className="text-xs text-muted">{sub}</div>
    </div>
  );
}

function FrontierTable({
  scenario,
  deals,
  sellerName,
  buyerName,
}: {
  scenario: Scenario;
  deals: FrontierDeal[];
  sellerName: string;
  buyerName: string;
}) {
  // Option labels come from the public deal fields; the points stay on the server.
  const issues = scenario.dealFields.filter((f) => f.type === "select");
  const label = (key: string, value: string) => {
    const f = issues.find((i) => i.key === key);
    return f && f.type === "select" ? (f.options.find((o) => o.value === value)?.label ?? value) : value;
  };
  return (
    <ul className="mt-2 flex flex-col gap-2">
      {deals.map((d, n) => (
        <li key={n} className="rounded-xl border border-line p-2 flex items-center gap-3">
          <div className="flex-1 flex flex-wrap gap-1">
            {Object.entries(d.deal).map(([k, v]) => (
              <span key={k} className="rounded-md bg-soft px-2 py-0.5 text-xs">
                {label(k, v)}
              </span>
            ))}
          </div>
          <div className="tabular text-right text-sm shrink-0">
            <div>
              <span className="text-muted">{sellerName.slice(0, 1)}</span> {d.seller} · <span className="text-muted">{buyerName.slice(0, 1)}</span> {d.buyer}
            </div>
            <div className="font-semibold">{d.joint} joint</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
