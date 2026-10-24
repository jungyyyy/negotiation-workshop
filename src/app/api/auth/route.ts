import { checkPasscode, passcodeRequired } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET: is a passcode needed? POST {passcode}: is this one right? */
export async function GET() {
  return Response.json({ required: passcodeRequired() }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let body: { passcode?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const ok = checkPasscode(body.passcode);
  return Response.json({ ok }, { status: ok ? 200 : 401, headers: { "Cache-Control": "no-store" } });
}
