import type {
  AirQuality,
  CurrentWeather,
  DailyPoint,
  GeoResult,
  HourlyPoint,
  WeatherBundle,
} from "@/types/weather";

const GEO_BASE = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";
const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function searchLocations(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const url = `${GEO_BASE}/search?name=${encodeURIComponent(
    query
  )}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding request failed");
  const json = await res.json();
  return (json.results ?? []) as GeoResult[];
}

export async function fetchWeatherForLocation(
  location: GeoResult
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || "auto",
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,precipitation,surface_pressure,uv_index",
    hourly: "temperature_2m,precipitation_probability,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset",
    forecast_days: "7",
  });

  const res = await fetch(`${FORECAST_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Forecast request failed");
  const json = await res.json();

  const current: CurrentWeather = {
    temperature: json.current.temperature_2m,
    apparentTemperature: json.current.apparent_temperature,
    humidity: json.current.relative_humidity_2m,
    windSpeed: json.current.wind_speed_10m,
    windDirection: json.current.wind_direction_10m,
    weatherCode: json.current.weather_code,
    isDay: json.current.is_day === 1,
    precipitation: json.current.precipitation,
    pressure: json.current.surface_pressure,
    uvIndex: json.current.uv_index ?? 0,
  };

  const nowIndex: number = json.hourly.time.findIndex(
    (t: string) => t === json.current.time
  );
  const startIdx = nowIndex >= 0 ? nowIndex : 0;

  const hourly: HourlyPoint[] = json.hourly.time
    .slice(startIdx, startIdx + 24)
    .map((t: string, i: number) => ({
      time: t,
      temperature: json.hourly.temperature_2m[startIdx + i],
      precipitationProbability: json.hourly.precipitation_probability[startIdx + i],
      weatherCode: json.hourly.weather_code[startIdx + i],
    }));

  const daily: DailyPoint[] = json.daily.time.map((d: string, i: number) => ({
    date: d,
    weatherCode: json.daily.weather_code[i],
    tempMax: json.daily.temperature_2m_max[i],
    tempMin: json.daily.temperature_2m_min[i],
    precipitationSum: json.daily.precipitation_sum[i],
    sunrise: json.daily.sunrise[i],
    sunset: json.daily.sunset[i],
  }));

  return { location, current, hourly, daily };
}

export async function fetchAirQuality(location: GeoResult): Promise<AirQuality> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    timezone: location.timezone || "auto",
    current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide",
  });

  const res = await fetch(`${AIR_QUALITY_BASE}?${params.toString()}`);
  if (!res.ok) throw new Error("Air quality request failed");
  const json = await res.json();

  return {
    usAqi: json.current?.us_aqi ?? null,
    pm2_5: json.current?.pm2_5 ?? null,
    pm10: json.current?.pm10 ?? null,
    ozone: json.current?.ozone ?? null,
    nitrogenDioxide: json.current?.nitrogen_dioxide ?? null,
  };
}

// EPA US AQI breakpoints -> label + color
export function describeAqi(aqi: number | null) {
  if (aqi == null) return { label: "Unknown", color: "#8b8f9a" };
  if (aqi <= 50) return { label: "Good", color: "#4ade80" };
  if (aqi <= 100) return { label: "Moderate", color: "#facc15" };
  if (aqi <= 150) return { label: "Unhealthy (sensitive)", color: "#fb923c" };
  if (aqi <= 200) return { label: "Unhealthy", color: "#f87171" };
  if (aqi <= 300) return { label: "Very unhealthy", color: "#c084fc" };
  return { label: "Hazardous", color: "#a78bfa" };
}

// WMO weather codes -> human label + icon key
export const WEATHER_CODE_MAP: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Rime fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Dense drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  80: { label: "Rain showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent showers", icon: "rain" },
  95: { label: "Thunderstorm", icon: "storm" },
  96: { label: "Thunderstorm w/ hail", icon: "storm" },
  99: { label: "Thunderstorm w/ hail", icon: "storm" },
};

export function describeWeatherCode(code: number) {
  return WEATHER_CODE_MAP[code] ?? { label: "Unknown", icon: "cloud" };
}