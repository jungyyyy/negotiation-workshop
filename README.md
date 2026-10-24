# Myda Negotiation Workshop

A two-day negotiation workshop app for the three Myda co-founders, run
remotely over a video call. Based on *Negotiation Genius* (Malhotra & Bazerman)
and *Getting to Yes* (Fisher, Ury & Patton). The app is the facilitator: it
runs the agenda and timers, times the reading sprints and quizzes, assigns
roles, shows each person only their confidential role sheet, collects deals,
scores them (ZOPA share, points, Pareto frontier), and runs the debriefs and
export.

Everyone opens the same deployed URL on a laptop or phone, enters the shared
passcode once, and taps their name. One person also keeps the facilitator view
(`/facilitator`) open to run the agenda and the clock.

## Prerequisites

- Node.js 20 or newer (built with Node 22)
- A Supabase project (free tier is fine) for the shared session state
- A Vercel account for hosting
- The two book PDFs, placed locally in `reference/` (see below)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in, or leave empty for file-based local state
npm run dev
```

Without `SUPABASE_URL` the app keeps state in `data/session.json`. Without
`WORKSHOP_PASSCODE` the passcode gate is skipped. Both are fine for local
testing. State is polled by every device every two seconds.

## Supabase

Create one table. In the Supabase SQL editor:

```sql
create table if not exists public.sessions (
  id          text primary key,
  state       jsonb not null,
  rev         integer not null default 1,
  updated_at  timestamptz not null default now()
);

-- The app uses the service-role key from the server only, so no policies are
-- needed. Keep RLS on so the anon key (which the app never uses) cannot read it.
alter table public.sessions enable row level security;
```

The app keeps a single row with `id = 'default'`. `rev` is bumped on every
write and checked on update, so three devices acting at the same moment cannot
overwrite each other.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) and in
`.env.local` for development:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key. Server only; never exposed to the browser. |
| `WORKSHOP_PASSCODE` | Any phrase you share in the call. Asked once per device, stored in that browser. |

## Deploy to Vercel

1. Push this repository to GitHub (it is private; the PDFs are not in it).
2. In Vercel, **Add New → Project**, import the repository. Framework preset:
   Next.js (detected). `vercel.json` pins the region to Frankfurt.
3. Add the three environment variables above for Production (and Preview if
   you want preview deployments to share the same session).
4. Deploy. Open the production URL, enter the passcode, pick your name.
5. Before the real day, open `/facilitator`, use **Reset session** so the state
   is clean, and share the URL and passcode in the call.

Changing the passcode in Vercel locks every device out until they enter the
new one. "Start demo session" in the facilitator tools seeds a session that
can be clicked through in a few minutes.

## The books

The reading sprints and quizzes refer to page numbers in the two PDFs. Put
them in `reference/` locally:

- `reference/NegotiationGeniusMalhotra.pdf`
- `reference/fisher-getting-to-yes.pdf`

The PDFs are copyrighted and are not in this repository; `reference/` is
ignored by git. Each participant needs their own copy open during the sprints.
