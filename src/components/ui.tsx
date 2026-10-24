"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main className={`flex-1 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4 pb-8 safe-bottom ${className}`}>
      {children}
    </main>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`bg-card border border-line rounded-2xl p-4 ${className}`}>{children}</section>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  onClick,
  href,
  variant = "secondary",
  size = "md",
  disabled,
  className = "",
  type = "button",
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold select-none transition active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100";
  const sizes = {
    lg: "min-h-16 px-5 text-xl w-full",
    md: "min-h-12 px-4 text-base",
    sm: "min-h-10 px-3 text-sm",
  }[size];
  const variants = {
    primary: "bg-accent text-accent-fg",
    secondary: "bg-card border border-line text-fg",
    ghost: "text-accent underline-offset-4 hover:underline",
    danger: "border border-warn text-warn",
  }[variant];
  const cls = `${base} ${sizes} ${variants} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls} aria-disabled={disabled}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-xs uppercase tracking-wide text-muted font-semibold">{children}</div>;
}

export function Spinner({ text = "Connecting…" }: { text?: string }) {
  return <div className="text-muted text-center py-16">{text}</div>;
}
