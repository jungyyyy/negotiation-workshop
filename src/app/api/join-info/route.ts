import QRCode from "qrcode";
import { lanUrl } from "@/lib/lan";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = lanUrl();
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 640 });
  return Response.json({ url, qr }, { headers: { "Cache-Control": "no-store" } });
}
