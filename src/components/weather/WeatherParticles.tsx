import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  icon: string;
  isDay: boolean;
}

type Particle = Record<string, number>;

export default function WeatherParticles({ icon, isDay }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(parent);

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    let particles: Particle[] = [];
    let mode: "rain" | "snow" | "cloud" | "stars" | "motes" | "none" = "none";
    let lightningTimer = 0;
    let lightningFlash = 0;

    const isPrecip = icon === "rain" || icon === "drizzle" || icon === "storm";

    if (isPrecip) {
      mode = "rain";
      const count = icon === "drizzle" ? 45 : icon === "storm" ? 110 : 75;
      particles = Array.from({ length: count }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        len: rand(10, icon === "storm" ? 26 : 18),
        speed: rand(icon === "storm" ? 9 : 5, icon === "storm" ? 16 : 10),
        drift: rand(-1.5, -0.5),
        opacity: rand(0.25, 0.55),
      }));
    } else if (icon === "snow") {
      mode = "snow";
      particles = Array.from({ length: 60 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(1.5, 3.5),
        speed: rand(0.6, 1.8),
        wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(0.01, 0.03),
        opacity: rand(0.5, 0.9),
      }));
    } else if (icon === "cloud" || icon === "cloud-sun" || icon === "fog") {
      mode = "cloud";
      particles = Array.from({ length: 6 }, (_, i) => ({
        x: rand(0, width),
        y: rand(height * 0.05, height * 0.4),
        w: rand(140, 260),
        h: rand(40, 70),
        speed: rand(4, 10) * (i % 2 === 0 ? 1 : -1) * 0.02,
        opacity: rand(0.05, 0.12),
      }));
    } else if (icon === "sun" && isDay) {
      mode = "motes";
      particles = Array.from({ length: 26 }, () => ({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(1, 2.4),
        speed: rand(0.15, 0.4),
        phase: rand(0, Math.PI * 2),
        opacity: rand(0.2, 0.5),
      }));
    } else if (!isDay) {
      mode = "stars";
      particles = Array.from({ length: 90 }, () => ({
        x: rand(0, width),
        y: rand(0, height * 0.75),
        r: rand(0.6, 1.8),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.02, 0.06),
      }));
    }

    function tick() {
      ctx!.clearRect(0, 0, width, height);
      const t = performance.now() / 1000;

      if (mode === "rain") {
        ctx!.strokeStyle = icon === "storm" ? "#cfe0ff" : "#bcd6ff";
        ctx!.lineWidth = icon === "storm" ? 1.6 : 1.2;
        for (const p of particles) {
          ctx!.globalAlpha = p.opacity;
          ctx!.beginPath();
          ctx!.moveTo(p.x, p.y);
          ctx!.lineTo(p.x + p.drift * 3, p.y + p.len);
          ctx!.stroke();
          p.y += p.speed;
          p.x += p.drift;
          if (p.y > height) {
            p.y = -p.len;
            p.x = rand(0, width);
          }
        }
        ctx!.globalAlpha = 1;

        if (icon === "storm") {
          lightningTimer -= 1;
          if (lightningTimer <= 0 && Math.random() < 0.006) {
            lightningFlash = 1;
            lightningTimer = 90;
          }
          if (lightningFlash > 0) {
            ctx!.fillStyle = `rgba(255,255,255,${lightningFlash * 0.25})`;
            ctx!.fillRect(0, 0, width, height);
            lightningFlash -= 0.08;
            if (lightningFlash < 0) lightningFlash = 0;
          }
        }
      } else if (mode === "snow") {
        ctx!.fillStyle = "#ffffff";
        for (const p of particles) {
          ctx!.globalAlpha = p.opacity;
          ctx!.beginPath();
          ctx!.arc(p.x + Math.sin(p.wobble) * 12, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
          p.y += p.speed;
          p.wobble += p.wobbleSpeed;
          if (p.y > height) {
            p.y = -4;
            p.x = rand(0, width);
          }
        }
        ctx!.globalAlpha = 1;
      } else if (mode === "cloud") {
        for (const p of particles) {
          const grad = ctx!.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.w / 2
          );
          grad.addColorStop(0, `rgba(255,255,255,${p.opacity})`);
          grad.addColorStop(1, "rgba(255,255,255,0)");
          ctx!.fillStyle = grad;
          ctx!.beginPath();
          ctx!.ellipse(p.x, p.y, p.w / 2, p.h / 2, 0, 0, Math.PI * 2);
          ctx!.fill();
          p.x += p.speed;
          if (p.x - p.w / 2 > width) p.x = -p.w / 2;
          if (p.x + p.w / 2 < 0) p.x = width + p.w / 2;
        }
      } else if (mode === "motes") {
        ctx!.fillStyle = "#fff6d8";
        for (const p of particles) {
          const flicker = 0.5 + 0.5 * Math.sin(t * 1.5 + p.phase);
          ctx!.globalAlpha = p.opacity * flicker;
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
          p.y -= p.speed;
          if (p.y < 0) p.y = height;
        }
        ctx!.globalAlpha = 1;
      } else if (mode === "stars") {
        ctx!.fillStyle = "#ffffff";
        for (const p of particles) {
          const twinkle = 0.4 + 0.6 * Math.sin(t * p.speed * 10 + p.phase);
          ctx!.globalAlpha = Math.max(0, twinkle);
          ctx!.beginPath();
          ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      }
    }

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      resizeObserver.disconnect();
    };
  }, [icon, isDay]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden="true"
    />
  );
}