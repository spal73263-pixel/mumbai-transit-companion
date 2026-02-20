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
}

// Collect all unique stations in order from the segments
function getStations(segments: RouteMapProps["segments"]): { name: string; type: "suburban" | "metro"; isInterchange: boolean }[] {
  const result: { name: string; type: "suburban" | "metro"; isInterchange: boolean }[] = [];
  segments.forEach((seg, i) => {
    if (i === 0) {
      result.push({ name: seg.from, type: seg.type, isInterchange: false });
    }
    // If this segment's from is different line than previous, mark it as interchange
    if (i > 0 && seg.from === segments[i - 1].to) {
      result[result.length - 1].isInterchange = true;
    }
    result.push({ name: seg.to, type: seg.type, isInterchange: false });
  });
  return result;
}

function crowdBg(level: "low" | "medium" | "high") {
  return level === "high" ? "bg-crowd-high" : level === "medium" ? "bg-crowd-medium" : "bg-crowd-low";
}

function lineColor(type: "suburban" | "metro") {
  return type === "metro" ? "bg-metro" : "bg-rail";
}

const RouteMap = ({ segments }: RouteMapProps) => {
  const stations = getStations(segments);
  if (stations.length < 2) return null;

  return (
    <div className="relative py-4 px-2 overflow-x-auto">
      <div className="flex items-center min-w-max">
        {stations.map((station, i) => {
          const seg = segments[Math.min(i, segments.length - 1)];
          const isLast = i === stations.length - 1;
          const isFirst = i === 0;
          
          return (
            <div key={`${station.name}-${i}`} className="flex items-center">
              {/* Station dot */}
              <div className="flex flex-col items-center relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
                  className={cn(
                    "relative z-10 rounded-full border-2 border-card flex items-center justify-center",
                    station.isInterchange ? "w-7 h-7" : "w-5 h-5",
                    isFirst || isLast ? "w-7 h-7" : "",
                    lineColor(station.type)
                  )}
                >
                  {(isFirst || isLast || station.isInterchange) && (
                    <div className="w-2.5 h-2.5 rounded-full bg-card" />
                  )}
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.12 + 0.1 }}
                  className={cn(
                    "text-[10px] mt-2 whitespace-nowrap font-medium max-w-[70px] text-center leading-tight",
                    isFirst || isLast ? "text-card-foreground font-semibold text-xs" : "text-muted-foreground"
                  )}
                >
                  {station.name}
                </motion.p>
                {station.isInterchange && (
                  <span className="text-[8px] text-accent font-semibold mt-0.5">CHANGE</span>
                )}
              </div>

              {/* Line connector */}
              {!isLast && (
                <div className="relative mx-1">
                  <div className={cn("h-1 w-12 sm:w-16 rounded-full", lineColor(seg.type), "opacity-30")} />
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: i * 0.12 + 0.05, duration: 0.4 }}
                    style={{ originX: 0 }}
                    className={cn("absolute inset-0 h-1 rounded-full", crowdBg(seg.crowdLevel))}
                  />
                  {/* Animated train icon moving along the line */}
                  <motion.div
                    initial={{ x: 0, opacity: 0 }}
                    animate={{ x: [0, 48, 48], opacity: [0, 1, 0] }}
                    transition={{ delay: i * 0.12 + 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute -top-2.5 left-0"
                  >
                    <Train className={cn("h-3 w-3", seg.type === "metro" ? "text-metro" : "text-rail")} />
                  </motion.div>
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
