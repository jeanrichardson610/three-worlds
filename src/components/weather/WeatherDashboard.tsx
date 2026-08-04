import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { AirQuality, DailyPoint, GeoResult, WeatherBundle } from "@/types/weather";
import {
  describeWeatherCode,
  fetchAirQuality,
  fetchWeatherForLocation,
} from "@/lib/weatherApi";
import { useCountUp } from "@/hooks/useCountUp";
import WeatherSearch from "./WeatherSearch";
import WeatherIcon from "./WeatherIcon";
import WeatherParticles from "./WeatherParticles";
import HourlyScrubber from "./Hourlyscrubber";
import DailyForecast from "./DailyForecast";
import WeatherSkeleton from "./WeatherSkeleton";
import RadarMap from "./RadarMap";
import AQIGauge from "./Aqigauge";
import SunPathArc from "./Sunpatharc";
import OutdoorScore from "./Outdoorscore";

const DEFAULT_LOCATION: GeoResult = {
  id: 5128581,
  name: "New York",
  country: "United States",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.006,
  timezone: "America/New_York",
};

function gradientFor(icon: string, isDay: boolean) {
  if (!isDay) return "linear-gradient(160deg, #0b1026, #1c2452 55%, #0b1026)";
  switch (icon) {
    case "sun":
      return "linear-gradient(160deg, #2b7fff, #6fb7ff 55%, #ffe0a3)";
    case "cloud-sun":
      return "linear-gradient(160deg, #5b8fd1, #8fb3dd 55%, #cfd9e6)";
    case "cloud":
    case "fog":
      return "linear-gradient(160deg, #55606e, #7c8798 55%, #a6afba)";
    case "rain":
    case "drizzle":
      return "linear-gradient(160deg, #33445c, #4a5e7a 55%, #6c7f9a)";
    case "snow":
      return "linear-gradient(160deg, #4c5a72, #8fa3bd 55%, #dfe7f2)";
    case "storm":
      return "linear-gradient(160deg, #1a1f2e, #33384a 55%, #565f75)";
    default:
      return "linear-gradient(160deg, #2b7fff, #6fb7ff 55%, #ffe0a3)";
  }
}

/** Estimates day/night for a given hourly timestamp using that day's sunrise/sunset */
function isDaytimeAt(iso: string, daily: DailyPoint[]) {
  const date = iso.slice(0, 10);
  const day = daily.find((d) => d.date === date) ?? daily[0];
  if (!day) return true;
  const t = new Date(iso).getTime();
  return t >= new Date(day.sunrise).getTime() && t <= new Date(day.sunset).getTime();
}

export default function WeatherDashboard() {
  const [location, setLocation] = useState<GeoResult>(DEFAULT_LOCATION);
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [air, setAir] = useState<AirQuality | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          name: "Your location",
          country: "",
          timezone: "auto",
        }));
      },
      () => {
        /* silently keep default location if permission denied */
      },
      { timeout: 4000 }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setPreviewIndex(null);

    Promise.all([fetchWeatherForLocation(location), fetchAirQuality(location)])
      .then(([weather, airQuality]) => {
        if (cancelled) return;
        setBundle(weather);
        setAir(airQuality);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
    };
  }, [location]);

  useEffect(() => {
    if (status !== "ready") return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [status]);

  // Resolve what's actually on display: either live current conditions, or
  // whichever hour the user is previewing on the scrubber.
  const previewHour =
    previewIndex != null && bundle ? bundle.hourly[previewIndex] : null;

  const displayTemp = previewHour ? previewHour.temperature : bundle?.current.temperature ?? 0;
  const displayWeatherCode = previewHour
    ? previewHour.weatherCode
    : bundle?.current.weatherCode ?? 0;
  const displayIsDay = previewHour
    ? isDaytimeAt(previewHour.time, bundle?.daily ?? [])
    : bundle?.current.isDay ?? true;

  const tempRef = useCountUp(
    displayTemp,
    (n) => `${Math.round(n)}°`,
    [bundle?.location.id, previewIndex]
  );

  const conditionMeta = bundle
    ? describeWeatherCode(displayWeatherCode)
    : { label: "Loading", icon: "cloud" };
  const background = bundle
    ? gradientFor(conditionMeta.icon, displayIsDay)
    : "linear-gradient(160deg, #2b7fff, #6fb7ff 55%, #ffe0a3)";

  return (
    <div
      className="relative flex min-h-full flex-col gap-6 overflow-hidden p-6 text-weather-text transition-[background] duration-700 md:p-8"
      style={{ background }}
    >
      {bundle && status === "ready" && (
        <WeatherParticles icon={conditionMeta.icon} isDay={displayIsDay} />
      )}

      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">
            Open-Meteo
          </p>
          <h1 className="font-display text-2xl font-semibold text-white">
            Weather °C
          </h1>
        </div>
        <WeatherSearch onSelect={setLocation} />
      </div>

      {status === "error" && (
        <p className="relative z-10 rounded-xl bg-black/30 px-4 py-3 text-sm text-white">
          Couldn't load weather for this location. Try searching another city.
        </p>
      )}

      {status === "loading" && (
        <div className="relative z-10">
          <WeatherSkeleton />
        </div>
      )}

      {bundle && air && status === "ready" && (
        <div className="relative z-10 flex flex-col gap-6">
          <div
            ref={heroRef}
            className="flex flex-col items-center gap-2 rounded-3xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur"
          >
            <p className="font-display text-lg text-white/90">
              {bundle.location.name}
              {bundle.location.admin1 ? `, ${bundle.location.admin1}` : ""}
            </p>
            {previewHour && (
              <p className="rounded-full bg-white/15 px-3 py-1 text-[11px] uppercase tracking-wide text-white/80">
                Previewing{" "}
                {new Date(previewHour.time).toLocaleTimeString("en-US", {
                  hour: "numeric",
                })}
              </p>
            )}
            <WeatherIcon icon={conditionMeta.icon} size={100} />
            <span
              ref={tempRef}
              className="tabular font-display text-6xl font-semibold text-white"
            >
              0°
            </span>
            <p className="text-sm text-white/80">{conditionMeta.label}</p>
            {!previewHour && (
              <p className="text-xs text-white/60">
                Feels like {Math.round(bundle.current.apparentTemperature)}° · Humidity{" "}
                {bundle.current.humidity}% · Wind {Math.round(bundle.current.windSpeed)}{" "}
                km/h
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "UV index", value: bundle.current.uvIndex.toFixed(1) },
              { label: "Pressure", value: `${Math.round(bundle.current.pressure)} hPa` },
              { label: "Precipitation", value: `${bundle.current.precipitation} mm` },
              {
                label: "Sunset",
                value: new Date(bundle.daily[0].sunset).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }),
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur"
              >
                <p className="text-[11px] uppercase tracking-wide text-white/60">
                  {stat.label}
                </p>
                <p className="tabular text-lg font-medium text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <HourlyScrubber
            hours={bundle.hourly}
            selectedIndex={previewIndex}
            onChange={setPreviewIndex}
          />

          <RadarMap location={location} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <AQIGauge air={air} />
            <SunPathArc sunrise={bundle.daily[0].sunrise} sunset={bundle.daily[0].sunset} />
            <OutdoorScore
              uvIndex={bundle.current.uvIndex}
              aqi={air.usAqi}
              windSpeed={bundle.current.windSpeed}
              precipProbability={bundle.hourly[0]?.precipitationProbability ?? 0}
            />
          </div>

          <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
            <h2 className="mb-2 font-display text-base text-white">7-day forecast</h2>
            <DailyForecast days={bundle.daily} />
          </section>
        </div>
      )}
    </div>
  );
}