# Myda Negotiation Workshop

A two-day negotiation workshop app for the three Myda co-founders, run
remotely over a video call. Based on *Negotiation Genius* (Malhotra & Bazerman)
and *Getting to Yes* (Fisher, Ury & Patton). The app is the facilitator: it
runs the agenda and timers, times the reading sprints and quizzes, assigns
roles, shows each person only their confidential role sheet, collects deals,
scores them (ZOPA share, points, Pareto frontier), and runs the debriefs and
export.

Everyone opens the same deployed URL on a laptop or phone and signs in with
their Myda email through a magic link (no password). Only the three allowlisted
addresses can sign in, and the app knows who you are from your session, so
there is no name picking. Confidential material (role sheets, points tables,
hidden solutions, prep forms, personal mistakes lists) is served only to the
participant it belongs to; the observer's tools only to that round's observer.
One person also keeps the facilitator view (`/facilitator`) open to run the
agenda and the clock.

Two AI features use the Anthropic API (model `claude-sonnet-5-5`):

- **Debrief from transcript.** On every round's reveal screen the observer
  pastes the call transcript (from Wispr Flow; speaker labels may be wrong)
  and gets a structured debrief: the decisive moment, every question asked,
  what information surfaced and what stayed hidden, each offer and concession,
  tactics and responses, an AI rubric next to the observer's, and one rule
  per negotiator. AI rubric zeros join the personal mistakes lists, tagged
  "AI". Try it with `fixtures/demo-transcript-r1.txt`.
- **Practice against an AI counterpart.** `/practice`, available any time:
  pick a scenario and a side, fill the prep form, negotiate in a streaming
  chat with a counterpart who plays the other role from its confidential
  sheet, submit the deal, and get the same scoring and reveal as a live round,
  followed by the debrief. Practice rounds are stored per person, shown on
  the personal page, included in the export, and kept out of the live
  rotation and rubric totals.

Prompts live in `src/lib/ai/prompts.ts` as plain strings. Every call's token
counts are logged to the server console and summed in the session state, so
the export shows the day's spend. See `TESTING.md` for how to try both.

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

Without `SUPABASE_URL` the app keeps state in `data/session.json`. For local
work without Supabase Auth, set `AUTH_DEV_EMAIL` to one of the allowlisted
addresses (development builds only; production ignores it). To look at the app
as another participant, set a cookie `nw-dev-user=<their email>` in that
browser. State is polled by every device every two seconds.

## Supabase

The Supabase project is shared with another small app that has its own table,
so this app uses a dedicated table, `workshop_sessions` by default. The name is
configurable through `SUPABASE_TABLE`. Create it in the Supabase SQL editor:

```sql
create table if not exists public.workshop_sessions (
  id          text primary key,
  state       jsonb not null,
  rev         integer not null default 1,
  updated_at  timestamptz not null default now()
);

-- The app uses the service-role key from the server only, so no policies are
-- needed. Keep RLS on so the anon key (which the app never uses for data)
-- cannot read it.
alter table public.workshop_sessions enable row level security;
```

The app keeps a single row with `id = 'default'`. `rev` is bumped on every
write and checked on update, so three devices acting at the same moment cannot
overwrite each other.

Because the project is shared, the service-role key can read and write the
other app's table as well. It must stay server-side only: it is read from the
environment in server code and never sent to the browser.

## Supabase Auth (magic links)

1. **Authentication → Providers → Email**: enable the Email provider, turn
   **Confirm email** on, and leave passwords off (the app never uses them).
   Magic links are enabled by default with the Email provider.
2. **Authentication → URL Configuration**: add
   `https://negotiation-workshop.vercel.app/auth/callback` (and the same path
   for `http://localhost:3000` if you want to test links locally) to
   **Redirect URLs**. The project is shared with another app, so this app's
   Vercel domain must be in that list alongside the other app's domain; do not
   replace the other app's entries. **Site URL** can stay as the other app's
   domain, since this app passes its own redirect URL when sending the link.
3. Optional, recommended: **Authentication → Email Templates → Magic Link**:
   leave the default `{{ .ConfirmationURL }}` link. The callback route accepts
   both the default PKCE link (`?code=`) and the token-hash form
   (`/auth/callback?token_hash={{ .TokenHash }}&type=email`).
4. The allowlist is enforced in the app, not in Supabase: the route that sends
   the link refuses any address not in `ALLOWED_EMAILS`, and every API route
   that reads or writes state checks the signed-in email against the same list.
   Sessions are kept in cookies and refreshed on every request, so a device
   stays signed in for the whole day.

## Environment variables

Set these in Vercel (Project → Settings → Environment Variables) and in
`.env.local` for development:

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key. Used on the server for Auth. |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → service_role key. Server only; never exposed to the browser. Shared project: it can also read the other app's table. |
| `SUPABASE_TABLE` | Table holding the workshop session. Default `workshop_sessions`. |
| `ANTHROPIC_API_KEY` | Anthropic Console → API keys. Server only. Needed for the transcript debrief and the practice counterpart. |
| `ALLOWED_EMAILS` | Comma-separated. The local part of each address must start with the participant id (`jung…`, `rehan…`, `harry…`), e.g. `jung@example.com,rehan@example.com,harry@example.com` |

## Deploy to Vercel

1. Push this repository to GitHub (it is private; the PDFs are not in it).
2. In Vercel, **Add New → Project**, import the repository. Framework preset:
   Next.js (detected). `vercel.json` pins the region to Frankfurt.
3. Add the environment variables above for Production (and Preview if
   you want preview deployments to share the same session). Then set the
   Supabase Site URL and Redirect URL to the Vercel domain (section above).
4. Deploy. Open the production URL, enter your Myda email, open the link from
   the email on the same device.
5. Before the real day, open `/facilitator`, use **Reset session** so the state
   is clean, and share the URL and passcode in the call.

To remove someone's access, take their address out of `ALLOWED_EMAILS` and
redeploy; their next request is refused. "Start demo session" in the facilitator tools seeds a session that
can be clicked through in a few minutes.

## Troubleshooting

Open `https://<your-domain>/api/health`. It reports, without revealing any
secret, whether each variable is set, whether `SUPABASE_URL` is the project API
URL, whether the Auth endpoint answers, and whether the workshop table is
readable.

- **"Unexpected token '<' … is not valid JSON"** on sign-in: `SUPABASE_URL`
  is pointing at a web page rather than the API. It must be the Project URL
  from Supabase → Settings → API, of the form `https://<project-ref>.supabase.co`,
  with no path. The dashboard address (`https://supabase.com/dashboard/...`)
  is wrong.
- **"Invalid API key"**: the anon or service_role key is wrong or swapped.
- **"relation … does not exist"** in the table check: run the SQL above, or
  set `SUPABASE_TABLE` to the table you created.
- **No email arrives**: the address is not in `ALLOWED_EMAILS` (the app then
  says "This workshop is private"), or the Email provider is disabled in
  Supabase, or the redirect URL is not in the allowed list.

After changing a variable in Vercel, redeploy; variables are read at request
time but the function instances must restart.

## The books

The reading sprints and quizzes refer to page numbers in the two PDFs. Put
them in `reference/` locally:

- `reference/NegotiationGeniusMalhotra.pdf`
- `reference/fisher-getting-to-yes.pdf`

The PDFs are copyrighted and are not in this repository; `reference/` is
ignored by git. Each participant needs their own copy open during the sprints.
