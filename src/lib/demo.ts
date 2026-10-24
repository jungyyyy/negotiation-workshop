import { getStep } from "./agenda";
import { DRILL_SETS, drillSetForStep } from "./drills";
import { EXPERIMENTS, experimentForStep } from "./experiments";
import { COMMON_MISTAKES } from "./mistakes";
import { getFullScenario } from "./scenarioSecrets";
import { computeScores } from "./scoring";
import { SPRINTS } from "./sprints";
import { PEOPLE, type Deal, type Person, type PrepAnswers, type Round, type Session } from "./types";

type PrepDraft = Omit<PrepAnswers, "submittedAt">;

const PREP: Record<string, { seller: PrepDraft; buyer: PrepDraft }> = {
  R1: {
    seller: {
      batna: "Berlin agency at €900, probably €1,000–1,100 with a push",
      reservation: "€1,050/month",
      theirBatna: "A cheaper tool or a freelancer; unknown timeline",
      theirReservation: "About €1,500",
      target: "€1,600",
      firstOffer: "Let them open. If I must: €1,800, because comparable tools go to €2,000 and none do 1:1 feedback.",
      questions: ["What do you use for creator feedback today?", "When does the pilot need to start?", "What happens if you do nothing this quarter?"],
    },
    buyer: {
      batna: "Another freelancer at ~€2,000 with a six-week delay",
      reservation: "€2,200/month (director's approval)",
      theirBatna: "Another agency pilot, maybe smaller",
      theirReservation: "About €900",
      target: "€1,000",
      firstOffer: "Open at €800: there are cheaper tools.",
      questions: ["How many agencies use you today?", "How long does onboarding take?", "Can we cancel monthly?"],
    },
  },
  R2: {
    seller: {
      batna: "Berlin agency deal = 600 points",
      reservation: "600 points (package)",
      theirBatna: "Freelancer; I guess 400–600 of their points",
      theirReservation: "About 500 of their points",
      target: "1,400 points: €120, 12 months, named case study, weekly call",
      firstOffer: "Package: €140, 12 months, named, email support, because the pilot showed the uplift.",
      questions: ["Which of the four issues matters most to you?", "How do you weigh support against price?", "Would a named case study help your sales?"],
    },
    buyer: {
      batna: "Freelancer = 500 points",
      reservation: "500 points (package)",
      theirBatna: "Another agency; maybe 500 of their points",
      theirReservation: "About 600 of their points",
      target: "1,200 points: €80, 6 months, anonymous, weekly call",
      firstOffer: "Package: €60, 3 months, no case study, weekly call, because we are the pilot customer.",
      questions: ["What does the weekly call cost you?", "Why does term matter to you?", "What would a named case study be worth to you?"],
    },
  },
  R3: {
    seller: {
      batna: "Lose Veltra, keep skincare pipeline (a third of revenue)",
      reservation: "No blanket skincare exclusivity",
      theirBatna: "Another tool, or none",
      theirReservation: "Some protection they have not named",
      target: "Annual deal with a narrow clause",
      firstOffer: "No offer. Open with: what specifically worries you about other skincare brands?",
      questions: ["What specifically worries you?", "Is there one brand in particular?", "What would make you comfortable sharing a tool?"],
    },
    buyer: {
      batna: "Walk away and keep looking",
      reservation: "Lumea must not benefit from our data or creators",
      theirBatna: "Other skincare brands",
      theirReservation: "They will not sign a blanket clause",
      target: "A clause that keeps Lumea out",
      firstOffer: "'It's a matter of principle.' Hold until they ask why.",
      questions: ["How do you separate client data?", "Who else in skincare do you work with?", "Can we see the contract template?"],
    },
  },
  R5: {
    seller: {
      batna: "Slower DACH pilot = 700 points",
      reservation: "700 points (package)",
      theirBatna: "Clipcoach; maybe 600 of their points",
      theirReservation: "About 650 of their points",
      target: "1,700 points: €140, 24 months, upfront, named, two on-site",
      firstOffer: "Package: €160, 24 months, annual upfront, named, two on-site, because on-site onboarding is what Clipcoach cannot do.",
      questions: ["What exactly does Clipcoach include?", "Who evaluated it on your side?", "When does your budget year close?"],
    },
    buyer: {
      batna: "Clipcoach = 650 points",
      reservation: "650 points (package)",
      theirBatna: "Another brand pilot; 600–700 of their points",
      theirReservation: "About 700 of their points",
      target: "1,300 points: €100, 12 months, upfront, anonymous, two on-site",
      firstOffer: "Package: €80, 6 months, monthly, none, two on-site, because Clipcoach is at €90 and does everything you do.",
      questions: ["What do the on-site workshops cover?", "How fast is feedback delivered?", "What references do you have in DACH?"],
    },
  },
};

const DEALS: Record<string, Deal> = {
  R1: { price: 1600 },
  R2: { price: "100", term: "6", caseStudy: "anon", support: "email", contingency: "" },
  R3: { found: true, question: "What specifically worries you about other skincare brands?", clause: "Non-compete limited to Lumea, plus data separation", concessions: "" },
  R3b: { penalty: 750, bonus: true, bonusAmount: "€300 per delivery under 24h" },
  R5: { price: "120", term: "12", payment: "monthly", caseStudy: "anon", workshop: "onsite2", probed: false, contingency: false, contingencyText: "" },
};

const LOGS: Record<string, string[]> = {
  R1: ["Buyer opened at €800, 'cheaper tools out there'", "Seller: 'what do you use today?'", "Buyer mentioned a coach leaving; seller did not follow up", "Seller countered €1,800 with comparables", "Agreed €1,600"],
  R2: ["Price discussed first for 8 minutes", "Term settled before support was raised", "'Let's split the difference' on price", "Package never offered as a whole"],
  R3: ["Seller offered a 10% discount at 2:10", "'It's our policy' twice", "Seller: 'what specifically worries you?' at 6:40", "Lumea named at 7:05"],
  R3b: ["Seller: 'what's driving the 48 hours?'", "Seller proposed higher penalty plus bonus under 24h"],
  R5: ["Buyer: 'Clipcoach is at €90 and does everything you do'", "Seller moved on price without asking what Clipcoach includes", "Both argued for monthly vs upfront, then 'compromised' on monthly", "Two on-site workshops agreed quickly"],
};

const RUBRIC_SCORES: Record<string, { seller: number[]; buyer: number[] }> = {
  R1: { seller: [2, 1, 0, 1, -1, 2, 2], buyer: [2, 2, 1, 2, -1, 1, 2] },
  R2: { seller: [2, 1, 1, 1, 0, 2, 2], buyer: [2, 2, 1, 2, 0, 2, 2] },
  R3: { seller: [2, 2, 1, 0, -1, 1, 2], buyer: [2, 2, 2, 2, -1, 2, 2] },
  R3b: { seller: [-1, 2, 2, 2, -1, 2, 2], buyer: [-1, 2, 1, 2, -1, 2, 2] },
  R5: { seller: [2, 1, 0, 1, 1, 0, 2], buyer: [2, 2, 1, 2, 1, 2, 2] },
};

const MOMENTS: Record<string, string> = {
  R1: "The buyer mentioned the coach leaving in four weeks and the seller let it pass.",
  R2: "Price got settled first; after that nothing could be traded.",
  R3: "The first 'what specifically worries you' question, six minutes in.",
  R3b: "The seller asked what was driving the 48 hours instead of defending.",
  R5: "Nobody asked what Clipcoach actually includes.",
};

const TICKS: Partial<Record<Person, Record<string, string[]>>> = {
  jung: { R1: ["earlyOffer", "talked"], R5: ["assumed", "zopa"] },
  rehan: { R2: ["conceded"], R3: ["influenced"] },
  harry: { R2: ["talked", "conceded"], R5: ["assumed"] },
};

/** Build a complete demo session: everyone in, every quiz passed, prep forms ready. */
export function seedDemo(s: Session): Session {
  const now = Date.now();
  for (const p of PEOPLE) s.joined[p.id] = { joinedAt: now, prework: [true, true] };
  for (const sp of SPRINTS) {
    s.quizzes[sp.id] = Object.fromEntries(
      PEOPLE.map((p) => [p.id, { attempts: [{ answers: sp.quiz.map((q) => q.answer), score: 5, at: now }], passed: true }]),
    );
  }
  return s;
}

/** Prep forms for a round, if the demo has them. */
export function demoPrep(round: Round, now: number) {
  const d = PREP[round.id];
  if (!d) return;
  round.prep[round.roles.seller] ??= { ...d.seller, submittedAt: now };
  round.prep[round.roles.buyer] ??= { ...d.buyer, submittedAt: now };
}

/**
 * Fill whatever the current step needs with sample data so the facilitator can
 * press Next. Returns a short note about what was filled.
 */
export function demoFill(s: Session, now: number): string {
  const step = getStep(s.block, s.step);

  if (step.kind === "sprint" || step.kind === "lunch") {
    s.timer.endsAt = null;
    s.timer.remainingMs = 0;
    return "Timer skipped.";
  }

  if (step.roundId) {
    const r = s.rounds.find((x) => x.id === step.roundId);
    const sc = r && getFullScenario(r.scenarioId);
    if (!r || !sc) return "No round.";
    if (sc.requiresPrep) demoPrep(r, now);
    if (r.status === "prep") {
      r.status = "negotiating";
      r.startedAt = now - 7 * 60_000;
    }
    if (r.status === "negotiating") {
      r.deal = { ...(DEALS[r.id] ?? {}) };
      r.noDeal = false;
      r.status = "submitted";
      r.submittedAt = now;
      r.observerLog = (LOGS[r.id] ?? []).map((text, i) => ({ at: (r.startedAt ?? now) + (i + 1) * 80_000, text }));
      const rs = RUBRIC_SCORES[r.id];
      if (rs) r.rubric = { [r.roles.seller]: { scores: rs.seller }, [r.roles.buyer]: { scores: rs.buyer } };
      r.moment = MOMENTS[r.id];
      s.timer.endsAt = null;
      s.timer.remainingMs = 0;
    }
    if (step.kind === "reveal" || step.kind === "debrief") {
      if (r.status !== "revealed") {
        r.status = "revealed";
        r.revealedAt = now;
        r.scores = computeScores(sc, r);
      }
      for (const p of PEOPLE) {
        const t = TICKS[p.id]?.[r.id];
        if (t) (s.mistakes[p.id] ??= {})[r.id] = t;
      }
      return `${r.id} revealed with a sample deal.`;
    }
    return `${r.id}: prep filled, sample deal submitted. Press Reveal or Next.`;
  }

  const exp = experimentForStep(step.id);
  if (exp || step.id === "b5-reveal") {
    const samples: Record<string, Record<Person, Record<string, string | number>>> = {
      anchoring: { jung: { fair: 800, wtp: 600 }, rehan: { fair: 1500, wtp: 1200 }, harry: { fair: 2200, wtp: 1800 } },
      fixedpie: { jung: { date: "two", host: "brightline", why: "trade" }, rehan: { date: "next", host: "alternate", why: "same" }, harry: { date: "two", host: "brightline", why: "meet" } },
      overconfidence: { jung: { rank: "1", share: 60 }, rehan: { rank: "1", share: 55 }, harry: { rank: "2", share: 50 } },
    };
    const targets = exp ? [exp] : EXPERIMENTS.filter((e) => !e.deferred);
    for (const e of targets) s.experiments[e.id] = { ...samples[e.id] };
    return "Experiment answers filled for everyone.";
  }

  const set = drillSetForStep(step.id);
  if (set) {
    const st = (s.drills[set.id] ??= { index: 0, results: {} });
    set.drills.forEach((_, i) => {
      st.results[i] = { scores: [[2, 1, 2], [1, 2, 1], [2, 2, 1], [0, 2, 2], [2, 1, 1], [1, 1, 2]][i % 6], revealed: true };
    });
    st.index = set.drills.length - 1;
    s.timer.endsAt = null;
    s.timer.remainingMs = 0;
    return "All drills scored and revealed.";
  }

  if (step.id === "b4-rule") {
    s.rules.jung = { ...s.rules.jung, day1: "Ask three questions before I say any number." };
    s.rules.rehan = { ...s.rules.rehan, day1: "Never settle one issue before all are on the table." };
    s.rules.harry = { ...s.rules.harry, day1: "Label every concession and say what I want back." };
    return "Day-1 rules filled.";
  }
  if (step.id === "b9-mistakes") {
    s.rules.jung = { ...s.rules.jung, final: "Write my package reservation value before every call." };
    s.rules.rehan = { ...s.rules.rehan, final: "When they say 'policy', ask what specifically worries them." };
    s.rules.harry = { ...s.rules.harry, final: "Ask what the competitor's offer actually includes." };
    return "Final rules filled.";
  }
  if (step.id === "b9-cross" && s.patterns.length === 0) {
    s.patterns.push(
      { at: now, person: "harry", text: "First offers came before the third question every time." },
      { at: now + 1, person: "jung", text: "Every late demand was defended first and traded second." },
    );
    return "Sample patterns added.";
  }
  if (step.kind === "setup") {
    for (const p of PEOPLE) s.joined[p.id] = { joinedAt: now, prework: [true, true] };
    return "Everyone joined with pre-work done.";
  }
  return "Nothing to fill on this step.";
}

export const DEMO_MISTAKE_IDS = COMMON_MISTAKES.map((m) => m.id);
