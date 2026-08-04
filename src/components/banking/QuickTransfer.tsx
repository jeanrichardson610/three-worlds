import { useState } from "react";
import type { Contact } from "@/types/banking";

export default function QuickTransfer({ contacts }: { contacts: Contact[] }) {
  const [selected, setSelected] = useState<string | null>(contacts[0]?.id ?? null);
  const [amount, setAmount] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const handleSend = () => {
    const contact = contacts.find((c) => c.id === selected);
    if (!contact || !amount) return;
    setSent(`Sent $${amount} to ${contact.name}`);
    setAmount("");
    setTimeout(() => setSent(null), 2500);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {contacts.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelected(c.id)}
            className={`flex shrink-0 flex-col items-center gap-2 rounded-xl px-1 py-2 ${
              selected === c.id ? "opacity-100" : "opacity-60 hover:opacity-90"
            }`}
          >
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-full font-display text-sm ${
                selected === c.id
                  ? "bg-bank-mint text-bank-bg"
                  : "bg-bank-surface-2 text-bank-text"
              }`}
            >
              {c.initials}
            </span>
            <span className="text-[11px] text-bank-muted">
              {c.name.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-lg text-bank-muted">$</span>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          placeholder="0.00"
          className="w-full rounded-lg border border-bank-border bg-transparent px-3 py-2 text-sm text-bank-text outline-none focus:border-bank-mint"
        />
        <button
          onClick={handleSend}
          disabled={!amount || !selected}
          className="shrink-0 rounded-lg bg-bank-mint px-4 py-2 text-sm font-medium text-bank-bg disabled:opacity-40"
        >
          Send
        </button>
      </div>
      {sent && <p className="text-xs text-bank-mint">{sent}</p>}
    </div>
  );
}
