import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import gsap from "gsap";
import type { GeoResult } from "@/types/weather";
import { fetchRadarFrames, radarTileUrl, type RadarFrame } from "@/lib/rainviewerapi";

const DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?api_key=${import.meta.env.CARTO_API_KEY}";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

function frameLabel(frame: RadarFrame) {
  const diffMin = Math.round((frame.time * 1000 - Date.now()) / 60000);
  if (Math.abs(diffMin) < 2) return "Now";
  return diffMin > 0 ? `+${diffMin}m` : `${diffMin}m`;
}

function locationMarkerIcon() {
  return L.divIcon({
    className: "",
    html:
      '<span style="position:relative;display:flex;height:14px;width:14px;">' +
      '<span style="position:absolute;inset:0;border-radius:9999px;background:#5fb8ff;opacity:0.6;animation:radar-ping 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>' +
      '<span style="position:relative;display:block;height:14px;width:14px;border-radius:9999px;background:#5fb8ff;border:2px solid white;"></span>' +
      "</span>",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function RadarMap({ location }: { location: GeoResult }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const radarLayerRef = useRef<L.TileLayer | null>(null);
  const playTimer = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [host, setHost] = useState("");
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([location.latitude, location.longitude], 6);

    L.tileLayer(DARK_TILES, {
      attribution: TILE_ATTRIBUTION,
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([location.latitude, location.longitude], {
      icon: locationMarkerIcon(),
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      radarLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter + move marker when the location changes (without rebuilding the map)
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;
    const latlng: L.LatLngExpression = [location.latitude, location.longitude];
    map.setView(latlng, map.getZoom(), { animate: true });
    marker.setLatLng(latlng);
  }, [location.latitude, location.longitude]);

  // Fetch RainViewer frames once
  useEffect(() => {
    let cancelled = false;
    fetchRadarFrames()
      .then((data) => {
        if (cancelled) return;
        setFrames(data.frames);
        setHost(data.host);
        setFrameIndex(data.nowIndex);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync the active radar tile layer to the selected frame
  useEffect(() => {
    const map = mapRef.current;
    const frame = frames[frameIndex];
    if (!map || !frame || !host) return;

    const url = radarTileUrl(host, frame.path);

    if (!radarLayerRef.current) {
      radarLayerRef.current = L.tileLayer(url, { opacity: 0.65, zIndex: 10 }).addTo(map);
    } else {
      radarLayerRef.current.setUrl(url);
    }
  }, [frames, frameIndex, host]);

  // Play/pause loop through the timeline
  useEffect(() => {
    if (!playing || frames.length === 0) {
      if (playTimer.current) window.clearInterval(playTimer.current);
      return;
    }
    playTimer.current = window.setInterval(() => {
      setFrameIndex((i) => (i + 1) % frames.length);
    }, 600);
    return () => {
      if (playTimer.current) window.clearInterval(playTimer.current);
    };
  }, [playing, frames.length]);

  useEffect(() => {
    if (status !== "ready") return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrapRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, [status]);

  const activeFrame = frames[frameIndex];

  return (
    <section className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base text-white">Live precipitation radar</h2>
        {status === "ready" && (
          <span className="text-[11px] uppercase tracking-wide text-white/60">
            RainViewer
          </span>
        )}
      </div>

      {status === "error" && (
        <p className="text-sm text-white/70">Radar data is unavailable right now.</p>
      )}

      <div ref={wrapRef} className="flex flex-col gap-3">
        <div
          ref={containerRef}
          className="h-72 w-full overflow-hidden rounded-xl border border-white/10"
        />

        {status === "ready" && frames.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying((p) => !p)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              aria-label={playing ? "Pause radar loop" : "Play radar loop"}
            >
              {playing ? "❚❚" : "▶"}
            </button>
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              value={frameIndex}
              onChange={(e) => {
                setPlaying(false);
                setFrameIndex(Number(e.target.value));
              }}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-sky-300"
            />
            <span className="w-12 shrink-0 text-right text-xs tabular text-white/80">
              {activeFrame ? frameLabel(activeFrame) : ""}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}