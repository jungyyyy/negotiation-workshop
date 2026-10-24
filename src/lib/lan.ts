import os from "node:os";

export function lanIp(): string | null {
  const candidates: string[] = [];
  for (const [name, list] of Object.entries(os.networkInterfaces())) {
    for (const i of list ?? []) {
      if (i.family !== "IPv4" || i.internal) continue;
      // Prefer the primary Wi‑Fi/Ethernet interface on macOS.
      if (name === "en0") candidates.unshift(i.address);
      else candidates.push(i.address);
    }
  }
  return candidates[0] ?? null;
}

export function lanUrl(): string {
  const port = process.env.PORT ?? "3000";
  const ip = lanIp() ?? "localhost";
  return `http://${ip}:${port}`;
}
