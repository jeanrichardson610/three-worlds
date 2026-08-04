export interface RadarFrame {
  time: number;
  path: string;
  isForecast: boolean;
}

export interface RadarFrameSet {
  host: string;
  frames: RadarFrame[];
  /** Index of the "now" frame within `frames` */
  nowIndex: number;
}

/**
 * Fetches the list of available RainViewer radar frames (past + short-term
 * forecast/nowcast) and returns them as one flat, time-ordered timeline.
 */
export async function fetchRadarFrames(): Promise<RadarFrameSet> {
  const res = await fetch("https://api.rainviewer.com/public/weather-maps.json");
  if (!res.ok) throw new Error("RainViewer request failed");
  const json = await res.json();

  const past = (json.radar?.past ?? []) as { time: number; path: string }[];
  const nowcast = (json.radar?.nowcast ?? []) as { time: number; path: string }[];

  const frames: RadarFrame[] = [
    ...past.map((f) => ({ ...f, isForecast: false })),
    ...nowcast.map((f) => ({ ...f, isForecast: true })),
  ];

  return {
    host: json.host as string,
    frames,
    nowIndex: Math.max(past.length - 1, 0),
  };
}

/** Builds a tile URL template for a given frame, usable directly by Leaflet's L.tileLayer */
export function radarTileUrl(host: string, path: string) {
  // size=256, color scheme=2 (universal blue), smooth=1, snow=1
  return `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`;
}