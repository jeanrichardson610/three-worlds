import { useEffect, useRef } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  label: string;
  accent: string; // hex color to theme the ring for the active world
}

export default function LoadingScreen({ label, accent }: LoadingScreenProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<SVGCircleElement | null>(null);
  const sweepRef = useRef<SVGCircleElement | null>(null);
  const imgWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(rootRef.current, { opacity: 0 });
      gsap.to(rootRef.current, { opacity: 1, duration: 0.35, ease: "power1.out" });

      // Radar sweep rotation
      gsap.to(sweepRef.current, {
        rotate: 360,
        transformOrigin: "50% 50%",
        duration: 1.4,
        repeat: -1,
        ease: "none",
      });

      // Dash offset "loading ring" pulse
      if (ringRef.current) {
        const length = ringRef.current.getTotalLength();
        gsap.set(ringRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(ringRef.current, {
          strokeDashoffset: 0,
          duration: 1.8,
          repeat: -1,
          ease: "power2.inOut",
        });
      }

      // Placeholder image breathing pulse
      gsap.to(imgWrapRef.current, {
        scale: 1.06,
        duration: 1.1,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-shell-bg"
    >
      <div className="relative flex h-40 w-40 items-center justify-center">
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="#1d2027"
            strokeWidth="3"
          />
          <circle
            ref={ringRef}
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full">
          <circle
            ref={sweepRef}
            cx="80"
            cy="80"
            r="55"
            fill="none"
            stroke={accent}
            strokeWidth="1"
            strokeDasharray="1 40"
            opacity={0.7}
          />
        </svg>

        {/* Placeholder image "porthole" */}
        <div
          ref={imgWrapRef}
          className="h-24 w-24 overflow-hidden rounded-full border border-shell-border bg-shell-panel"
        >
          <img
            src="https://placehold.co/200x200/141620/8b8f9a?text=%E2%80%A2"
            alt="Loading placeholder"
            className="h-full w-full object-cover opacity-80"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-shell-muted">
          Loading
        </p>
        <p className="font-display text-lg text-shell-text">{label}</p>
      </div>
    </div>
  );
}
