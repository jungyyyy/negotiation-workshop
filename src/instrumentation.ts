export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { lanUrl } = await import("./lib/lan");
    const url = lanUrl();
    console.log(`\n  Phones join at:  ${url}\n  QR code:         ${url}/qr\n  Facilitator:     ${url}/facilitator\n`);
  }
}
