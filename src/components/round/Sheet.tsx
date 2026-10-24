"use client";

import type { ReactNode } from "react";
import type { PointsTable, Scenario } from "@/lib/scenarios";
import type { Role } from "@/lib/types";
import { Label } from "../ui";

export function Collapsible({
  title,
  subtitle,
  defaultOpen = false,
  tone = "card",
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  tone?: "card" | "soft" | "accent" | "warn";
  children: ReactNode;
}) {
  const border = { card: "border-line", soft: "border-line bg-soft", accent: "border-accent", warn: "border-warn" }[tone];
  return (
    <details open={defaultOpen} className={`group rounded-2xl border bg-card ${border}`}>
      <summary className="list-none cursor-pointer select-none min-h-12 px-4 py-3 flex items-center gap-3">
        <span className="flex-1 min-w-0">
          <span className="block font-semibold">{title}</span>
          {subtitle ? <span className="block text-sm text-muted">{subtitle}</span> : null}
        </span>
        <span className="text-muted transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}

export function Paragraphs({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 leading-relaxed ${className}`}>
      {items.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

export function PointsTableView({
  table,
  side,
  highlight,
}: {
  table: PointsTable;
  side: "seller" | "buyer" | "both";
  highlight?: Record<string, unknown>;
}) {
  return (
    <div className="mt-3">
      <Label>Your points{side === "both" ? " · both sides" : ""}</Label>
      <div className="mt-1 overflow-x-auto">
        <table className="w-full text-sm tabular">
          <thead>
            <tr className="text-muted text-left">
              <th className="py-1 pr-2 font-semibold">Issue</th>
              <th className="py-1 pr-2 font-semibold">Option</th>
              {side === "both" ? (
                <>
                  <th className="py-1 pr-2 text-right font-semibold">Seller</th>
                  <th className="py-1 text-right font-semibold">Buyer</th>
                </>
              ) : (
                <th className="py-1 text-right font-semibold">Points</th>
              )}
            </tr>
          </thead>
          <tbody>
            {table.issues.map((issue) =>
              issue.options.map((o, i) => {
                const hit = highlight && String(highlight[issue.key]) === o.value;
                return (
                  <tr key={issue.key + o.value} className={`border-t border-line ${hit ? "bg-soft font-semibold" : ""}`}>
                    <td className="py-1 pr-2 text-muted">{i === 0 ? issue.label : ""}</td>
                    <td className="py-1 pr-2">{o.label}</td>
                    {side === "both" ? (
                      <>
                        <td className="py-1 pr-2 text-right">{o.seller}</td>
                        <td className="py-1 text-right">{o.buyer}</td>
                      </>
                    ) : (
                      <td className="py-1 text-right">{o[side]}</td>
                    )}
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-muted mt-2">
        {side === "seller" ? `Your BATNA is worth ${table.sellerBatna} points.` : null}
        {side === "buyer" ? `Your BATNA is worth ${table.buyerBatna} points.` : null}
        {side === "both" ? `BATNAs: seller ${table.sellerBatna} · buyer ${table.buyerBatna} points.` : null}
      </div>
    </div>
  );
}

export function RoleSheet({
  scenario,
  role,
  defaultOpen = true,
  locked = false,
}: {
  scenario: Scenario;
  role: Exclude<Role, "observer">;
  defaultOpen?: boolean;
  locked?: boolean;
}) {
  const party = role === "seller" ? scenario.sellerParty : scenario.buyerParty;
  const sheet = role === "seller" ? scenario.sellerSheet : scenario.buyerSheet;
  return (
    <Collapsible
      title={`${role === "seller" ? "Seller" : "Buyer"} sheet · ${party}`}
      subtitle={locked ? "Locked until you pass the quiz" : "Confidential"}
      defaultOpen={defaultOpen && !locked}
      tone={locked ? "warn" : "accent"}
    >
      {locked ? (
        <p className="text-muted">Pass the quiz (4 of 5) and this sheet opens.</p>
      ) : (
        <>
          <Paragraphs items={sheet} />
          {scenario.points ? <PointsTableView table={scenario.points} side={role} /> : null}
        </>
      )}
    </Collapsible>
  );
}
