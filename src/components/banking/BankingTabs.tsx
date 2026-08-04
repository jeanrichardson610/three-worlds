import { useEffect, useRef } from "react";
import gsap from "gsap";

export type BankingTab = "overview" | "transactions" | "cards" | "goals";

const TABS: { key: BankingTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "transactions", label: "Transactions" },
  { key: "cards", label: "Cards" },
  { key: "goals", label: "Goals" },
];

export default function BankingTabs({
  active,
  onChange,
}: {
  active: BankingTab;
  onChange: (tab: BankingTab) => void;
}) {
  const navRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const nav = navRef.current;
    const pill = pillRef.current;
    const btn = buttonRefs.current[active];
    if (!nav || !pill || !btn) return;

    const navBox = nav.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();

    gsap.to(pill, {
      left: btnBox.left - navBox.left,
      width: btnBox.width,
      duration: 0.4,
      ease: "power3.out",
    });
  }, [active]);

  return (
    <div
      ref={navRef}
      className="relative flex w-fit gap-1 rounded-xl border border-bank-border bg-bank-surface p-1"
    >
      <div
        ref={pillRef}
        className="pointer-events-none absolute top-1 h-[calc(100%-8px)] rounded-lg bg-bank-mint/15 ring-1 ring-bank-mint/40"
        style={{ left: 0, width: 0 }}
      />
      {TABS.map((tab) => (
        <button
          key={tab.key}
          ref={(node) => {
            buttonRefs.current[tab.key] = node;
          }}
          onClick={() => onChange(tab.key)}
          className={`relative z-10 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            active === tab.key ? "text-bank-text" : "text-bank-muted hover:text-bank-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}