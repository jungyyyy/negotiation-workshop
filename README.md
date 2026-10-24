# Myda Negotiation Workshop

A two-day negotiation workshop app for the three Myda co-founders, based on
*Negotiation Genius* (Malhotra & Bazerman) and *Getting to Yes* (Fisher, Ury &
Patton). One laptop runs the server; each person joins from their own phone.
The app is the facilitator: it runs the agenda and timers, times the reading
sprints and quizzes, assigns roles, shows each person only their confidential
role sheet, collects deals, scores them (ZOPA share, points, Pareto frontier),
and runs the debriefs and export.

## Prerequisites

- Node.js 20 or newer (built with Node 22)
- The three phones and the laptop on the same Wi‑Fi
- The two book PDFs, placed locally in `reference/` (see below)

## Run

```bash
npm install
npm run dev
```

The console prints the LAN address, for example `http://192.168.178.104:3000`.

## Joining from the phones

Open the LAN address on the laptop and show the QR code (`/qr`), or read the
address out. Each person opens it in Safari or Chrome on their phone, taps
their name once, and the phone remembers it. The facilitator view is at
`/facilitator` and works on the laptop or any phone.

Timers never start on their own: the facilitator (or, during a round, the
observer) presses Start.

Session state is saved to `data/session.json`, so a server restart does not
lose the day. "Start demo session" in the facilitator tools seeds a session
that can be clicked through in a few minutes.

## The books

The reading sprints and quizzes refer to page numbers in the two PDFs. Put
them in `reference/` locally:

- `reference/NegotiationGeniusMalhotra.pdf`
- `reference/fisher-getting-to-yes.pdf`

The PDFs are copyrighted and are not in this repository; `reference/` is
ignored by git.
