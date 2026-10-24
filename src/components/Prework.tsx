"use client";

import { PREWORK, type Person, type Session } from "@/lib/types";
import type { Action } from "@/lib/types";
import { Label } from "./ui";

export function PreworkChecklist({
  session,
  me,
  act,
}: {
  session: Session;
  me: Person;
  act: (a: Action) => void;
}) {
  const done = session.joined[me]?.prework ?? [false, false];
  return (
    <div>
      <Label>Pre-work (about one hour)</Label>
      <ul className="mt-2 flex flex-col gap-2">
        {PREWORK.map((item, i) => {
          const checked = done[i];
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => act({ type: "prework", person: me, index: i as 0 | 1, done: !checked })}
                className={`w-full min-h-16 flex items-center gap-3 rounded-xl border px-4 text-left transition active:scale-[0.99] ${
                  checked ? "bg-soft border-accent" : "bg-card border-line"
                }`}
                aria-pressed={checked}
              >
                <span
                  className={`shrink-0 h-7 w-7 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    checked ? "bg-accent border-accent text-accent-fg" : "border-line"
                  }`}
                >
                  {checked ? "✓" : ""}
                </span>
                <span>
                  <span className="block font-semibold">{item.title}</span>
                  <span className="block text-sm text-muted">{item.detail}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
