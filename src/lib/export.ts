import { DRILL_SETS, drillRoles } from "./drills";
import { EXPERIMENTS } from "./experiments";
import { mistakesFor, rubricTotals } from "./mistakes";
import { RUBRIC } from "./rubric";
import { getScenario } from "./scenarios";
import { computeScores } from "./scoring";
import { PEOPLE, personName, type Session } from "./types";

const fmtDate = (ms: number) => new Date(ms).toISOString().replace("T", " ").slice(0, 16);

export function exportMarkdown(s: Session): string {
  const out: string[] = [];
  out.push(`# Myda Negotiation Workshop — export`, ``, `Session started ${fmtDate(s.createdAt)}; exported ${fmtDate(Date.now())}.`, ``);

  out.push(`## Rounds`, ``);
  for (const r of s.rounds) {
    const sc = getScenario(r.scenarioId);
    if (!sc) continue;
    out.push(`### ${r.id} · ${sc.title} (${r.status})`, ``);
    out.push(`Seller ${personName(r.roles.seller)} · Buyer ${personName(r.roles.buyer)} · Observer ${personName(r.roles.observer)}`, ``);
    if (r.noDeal) out.push(`**No deal.**`, ``);
    else if (r.deal) {
      out.push(`**Deal**`, ``);
      for (const f of sc.dealFields) {
        const v = r.deal[f.key];
        if (v === undefined || v === "") continue;
        const shown = f.type === "select" ? f.options.find((o) => o.value === v)?.label ?? String(v) : f.type === "boolean" ? (v ? "yes" : "no") : String(v);
        out.push(`- ${f.label}: ${shown}`);
      }
      out.push(``);
    }
    const scores = computeScores(sc, r) ?? r.scores;
    if (scores) {
      out.push(`**Scores**`, ``);
      if (scores.kind === "single") {
        out.push(`- Reservation values: seller €${scores.sellerRv}, buyer €${scores.buyerRv}`);
        if (scores.price != null) out.push(`- Price €${scores.price}; seller share ${Math.round((scores.sellerShare ?? 0) * 100)}%, buyer share ${Math.round((scores.buyerShare ?? 0) * 100)}%${scores.inZopa ? "" : " (outside the ZOPA)"}`);
      } else if (scores.kind === "points") {
        out.push(`- Seller ${scores.seller ?? "—"} (BATNA ${scores.sellerBatna}), buyer ${scores.buyer ?? "—"} (BATNA ${scores.buyerBatna})`);
        out.push(`- Joint ${scores.joint ?? "—"} of max ${scores.maxJoint}; left on the table ${scores.leftOnTable ?? "—"}; ${scores.onFrontier ? "on" : "not on"} the Pareto frontier`);
        out.push(`- Frontier (beats both BATNAs): ${scores.frontier.map((f) => `${Object.values(f.deal).join("/")} → ${f.seller}/${f.buyer}`).join("; ")}`);
      } else if (scores.kind === "investigation") {
        out.push(`- ${scores.found ? "Found" : "Did not find"} the real interest${scores.minutes != null ? ` after ${scores.minutes} min` : ""}`);
        if (scores.question) out.push(`- Unlocking question: ${scores.question}`);
        if (scores.concessions) out.push(`- Concessions: ${scores.concessions}`);
      } else {
        out.push(`- Penalty €${scores.penalty ?? "—"}, bonus ${scores.bonus ? "yes" : "no"}; ${scores.bestAnswer ? "turned the demand into a trade" : "did not trade"}`);
      }
      out.push(``);
    }
    for (const p of [r.roles.seller, r.roles.buyer]) {
      const prep = r.prep[p];
      if (!prep) continue;
      out.push(`**Prep · ${personName(p)}**`, ``);
      out.push(`- BATNA: ${prep.batna}`, `- Reservation value: ${prep.reservation}`, `- Their BATNA (est.): ${prep.theirBatna}`, `- Their reservation value (est.): ${prep.theirReservation}`, `- Target: ${prep.target}`, `- First offer plan: ${prep.firstOffer}`, `- Questions: ${prep.questions.join(" | ")}`, ``);
    }
    if (r.rubric) {
      out.push(`**Rubric**`, ``);
      for (const p of [r.roles.seller, r.roles.buyer]) {
        const sc2 = r.rubric[p]?.scores;
        if (!sc2) continue;
        out.push(`- ${personName(p)}: ${RUBRIC.map((item, i) => (sc2[i] >= 0 ? `${item.short} ${sc2[i]}` : null)).filter(Boolean).join(", ")}`);
      }
      out.push(``);
    }
    if (r.moment) out.push(`**The moment:** ${r.moment}`, ``);
    if (r.observerLog.length) {
      out.push(`**Observer log**`, ``);
      const t0 = r.startedAt ?? r.observerLog[0].at;
      for (const e of r.observerLog) out.push(`- ${Math.floor((e.at - t0) / 60000)}:${String(Math.floor(((e.at - t0) % 60000) / 1000)).padStart(2, "0")} ${e.text}`);
      out.push(``);
    }
  }

  out.push(`## Quizzes`, ``);
  for (const [sprintId, byPerson] of Object.entries(s.quizzes)) {
    for (const p of PEOPLE) {
      const q = byPerson[p.id];
      if (!q) continue;
      out.push(`- ${sprintId} · ${p.name}: ${q.attempts.map((a) => `${a.score}/5`).join(", ")}${q.passed ? " (passed)" : q.unlocked ? " (unlocked)" : ""}`);
    }
  }
  out.push(``);

  out.push(`## Experiments`, ``);
  for (const e of EXPERIMENTS) {
    out.push(`### ${e.title}`, ``);
    for (const p of PEOPLE) {
      const a = s.experiments[e.id]?.[p.id];
      if (!a) continue;
      out.push(`- ${p.name}${e.variant ? ` (shown: ${e.variant(p.id).join(" ")})` : ""}: ${e.fields.map((f) => `${f.label} = ${a[f.key] ?? "—"}`).join("; ")}`);
    }
    out.push(``);
  }

  out.push(`## Drills`, ``);
  for (const set of DRILL_SETS) {
    const st = s.drills[set.id];
    if (!st) continue;
    out.push(`### ${set.title}`, ``);
    set.drills.forEach((d, i) => {
      const r = st.results[i];
      if (!r) return;
      out.push(`- ${d.title} · ${personName(drillRoles(set.id, i).responder)}: ${r.scores.join("/")} (${r.scores.reduce((a, b) => a + b, 0)}/6)`);
    });
    out.push(``);
  }

  out.push(`## Personal lists`, ``);
  const totals = rubricTotals(s);
  for (const p of PEOPLE) {
    out.push(`### ${p.name}`, ``);
    out.push(`Rubric total ${totals[p.id].pts}/${totals[p.id].max}`, ``);
    const m = mistakesFor(s, p.id);
    if (m.length) {
      out.push(`Most repeated mistakes:`, ``);
      m.slice(0, 5).forEach((x) => out.push(`- ${x.text} (${x.count}×: ${x.rounds.join(", ")})`));
      out.push(``);
    }
    out.push(`- Rule for day 2: ${s.rules[p.id]?.day1 ?? "—"}`, `- Rule for the next real call: ${s.rules[p.id]?.final ?? "—"}`, ``);
  }

  if (s.patterns.length) {
    out.push(`## Patterns named in the cross-case debrief`, ``);
    for (const p of s.patterns) out.push(`- ${personName(p.person)}: ${p.text}`);
    out.push(``);
  }
  return out.join("\n");
}
