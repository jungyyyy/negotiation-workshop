import { timingSafeEqual } from "node:crypto";

export const PASS_HEADER = "x-passcode";

/** True when no passcode is configured (local dev) or the request carries the right one. */
export function passcodeRequired(): boolean {
  return !!process.env.WORKSHOP_PASSCODE;
}

export function checkPasscode(candidate: string | null | undefined): boolean {
  const expected = process.env.WORKSHOP_PASSCODE;
  if (!expected) return true;
  if (!candidate) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function authorized(req: Request): boolean {
  return checkPasscode(req.headers.get(PASS_HEADER));
}

export function unauthorized(): Response {
  return Response.json({ error: "Passcode required" }, { status: 401, headers: { "Cache-Control": "no-store" } });
}
