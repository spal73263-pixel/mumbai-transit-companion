import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Train } from "lucide-react";

interface RouteMapProps {
  segments: {
    from: string;
    to: string;
    type: "suburban" | "metro";
    line: string;
    crowdLevel: "low" | "medium" | "high";
  }[];
  /** Per-station crowd level from real-time DB data */
  stationCrowdMap?: Record<string, "low" | "medium" | "high">;
}

// Full station lists per line — used to expand intermediate stops
const LINE_STOPS: Record<string, string[]> = {
  Western:   ["Churchgate", "Marine Lines", "Charni Road", "Grant Road", "Mumbai Central", "Elphinstone", "Lower Parel", "Dadar", "Matunga Road", "Mahim", "Bandra", "Khar Road", "Santacruz", "Vile Parle", "Andheri", "Jogeshwari", "Goregaon", "Malad", "Kandivali", "Borivali", "Dahisar", "Mira Road", "Bhayandar", "Naigaon", "Vasai Road", "Nallasopara", "Virar"],
  Central:   ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Dadar", "Matunga", "Sion", "Kurla", "Vidyavihar", "Ghatkopar", "Vikhroli", "Kanjurmarg", "Bhandup", "Nahur", "Mulund", "Thane", "Dombivli", "Kalyan"],
  Harbour:   ["CST", "Masjid", "Sandhurst Road", "Byculla", "Chinchpokli", "Dadar", "Matunga", "Sion", "Kurla", "Chunabhatti", "GTB Nagar", "Wadala", "Mankhurd", "Vashi", "Nerul", "Belapur", "Kharghar", "Panvel"],
  "Metro 1": ["Versova", "D.N. Nagar", "Azad Nagar", "WEH", "Marol Naka", "Saki Naka", "Jagruti Nagar", "Ghatkopar"],
};

interface StationNode {
  name: string;
  type: "suburban" | "metro";
  crowdLevel: "low" | "medium" | "high";
  isFirst: boolean;
  isLast: boolean;
  isInterchange: boolean;
  isEndpoint: boolean; // segment from/to
}

function expandSegment(seg: RouteMapProps["segments"][0]): string[] {
  const stops = LINE_STOPS[seg.line];
  if (!stops) return [seg.from, seg.to];
  const fi = stops.indexOf(seg.from);
  const ti = stops.indexOf(seg.to);
  if (fi === -1 || ti === -1) return [seg.from, seg.to];
  if (fi <= ti) return stops.slice(fi, ti + 1);
  return stops.slice(ti, fi + 1).reverse();
}

function buildStationList(segments: RouteMapProps["segments"]): StationNode[] {
  const nodes: StationNode[] = [];
  
  segments.forEach((seg, segIdx) => {
    const expanded = expandSegment(seg);
    expanded.forEach((name, i) => {
      // Skip if duplicate from previous segment's last station
      if (nodes.length > 0 && nodes[nodes.length - 1].name === name) {
        // Mark as interchange
        nodes[nodes.length - 1].isInterchange = true;
        return;
      }
      const isSegEndpoint = i === 0 || i === expanded.length - 1;
      nodes.push({
        name,
        type: seg.type,
        crowdLevel: seg.crowdLevel,
        isFirst: nodes.length === 0,
        isLast: false, // set after
        isInterchange: false,
        isEndpoint: isSegEndpoint,
      });
    });
  });

  if (nodes.length > 0) nodes[nodes.length - 1].isLast = true;
  return nodes;
}

function crowdBg(level: "low" | "medium" | "high") {
  return level === "high" ? "bg-crowd-high" : level === "medium" ? "bg-crowd-medium" : "bg-crowd-low";
}

function lineColor(type: "suburban" | "metro") {
  return type === "metro" ? "bg-metro" : "bg-rail";
}

const RouteMap = ({ segments, stationCrowdMap }: RouteMapProps) => {
  const stations = buildStationList(segments);
  if (stations.length < 2) return null;

  return (
    <div className="relative py-4 px-3 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {stations.map((station, i) => {
          const isMain = station.isFirst || station.isLast || station.isInterchange;
          // Use real-time crowd data if available, otherwise fall back to segment crowd
          const liveCrowd = stationCrowdMap?.[station.name] ?? station.crowdLevel;

          return (
            <div key={`${station.name}-${i}`} className="flex items-center">
              {/* Station dot */}
              <div className="flex flex-col items-center relative">
                {/* Live crowd ring around station dot */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
                  className={cn(
                    "relative z-10 rounded-full flex items-center justify-center",
                    isMain ? "w-8 h-8" : "w-4 h-4",
                    // Outer ring = live crowd color
                    liveCrowd === "high" ? "ring-2 ring-crowd-high" : liveCrowd === "medium" ? "ring-2 ring-crowd-medium" : "ring-2 ring-crowd-low",
                    lineColor(station.type)
                  )}
                >
                  {isMain && (
                    <div className={cn(
                      "w-3 h-3 rounded-full animate-pulse-glow",
                      crowdBg(liveCrowd)
                    )} />
                  )}
                  {!isMain && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      crowdBg(liveCrowd)
                    )} />
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.05 }}
                  className={cn(
                    "mt-1.5 whitespace-nowrap text-center leading-tight",
                    isMain
                      ? "text-[11px] font-semibold text-card-foreground"
                      : "text-[9px] font-medium text-muted-foreground"
                  )}
                >
                  {station.name}
                </motion.p>
                {/* Live crowd label for main stations */}
                {isMain && stationCrowdMap?.[station.name] && (
                  <span className={cn(
                    "text-[7px] font-bold mt-0.5 uppercase",
                    liveCrowd === "high" ? "text-crowd-high" : liveCrowd === "medium" ? "text-crowd-medium" : "text-crowd-low"
                  )}>
                    {liveCrowd === "high" ? "🔴" : liveCrowd === "medium" ? "🟡" : "🟢"} {liveCrowd}
                  </span>
                )}
                {station.isInterchange && (
                  <span className="text-[8px] text-accent font-bold mt-0.5">⇌ CHANGE</span>
                )}
              </div>

              {/* Line connector */}
              {!station.isLast && (
                <div className="relative mx-0.5">
                  <div className={cn(
                    "h-1 rounded-full opacity-25",
                    lineColor(station.type),
                    isMain ? "w-10 sm:w-14" : "w-7 sm:w-10"
                  )} />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.08 + 0.03, duration: 0.3 }}
                    style={{ originX: 0 }}
                    className={cn(
                      "absolute inset-0 h-1 rounded-full",
                      crowdBg(liveCrowd)
                    )}
                  />
                  {/* Animated train only on first connector */}
                  {i === 0 && (
                    <motion.div
                      animate={{ x: [0, 200, 200], opacity: [0, 1, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                      className="absolute -top-2.5 left-0 z-20"
                    >
                      <Train className={cn("h-3 w-3", station.type === "metro" ? "text-metro" : "text-rail")} />
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteMap;
