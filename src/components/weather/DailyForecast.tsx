import type { DailyPoint } from "@/types/weather";
import { describeWeatherCode } from "@/lib/weatherApi";
import WeatherIcon from "./WeatherIcon";

export default function DailyForecast({ days }: { days: DailyPoint[] }) {
  return (
    <div className="flex flex-col divide-y divide-white/10">
      {days.map((d, i) => {
        const { label, icon } = describeWeatherCode(d.weatherCode);
        const dayLabel =
          i === 0
            ? "Today"
            : new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
        return (
          <div key={d.date} className="flex items-center gap-4 py-3">
            <span className="w-16 text-sm text-white/80">{dayLabel}</span>
            <WeatherIcon icon={icon} size={30} />
            <span className="flex-1 text-xs text-white/60">{label}</span>
            <span className="tabular text-sm text-white/60">
              {Math.round(d.tempMin)}°
            </span>
            <div className="h-1 w-20 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300"
                style={{ width: "100%" }}
              />
            </div>
            <span className="tabular text-sm font-medium text-white">
              {Math.round(d.tempMax)}°
            </span>
          </div>
        );
      })}
    </div>
  );
}
