import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Mumbai station coordinates
const STATION_COORDS: Record<string, [number, number]> = {
  Churchgate:     [18.9352, 72.8278],
  "Mumbai Central": [18.9692, 72.8198],
  Dadar:          [19.0176, 72.8428],
  Bandra:         [19.0544, 72.8403],
  Andheri:        [19.1197, 72.8464],
  Borivali:       [19.2288, 72.8570],
  Virar:          [19.4559, 72.8111],
  CST:            [18.9398, 72.8355],
  Kurla:          [19.0726, 72.8793],
  Ghatkopar:      [19.0860, 72.9080],
  Thane:          [19.1860, 72.9757],
  Kalyan:         [19.2437, 73.1355],
  Wadala:         [19.0178, 72.8688],
  Panvel:         [18.9930, 73.1175],
  Versova:        [19.1310, 72.8175],
  WEH:            [19.1186, 72.8369],
  "Marol Naka":   [19.1108, 72.8720],
  "Saki Naka":    [19.1017, 72.8884],
};

const LINE_COLORS: Record<string, string> = {
  Western:   "#2563eb",
  Central:   "#dc2626",
  Harbour:   "#16a34a",
  "Metro 1": "#9333ea",
};

const CROWD_COLORS: Record<string, string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

interface RouteGeoMapProps {
  segments: {
    from: string;
    to: string;
    type: "suburban" | "metro";
    line: string;
    crowdLevel: "low" | "medium" | "high";
  }[];
  stationCrowdMap?: Record<string, "low" | "medium" | "high">;
}

// Full station lists per line
const LINE_STOPS: Record<string, string[]> = {
  Western:   ["Churchgate", "Mumbai Central", "Dadar", "Bandra", "Andheri", "Borivali", "Virar"],
  Central:   ["CST", "Kurla", "Ghatkopar", "Thane", "Kalyan"],
  Harbour:   ["CST", "Kurla", "Wadala", "Panvel"],
  "Metro 1": ["Versova", "WEH", "Marol Naka", "Saki Naka", "Ghatkopar"],
};

function expandSegment(from: string, to: string, line: string): string[] {
  const stops = LINE_STOPS[line];
  if (!stops) return [from, to];
  const fi = stops.indexOf(from);
  const ti = stops.indexOf(to);
  if (fi === -1 || ti === -1) return [from, to];
  return fi <= ti ? stops.slice(fi, ti + 1) : stops.slice(ti, fi + 1).reverse();
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

const RouteGeoMap = ({ segments, stationCrowdMap }: RouteGeoMapProps) => {
  const allPositions: [number, number][] = [];
  const polylines: { positions: [number, number][]; color: string }[] = [];
  const stationMarkers: {
    name: string;
    pos: [number, number];
    isMain: boolean;
    crowdLevel: "low" | "medium" | "high";
    line: string;
  }[] = [];

  const seenStations = new Set<string>();

  segments.forEach((seg) => {
    const expanded = expandSegment(seg.from, seg.to, seg.line);
    const linePositions: [number, number][] = [];

    expanded.forEach((name, i) => {
      const coord = STATION_COORDS[name];
      if (!coord) return;
      linePositions.push(coord);
      allPositions.push(coord);

      if (!seenStations.has(name)) {
        seenStations.add(name);
        const crowd = stationCrowdMap?.[name] ?? seg.crowdLevel;
        stationMarkers.push({
          name,
          pos: coord,
          isMain: i === 0 || i === expanded.length - 1,
          crowdLevel: crowd,
          line: seg.line,
        });
      }
    });

    polylines.push({
      positions: linePositions,
      color: LINE_COLORS[seg.line] ?? "#6b7280",
    });
  });

  if (allPositions.length < 2) return null;

  const center: [number, number] = [
    allPositions.reduce((s, p) => s + p[0], 0) / allPositions.length,
    allPositions.reduce((s, p) => s + p[1], 0) / allPositions.length,
  ];

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-card" style={{ height: 320 }}>
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds positions={allPositions} />

        {/* Route polylines */}
        {polylines.map((pl, i) => (
          <Polyline
            key={i}
            positions={pl.positions}
            pathOptions={{ color: pl.color, weight: 4, opacity: 0.8 }}
          />
        ))}

        {/* Station markers */}
        {stationMarkers.map((st) => (
          <CircleMarker
            key={st.name}
            center={st.pos}
            radius={st.isMain ? 8 : 5}
            pathOptions={{
              fillColor: CROWD_COLORS[st.crowdLevel],
              color: LINE_COLORS[st.line] ?? "#6b7280",
              weight: 2,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold text-sm">{st.name}</p>
                <p className="text-xs text-gray-500">{st.line}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: CROWD_COLORS[st.crowdLevel] }}
                  />
                  <span className="text-xs font-medium capitalize">{st.crowdLevel} crowd</span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RouteGeoMap;
