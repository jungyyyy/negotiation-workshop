"use client";

import type { ConceptCard as CardData } from "@/lib/cards";
import { Card, Label } from "./ui";

export function ConceptCardView({ card, compact = false }: { card: CardData; compact?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <Card className="border-accent">
        <Label>Concept card {card.number}</Label>
        <h2 className="text-2xl font-bold mt-1 leading-tight">{card.title}</h2>
        <p className="mt-3 rounded-xl bg-soft p-3 font-semibold leading-snug">{card.rule}</p>
      </Card>
      {!compact ? (
        <div className="grid gap-3 md:grid-cols-2">
          {card.sections.map((s) => (
            <Card key={s.heading}>
              <h3 className="font-bold">{s.heading}</h3>
              <p className="mt-1 leading-relaxed">{s.body}</p>
            </Card>
          ))}
        </div>
      ) : (
            <Card>
              <ul className="flex flex-col gap-1 text-sm">
                {card.sections.map((s) => (
                  <li key={s.heading} className="font-semibold">
                    {s.heading}
                  </li>
                ))}
              </ul>
            </Card>
          )}
      <Card className="text-sm text-muted">
        <span className="font-semibold text-fg">Read: </span>
        {card.read}
      </Card>
    </div>
  );
}
