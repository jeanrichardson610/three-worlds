import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { WorldKey } from "@/App";

interface WorldDef {
  key: WorldKey;
  label: string;
  glyph: string;
  accent: string;
}

export const WORLDS: WorldDef[] = [
  { key: "banking", label: "Banking", glyph: "◆", accent: "#33d6ac" },
  { key: "anime", label: "Anime", glyph: "✧", accent: "#ff3d81" },
  { key: "weather", label: "Weather", glyph: "☼", accent: "#5fb8ff" },
];

interface SidebarProps {
  active: WorldKey;
  onChange: (world: WorldKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  active,
  onChange,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const pillRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const btn = buttonRefs.current[active];
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!btn || !nav || !pill) return;

    const navBox = nav.getBoundingClientRect();
    const btnBox = btn.getBoundingClientRect();

    gsap.to(pill, {
      top: btnBox.top - navBox.top,
      height: btnBox.height,
      duration: 0.5,
      ease: "power3.out",
    });
  }, [active, collapsed]);

  return (
    <aside
      className={`relative flex h-full flex-col border-r border-shell-border bg-shell-panel transition-[width] duration-300 ${
        collapsed ? "w-[76px]" : "w-[240px]"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-shell-accent/15 font-display text-shell-accent">
          3W
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="font-display text-sm text-shell-text">Three Worlds</span>
            <span className="text-[11px] text-shell-muted">dashboard suite</span>
          </div>
        )}
      </div>

      <nav ref={navRef} className="relative mt-2 flex flex-col gap-1 px-3">
        <div
          ref={pillRef}
          className="pointer-events-none absolute left-3 right-3 rounded-xl bg-shell-accent/10 ring-1 ring-shell-accent/40"
          style={{ top: 0, height: 0 }}
        />
        {WORLDS.map((world) => {
          const isActive = active === world.key;
          return (
            <button
              key={world.key}
              ref={(node) => {
                buttonRefs.current[world.key] = node;
              }}
              onClick={() => onChange(world.key)}
              className={`relative z-10 flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
                isActive ? "text-shell-text" : "text-shell-muted hover:text-shell-text"
              }`}
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm"
                style={{
                  color: isActive ? world.accent : undefined,
                  background: isActive ? `${world.accent}22` : "transparent",
                }}
              >
                {world.glyph}
              </span>
              {!collapsed && (
                <span className="font-display text-sm">{world.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <button
          onClick={onToggleCollapse}
          className="flex w-full items-center justify-center rounded-xl border border-shell-border py-2 text-xs text-shell-muted transition-colors hover:text-shell-text"
        >
          {collapsed ? "»" : "« Collapse"}
        </button>
      </div>
    </aside>
  );
}
