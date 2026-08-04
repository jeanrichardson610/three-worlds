import { forwardRef, useImperativeHandle, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import gsap from "gsap";
import type { Card } from "@/types/banking";

const THEME_GRADIENT: Record<Card["theme"], string> = {
  gold: "linear-gradient(135deg, #7a5a20, #e9bd6b 55%, #7a5a20)",
  midnight: "linear-gradient(135deg, #0f1c30, #23406b 55%, #0f1c30)",
  mint: "linear-gradient(135deg, #124a3d, #33d6ac 55%, #124a3d)",
};

function formatVirtualNumber(num: string, revealed: boolean) {
  if (revealed) return num;
  const groups = num.split(" ");
  return groups.map((g, i) => (i === groups.length - 1 ? g : "••••")).join(" ");
}

function CardFace({
  card,
  frozen,
  onToggleFrozen,
}: {
  card: Card;
  frozen: boolean;
  onToggleFrozen: () => void;
}) {
  const faceRef = useRef<HTMLDivElement | null>(null);
  const glareRef = useRef<HTMLDivElement | null>(null);
  const [limit, setLimit] = useState(card.spendingLimit);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const spentPct = Math.min((card.spentThisMonth / limit) * 100, 100);

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = faceRef.current;
    const glare = glareRef.current;
    if (!el || !glare) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    gsap.to(glare, { "--gx": `${x}%`, "--gy": `${y}%`, opacity: 0.9, duration: 0.35, ease: "power2.out" });
    gsap.to(el, {
      rotateY: (x - 50) / 8,
      rotateX: -(y - 50) / 8,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 700,
    });
  };

  const handleLeave = () => {
    gsap.to(glareRef.current, { opacity: 0, duration: 0.5 });
    gsap.to(faceRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "power3.out" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(card.virtualNumber.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available; silently ignore */
    }
  };

  return (
    <div className="flex w-64 shrink-0 flex-col gap-3">
      <div
        ref={faceRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative flex h-40 flex-col justify-between overflow-hidden rounded-2xl p-4 text-white shadow-lg will-change-transform"
        style={{
          background: THEME_GRADIENT[card.theme],
          filter: frozen ? "grayscale(0.85) brightness(0.7)" : "none",
          transformStyle: "preserve-3d",
        }}
      >
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 opacity-0"
          style={
            {
              "--gx": "50%",
              "--gy": "50%",
              background:
                "radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.35), transparent 45%)",
            } as CSSProperties
          }
        />
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-white/80">
            {card.label}
          </span>
          <span className="font-display text-sm uppercase">{card.network}</span>
        </div>
        <div>
          <p className="tabular text-lg tracking-[0.2em]">
            {formatVirtualNumber(card.virtualNumber, revealed)}
          </p>
          <p className="text-xs text-white/70">Exp {card.expiry}</p>
        </div>
        {frozen && (
          <span className="absolute right-4 top-4 rounded-full bg-black/40 px-2 py-1 text-[10px] uppercase tracking-wide">
            Frozen
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onToggleFrozen}
          className="flex-1 rounded-lg border border-bank-border py-2 text-xs text-bank-muted transition-colors hover:text-bank-text"
        >
          {frozen ? "Unfreeze" : "Freeze"}
        </button>
        <button
          onClick={() => setRevealed((r) => !r)}
          className="flex-1 rounded-lg border border-bank-border py-2 text-xs text-bank-muted transition-colors hover:text-bank-text"
        >
          {revealed ? "Hide number" : "Reveal number"}
        </button>
        <button
          onClick={handleCopy}
          className="rounded-lg border border-bank-border px-3 py-2 text-xs text-bank-muted transition-colors hover:text-bank-text"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 rounded-xl border border-bank-border bg-bank-surface p-3">
        <div className="flex items-center justify-between text-[11px] text-bank-muted">
          <span>Spending limit</span>
          <span className="tabular text-bank-text">${limit.toLocaleString()}/mo</span>
        </div>
        <input
          type="range"
          min={200}
          max={10000}
          step={100}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="w-full accent-bank-mint"
        />
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bank-surface-2">
          <div
            className={`h-full rounded-full ${spentPct >= 90 ? "bg-bank-rose" : "bg-bank-mint"}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <p className="tabular text-[11px] text-bank-muted">
          ${card.spentThisMonth.toFixed(0)} spent this month ({Math.round(spentPct)}%)
        </p>
      </div>
    </div>
  );
}

export interface CardsPanelHandle {
  freezeAll: () => void;
}

const CardsPanel = forwardRef<CardsPanelHandle, { cards: Card[] }>(function CardsPanel(
  { cards },
  ref
) {
  const [frozenMap, setFrozenMap] = useState<Record<string, boolean>>(
    Object.fromEntries(cards.map((c) => [c.id, c.frozen]))
  );

  useImperativeHandle(ref, () => ({
    freezeAll: () =>
      setFrozenMap(Object.fromEntries(cards.map((c) => [c.id, true]))),
  }));

  return (
    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar" style={{ perspective: 900 }}>
      {cards.map((card) => (
        <CardFace
          key={card.id}
          card={card}
          frozen={frozenMap[card.id]}
          onToggleFrozen={() =>
            setFrozenMap((prev) => ({ ...prev, [card.id]: !prev[card.id] }))
          }
        />
      ))}
    </div>
  );
});

export default CardsPanel;