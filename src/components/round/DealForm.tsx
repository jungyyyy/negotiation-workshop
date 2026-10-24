"use client";

import { useState } from "react";
import type { Scenario } from "@/lib/scenarios";
import type { Action, Deal, DealValue, Round } from "@/lib/types";
import { Button, Card, Label } from "../ui";

export function DealForm({
  scenario,
  round,
  act,
  onSubmit,
  submitLabel,
}: {
  scenario: Scenario;
  round: Pick<Round, "id" | "deal" | "noDeal" | "status">;
  act?: (a: Action) => void;
  /** Override where the deal goes (practice rounds). Defaults to the live round action. */
  onSubmit?: (deal: Deal, noDeal: boolean) => void;
  submitLabel?: string;
}) {
  const [deal, setDeal] = useState<Deal>(() => ({ ...(round.deal ?? {}) }));
  const [noDeal, setNoDeal] = useState(!!round.noDeal);

  const missing = noDeal
    ? []
    : scenario.dealFields.filter((f) => f.required && (deal[f.key] === undefined || deal[f.key] === ""));

  const set = (k: string, v: DealValue) => setDeal({ ...deal, [k]: v });

  return (
    <Card>
      <Label>Deal · entered by the observer</Label>
      <form
        className="mt-2 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (missing.length) return;
          if (onSubmit) onSubmit(deal, noDeal);
          else act?.({ type: "round.submit", roundId: round.id, deal, noDeal });
        }}
      >
        <label className="flex items-center gap-3 min-h-12 rounded-xl border border-line px-3">
          <input type="checkbox" checked={noDeal} onChange={(e) => setNoDeal(e.target.checked)} className="h-5 w-5" />
          <span className="font-semibold">No deal (impasse)</span>
        </label>

        {!noDeal
          ? scenario.dealFields.map((f) => (
              <div key={f.key}>
                <div className="text-sm font-semibold mb-1">
                  {f.label}
                  {f.required ? <span className="text-warn"> *</span> : null}
                </div>
                {f.type === "number" ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      min={f.min}
                      max={f.max}
                      step={f.step}
                      value={deal[f.key] === undefined ? "" : String(deal[f.key])}
                      onChange={(e) => set(f.key, e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-40 min-h-12 rounded-xl border border-line bg-bg px-3 tabular"
                    />
                    {f.unit ? <span className="text-muted">{f.unit}</span> : null}
                  </div>
                ) : f.type === "select" ? (
                  <div className="flex flex-wrap gap-2">
                    {f.options.map((o) => {
                      const on = deal[f.key] === o.value;
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => set(f.key, o.value)}
                          aria-pressed={on}
                          className={`min-h-11 px-3 rounded-xl border text-sm font-semibold ${
                            on ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"
                          }`}
                        >
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                ) : f.type === "boolean" ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[true, false].map((v) => {
                      const on = deal[f.key] === v;
                      return (
                        <button
                          key={String(v)}
                          type="button"
                          onClick={() => set(f.key, v)}
                          aria-pressed={on}
                          className={`min-h-11 rounded-xl border text-sm font-semibold ${
                            on ? "bg-accent text-accent-fg border-accent" : "border-line bg-card"
                          }`}
                        >
                          {v ? "Yes" : "No"}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    placeholder={f.placeholder}
                    value={deal[f.key] === undefined ? "" : String(deal[f.key])}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full rounded-xl border border-line bg-bg px-3 py-2"
                  />
                )}
              </div>
            ))
          : null}

        <Button type="submit" variant="primary" size="lg" disabled={missing.length > 0}>
          {submitLabel ?? (round.status === "submitted" ? "Update deal" : "Submit deal")}
        </Button>
        {missing.length ? <p className="text-xs text-muted text-center">Fill the starred fields.</p> : null}
      </form>
    </Card>
  );
}

export function DealSummary({ scenario, round }: { scenario: Scenario; round: Pick<Round, "deal" | "noDeal"> }) {
  if (round.noDeal) return <div className="text-xl font-bold text-warn">No deal</div>;
  const deal = round.deal ?? {};
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
      {scenario.dealFields.map((f) => {
        const v = deal[f.key];
        if (v === undefined || v === "") return null;
        let shown: string;
        if (f.type === "select") shown = f.options.find((o) => o.value === v)?.label ?? String(v);
        else if (f.type === "boolean") shown = v ? "Yes" : "No";
        else if (f.type === "number") shown = `${f.unit?.startsWith("€") ? "€" : ""}${Number(v).toLocaleString("en")}${f.unit && !f.unit.startsWith("€") ? ` ${f.unit}` : f.unit?.includes("/") ? f.unit.slice(1) : ""}`;
        else shown = String(v);
        return (
          <div key={f.key} className="contents">
            <dt className="text-muted">{f.label}</dt>
            <dd className="font-semibold">{shown}</dd>
          </div>
        );
      })}
    </dl>
  );
}
