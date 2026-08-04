import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import type { Account, Transaction } from "@/types/banking";
import { CATEGORY_GLYPH } from "./TransactionsList";
import { generateReceiptPdf } from "@/lib/Statementpdf";

function formatUSD(n: number) {
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TransactionDetail({
  transaction,
  account,
  originRect,
  onClose,
}: {
  transaction: Transaction;
  account?: Account;
  originRect: DOMRect;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [closing, setClosing] = useState(false);

  // Prevent background scroll while open.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // FLIP: measure the panel's final resting position, then animate in from
  // the clicked row's rect (Invert), and let GSAP play it back to identity.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay) return;

    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25 });

    const finalRect = panel.getBoundingClientRect();
    const scaleX = originRect.width / finalRect.width;
    const scaleY = originRect.height / finalRect.height;
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const finalCenterX = finalRect.left + finalRect.width / 2;
    const finalCenterY = finalRect.top + finalRect.height / 2;

    const tween = gsap.fromTo(
      panel,
      {
        x: originCenterX - finalCenterX,
        y: originCenterY - finalCenterY,
        scaleX,
        scaleY,
        opacity: 0.5,
      },
      {
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: 0.55,
        ease: "power3.out",
      }
    );

    return () => {
      tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!panel || !overlay || closing) return;
    setClosing(true);

    const currentRect = panel.getBoundingClientRect();
    const scaleX = originRect.width / currentRect.width;
    const scaleY = originRect.height / currentRect.height;
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;

    gsap.to(overlay, { opacity: 0, duration: 0.3 });
    gsap.to(panel, {
      x: originCenterX - currentCenterX,
      y: originCenterY - currentCenterY,
      scaleX,
      scaleY,
      opacity: 0.4,
      duration: 0.4,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-5 rounded-2xl border border-bank-border bg-bank-surface p-6"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-bank-surface-2 text-xl">
              {CATEGORY_GLYPH[transaction.category]}
            </span>
            <div>
              <p className="font-display text-base text-bank-text">{transaction.merchant}</p>
              <p className="text-xs capitalize text-bank-muted">{transaction.category}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full border border-bank-border px-2.5 py-1 text-xs text-bank-muted hover:text-bank-text"
          >
            Close
          </button>
        </div>

        <div className="text-center">
          <p
            className={`tabular font-display text-4xl ${
              transaction.amount < 0 ? "text-bank-text" : "text-bank-mint"
            }`}
          >
            {formatUSD(transaction.amount)}
          </p>
          <p className="mt-1 text-xs text-bank-muted">{formatFullDate(transaction.date)}</p>
        </div>

        <div className="flex flex-col divide-y divide-bank-border rounded-xl border border-bank-border">
          <Row label="Status" value={transaction.status === "pending" ? "Pending" : "Posted"} />
          <Row
            label="Account"
            value={account ? `${account.name} · ${account.accountNumberMasked}` : "—"}
          />
          {transaction.runningBalance != null && (
            <Row label="Balance after" value={formatUSD(transaction.runningBalance)} />
          )}
          <Row label="Transaction ID" value={transaction.id} mono />
        </div>

        <button
          onClick={() => generateReceiptPdf(transaction, account)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-bank-border py-2.5 text-sm text-bank-text hover:border-bank-mint/50"
        >
          ⬇ Download receipt (PDF)
        </button>
      </div>
    </div>,
    document.body
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <span className="text-bank-muted">{label}</span>
      <span className={`text-bank-text ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}