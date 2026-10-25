"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Browser-native voice for the practice chat: Web Speech API recognition (hold-to-talk)
// and speechSynthesis for spoken replies. No server, no keys. Typing remains the fallback.

type RecognitionCtor = new () => SpeechRecognitionLike;
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechInput(onFinal: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<SpeechRecognitionLike | null>(null);
  const finalText = useRef("");
  const onFinalRef = useRef(onFinal);
  onFinalRef.current = onFinal;

  useEffect(() => {
    setSupported(!!recognitionCtor());
  }, []);

  const stop = useCallback(() => {
    rec.current?.stop();
  }, []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor || rec.current) return;
    const r = new Ctor();
    r.lang = "en-US";
    r.continuous = true;
    r.interimResults = true;
    finalText.current = "";
    setInterim("");
    setError(null);
    r.onresult = (e) => {
      let fin = "";
      let tmp = "";
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        const t = res[0]?.transcript ?? "";
        if (res.isFinal) fin += t + " ";
        else tmp += t;
      }
      finalText.current = fin;
      setInterim((fin + tmp).trim());
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(e.error === "not-allowed" ? "Microphone access was blocked. Allow it in the browser and try again." : `Speech recognition error: ${e.error}`);
    };
    r.onend = () => {
      rec.current = null;
      setListening(false);
      const text = finalText.current.trim();
      setInterim("");
      if (text) onFinalRef.current(text);
    };
    rec.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      rec.current = null;
      setListening(false);
    }
  }, []);

  useEffect(() => () => rec.current?.abort(), []);

  return { supported, listening, interim, error, start, stop };
}

const MUTE_KEY = "nw-voice-muted";

export function useSpeaker() {
  const [supported, setSupported] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    try {
      const m = localStorage.getItem(MUTE_KEY) === "1";
      mutedRef.current = m;
      setMutedState(m);
    } catch {}
    // Some browsers load voices asynchronously; touching the list warms it up.
    if (ok) window.speechSynthesis.getVoices();
    return () => {
      if (ok) window.speechSynthesis.cancel();
    };
  }, []);

  const setMuted = useCallback((m: boolean) => {
    mutedRef.current = m;
    setMutedState(m);
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {}
    if (m && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
    return en.find((v) => /Samantha|Daniel|Google US English|Microsoft (Aria|Guy)/i.test(v.name)) ?? en.find((v) => v.default) ?? en[0] ?? null;
  };

  const speak = useCallback((text: string) => {
    if (mutedRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const t = text.trim();
    if (!t) return;
    const u = new SpeechSynthesisUtterance(t);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = 1.03;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(!!window.speechSynthesis.pending || window.speechSynthesis.speaking);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { supported, muted, setMuted, speaking, speak, cancel };
}

// Finds the end of the last complete sentence in `text` at or after `from`, or -1.
export function sentenceBoundary(text: string, from: number): number {
  const re = /[.!?…]["')\]]?(?:\s|$)/g;
  re.lastIndex = from;
  let end = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) end = m.index + m[0].length;
  return end;
}
