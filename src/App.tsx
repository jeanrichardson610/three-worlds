import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Sidebar, { WORLDS } from "@/components/shell/Sidebar";
import LoadingScreen from "@/components/shell/LoadingScreen";
import BankingDashboard from "@/components/banking/BankingDashboard";
import AnimeDashboard from "@/components/anime/AnimeDashboard";
import WeatherDashboard from "@/components/weather/WeatherDashboard";

export type WorldKey = "banking" | "anime" | "weather";

const MIN_LOADING_MS = 900;

export default function App() {
  const [active, setActive] = useState<WorldKey>("banking");
  const [renderedWorld, setRenderedWorld] = useState<WorldKey>("banking");
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const activeWorldDef = WORLDS.find((w) => w.key === active)!;

  // Initial boot loading screen
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), MIN_LOADING_MS + 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (world: WorldKey) => {
    if (world === active) return;
    setActive(world);
    setLoading(true);
    const timer = setTimeout(() => {
      setRenderedWorld(world);
      setLoading(false);
    }, MIN_LOADING_MS);
    return () => clearTimeout(timer);
  };

  // Animate dashboard content in whenever the rendered world changes
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", clearProps: "transform" }
      );
    });
    return () => ctx.revert();
  }, [renderedWorld, loading]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-shell-bg">
      <Sidebar
        active={active}
        onChange={handleChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <main className="relative flex-1 overflow-y-auto">
        {loading && (
          <LoadingScreen
            label={WORLDS.find((w) => w.key === active)!.label}
            accent={activeWorldDef.accent}
          />
        )}

        {!loading && (
          <div ref={contentRef}>
            {renderedWorld === "banking" && <BankingDashboard />}
            {renderedWorld === "anime" && <AnimeDashboard />}
            {renderedWorld === "weather" && <WeatherDashboard />}
          </div>
        )}
      </main>
    </div>
  );
}