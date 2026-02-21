import { useState, useEffect } from "react";
import { ArrowRight, Clock, Repeat, Train, Zap, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import StationSelector from "@/components/StationSelector";
import CrowdIndicator from "@/components/CrowdIndicator";
import RouteMap from "@/components/RouteMap";
import RouteGeoMap from "@/components/RouteGeoMap";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Segment {
  from: string;
  to: string;
  type: "suburban" | "metro";
  line: string;
  duration: number;
  crowdLevel: "low" | "medium" | "high";
}

interface RouteOption {
  id: string;
  label: string;
  segments: Segment[];
  totalDuration: number;
  crowdLevel: "low" | "medium" | "high";
  changes: number;
}

interface StationRow {
  id: string;
  name: string;
  line: string;
  type: string;
}

interface ServiceRow {
  id: string;
  from_name: string;
  to_name: string;
  type: string;
  crowd_level: string;
  current_occupancy: number;
  max_capacity: number;
  from_line: string;
  departure_time: string;
  arrival_time: string;
}

// Mumbai railway network topology — adjacency and known routes
const LINE_ORDER: Record<string, string[]> = {
  Western:   ["Churchgate", "Mumbai Central", "Dadar", "Bandra", "Andheri", "Borivali", "Virar"],
  Central:   ["CST", "Kurla", "Ghatkopar", "Thane", "Kalyan"],
  Harbour:   ["CST", "Kurla", "Wadala", "Panvel"],
  "Metro 1": ["Versova", "WEH", "Marol Naka", "Saki Naka", "Ghatkopar"],
};

const DURATION_PER_STOP: Record<string, number> = {
  Western: 5, Central: 7, Harbour: 9, "Metro 1": 4,
};

// Interchanges: which stations connect which lines
const INTERCHANGES: Record<string, string[]> = {
  Dadar:    ["Western", "Central"],
  Kurla:    ["Central", "Harbour", "Metro 1"],
  Ghatkopar:["Central", "Metro 1"],
  CST:      ["Central", "Harbour"],
  Andheri:  ["Western", "Metro 1"],
};

function getStationLine(station: string): string | null {
  for (const [line, stops] of Object.entries(LINE_ORDER)) {
    if (stops.includes(station)) return line;
  }
  return null;
}

function buildDirectRoute(
  from: string,
  to: string,
  line: string,
  serviceMap: Map<string, ServiceRow>,
  idx: number
): RouteOption | null {
  const stops = LINE_ORDER[line];
  if (!stops) return null;
  const fi = stops.indexOf(from);
  const ti = stops.indexOf(to);
  if (fi === -1 || ti === -1) return null;

  const numStops = Math.abs(fi - ti);
  const duration = numStops * (DURATION_PER_STOP[line] ?? 6);

  // Find a real service on this route for crowd level
  const svc = serviceMap.get(`${from}-${to}`) || serviceMap.get(`${to}-${from}`);
  const crowdLevel = (svc?.crowd_level as "low" | "medium" | "high") ?? (idx === 0 ? "high" : "medium");

  return {
    id: `r${idx}`,
    label: idx === 0 ? "Direct" : "Alternative",
    segments: [{
      from, to,
      type: line.startsWith("Metro") ? "metro" : "suburban",
      line,
      duration,
      crowdLevel,
    }],
    totalDuration: duration,
    crowdLevel,
    changes: 0,
  };
}

function buildInterchangeRoute(
  from: string,
  to: string,
  fromLine: string,
  toLline: string,
  interchange: string,
  serviceMap: Map<string, ServiceRow>,
  idx: number
): RouteOption | null {
  const fromStops = LINE_ORDER[fromLine];
  const toStops = LINE_ORDER[toLline];
  if (!fromStops || !toStops) return null;
  if (fromStops.indexOf(from) === -1 || toStops.indexOf(to) === -1) return null;
  if (fromStops.indexOf(interchange) === -1 || toStops.indexOf(interchange) === -1) return null;

  const seg1Stops = Math.abs(fromStops.indexOf(from) - fromStops.indexOf(interchange));
  const seg2Stops = Math.abs(toStops.indexOf(interchange) - toStops.indexOf(to));
  const dur1 = seg1Stops * (DURATION_PER_STOP[fromLine] ?? 6);
  const dur2 = seg2Stops * (DURATION_PER_STOP[toLline] ?? 6);

  const svc1 = serviceMap.get(`${from}-${interchange}`);
  const svc2 = serviceMap.get(`${interchange}-${to}`);
  const crowd1 = (svc1?.crowd_level as "low" | "medium" | "high") ?? "medium";
  const crowd2 = (svc2?.crowd_level as "low" | "medium" | "high") ?? "low";
  const overallCrowd = crowd1 === "high" || crowd2 === "high" ? "high" : crowd1 === "medium" || crowd2 === "medium" ? "medium" : "low";

  return {
    id: `r${idx}`,
    label: "Via " + interchange,
    segments: [
      { from, to: interchange, type: fromLine.startsWith("Metro") ? "metro" : "suburban", line: fromLine, duration: dur1, crowdLevel: crowd1 },
      { from: interchange, to, type: toLline.startsWith("Metro") ? "metro" : "suburban", line: toLline, duration: dur2, crowdLevel: crowd2 },
    ],
    totalDuration: dur1 + dur2 + 5, // 5min transfer
    crowdLevel: overallCrowd,
    changes: 1,
  };
}

function computeRoutes(from: string, to: string, serviceMap: Map<string, ServiceRow>): RouteOption[] {
  if (!from || !to || from === to) return [];
  const routes: RouteOption[] = [];

  const fromLine = getStationLine(from);
  const toLine = getStationLine(to);

  if (!fromLine || !toLine) return [];

  // 1. Direct on same line
  if (fromLine === toLine) {
    const direct = buildDirectRoute(from, to, fromLine, serviceMap, 0);
    if (direct) routes.push(direct);

    // Also suggest via interchange if one exists
    for (const [iStation, lines] of Object.entries(INTERCHANGES)) {
      if (lines.includes(fromLine) && lines.length > 1) {
        const altLine = lines.find(l => l !== fromLine);
        if (altLine) {
          const alt = buildInterchangeRoute(from, to, fromLine, altLine, iStation, serviceMap, routes.length);
          if (alt && alt.totalDuration > 0) routes.push(alt);
        }
      }
    }
    return routes.slice(0, 3);
  }

  // 2. Cross-line — find interchange stations
  for (const [iStation, lines] of Object.entries(INTERCHANGES)) {
    if (lines.includes(fromLine) && lines.includes(toLine)) {
      const r = buildInterchangeRoute(from, to, fromLine, toLine, iStation, serviceMap, routes.length);
      if (r) routes.push(r);
    }
  }

  // 3. Two-hop: from → interchangeA → interchangeB → to
  if (routes.length === 0) {
    // Try to find a connecting path
    for (const [iA, linesA] of Object.entries(INTERCHANGES)) {
      if (!linesA.includes(fromLine)) continue;
      for (const [iB, linesB] of Object.entries(INTERCHANGES)) {
        if (!linesB.includes(toLine)) continue;
        const sharedLine = linesA.find(l => linesB.includes(l));
        if (!sharedLine) continue;
        const fromStops = LINE_ORDER[fromLine];
        const midStops = LINE_ORDER[sharedLine];
        const toStops = LINE_ORDER[toLine];
        if (!fromStops?.includes(from)) continue;
        if (!fromStops?.includes(iA)) continue;
        if (!midStops?.includes(iA) || !midStops?.includes(iB)) continue;
        if (!toStops?.includes(iB) || !toStops?.includes(to)) continue;

        const d1 = Math.abs(fromStops.indexOf(from) - fromStops.indexOf(iA)) * (DURATION_PER_STOP[fromLine] ?? 6);
        const d2 = Math.abs(midStops.indexOf(iA) - midStops.indexOf(iB)) * (DURATION_PER_STOP[sharedLine] ?? 6);
        const d3 = Math.abs(toStops.indexOf(iB) - toStops.indexOf(to)) * (DURATION_PER_STOP[toLine] ?? 6);

        routes.push({
          id: `r${routes.length}`,
          label: `Via ${iA} & ${iB}`,
          segments: [
            { from, to: iA, type: "suburban", line: fromLine, duration: d1, crowdLevel: "medium" },
            { from: iA, to: iB, type: "suburban", line: sharedLine, duration: d2, crowdLevel: "medium" },
            { from: iB, to, type: "suburban", line: toLine, duration: d3, crowdLevel: "low" },
          ],
          totalDuration: d1 + d2 + d3 + 10,
          crowdLevel: "medium",
          changes: 2,
        });
        if (routes.length >= 2) break;
      }
      if (routes.length >= 2) break;
    }
  }

  return routes.slice(0, 3);
}

const Routes = () => {
  const [from, setFrom] = useState("Kalyan");
  const [to, setTo] = useState("Panvel");
  const [stations, setStations] = useState<StationRow[]>([]);
  const [serviceMap, setServiceMap] = useState<Map<string, ServiceRow>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [{ data: stationData }, { data: serviceData }] = await Promise.all([
        supabase.from("stations").select("id, name, line, type").order("name"),
        supabase.from("services").select(`
          id, type, crowd_level, current_occupancy, max_capacity, departure_time, arrival_time,
          from_station:stations!services_from_station_id_fkey(name, line),
          to_station:stations!services_to_station_id_fkey(name)
        `).eq("is_active", true),
      ]);

      if (stationData) setStations(stationData);

      if (serviceData) {
        const map = new Map<string, ServiceRow>();
        serviceData.forEach((s: any) => {
          const fn = s.from_station?.name ?? "";
          const tn = s.to_station?.name ?? "";
          map.set(`${fn}-${tn}`, {
            id: s.id,
            from_name: fn,
            to_name: tn,
            type: s.type,
            crowd_level: s.crowd_level ?? "low",
            current_occupancy: s.current_occupancy ?? 0,
            max_capacity: s.max_capacity ?? 1500,
            from_line: s.from_station?.line ?? "",
            departure_time: s.departure_time ?? "",
            arrival_time: s.arrival_time ?? "",
          });
        });
        setServiceMap(map);
      }

      setLoading(false);
    };

    fetchData();

    // Real-time crowd updates
    const channel = supabase
      .channel("routes-services")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "services" }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stationNames = stations.map(s => s.name);
  const routes = computeRoutes(from, to, serviceMap);

  // Build per-station crowd map from real-time service data
  const stationCrowdMap: Record<string, "low" | "medium" | "high"> = {};
  serviceMap.forEach((svc) => {
    const level = svc.crowd_level as "low" | "medium" | "high";
    // Assign crowd level to from/to stations (worst wins)
    [svc.from_name, svc.to_name].forEach(name => {
      if (!name) return;
      const existing = stationCrowdMap[name];
      if (!existing || (level === "high") || (level === "medium" && existing === "low")) {
        stationCrowdMap[name] = level;
      }
    });
  });

  const crowdColor = (level: "low" | "medium" | "high") =>
    level === "high" ? "text-crowd-high" : level === "medium" ? "text-crowd-medium" : "text-crowd-low";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Smart Route Finder</h1>
          <p className="text-muted-foreground mt-1">Find the fastest, least crowded route — with live crowd data</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <StationSelector label="From" value={from} onChange={setFrom} stations={stationNames} />
            <StationSelector label="To" value={to} onChange={setTo} stations={stationNames} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-foreground">Suggested Routes</h2>
          {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>

        {!from || !to ? (
          <div className="text-center py-16 text-muted-foreground">Select a From and To station to see routes</div>
        ) : routes.length === 0 && !loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-medium mb-1">No route found</p>
            <p className="text-sm">Try stations on connected lines (e.g. Kalyan → Panvel via Kurla)</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {routes.map((route, i) => (
              <motion.div
                key={route.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "rounded-lg border bg-card p-5 transition-all hover:shadow-elevated cursor-pointer",
                  i === 0 ? "border-accent shadow-card" : "border-border"
                )}
              >
                {i === 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent mb-3">
                    <Zap className="h-3.5 w-3.5" />
                    RECOMMENDED
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-display font-bold text-xl text-card-foreground">{route.totalDuration} min</span>
                    </div>
                    <CrowdIndicator level={route.crowdLevel} size="sm" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-xs font-semibold", crowdColor(route.crowdLevel))}>
                      {route.crowdLevel.toUpperCase()} CROWD
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Repeat className="h-3 w-3" />
                      {route.changes} change{route.changes !== 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                {/* Schematic Route Map */}
                <div className="rounded-lg bg-muted/50 border border-border mb-3">
                  <RouteMap segments={route.segments} stationCrowdMap={stationCrowdMap} />
                </div>

                {/* Geographic Map */}
                <div className="mb-3">
                  <RouteGeoMap segments={route.segments} stationCrowdMap={stationCrowdMap} />
                </div>

                <div className="flex flex-col gap-2">
                  {route.segments.map((seg, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={cn(
                        "rounded p-1",
                        seg.type === "metro" ? "bg-metro/10" : "bg-rail/10"
                      )}>
                        <Train className={cn("h-3.5 w-3.5", seg.type === "metro" ? "text-metro" : "text-rail")} />
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{seg.from}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-medium text-card-foreground">{seg.to}</span>
                      <span className={cn(
                        "ml-auto text-xs font-medium px-2 py-0.5 rounded",
                        seg.type === "metro" ? "bg-metro/10 text-metro" : "bg-rail/10 text-rail"
                      )}>
                        {seg.line} • {seg.duration}m
                      </span>
                      <span className={cn("text-xs font-semibold", crowdColor(seg.crowdLevel))}>
                        {seg.crowdLevel === "high" ? "🔴" : seg.crowdLevel === "medium" ? "🟡" : "🟢"}
                      </span>
                    </div>
                  ))}
                </div>

                {route.label !== "Direct" && (
                  <p className="text-xs text-muted-foreground mt-3 font-medium">{route.label}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Routes;
