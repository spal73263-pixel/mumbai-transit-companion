import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/utils";

// Mumbai station coordinates
const STATION_COORDS: Record<string, [number, number]> = {
  // Western Line
  Churchgate:       [18.9352, 72.8278],
  "Marine Lines":   [18.9440, 72.8234],
  "Charni Road":    [18.9513, 72.8192],
  "Grant Road":     [18.9590, 72.8190],
  "Mumbai Central": [18.9692, 72.8198],
  "Elphinstone":    [18.9870, 72.8310],
  "Lower Parel":    [18.9940, 72.8310],
  Dadar:            [19.0176, 72.8428],
  "Matunga Road":   [19.0270, 72.8470],
  "Mahim":          [19.0420, 72.8400],
  Bandra:           [19.0544, 72.8403],
  "Khar Road":      [19.0660, 72.8370],
  "Santacruz":      [19.0820, 72.8390],
  "Vile Parle":     [19.0980, 72.8430],
  Andheri:          [19.1197, 72.8464],
  "Jogeshwari":     [19.1360, 72.8490],
  "Goregaon":       [19.1550, 72.8490],
  "Malad":          [19.1870, 72.8480],
  "Kandivali":      [19.2040, 72.8520],
  Borivali:         [19.2288, 72.8570],
  "Dahisar":        [19.2530, 72.8600],
  "Mira Road":      [19.2810, 72.8680],
  "Bhayandar":      [19.3010, 72.8510],
  "Naigaon":        [19.3510, 72.8440],
  "Vasai Road":     [19.3710, 72.8280],
  "Nallasopara":    [19.4180, 72.8210],
  Virar:            [19.4559, 72.8111],

  // Central Line
  CST:              [18.9398, 72.8355],
  "Masjid":         [18.9480, 72.8392],
  "Sandhurst Road": [18.9580, 72.8430],
  "Byculla":        [18.9770, 72.8340],
  "Chinchpokli":    [18.9850, 72.8330],
  "Matunga":        [19.0270, 72.8560],
  "Sion":           [19.0440, 72.8620],
  Kurla:            [19.0726, 72.8793],
  "Vidyavihar":     [19.0790, 72.8910],
  Ghatkopar:        [19.0860, 72.9080],
  "Vikhroli":       [19.1060, 72.9270],
  "Kanjurmarg":     [19.1280, 72.9360],
  "Bhandup":        [19.1490, 72.9460],
  "Nahur":          [19.1610, 72.9530],
  "Mulund":         [19.1730, 72.9560],
  Thane:            [19.1860, 72.9757],
  "Dombivli":       [19.2183, 73.0867],
  Kalyan:           [19.2437, 73.1355],

  // Harbour Line
  Wadala:           [19.0178, 72.8688],
  "GTB Nagar":      [19.0300, 72.8740],
  "Chunabhatti":    [19.0530, 72.8760],
  "Mankhurd":       [19.0660, 72.9240],
  "Vashi":          [19.0770, 73.0020],
  "Nerul":          [19.0330, 73.0180],
  "Belapur":        [19.0220, 73.0380],
  "Kharghar":       [19.0430, 73.0660],
  Panvel:           [18.9930, 73.1175],

  // Metro 1
  Versova:          [19.1310, 72.8175],
  WEH:              [19.1186, 72.8369],
  "Azad Nagar":     [19.1150, 72.8450],
  "D.N. Nagar":     [19.1260, 72.8310],
  "Marol Naka":     [19.1108, 72.8720],
  "Saki Naka":      [19.1017, 72.8884],
  "Jagruti Nagar":  [19.1020, 72.8980],
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
  Western:   ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Elphinstone", "Lower Parel", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
  Central:   ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Dadar", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
  Harbour:   ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Dadar", "Matunga", "Sion", "Kurla", "Chunabhatti", "GTB Nagar", "Wadala", "Mankhurd", "Vashi", "Nerul", "Belapur", "Kharghar", "Panvel"],
  "Metro 1": ["Versova", "D.N. Nagar", "Azad Nagar", "WEH", "Marol Naka", "Saki Naka", "Jagruti Nagar", "Ghatkopar"],
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
