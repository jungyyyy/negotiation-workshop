import type { Action, Session, Timer } from "./types";
import { storage } from "./storage";
import { clampPosition, getStep, nextPosition, prevPosition } from "./agenda";
import { getSprint, MAX_ATTEMPTS, PASS_MARK } from "./sprints";
import { ROLES } from "./scenarios";
import { getFullScenario } from "./scenarioSecrets";
import { computeScores } from "./scoring";
import { getDrillSet } from "./drills";
import { demoFill, demoPrep, seedDemo } from "./demo";
import type { Round } from "./types";

function findRound(s: Session, id: string): Round | undefined {
  return s.rounds.find((r) => r.id === id);
}

/** Create the round for a step the first time the session reaches it. */
function ensureRound(s: Session, block: number, step: number) {
  const st = getStep(block, step);
  const id = st.roundId;
  if (!id || findRound(s, id)) return;
  const scenario = getFullScenario(id);
  const roles = ROLES[id];
  if (!scenario || !roles) return;
  const round: Round = {
    id,
    scenarioId: scenario.id,
    roles,
    status: "prep",
    prep: {},
    observerLog: [],
  };
  if (s.demo && scenario.requiresPrep) demoPrep(round, Date.now());
  s.rounds.push(round);
}

function moveTo(s: Session, block: number, step: number) {
  s.block = block;
  s.step = step;
  s.timer = stepTimer(block, step);
  ensureRound(s, block, step);
}

function stepTimer(block: number, step: number): Timer {
  const s = getStep(block, step);
  const ms = (s.minutes ?? 0) * 60_000;
  return { label: s.label, durationMs: ms, endsAt: null, remainingMs: ms };
}

export function newSession(demo = false): Session {
  const now = Date.now();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    demo,
    block: 0,
    step: 0,
    timer: stepTimer(0, 0),
    joined: {},
    quizzes: {},
    experiments: {},
    drills: {},
    mistakes: {},
    rules: {},
    patterns: [],
    rounds: [],
  };
}

/** Fill in fields added after the file on disk was written. */
function migrate(s: Session): Session {
  s.quizzes ??= {};
  s.experiments ??= {};
  s.drills ??= {};
  s.mistakes ??= {};
  s.rules ??= {};
  s.patterns ??= [];
  s.rounds ??= [];
  s.joined ??= {};
  return s;
}

const MAX_RETRIES = 6;

/** Current state; creates the session on first use. */
export async function getSession(): Promise<Session> {
  const loaded = await storage().load();
  if (loaded) return migrate(loaded.state);
  const fresh = newSession();
  await storage().save(fresh, 0);
  return fresh;
}

/**
 * Apply an action. Reads the latest state, reduces, and writes back with an
 * optimistic-concurrency check; retries when another device wrote in between.
 */
export async function dispatch(action: Action): Promise<Session> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const loaded = await storage().load();
    const prev = loaded ? migrate(loaded.state) : newSession();
    const rev = loaded?.rev ?? 0;
    const next = reduce(prev, action);
    next.updatedAt = Date.now();
    if (await storage().save(next, rev)) return next;
    await new Promise((r) => setTimeout(r, 40 + Math.random() * 120));
  }
  throw new Error("Could not save: too many concurrent writes");
}

function reduce(prev: Session, a: Action): Session {
  const s: Session = migrate(structuredClone(prev));
  const now = Date.now();

  switch (a.type) {
    case "join": {
      s.joined[a.person] ??= { joinedAt: now, prework: [false, false] };
      return s;
    }
    case "prework": {
      const j = (s.joined[a.person] ??= { joinedAt: now, prework: [false, false] });
      j.prework[a.index] = a.done;
      return s;
    }
    case "goto": {
      const p = clampPosition(a.block, a.step);
      moveTo(s, p.block, p.step);
      return s;
    }
    case "next": {
      const p = nextPosition(s.block, s.step);
      moveTo(s, p.block, p.step);
      return s;
    }
    case "prev": {
      const p = prevPosition(s.block, s.step);
      moveTo(s, p.block, p.step);
      return s;
    }
    case "timer.start": {
      const base = s.timer.durationMs || 5 * 60_000;
      const ms = a.minutes != null ? a.minutes * 60_000 : base;
      s.timer = {
        label: a.label ?? s.timer.label,
        durationMs: ms,
        remainingMs: ms,
        endsAt: now + ms,
      };
      return s;
    }
    case "timer.pause": {
      if (s.timer.endsAt != null) {
        s.timer.remainingMs = Math.max(0, s.timer.endsAt - now);
        s.timer.endsAt = null;
      }
      return s;
    }
    case "timer.resume": {
      if (s.timer.endsAt == null && s.timer.remainingMs > 0) {
        s.timer.endsAt = now + s.timer.remainingMs;
      }
      return s;
    }
    case "timer.reset": {
      s.timer.endsAt = null;
      s.timer.remainingMs = s.timer.durationMs;
      return s;
    }
    case "timer.skip": {
      s.timer.endsAt = null;
      s.timer.remainingMs = 0;
      return s;
    }
    case "demo.fill": {
      if (!s.demo) return s;
      demoFill(s, now);
      return s;
    }
    case "timer.adjust": {
      s.timer.durationMs = Math.max(0, s.timer.durationMs + a.deltaMs);
      if (s.timer.endsAt != null) {
        s.timer.endsAt = Math.max(now, s.timer.endsAt + a.deltaMs);
      } else {
        s.timer.remainingMs = Math.max(0, s.timer.remainingMs + a.deltaMs);
      }
      return s;
    }
    case "quiz.submit": {
      const sprint = getSprint(a.sprintId);
      if (!sprint) return s;
      const bySprint = (s.quizzes[a.sprintId] ??= {});
      const q = (bySprint[a.person] ??= { attempts: [], passed: false });
      if (q.passed || q.attempts.length >= MAX_ATTEMPTS) return s;
      const score = sprint.quiz.reduce((n, item, i) => n + (a.answers[i] === item.answer ? 1 : 0), 0);
      q.attempts.push({ answers: a.answers.slice(0, sprint.quiz.length), score, at: now });
      if (score >= PASS_MARK) q.passed = true;
      return s;
    }
    case "quiz.reset": {
      const bySprint = s.quizzes[a.sprintId];
      if (bySprint) delete bySprint[a.person];
      return s;
    }
    case "quiz.unlock": {
      const bySprint = (s.quizzes[a.sprintId] ??= {});
      const q = (bySprint[a.person] ??= { attempts: [], passed: false });
      q.unlocked = true;
      return s;
    }
    case "prep.submit": {
      const r = findRound(s, a.roundId);
      if (!r || r.status !== "prep") return s;
      r.prep[a.person] = { ...a.answers, submittedAt: now };
      return s;
    }
    case "round.start": {
      const r = findRound(s, a.roundId);
      const sc = r && getFullScenario(r.scenarioId);
      if (!r || !sc || r.status !== "prep") return s;
      const ready = !sc.requiresPrep || (r.prep[r.roles.seller] && r.prep[r.roles.buyer]);
      if (!ready && !a.force) return s;
      r.status = "negotiating";
      r.startedAt = now;
      const ms = sc.negotiateMinutes * 60_000;
      s.timer = { label: `Negotiate · ${sc.title}`, durationMs: ms, remainingMs: ms, endsAt: now + ms };
      return s;
    }
    case "round.log": {
      const r = findRound(s, a.roundId);
      if (!r || !a.text.trim()) return s;
      r.observerLog.push({ at: now, text: a.text.trim() });
      return s;
    }
    case "round.unlog": {
      const r = findRound(s, a.roundId);
      if (!r) return s;
      r.observerLog = r.observerLog.filter((e) => e.at !== a.at);
      return s;
    }
    case "round.submit": {
      const r = findRound(s, a.roundId);
      if (!r || r.status === "revealed") return s;
      r.deal = a.deal;
      r.noDeal = !!a.noDeal;
      r.status = "submitted";
      r.submittedAt = now;
      // Stop the negotiation clock where it stands.
      if (s.timer.endsAt != null) {
        s.timer.remainingMs = Math.max(0, s.timer.endsAt - now);
        s.timer.endsAt = null;
      }
      return s;
    }
    case "round.reopen": {
      const r = findRound(s, a.roundId);
      if (!r || r.status !== "submitted") return s;
      r.status = "negotiating";
      r.submittedAt = undefined;
      if (s.timer.endsAt == null && s.timer.remainingMs > 0) s.timer.endsAt = now + s.timer.remainingMs;
      return s;
    }
    case "round.rubric": {
      const r = findRound(s, a.roundId);
      if (!r) return s;
      r.rubric ??= {};
      r.rubric[a.person] = { scores: a.scores.slice(0, 7) };
      return s;
    }
    case "round.moment": {
      const r = findRound(s, a.roundId);
      if (!r) return s;
      r.moment = a.text;
      return s;
    }
    case "round.reveal": {
      const r = findRound(s, a.roundId);
      const sc = r && getFullScenario(r.scenarioId);
      if (!r || !sc) return s;
      if (r.status === "prep" || r.status === "negotiating") {
        // Revealing without a submitted deal counts as no deal.
        r.deal ??= {};
        if (r.noDeal == null) r.noDeal = Object.keys(r.deal).length === 0;
        r.submittedAt ??= now;
      }
      r.status = "revealed";
      r.revealedAt = now;
      r.scores = computeScores(sc, r);
      if (s.timer.endsAt != null) {
        s.timer.remainingMs = Math.max(0, s.timer.endsAt - now);
        s.timer.endsAt = null;
      }
      return s;
    }
    case "round.reset": {
      s.rounds = s.rounds.filter((r) => r.id !== a.roundId);
      ensureRound(s, s.block, s.step);
      return s;
    }
    case "experiment.answer": {
      const byExp = (s.experiments[a.experimentId] ??= {});
      byExp[a.person] = a.answers;
      return s;
    }
    case "drill.goto": {
      const set = getDrillSet(a.setId);
      if (!set) return s;
      const st = (s.drills[a.setId] ??= { index: 0, results: {} });
      st.index = Math.min(Math.max(a.index, 0), set.drills.length - 1);
      const ms = set.seconds * 1000;
      s.timer = { label: `Drill ${st.index + 1} · ${set.drills[st.index].title}`, durationMs: ms, remainingMs: ms, endsAt: null };
      return s;
    }
    case "drill.start": {
      const set = getDrillSet(a.setId);
      if (!set) return s;
      const st = (s.drills[a.setId] ??= { index: 0, results: {} });
      const ms = set.seconds * 1000;
      s.timer = { label: `Drill ${st.index + 1} · ${set.drills[st.index].title}`, durationMs: ms, remainingMs: ms, endsAt: now + ms };
      return s;
    }
    case "drill.reveal": {
      const st = (s.drills[a.setId] ??= { index: 0, results: {} });
      const r = (st.results[a.index] ??= { scores: [0, 0, 0], revealed: false });
      r.revealed = true;
      if (s.timer.endsAt != null) {
        s.timer.remainingMs = Math.max(0, s.timer.endsAt - now);
        s.timer.endsAt = null;
      }
      return s;
    }
    case "drill.score": {
      const st = (s.drills[a.setId] ??= { index: 0, results: {} });
      const r = (st.results[a.index] ??= { scores: [0, 0, 0], revealed: false });
      r.scores = a.scores.slice(0, 3);
      return s;
    }
    case "mistakes.tick": {
      const mine = (s.mistakes[a.person] ??= {});
      mine[a.roundId] = a.ids;
      return s;
    }
    case "rule.set": {
      const r = (s.rules[a.person] ??= {});
      r[a.which] = a.text;
      return s;
    }
    case "pattern.add": {
      if (a.text.trim()) s.patterns.push({ at: now, person: a.person, text: a.text.trim() });
      return s;
    }
    case "pattern.remove": {
      s.patterns = s.patterns.filter((p) => p.at !== a.at);
      return s;
    }
    case "reset": {
      const fresh = newSession(a.demo ?? false);
      return a.demo ? seedDemo(fresh) : fresh;
    }
  }
}
