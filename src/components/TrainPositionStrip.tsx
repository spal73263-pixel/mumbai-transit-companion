import { useEffect, useState, useMemo } from "react";
import { Train } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const LINE_ROUTES: Record<string, string[]> = {
  Western: ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Mahalaxmi", "Lower Parel", "Elphinstone Road", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Ram Mandir", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
  Central: ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Parel", "Dadar Central", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
  Harbour: ["CST", "Dockyard Road", "Reay Road", "Cotton Green", "Sewri", "Wadala", "Kings Circle", "Mahim Junction", "GTB Nagar", "Chunabhatti", "Tilak Nagar", "Chembur", "Govandi", "Mankhurd", "Vashi", "Sanpada", "Turbhe", "Juinagar", "Nerul", "Seawoods Darave", "Belapur", "Kharghar", "Mansarovar", "Khandeshwar", "Panvel"],
  "Metro 1": ["Versova", "Andheri Metro", "WEH", "Chakala", "Airport Road", "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar Metro"],
};

function getLineForStations(from: string, to: string): string | null {
  for (const [line, stops] of Object.entries(LINE_ROUTES)) {
    if (stops.includes(from) && stops.includes(to)) return line;
  }
  // Partial match
  for (const [line, stops] of Object.entries(LINE_ROUTES)) {
    if (stops.includes(from) || stops.includes(to)) return line;
  }
  return null;
}

function getStationsBetween(from: string, to: string): string[] {
  const line = getLineForStations(from, to);
  if (!line) return [from, to];
  const route = LINE_ROUTES[line];
  const fromIdx = route.indexOf(from);
  const toIdx = route.indexOf(to);
  if (fromIdx === -1 || toIdx === -1) return [from, to];
  const lo = Math.min(fromIdx, toIdx);
  const hi = Math.max(fromIdx, toIdx);
  const segment = route.slice(lo, hi + 1);
  return fromIdx <= toIdx ? segment : [...segment].reverse();
}

interface TrainPositionStripProps {
  from: string;
  to: string;
  departure: string;
  arrival: string;
  crowdLevel: "low" | "medium" | "high";
  type: "suburban" | "metro";
}

const TrainPositionStrip = ({ from, to, departure, arrival, crowdLevel, type }: TrainPositionStripProps) => {
  const [progress, setProgress] = useState(0);

  const stops = useMemo(() => getStationsBetween(from, to), [from, to]);

  useEffect(() => {
    const calcProgress = () => {
      const now = new Date();
      const currentMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
      const depParts = departure.split(":");
      const arrParts = arrival.split(":");
      const depMin = parseInt(depParts[0]) * 60 + parseInt(depParts[1]);
      const arrMin = parseInt(arrParts[0]) * 60 + parseInt(arrParts[1]);
      const duration = arrMin - depMin || 60;
      const elapsed = ((currentMin - depMin) % duration + duration) % duration;
      setProgress(Math.min(elapsed / duration, 0.98));
    };
    calcProgress();
    const interval = setInterval(calcProgress, 2000);
    return () => clearInterval(interval);
  }, [departure, arrival]);

  // Current station index (approximate)
  const currentStopIdx = Math.floor(progress * (stops.length - 1));
  const segmentProgress = (progress * (stops.length - 1)) - currentStopIdx;

  // Always show up to 8 station labels (terminals + evenly spaced)
  const labelsToShow = useMemo(() => {
    const maxLabels = 8;
    if (stops.length <= maxLabels) return new Set(stops.map((_, i) => i));
    const indices = new Set<number>([0, stops.length - 1]);
    // Add current stop
    indices.add(currentStopIdx);
    // Fill remaining with evenly spaced
    const step = (stops.length - 1) / (maxLabels - 1);
    for (let i = 1; i < maxLabels - 1 && indices.size < maxLabels; i++) {
      indices.add(Math.round(i * step));
    }
    return indices;
  }, [stops, currentStopIdx]);

  const lineColor = type === "metro" ? "hsl(var(--metro))" : "hsl(var(--rail))";
  const crowdColor = crowdLevel === "high" ? "hsl(var(--crowd-high))" : crowdLevel === "medium" ? "hsl(var(--crowd-medium))" : "hsl(var(--crowd-low))";

  return (
    <div className="mt-3 px-1">
      {/* Strip container */}
      <div className="relative">
        {/* Track line (background) */}
        <div className="absolute top-[9px] left-2 right-2 h-[3px] rounded-full bg-muted" />
        
        {/* Traveled portion */}
        <div
          className="absolute top-[9px] left-2 h-[3px] rounded-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            background: lineColor,
            maxWidth: "calc(100% - 16px)",
          }}
        />

        {/* Station dots */}
        <div className="relative flex justify-between items-start" style={{ minHeight: 40 }}>
          {stops.map((stop, i) => {
            const pct = stops.length > 1 ? i / (stops.length - 1) : 0;
            const isPassed = pct <= progress;
            const isCurrent = i === currentStopIdx;
            const isTerminal = i === 0 || i === stops.length - 1;

            return (
              <div
                key={`${stop}-${i}`}
                className="flex flex-col items-center"
                style={{ width: stops.length > 12 ? 8 : "auto", minWidth: isTerminal ? 20 : undefined }}
              >
                {/* Dot */}
                <div
                  className={cn(
                    "rounded-full border-2 transition-all duration-500 z-10 relative",
                    isTerminal ? "w-[10px] h-[10px]" : "w-[7px] h-[7px]",
                    isPassed
                      ? "border-transparent"
                      : "border-muted-foreground/30 bg-background",
                  )}
                  style={isPassed ? { background: lineColor, borderColor: lineColor } : {}}
                />

                {/* Station name - show for terminals, current, and if few stops */}
                {(isTerminal || (showLabels && stops.length <= 12) || isCurrent) && (
                  <span
                    className={cn(
                      "text-[8px] leading-tight mt-1 text-center max-w-[48px] truncate",
                      isCurrent ? "font-bold text-foreground" : "text-muted-foreground",
                      isTerminal && "font-semibold text-foreground text-[9px]"
                    )}
                  >
                    {stop.length > 8 ? stop.slice(0, 7) + "…" : stop}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Animated train icon */}
        <motion.div
          className="absolute top-0 z-20"
          animate={{ left: `calc(${progress * 100}% - 8px)` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ top: -2 }}
        >
          <div
            className="relative w-[22px] h-[22px] rounded-full flex items-center justify-center shadow-md"
            style={{
              background: lineColor,
              boxShadow: `0 0 8px ${lineColor}60`,
            }}
          >
            <Train className="h-3 w-3 text-white" />
            {/* Crowd indicator dot */}
            <div
              className="absolute -top-0.5 -right-0.5 w-[8px] h-[8px] rounded-full border border-white"
              style={{ background: crowdColor }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TrainPositionStrip;
