"use client";

import { useJoinInfo } from "@/lib/client";
import { Button, Page } from "@/components/ui";

export default function QrPage() {
  const info = useJoinInfo();
  return (
    <Page className="flex flex-col items-center justify-center text-center gap-6 pt-10">
      <h1 className="text-2xl font-bold">Scan to join</h1>
      {info ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={info.qr}
            alt={`QR code for ${info.url}`}
            className="w-[min(80vw,480px)] h-[min(80vw,480px)] rounded-2xl bg-white p-3"
          />
          <div className="tabular text-xl break-all">{info.url}</div>
          <p className="text-muted text-sm">Phones must be on the same Wi‑Fi as this laptop.</p>
        </>
      ) : (
        <div className="w-[min(80vw,480px)] h-[min(80vw,480px)] rounded-2xl bg-soft animate-pulse" />
      )}
      <div className="flex gap-3">
        <Button href="/">Join screen</Button>
        <Button href="/facilitator">Facilitator view</Button>
      </div>
    </Page>
  );
}
