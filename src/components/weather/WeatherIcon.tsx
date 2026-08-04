import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function WeatherIcon({
  icon,
  size = 96,
}: {
  icon: string;
  size?: number;
}) {
  const rootRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (icon === "sun") {
        gsap.to(".w-sun-rays", {
          rotate: 360,
          transformOrigin: "50% 50%",
          duration: 18,
          repeat: -1,
          ease: "none",
        });
      }
      if (icon === "cloud" || icon === "cloud-sun") {
        gsap.to(".w-cloud-back", {
          x: 5,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }
      if (icon === "rain" || icon === "drizzle") {
        gsap.to(".w-drop", {
          y: 10,
          opacity: 0,
          duration: 0.8,
          repeat: -1,
          stagger: 0.15,
          ease: "power1.in",
        });
      }
      if (icon === "snow") {
        gsap.to(".w-flake", {
          y: 8,
          rotate: 90,
          duration: 1.6,
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
          ease: "sine.inOut",
        });
      }
      if (icon === "storm") {
        gsap
          .timeline({ repeat: -1, repeatDelay: 1.2 })
          .to(".w-bolt", { opacity: 1, duration: 0.08 })
          .to(".w-bolt", { opacity: 0.2, duration: 0.12 })
          .to(".w-bolt", { opacity: 1, duration: 0.08 })
          .to(".w-bolt", { opacity: 0, duration: 0.4 });
      }
    }, rootRef);
    return () => ctx.revert();
  }, [icon]);

  return (
    <svg
      ref={rootRef}
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="drop-shadow-lg"
    >
      {icon === "sun" && (
        <g>
          <g className="w-sun-rays" stroke="#ffd166" strokeWidth="4" strokeLinecap="round">
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * Math.PI) / 4;
              const x1 = 50 + Math.cos(angle) * 32;
              const y1 = 50 + Math.sin(angle) * 32;
              const x2 = 50 + Math.cos(angle) * 42;
              const y2 = 50 + Math.sin(angle) * 42;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
          <circle cx="50" cy="50" r="22" fill="#ffd166" />
        </g>
      )}

      {(icon === "cloud" || icon === "cloud-sun") && (
        <g>
          {icon === "cloud-sun" && (
            <circle cx="38" cy="40" r="14" fill="#ffd166" />
          )}
          <g className="w-cloud-back">
            <ellipse cx="55" cy="60" rx="26" ry="16" fill="#c9d6e8" />
            <ellipse cx="40" cy="65" rx="20" ry="13" fill="#e7edf6" />
          </g>
        </g>
      )}

      {(icon === "rain" || icon === "drizzle") && (
        <g>
          <ellipse cx="50" cy="45" rx="26" ry="16" fill="#c9d6e8" />
          {[35, 50, 65].map((x, i) => (
            <line
              key={i}
              className="w-drop"
              x1={x}
              y1="65"
              x2={x - 4}
              y2="78"
              stroke="#5fb8ff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </g>
      )}

      {icon === "snow" && (
        <g>
          <ellipse cx="50" cy="45" rx="26" ry="16" fill="#dfe7f2" />
          {[35, 50, 65].map((x, i) => (
            <circle key={i} className="w-flake" cx={x} cy="70" r="2.5" fill="#ffffff" />
          ))}
        </g>
      )}

      {icon === "storm" && (
        <g>
          <ellipse cx="50" cy="42" rx="26" ry="16" fill="#8a94a6" />
          <polygon className="w-bolt" points="52,58 42,78 50,78 46,92 64,68 54,68" fill="#ffd166" />
        </g>
      )}

      {icon === "fog" && (
        <g stroke="#c9d6e8" strokeWidth="4" strokeLinecap="round">
          <line x1="20" y1="45" x2="80" y2="45" />
          <line x1="28" y1="55" x2="72" y2="55" />
          <line x1="20" y1="65" x2="80" y2="65" />
        </g>
      )}
    </svg>
  );
}
