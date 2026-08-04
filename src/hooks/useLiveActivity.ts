import { useEffect, useRef, useState } from "react";
import type { Transaction } from "@/types/banking";

const LIVE_MERCHANTS: { merchant: string; category: Transaction["category"] }[] = [
  { merchant: "Trader Joe's", category: "groceries" },
  { merchant: "Blue Bottle Coffee", category: "dining" },
  { merchant: "Uber", category: "transport" },
  { merchant: "Amazon", category: "shopping" },
  { merchant: "Chipotle", category: "dining" },
  { merchant: "Shell Gas", category: "transport" },
];

export interface ToastEvent {
  id: string;
  merchant: string;
  amount: number;
}

interface Options {
  accountId: string;
  minDelayMs?: number;
  maxDelayMs?: number;
}

/**
 * Wraps a base transaction list + starting balance and periodically injects
 * a simulated new transaction (pending -> posted after a few seconds),
 * emitting a toast event each time one lands.
 */
export function useLiveActivity(
  baseTransactions: Transaction[],
  baseBalance: number,
  { accountId, minDelayMs = 16000, maxDelayMs = 32000 }: Options
) {
  const [transactions, setTransactions] = useState<Transaction[]>(baseTransactions);
  const [balance, setBalance] = useState(baseBalance);
  const [toast, setToast] = useState<ToastEvent | null>(null);
  const toastTimer = useRef<number | null>(null);
  const balanceRef = useRef(baseBalance);
  

  useEffect(() => {
    let cancelled = false;
    let timeout: number;

    const scheduleNext = () => {
      const delay = minDelayMs + Math.random() * (maxDelayMs - minDelayMs);
      timeout = window.setTimeout(() => {
        if (cancelled) return;

        const pick = LIVE_MERCHANTS[Math.floor(Math.random() * LIVE_MERCHANTS.length)];
        const amount = -Math.round((4 + Math.random() * 60) * 100) / 100;
        const id = `live-${Date.now()}`;
        const updatedBalance = Math.round((balanceRef.current + amount) * 100) / 100;
        balanceRef.current = updatedBalance;

        setTransactions((prev) => {
          const next: Transaction = {
            id,
            date: new Date().toISOString(),
            merchant: pick.merchant,
            category: pick.category,
            amount,
            accountId,
            status: "pending",
            runningBalance: updatedBalance,
          };
          return [next, ...prev];
        });

        setBalance(updatedBalance);

        setToast({ id, merchant: pick.merchant, amount });
        if (toastTimer.current) window.clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(null), 4200);

        // Flip pending -> posted after a few seconds, like a real settlement.
        window.setTimeout(() => {
          if (cancelled) return;
          setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: "posted" } : t))
          );
        }, 4500);

        scheduleNext();
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId]);

  const addFunds = (amount: number, merchant = "Manual deposit") => {
    const id = `manual-${Date.now()}`;
    const updatedBalance = Math.round((balanceRef.current + amount) * 100) / 100;
    balanceRef.current = updatedBalance;

    setTransactions((prev) => [
      {
        id,
        date: new Date().toISOString(),
        merchant,
        category: "income",
        amount,
        accountId,
        status: "posted",
        runningBalance: updatedBalance,
      },
      ...prev,
    ]);
    setBalance(updatedBalance);

    setToast({ id, merchant, amount });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  };

  return { transactions, balance, toast, addFunds };
}