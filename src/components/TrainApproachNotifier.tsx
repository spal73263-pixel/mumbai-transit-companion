import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, BellOff, BellRing, MapPin, X, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import StationSelector from "./StationSelector";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ApproachingTrain {
  id: string;
  serviceNumber: string;
  from: string;
  to: string;
  line: string;
  crowdLevel: string;
  stationsAway: number;
  etaMinutes: number;
}

const LINE_ROUTES: Record<string, string[]> = {
  Western: ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Mahalaxmi", "Lower Parel", "Elphinstone Road", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Ram Mandir", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
  Central: ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Parel", "Dadar Central", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
  Harbour: ["CST", "Dockyard Road", "Reay Road", "Cotton Green", "Sewri", "Wadala", "Kings Circle", "Mahim Junction", "GTB Nagar", "Chunabhatti", "Tilak Nagar", "Chembur", "Govandi", "Mankhurd", "Vashi", "Sanpada", "Turbhe", "Juinagar", "Nerul", "Seawoods Darave", "Belapur", "Kharghar", "Mansarovar", "Khandeshwar", "Panvel"],
  "Metro 1": ["Versova", "Andheri Metro", "WEH", "Chakala", "Airport Road", "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar Metro"],
};

function getStationIndex(station: string, line: string): number {
  return LINE_ROUTES[line]?.indexOf(station) ?? -1;
}

function findStationOnLine(station: string): string[] {
  return Object.keys(LINE_ROUTES).filter((line) =>
    LINE_ROUTES[line].includes(station)
  );
}

const TrainApproachNotifier = () => {
  const [watchStation, setWatchStation] = useState("");
  const [stations, setStations] = useState<string[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>("default");
  const [approaching, setApproaching] = useState<ApproachingTrain[]>([]);
  const [expanded, setExpanded] = useState(false);
  const notifiedRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Fetch station names
  useEffect(() => {
    supabase.from("stations").select("name").order("name").then(({ data }) => {
      if (data) setStations(data.map((s) => s.name));
    });
  }, []);

  // Check notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast({ title: "Not supported", description: "Your browser doesn't support notifications.", variant: "destructive" });
      return false;
    }
    const perm = await Notification.requestPermission();
    setPermissionState(perm);
    if (perm === "granted") {
      toast({ title: "Notifications enabled", description: "You'll be alerted when trains approach your station." });
      return true;
    }
    toast({ title: "Permission denied", description: "Please enable notifications in your browser settings.", variant: "destructive" });
    return false;
  };

  const toggleNotifications = async () => {
    if (!enabled) {
      if (!watchStation) {
        toast({ title: "Select a station", description: "Choose a station to watch first.", variant: "destructive" });
        return;
      }
      if (permissionState !== "granted") {
        const ok = await requestPermission();
        if (!ok) return;
      }
      setEnabled(true);
      notifiedRef.current.clear();
      toast({ title: "Watching " + watchStation, description: "You'll get alerts when trains are 1-3 stations away." });
    } else {
      setEnabled(false);
      setApproaching([]);
      notifiedRef.current.clear();
    }
  };

  const sendNotification = useCallback((train: ApproachingTrain) => {
    const key = `${train.id}-${train.stationsAway}`;
    if (notifiedRef.current.has(key)) return;
    notifiedRef.current.add(key);

    const body = `${train.serviceNumber} (${train.from} → ${train.to}) is ${train.stationsAway} station${train.stationsAway > 1 ? "s" : ""} away · ~${train.etaMinutes} min · ${train.crowdLevel.toUpperCase()} crowd`;

    // Browser notification
    if (Notification.permission === "granted") {
      new Notification(`🚆 Train approaching ${watchStation}!`, {
        body,
        icon: "/favicon.ico",
        tag: key,
      } as NotificationOptions);
    }

    // Play sound
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdGKJjJeIeHF7cYGQj5yLgXp3fHyHkJGZj4V+e318hI2PlZGIgX19fIGIjo+Sj4qEf359gYaLj5CRj4uGgn9+gIWJjY+QkI6KhoOAgIKFiYuOj5CPjIiEgoGBhIeKjI6Pj46MiYWDgoKDhoiLjY6Pj46Lh4SDgoOEh4mMjY6Oj42KhoSDg4OFh4qLjY2Ojo2Lh4WEg4OFh4mLjI2NjY2LiIaEhIOEhoiKjIyNjY2MioeFhIOEhYeJi4yMjY2Mi4mHhYSEhIaHiYuMjIyMjIuJh4aEhISFh4iKi4yMjIyLioiGhYSEhYaIiouMjIyMi4qIh4WEhIWGiIqLjIyMjIuKiIeGhYSFhoiJi4uMjIyLi4mIh4WFhYWGh4mKi4uLi4uLiomHhoWFhYaHiYqLi4uLi4uKiYeGhYWFhoiJiouLi4uLi4qJh4aFhYWGh4mKi4uLi4uLiomIh4aFhYaHiImKi4uLi4uKiYiHhoaFhYaHiYqKi4uLi4qKiYiHhoaFhoaIiYqKi4uLi4qKiYiHhoaGhoaIiYqKi4uLi4qJiIeHhoaGhoeIiYqKi4uLioqJiIeHhoaGhoeIiYqKi4uLioqJiIeHhoaGhoeIiYqKi4uLioqJiIeHhoaGhoeIiYqKi4uLioqJiIeHhoaG");
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, [watchStation]);

  // Poll for approaching trains
  useEffect(() => {
    if (!enabled || !watchStation) return;

    const checkApproaching = async () => {
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
      const watchLines = findStationOnLine(watchStation);
      const newApproaching: ApproachingTrain[] = [];

      data.forEach((s: any) => {
        const from = s.from_station?.name;
        const to = s.to_station?.name;
        const line = s.from_station?.line;
        if (!from || !to || !line) return;
        if (!watchLines.includes(line)) return;

        const route = LINE_ROUTES[line];
        if (!route) return;

        const fromIdx = route.indexOf(from);
        const toIdx = route.indexOf(to);
        const watchIdx = route.indexOf(watchStation);
        if (fromIdx === -1 || toIdx === -1 || watchIdx === -1) return;

        // Check if train passes through watch station
        const direction = toIdx > fromIdx ? 1 : -1;
        const passesThrough =
          direction > 0
            ? watchIdx >= fromIdx && watchIdx <= toIdx
            : watchIdx <= fromIdx && watchIdx >= toIdx;
        if (!passesThrough) return;

        // Calculate progress
        const depParts = s.departure_time?.split(":") ?? ["8", "0"];
        const arrParts = s.arrival_time?.split(":") ?? ["9", "0"];
        const depMin = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
        const arrMin = parseInt(arrParts[0]) * 60 + parseInt(arrParts[1]);
        const totalDuration = arrMin - depMin || 60;
        const elapsed = ((currentMinutes - depMin) % totalDuration + totalDuration) % totalDuration;
        const progress = elapsed / totalDuration;

        // Current station index (approximate)
        const totalStops = Math.abs(toIdx - fromIdx);
        const currentStopFloat = progress * totalStops;
        const currentStopIdx = fromIdx + direction * Math.floor(currentStopFloat);

        const stationsAway = Math.abs(watchIdx - currentStopIdx);
        const avgTimePerStation = totalDuration / totalStops;
        const etaMinutes = Math.round(stationsAway * avgTimePerStation);

        // Alert if 1-3 stations away
        if (stationsAway >= 0 && stationsAway <= 3) {
          const train: ApproachingTrain = {
            id: s.id,
            serviceNumber: s.service_number,
            from,
            to,
            line,
            crowdLevel: s.crowd_level ?? "low",
            stationsAway,
            etaMinutes,
          };
          newApproaching.push(train);
          sendNotification(train);
        }
      });

      setApproaching(newApproaching);
    };

    checkApproaching();
    const interval = setInterval(checkApproaching, 5000);
    return () => clearInterval(interval);
  }, [enabled, watchStation, sendNotification]);

  const crowdColor = (level: string) =>
    level === "high" ? "text-crowd-high" : level === "medium" ? "text-crowd-medium" : "text-crowd-low";

  return (
    <div className="rounded-lg border border-border bg-card shadow-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center",
            enabled ? "gradient-accent" : "bg-muted"
          )}>
            {enabled ? (
              <BellRing className="h-4.5 w-4.5 text-accent-foreground animate-pulse" />
            ) : (
              <Bell className="h-4.5 w-4.5 text-muted-foreground" />
            )}
          </div>
          <div className="text-left">
            <h3 className="font-display font-semibold text-sm text-card-foreground">
              Train Approach Alerts
            </h3>
            <p className="text-xs text-muted-foreground">
              {enabled && watchStation
                ? `Watching ${watchStation} · ${approaching.length} train${approaching.length !== 1 ? "s" : ""} nearby`
                : "Get notified when trains are approaching"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {approaching.length > 0 && enabled && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent" />
            </span>
          )}
          <span className={cn(
            "text-xs font-medium px-2.5 py-1 rounded-full",
            enabled ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
          )}>
            {enabled ? "ON" : "OFF"}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
              {/* Station selector */}
              <StationSelector
                label="Watch Station"
                value={watchStation}
                onChange={(v) => {
                  setWatchStation(v);
                  notifiedRef.current.clear();
                  setApproaching([]);
                }}
                stations={stations}
              />

              {/* Toggle button */}
              <button
                onClick={toggleNotifications}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-lg py-3 font-semibold text-sm transition-all",
                  enabled
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                    : "gradient-accent text-accent-foreground hover:opacity-90 shadow-card"
                )}
              >
                {enabled ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    Stop Watching
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    Start Watching
                  </>
                )}
              </button>

              {permissionState === "denied" && (
                <p className="text-xs text-destructive text-center">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}

              {/* Approaching trains list */}
              <AnimatePresence>
                {enabled && approaching.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-2"
                  >
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="h-3 w-3" />
                      Approaching Trains
                    </p>
                    {approaching.map((train) => (
                      <motion.div
                        key={train.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "rounded-lg border p-3 flex items-center justify-between",
                          train.stationsAway <= 1
                            ? "border-accent/40 bg-accent/5"
                            : "border-border bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-accent-foreground",
                            train.stationsAway <= 1 ? "gradient-accent" : "bg-muted text-muted-foreground"
                          )}>
                            {train.stationsAway}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-card-foreground">
                              {train.serviceNumber}
                              <span className="font-normal text-muted-foreground ml-1.5">
                                {train.from} → {train.to}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {train.stationsAway === 0
                                ? "At your station!"
                                : `${train.stationsAway} station${train.stationsAway > 1 ? "s" : ""} away · ~${train.etaMinutes} min`}
                              {" · "}
                              <span className={crowdColor(train.crowdLevel)}>
                                {train.crowdLevel} crowd
                              </span>
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-accent">{train.line}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {enabled && approaching.length === 0 && (
                <div className="text-center py-4">
                  <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted-foreground">No trains within 3 stations yet. Watching...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrainApproachNotifier;
