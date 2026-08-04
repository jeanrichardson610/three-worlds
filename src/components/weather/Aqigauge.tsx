import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { AirQuality } from "@/types/weather";
import { describeAqi } from "@/lib/weatherApi";

const MAX_AQI = 300;

export default function AQIGauge({ air }: { air: AirQuality }) {
  const arcRef = useRef<SVGPathElement | null>(null);
  const needleRef = useRef<SVGGElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);

  const aqi = air.usAqi ?? 0;
  const fraction = Math.max(0, Math.min(1, aqi / MAX_AQI));
  const meta = describeAqi(air.usAqi);

  useEffect(() => {
    const arc = arcRef.current;
    const needle = needleRef.current;
    if (!arc || !needle) return;

    const length = arc.getTotalLength();
    gsap.set(arc, { strokeDasharray: length, strokeDashoffset: length });
    gsap.set(needle, { rotate: -90, transformOrigin: "100px 100px" });

    const obj = { val: 0 };
    const tl = gsap.timeline();
    tl.to(arc, {
      strokeDashoffset: length * (1 - fraction),
      duration: 1.1,
      ease: "power3.out",
    }, 0);
    tl.to(needle, {
      rotate: -90 + fraction * 180,
      duration: 1.1,
      ease: "power3.out",
    }, 0);
    tl.to(obj, {
      val: aqi,
      duration: 1.1,
      ease: "power3.out",
      onUpdate: () => {
        if (valueRef.current) valueRef.current.textContent = String(Math.round(obj.val));
      },
    }, 0);

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aqi, fraction]);

  const stats = [
    { label: "PM2.5", value: air.pm2_5, unit: "µg/m³" },
    { label: "PM10", value: air.pm10, unit: "µg/m³" },
    { label: "Ozone", value: air.ozone, unit: "µg/m³" },
    { label: "NO₂", value: air.nitrogenDioxide, unit: "µg/m³" },
  ];

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
      <h2 className="mb-2 font-display text-base text-white">Air quality</h2>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 115" className="w-full max-w-[220px]">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            ref={arcRef}
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={meta.color}
            strokeWidth="14"
            strokeLinecap="round"
          />
          <g ref={needleRef}>
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="34"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="white" />
          </g>
        </svg>
        <div className="-mt-4 flex flex-col items-center">
          <span
            ref={valueRef}
            className="tabular font-display text-4xl font-semibold text-white"
          >
            0
          </span>
          <span className="text-xs font-medium" style={{ color: meta.color }}>
            {meta.label}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-white/5 px-2 py-1.5 text-center">
            <p className="text-[10px] uppercase tracking-wide text-white/50">{s.label}</p>
            <p className="tabular text-sm text-white">
              {s.value != null ? Math.round(s.value) : "–"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}