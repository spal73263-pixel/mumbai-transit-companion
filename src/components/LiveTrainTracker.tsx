import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";

// Station coordinates
const STATION_COORDS: Record<string, [number, number]> = {
  Churchgate: [18.9352, 72.8278], "Marine Lines": [18.9440, 72.8234],
  "Charni Road": [18.9513, 72.8192], "Grant Road": [18.9590, 72.8190],
  "Mumbai Central": [18.9692, 72.8198], "Mahalaxmi": [18.982, 72.819],
  "Lower Parel": [18.994, 72.831], "Elphinstone Road": [18.987, 72.831],
  Dadar: [19.0176, 72.8428], "Matunga Road": [19.027, 72.847],
  Mahim: [19.042, 72.84], Bandra: [19.0544, 72.8403],
  "Khar Road": [19.066, 72.837], Santacruz: [19.082, 72.839],
  "Vile Parle": [19.098, 72.843], Andheri: [19.1197, 72.8464],
  Jogeshwari: [19.136, 72.849], Goregaon: [19.155, 72.849],
  "Ram Mandir": [19.164, 72.848], Malad: [19.187, 72.848],
  Kandivali: [19.204, 72.852], Borivali: [19.2288, 72.857],
  Dahisar: [19.253, 72.86], "Mira Road": [19.281, 72.868],
  Bhayandar: [19.301, 72.851], Naigaon: [19.351, 72.844],
  "Vasai Road": [19.371, 72.828], Nallasopara: [19.418, 72.821],
  Virar: [19.4559, 72.8111],
  CST: [18.9398, 72.8355], Masjid: [18.948, 72.8392],
  "Sandhurst Road": [18.958, 72.843], Byculla: [18.977, 72.834],
  Chinchpokli: [18.985, 72.833], Parel: [18.993, 72.837],
  "Dadar Central": [19.0178, 72.8435], Matunga: [19.027, 72.856],
  Sion: [19.044, 72.862], Kurla: [19.0726, 72.8793],
  Vidyavihar: [19.079, 72.891], Ghatkopar: [19.086, 72.908],
  Vikhroli: [19.106, 72.927], Kanjurmarg: [19.128, 72.936],
  Bhandup: [19.149, 72.946], Nahur: [19.161, 72.953],
  Mulund: [19.173, 72.956], Thane: [19.186, 72.9757],
  Dombivli: [19.2183, 73.0867], Kalyan: [19.2437, 73.1355],
  Wadala: [19.0178, 72.8688], "Cotton Green": [18.986, 72.852],
  Sewri: [18.999, 72.859], "Dockyard Road": [18.961, 72.845],
  "Reay Road": [18.971, 72.846], "Kings Circle": [19.032, 72.864],
  "Mahim Junction": [19.0427, 72.842], "GTB Nagar": [19.03, 72.874],
  Chunabhatti: [19.053, 72.876], "Tilak Nagar": [19.067, 72.89],
  Chembur: [19.062, 72.897], Govandi: [19.044, 72.912],
  Mankhurd: [19.066, 72.924], Vashi: [19.077, 73.002],
  Sanpada: [19.061, 73.014], Turbhe: [19.071, 73.012],
  Juinagar: [19.052, 73.023], Nerul: [19.033, 73.018],
  "Seawoods Darave": [19.02, 73.018], Belapur: [19.022, 73.039],
  Kharghar: [19.047, 73.066], Mansarovar: [19.038, 73.087],
  Khandeshwar: [19.026, 73.098], Panvel: [18.993, 73.1175],
  Versova: [19.131, 72.8175], "Andheri Metro": [19.1197, 72.8464],
  WEH: [19.1186, 72.8369], Chakala: [19.117, 72.859],
  "Airport Road": [19.109, 72.87], "Marol Naka": [19.1108, 72.872],
  "Saki Naka": [19.1017, 72.8884], Asalpha: [19.096, 72.898],
  "Jagruti Nagar": [19.102, 72.898], "Ghatkopar Metro": [19.0866, 72.9085],
  Airoli: [19.153, 72.999], Rabale: [19.142, 73.013],
  Ghansoli: [19.122, 73.008], "Kopar Khairane": [19.103, 73.007],
};

const LINE_ROUTES: Record<string, string[]> = {
  Western: ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Mahalaxmi", "Lower Parel", "Elphinstone Road", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Ram Mandir", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
  Central: ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Parel", "Dadar Central", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
  Harbour: ["CST", "Dockyard Road", "Reay Road", "Cotton Green", "Sewri", "Wadala", "Kings Circle", "Mahim Junction", "GTB Nagar", "Chunabhatti", "Tilak Nagar", "Chembur", "Govandi", "Mankhurd", "Vashi", "Sanpada", "Turbhe", "Juinagar", "Nerul", "Seawoods Darave", "Belapur", "Kharghar", "Mansarovar", "Khandeshwar", "Panvel"],
  "Metro 1": ["Versova", "Andheri Metro", "WEH", "Chakala", "Airport Road", "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar Metro"],
};

const LINE_COLORS: Record<string, string> = {
  Western: "#2563eb", Central: "#dc2626", Harbour: "#16a34a", "Metro 1": "#9333ea",
};

interface TrainPosition {
  id: string;
  serviceNumber: string;
  from: string;
  to: string;
  type: string;
  crowdLevel: string;
  position: [number, number];
  progress: number;
  line: string;
}

// Interpolate position along a line based on progress (0-1)
function interpolatePosition(
  fromStation: string,
  toStation: string,
  line: string,
  progress: number
): [number, number] | null {
  const route = LINE_ROUTES[line];
  if (!route) return null;

  const fromIdx = route.indexOf(fromStation);
  const toIdx = route.indexOf(toStation);
  if (fromIdx === -1 || toIdx === -1) return null;

  const startCoord = STATION_COORDS[fromStation];
  const endCoord = STATION_COORDS[toStation];
  if (!startCoord || !endCoord) return null;

  // Get all intermediate coords
  const lo = Math.min(fromIdx, toIdx);
  const hi = Math.max(fromIdx, toIdx);
  const intermediateStops = route.slice(lo, hi + 1);
  if (fromIdx > toIdx) intermediateStops.reverse();

  const coords = intermediateStops
    .map((s) => STATION_COORDS[s])
    .filter(Boolean) as [number, number][];

  if (coords.length < 2) {
    return [
      startCoord[0] + (endCoord[0] - startCoord[0]) * progress,
      startCoord[1] + (endCoord[1] - startCoord[1]) * progress,
    ];
  }

  // Calculate cumulative distances
  const distances = [0];
  for (let i = 1; i < coords.length; i++) {
    const d = Math.sqrt(
      Math.pow(coords[i][0] - coords[i - 1][0], 2) +
      Math.pow(coords[i][1] - coords[i - 1][1], 2)
    );
    distances.push(distances[i - 1] + d);
  }
  const totalDist = distances[distances.length - 1];
  const targetDist = totalDist * progress;

  // Find the segment
  for (let i = 1; i < distances.length; i++) {
    if (targetDist <= distances[i]) {
      const segProgress = (targetDist - distances[i - 1]) / (distances[i] - distances[i - 1]);
      return [
        coords[i - 1][0] + (coords[i][0] - coords[i - 1][0]) * segProgress,
        coords[i - 1][1] + (coords[i][1] - coords[i - 1][1]) * segProgress,
      ];
    }
  }
  return coords[coords.length - 1];
}

function getLineForStations(from: string, to: string): string {
  for (const [line, stops] of Object.entries(LINE_ROUTES)) {
    if (stops.includes(from) || stops.includes(to)) return line;
  }
  return "Western";
}

// Custom animated train icon
function createTrainIcon(color: string, crowdLevel: string) {
  const crowdColor = crowdLevel === "high" ? "#ef4444" : crowdLevel === "medium" ? "#f59e0b" : "#22c55e";
  return L.divIcon({
    className: "train-marker-icon",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 3px solid white;
      box-shadow: 0 0 12px ${color}80, 0 2px 8px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      position: relative; animation: trainPulse 2s ease-in-out infinite;
    ">
      <div style="width: 8px; height: 8px; border-radius: 50%; background: ${crowdColor};"></div>
      <div style="
        position: absolute; top: -4px; right: -4px;
        width: 10px; height: 10px; border-radius: 50%;
        background: ${crowdColor}; border: 2px solid white;
      "></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function AnimatedTrains({ trains }: { trains: TrainPosition[] }) {
  const map = useMap();
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  useEffect(() => {
    const currentIds = new Set(trains.map((t) => t.id));
    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Update or add markers
    trains.forEach((train) => {
      const line = train.line;
      const color = LINE_COLORS[line] ?? "#6b7280";
      const icon = createTrainIcon(color, train.crowdLevel);

      const existing = markersRef.current.get(train.id);
      if (existing) {
        // Smooth move
        const start = existing.getLatLng();
        const end = L.latLng(train.position[0], train.position[1]);
        const steps = 30;
        let step = 0;
        const animate = () => {
          step++;
          const t = step / steps;
          const lat = start.lat + (end.lat - start.lat) * t;
          const lng = start.lng + (end.lng - start.lng) * t;
          existing.setLatLng([lat, lng]);
          if (step < steps) requestAnimationFrame(animate);
        };
        animate();
        existing.setIcon(icon);
      } else {
        const marker = L.marker(train.position, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align:center;font-family:system-ui">
              <b style="font-size:13px">${train.serviceNumber}</b><br/>
              <span style="font-size:11px;color:#666">${train.from} → ${train.to}</span><br/>
              <span style="font-size:11px;color:${train.crowdLevel === 'high' ? '#ef4444' : train.crowdLevel === 'medium' ? '#f59e0b' : '#22c55e'};font-weight:600">
                ${train.crowdLevel.toUpperCase()} crowd
              </span>
            </div>
          `);
        markersRef.current.set(train.id, marker);
      }
    });

    return () => {};
  }, [trains, map]);

  return null;
}

const LiveTrainTracker = () => {
  const [trains, setTrains] = useState<TrainPosition[]>([]);
  const progressRef = useRef<Map<string, number>>(new Map());

  const fetchAndUpdate = async () => {
    const { data } = await supabase
      .from("services")
      .select(`
        id, service_number, type, crowd_level, departure_time, arrival_time,
        from_station:stations!services_from_station_id_fkey(name, line),
        to_station:stations!services_to_station_id_fkey(name)
      `)
      .eq("is_active", true);

    if (!data) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const positions: TrainPosition[] = [];
    data.forEach((s: any) => {
      const from = s.from_station?.name;
      const to = s.to_station?.name;
      if (!from || !to) return;

      const line = s.from_station?.line ?? getLineForStations(from, to);

      // Calculate progress based on time
      const depParts = s.departure_time?.split(":") ?? ["8", "0"];
      const arrParts = s.arrival_time?.split(":") ?? ["9", "0"];
      const depMin = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
      const arrMin = parseInt(arrParts[0]) * 60 + parseInt(arrParts[1]);
      const totalDuration = arrMin - depMin || 60;

      // Simulate movement: use modulo to create continuous looping
      const elapsed = ((currentMinutes - depMin) % totalDuration + totalDuration) % totalDuration;
      let progress = elapsed / totalDuration;

      // Add slight randomness to make it feel real
      const prevProgress = progressRef.current.get(s.id) ?? progress;
      const smoothed = prevProgress + (progress - prevProgress) * 0.3;
      progressRef.current.set(s.id, smoothed);

      const pos = interpolatePosition(from, to, line, Math.min(smoothed, 0.98));
      if (!pos) return;

      positions.push({
        id: s.id,
        serviceNumber: s.service_number,
        from,
        to,
        type: s.type,
        crowdLevel: s.crowd_level ?? "low",
        position: pos,
        progress: smoothed,
        line,
      });
    });

    setTrains(positions);
  };

  useEffect(() => {
    fetchAndUpdate();
    const interval = setInterval(fetchAndUpdate, 3000); // Update every 3s
    return () => clearInterval(interval);
  }, []);

  // Line polylines for background
  const linePolylines = Object.entries(LINE_ROUTES).map(([line, stops]) => {
    const coords = stops
      .map((s) => STATION_COORDS[s])
      .filter(Boolean) as [number, number][];
    return { line, coords };
  });

  return (
    <div className="rounded-lg overflow-hidden border border-border shadow-card" style={{ height: 500 }}>
      <style>{`
        @keyframes trainPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
      <MapContainer
        center={[19.076, 72.877]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw rail lines */}
        {linePolylines.map(({ line, coords }) => (
          <Polyline
            key={line}
            positions={coords}
            pathOptions={{
              color: LINE_COLORS[line] ?? "#6b7280",
              weight: 3,
              opacity: 0.4,
              dashArray: "8 4",
            }}
          />
        ))}

        {/* Station dots */}
        {Object.entries(STATION_COORDS).map(([name, pos]) => (
          <CircleMarker
            key={name}
            center={pos}
            radius={3}
            pathOptions={{ fillColor: "#94a3b8", color: "#64748b", weight: 1, fillOpacity: 0.6 }}
          >
            <Popup>
              <span className="text-xs font-medium">{name}</span>
            </Popup>
          </CircleMarker>
        ))}

        {/* Animated train markers */}
        <AnimatedTrains trains={trains} />
      </MapContainer>
    </div>
  );
};

export default LiveTrainTracker;
