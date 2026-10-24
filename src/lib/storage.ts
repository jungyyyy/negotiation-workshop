import fs from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Session } from "./types";
import { supabaseUrlProblem } from "./config";

/**
 * Where the single workshop session lives.
 *
 * Production: a Supabase (Postgres) table (SUPABASE_TABLE, default
 * "workshop_sessions") with one row, id "default",
 * a jsonb `state` column and an integer `rev` used for optimistic concurrency
 * (three phones can act at the same moment).
 *
 * Local development without SUPABASE_URL: a JSON file in data/session.json.
 */
export interface Loaded {
  state: Session;
  rev: number;
}

export interface Storage {
  load(): Promise<Loaded | null>;
  /** Returns false when another writer got there first (rev mismatch). */
  save(state: Session, expectedRev: number): Promise<boolean>;
  kind: "supabase" | "file";
}

const ROW_ID = "default";
export const DEFAULT_TABLE = "workshop_sessions";

/** The Supabase project is shared with another app, so our table name is configurable. */
export function tableName(): string {
  return process.env.SUPABASE_TABLE?.trim() || DEFAULT_TABLE;
}

class SupabaseStorage implements Storage {
  kind = "supabase" as const;
  private client: SupabaseClient;
  private table = tableName();
  constructor(url: string, serviceKey: string) {
    // Service-role key: server only. Never import this module from client code.
    this.client = createClient(url, serviceKey, { auth: { persistSession: false } });
  }
  async load(): Promise<Loaded | null> {
    const { data, error } = await this.client.from(this.table).select("state, rev").eq("id", ROW_ID).maybeSingle();
    if (error) throw new Error(`Supabase load failed: ${error.message}`);
    if (!data) return null;
    return { state: data.state as Session, rev: Number(data.rev) };
  }
  async save(state: Session, expectedRev: number): Promise<boolean> {
    if (expectedRev === 0) {
      const { error } = await this.client.from(this.table).insert({ id: ROW_ID, state, rev: 1 });
      if (!error) return true;
      // Row exists already (someone else created it): fall through to a conditional update.
      if (error.code !== "23505") throw new Error(`Supabase insert failed: ${error.message}`);
    }
    const { data, error } = await this.client
      .from(this.table)
      .update({ state, rev: expectedRev + 1, updated_at: new Date().toISOString() })
      .eq("id", ROW_ID)
      .eq("rev", expectedRev)
      .select("rev");
    if (error) throw new Error(`Supabase update failed: ${error.message}`);
    return (data?.length ?? 0) === 1;
  }
}

class FileStorage implements Storage {
  kind = "file" as const;
  private dir = path.join(process.cwd(), "data");
  private file = path.join(this.dir, "session.json");
  private rev = 1;
  async load(): Promise<Loaded | null> {
    try {
      const raw = fs.readFileSync(this.file, "utf8");
      return { state: JSON.parse(raw) as Session, rev: this.rev };
    } catch {
      return null;
    }
  }
  async save(state: Session, expectedRev: number): Promise<boolean> {
    if (expectedRev !== 0 && expectedRev !== this.rev) return false;
    fs.mkdirSync(this.dir, { recursive: true });
    const tmp = this.file + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
    fs.renameSync(tmp, this.file);
    this.rev = expectedRev + 1;
    return true;
  }
}

const g = globalThis as unknown as { __nwStorage?: Storage };

export function storage(): Storage {
  if (!g.__nwStorage) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (url && key) {
      const problem = supabaseUrlProblem(url);
      if (problem) throw new Error(problem);
      g.__nwStorage = new SupabaseStorage(url, key);
    }
    else {
      if (process.env.VERCEL) console.warn("SUPABASE_URL / SUPABASE_SERVICE_KEY not set; state will not persist on Vercel.");
      g.__nwStorage = new FileStorage();
    }
  }
  return g.__nwStorage;
}
