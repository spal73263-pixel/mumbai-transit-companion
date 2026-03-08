import { useState, useEffect, useMemo } from "react";
import { MapPin, Navigation, Train, ArrowRight, Clock, ChevronLeft, Loader2, AlertCircle, Users, Shield, Phone } from "lucide-react";
import Header from "@/components/Header";
import TrainPositionStrip from "@/components/TrainPositionStrip";
import CrowdIndicator from "@/components/CrowdIndicator";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const LINE_ROUTES: Record<string, { stations: string[]; color: string; icon: string }> = {
  Western: {
    stations: ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Mahalaxmi", "Lower Parel", "Elphinstone Road", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Ram Mandir", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
    color: "hsl(var(--rail))",
    icon: "🚆",
  },
  Central: {
    stations: ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Parel", "Dadar Central", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
    color: "hsl(var(--crowd-high))",
    icon: "🚃",
  },
  Harbour: {
    stations: ["CST", "Dockyard Road", "Reay Road", "Cotton Green", "Sewri", "Wadala", "Kings Circle", "Mahim Junction", "GTB Nagar", "Chunabhatti", "Tilak Nagar", "Chembur", "Govandi", "Mankhurd", "Vashi", "Sanpada", "Turbhe", "Juinagar", "Nerul", "Seawoods Darave", "Belapur", "Kharghar", "Mansarovar", "Khandeshwar", "Panvel"],
    color: "hsl(var(--crowd-medium))",
    icon: "🚈",
  },
  "Metro 1": {
    stations: ["Versova", "Andheri Metro", "WEH", "Chakala", "Airport Road", "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar Metro"],
    color: "hsl(var(--metro))",
    icon: "🚇",
  },
};

// Approximate station coordinates for GPS matching
const STATION_COORDS: Record<string, [number, number]> = {
  "Churchgate": [18.9322, 72.8264], "Marine Lines": [18.9439, 72.8231], "Charni Road": [18.9513, 72.8191],
  "Grant Road": [18.9630, 72.8168], "Mumbai Central": [18.9686, 72.8198], "Mahalaxmi": [18.9823, 72.8194],
  "Lower Parel": [18.9942, 72.8311], "Elphinstone Road": [19.0003, 72.8365], "Dadar": [19.0178, 72.8423],
  "Matunga Road": [19.0249, 72.8471], "Mahim": [19.0392, 72.8412], "Bandra": [19.0544, 72.8402],
  "Khar Road": [19.0650, 72.8369], "Santacruz": [19.0803, 72.8370], "Vile Parle": [19.0990, 72.8440],
  "Andheri": [19.1197, 72.8468], "Jogeshwari": [19.1358, 72.8490], "Goregaon": [19.1553, 72.8496],
  "Ram Mandir": [19.1647, 72.8513], "Malad": [19.1868, 72.8485], "Kandivali": [19.2048, 72.8529],
  "Borivali": [19.2281, 72.8567], "Dahisar": [19.2436, 72.8544], "Mira Road": [19.2812, 72.8690],
  "Bhayandar": [19.3012, 72.8510], "Naigaon": [19.3510, 72.8540], "Vasai Road": [19.3680, 72.8290],
  "Nallasopara": [19.4170, 72.8190], "Virar": [19.4550, 72.8110],
  "CST": [18.9398, 72.8355], "Masjid": [18.9476, 72.8393], "Sandhurst Road": [18.9594, 72.8424],
  "Byculla": [18.9784, 72.8331], "Chinchpokli": [18.9862, 72.8333], "Parel": [18.9929, 72.8367],
  "Dadar Central": [19.0178, 72.8441], "Matunga": [19.0273, 72.8527], "Sion": [19.0441, 72.8621],
  "Kurla": [19.0653, 72.8795], "Vidyavihar": [19.0788, 72.8881], "Ghatkopar": [19.0866, 72.9081],
  "Vikhroli": [19.1098, 72.9176], "Kanjurmarg": [19.1285, 72.9322], "Bhandup": [19.1489, 72.9370],
  "Nahur": [19.1558, 72.9440], "Mulund": [19.1726, 72.9565], "Thane": [19.1860, 72.9750],
  "Dombivli": [19.2183, 73.0867], "Kalyan": [19.2437, 73.1292],
  "Dockyard Road": [18.9475, 72.8452], "Reay Road": [18.9546, 72.8443], "Cotton Green": [18.9833, 72.8483],
  "Sewri": [18.9895, 72.8543], "Wadala": [19.0166, 72.8582], "Kings Circle": [19.0291, 72.8606],
  "Mahim Junction": [19.0421, 72.8468], "GTB Nagar": [19.0388, 72.8573], "Chunabhatti": [19.0559, 72.8736],
  "Tilak Nagar": [19.0651, 72.8894], "Chembur": [19.0622, 72.8966], "Govandi": [19.0525, 72.9105],
  "Mankhurd": [19.0458, 72.9282], "Vashi": [19.0768, 72.9988], "Sanpada": [19.0645, 73.0073],
  "Turbhe": [19.0818, 73.0180], "Juinagar": [19.0622, 73.0289], "Nerul": [19.0330, 73.0195],
  "Seawoods Darave": [19.0225, 73.0172], "Belapur": [19.0236, 73.0384], "Kharghar": [19.0472, 73.0655],
  "Mansarovar": [19.0420, 73.0756], "Khandeshwar": [19.0360, 73.0819], "Panvel": [18.9937, 73.1088],
  "Versova": [19.1323, 72.8175], "Andheri Metro": [19.1190, 72.8465], "WEH": [19.1169, 72.8535],
  "Chakala": [19.1137, 72.8612], "Airport Road": [19.1028, 72.8699], "Marol Naka": [19.0998, 72.8810],
  "Saki Naka": [19.0895, 72.8888], "Asalpha": [19.0865, 72.8981], "Jagruti Nagar": [19.0849, 72.9030],
  "Ghatkopar Metro": [19.0866, 72.9081],
};

type Step = "line" | "detecting" | "station" | "schedule";

interface StationWithCoords {
  name: string;
  lat: number;
  lng: number;
}

interface ScheduleTrain {
  id: string;
  trainNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  crowdLevel: "low" | "medium" | "high";
  type: "suburban" | "metro";
  platform: string;
  occupancy: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestStation(lat: number, lng: number, lineStations: string[]): { name: string; distance: number } {
  let nearest = { name: lineStations[0], distance: Infinity };
  for (const st of lineStations) {
    const coords = STATION_COORDS[st];
    if (!coords) continue;
    const d = haversine(lat, lng, coords[0], coords[1]);
    if (d < nearest.distance) nearest = { name: st, distance: d };
  }
  return nearest;
}

const TrainSchedule = () => {
  const [step, setStep] = useState<Step>("line");
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [sourceStation, setSourceStation] = useState<string>("");
  const [destStation, setDestStation] = useState<string>("");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [scheduleTrains, setScheduleTrains] = useState<ScheduleTrain[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [nearestDistance, setNearestDistance] = useState<number>(0);

  const lineStations = selectedLine ? LINE_ROUTES[selectedLine].stations : [];

  const handleLineSelect = (line: string) => {
    setSelectedLine(line);
    setSourceStation("");
    setDestStation("");
    setGpsError(null);
    setStep("detecting");

    // Auto-detect GPS
    if (!navigator.geolocation) {
      setGpsError("Geolocation not supported. Please select manually.");
      setStep("station");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = findNearestStation(pos.coords.latitude, pos.coords.longitude, LINE_ROUTES[line].stations);
        setSourceStation(nearest.name);
        setNearestDistance(Math.round(nearest.distance * 100) / 100);
        setStep("station");
      },
      () => {
        setGpsError("Location access denied. Please select your station manually.");
        setStep("station");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleDestSelect = async (dest: string) => {
    setDestStation(dest);
    setStep("schedule");
    setLoadingSchedule(true);

    // Fetch services for this line
    const { data } = await supabase
      .from("services")
      .select(`
        id, service_number, from_station_id, to_station_id,
        departure_time, arrival_time, type, platform,
        current_occupancy, max_capacity, crowd_level,
        stations!services_from_station_id_fkey(name),
        to_station:stations!services_to_station_id_fkey(name)
      `)
      .eq("is_active", true)
      .order("departure_time");

    if (data) {
      const mapped: ScheduleTrain[] = data
        .map((s: any) => ({
          id: s.id,
          trainNumber: s.service_number,
          from: s.stations?.name ?? "",
          to: s.to_station?.name ?? "",
          departure: s.departure_time?.slice(0, 5) ?? "--:--",
          arrival: s.arrival_time?.slice(0, 5) ?? "--:--",
          crowdLevel: (s.crowd_level as "low" | "medium" | "high") ?? "low",
          type: s.type as "suburban" | "metro",
          platform: s.platform ?? "1",
          occupancy: s.max_capacity ? Math.round(((s.current_occupancy ?? 0) / s.max_capacity) * 100) : 0,
        }))
        .filter((t) => {
          // Filter trains that pass through both source and dest on this line
          const stops = LINE_ROUTES[selectedLine!].stations;
          const srcIdx = stops.indexOf(sourceStation);
          const dstIdx = stops.indexOf(dest);
          const fromIdx = stops.indexOf(t.from);
          const toIdx = stops.indexOf(t.to);
          if (srcIdx === -1 || dstIdx === -1 || fromIdx === -1 || toIdx === -1) return false;

          // Direction check
          if (srcIdx < dstIdx) {
            return fromIdx <= srcIdx && toIdx >= dstIdx;
          } else {
            return fromIdx >= srcIdx && toIdx <= dstIdx;
          }
        });
      setScheduleTrains(mapped);
    }
    setLoadingSchedule(false);
  };

  const goBack = () => {
    if (step === "schedule") { setStep("station"); setDestStation(""); }
    else if (step === "station") { setStep("line"); setSelectedLine(null); }
    else if (step === "detecting") { setStep("line"); setSelectedLine(null); }
  };

  // Get station index for "direction" display
  const sourceIdx = lineStations.indexOf(sourceStation);
  const availableDests = lineStations.filter((s) => s !== sourceStation);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 max-w-lg mx-auto">
        {/* Back button */}
        {step !== "line" && (
          <button
            onClick={goBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP 1: Line Selection */}
          {step === "line" && (
            <motion.div
              key="line"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4">
                  <Train className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Train Schedule</h1>
                <p className="text-muted-foreground mt-1">Select your line to find train timings</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.entries(LINE_ROUTES).map(([line, info]) => (
                  <motion.button
                    key={line}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleLineSelect(line)}
                    className="rounded-xl border-2 border-border bg-card p-5 text-left shadow-card hover:shadow-elevated transition-all group"
                  >
                    <span className="text-3xl mb-3 block">{info.icon}</span>
                    <h3 className="font-display font-bold text-foreground group-hover:text-accent transition-colors">
                      {line}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {info.stations.length} stations
                    </p>
                    <div className="mt-2 h-1 rounded-full" style={{ background: info.color }} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 2: Detecting Location */}
          {step === "detecting" && (
            <motion.div
              key="detecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse">
                <Navigation className="h-10 w-10 text-accent" />
              </div>
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Detecting Location</h2>
              <p className="text-muted-foreground text-sm">Finding your nearest {selectedLine} line station...</p>
              <Loader2 className="h-5 w-5 animate-spin text-accent mx-auto mt-4" />
            </motion.div>
          )}

          {/* STEP 3: Station Selection */}
          {step === "station" && selectedLine && (
            <motion.div
              key="station"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Source station info */}
              <div className="rounded-xl border-2 border-accent/30 bg-accent/5 p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {gpsError ? "Select Source Station" : "Your Station (GPS)"}
                    </p>
                    {sourceStation ? (
                      <div>
                        <p className="font-display font-bold text-foreground text-lg">{sourceStation}</p>
                        {nearestDistance > 0 && (
                          <p className="text-xs text-muted-foreground">{nearestDistance} km away</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Select from list below</p>
                    )}
                  </div>
                  <div className="h-1 w-12 rounded-full" style={{ background: LINE_ROUTES[selectedLine].color }} />
                </div>
                {gpsError && (
                  <div className="flex items-center gap-2 mt-3 text-xs text-crowd-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {gpsError}
                  </div>
                )}
              </div>

              {/* Source station picker if GPS failed or user wants to change */}
              {(!sourceStation || gpsError) && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-foreground mb-3">Choose your station:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {lineStations.map((st) => (
                      <button
                        key={st}
                        onClick={() => { setSourceStation(st); setGpsError(null); }}
                        className={cn(
                          "text-left px-3 py-2 rounded-lg text-sm transition-colors border",
                          sourceStation === st
                            ? "border-accent bg-accent/10 text-accent font-semibold"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Change source station */}
              {sourceStation && !gpsError && (
                <button
                  onClick={() => setGpsError("Select your station manually")}
                  className="text-xs text-accent hover:underline mb-4 block"
                >
                  Change source station
                </button>
              )}

              {/* Destination picker */}
              {sourceStation && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowRight className="h-4 w-4 text-accent" />
                    <p className="text-sm font-semibold text-foreground">Where are you going?</p>
                  </div>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {availableDests.map((st, i) => {
                      const stIdx = lineStations.indexOf(st);
                      const direction = stIdx > sourceIdx ? "→" : "←";
                      const stopsAway = Math.abs(stIdx - sourceIdx);
                      return (
                        <motion.button
                          key={st}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => handleDestSelect(st)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted hover:border-accent/30 transition-all text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: LINE_ROUTES[selectedLine].color }}
                            />
                            <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                              {st}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {direction} {stopsAway} stop{stopsAway !== 1 ? "s" : ""}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: Schedule Display */}
          {step === "schedule" && selectedLine && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Journey header */}
              <div className="rounded-xl border-2 border-border bg-card p-4 mb-4 shadow-card">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{LINE_ROUTES[selectedLine].icon}</span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {selectedLine} Line
                  </span>
                  <div className="h-1 flex-1 rounded-full" style={{ background: LINE_ROUTES[selectedLine].color }} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-center flex-1">
                    <p className="font-display font-bold text-lg text-foreground">{sourceStation}</p>
                    <p className="text-xs text-muted-foreground">From</p>
                  </div>
                  <div className="flex items-center gap-1 text-accent">
                    <div className="h-px w-6 bg-accent" />
                    <Train className="h-4 w-4" />
                    <div className="h-px w-6 bg-accent" />
                  </div>
                  <div className="text-center flex-1">
                    <p className="font-display font-bold text-lg text-foreground">{destStation}</p>
                    <p className="text-xs text-muted-foreground">To</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {Math.abs(lineStations.indexOf(destStation) - lineStations.indexOf(sourceStation))} stops
                </p>
              </div>

              {/* Train list */}
              {loadingSchedule ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : scheduleTrains.length === 0 ? (
                <div className="text-center py-12">
                  <Train className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">No trains found for this route</p>
                  <p className="text-xs text-muted-foreground mt-1">Try a different source or destination</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">
                    {scheduleTrains.length} train{scheduleTrains.length !== 1 ? "s" : ""} found
                  </p>
                  {scheduleTrains.map((train, i) => (
                    <motion.div
                      key={train.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-border bg-card p-4 shadow-card hover:shadow-elevated transition-all"
                    >
                      {/* Train header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-lg p-1.5"
                            style={{ background: `${LINE_ROUTES[selectedLine].color}15` }}
                          >
                            <Train className="h-4 w-4" style={{ color: LINE_ROUTES[selectedLine].color }} />
                          </div>
                          <div>
                            <span className="font-display font-semibold text-sm text-card-foreground">
                              {train.trainNumber}
                            </span>
                            <span
                              className="ml-2 text-xs font-medium px-1.5 py-0.5 rounded"
                              style={{
                                background: `${LINE_ROUTES[selectedLine].color}15`,
                                color: LINE_ROUTES[selectedLine].color,
                              }}
                            >
                              {selectedLine}
                            </span>
                          </div>
                        </div>
                        <CrowdIndicator level={train.crowdLevel} size="sm" />
                      </div>

                      {/* Times */}
                      <div className="flex items-center gap-3 mb-1">
                        <div className="text-center">
                          <p className="font-display font-bold text-lg text-card-foreground">{train.departure}</p>
                          <p className="text-xs text-muted-foreground">{train.from}</p>
                        </div>
                        <div className="flex-1 flex items-center gap-1">
                          <div className="h-px flex-1 bg-border" />
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <div className="text-center">
                          <p className="font-display font-bold text-lg text-card-foreground">{train.arrival}</p>
                          <p className="text-xs text-muted-foreground">{train.to}</p>
                        </div>
                      </div>

                      {/* Position strip */}
                      <TrainPositionStrip
                        from={train.from}
                        to={train.to}
                        departure={train.departure}
                        arrival={train.arrival}
                        crowdLevel={train.crowdLevel}
                        type={train.type}
                      />

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{train.occupancy}% full</span>
                        </div>
                        {train.platform && <span>Platform {train.platform}</span>}
                      </div>

                      {/* Occupancy bar */}
                      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            train.crowdLevel === "low" && "bg-crowd-low",
                            train.crowdLevel === "medium" && "bg-crowd-medium",
                            train.crowdLevel === "high" && "bg-crowd-high",
                          )}
                          style={{ width: `${train.occupancy}%` }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TrainSchedule;
