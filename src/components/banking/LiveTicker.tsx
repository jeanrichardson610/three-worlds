import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { ToastEvent } from "@/hooks/useLiveActivity";

function formatUSD(n: number) {
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export default function LiveTicker({ toast }: { toast: ToastEvent | null }) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!toast || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.45, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [toast?.id]);

  if (!toast) return null;

  return createPortal(
    <div
      ref={cardRef}
      className="fixed right-4 top-4 z-[60] flex items-center gap-3 rounded-xl border border-bank-border bg-bank-surface px-4 py-3 shadow-2xl"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bank-mint/15 text-sm">
        💳
      </span>
      <div className="flex flex-col">
        <span className="text-xs text-bank-muted">New transaction</span>
        <span className="text-sm text-bank-text">
          {toast.merchant} <span className="tabular text-bank-rose">{formatUSD(toast.amount)}</span>
        </span>
      </div>
    </div>,
    document.body
  );
}