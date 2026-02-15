import { useState } from "react";
import { ArrowRight, Clock, Repeat, Train, Zap } from "lucide-react";
import Header from "@/components/Header";
import StationSelector from "@/components/StationSelector";
import CrowdIndicator from "@/components/CrowdIndicator";
import { stations, metroStations, sampleRoutes } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Routes = () => {
  const [from, setFrom] = useState("Churchgate");
  const [to, setTo] = useState("Andheri");
  const allStations = [...new Set([...stations, ...metroStations])].sort();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Smart Route Finder</h1>
          <p className="text-muted-foreground mt-1">Find the fastest, least crowded route</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            <StationSelector label="From" value={from} onChange={setFrom} stations={allStations} />
            <StationSelector label="To" value={to} onChange={setTo} stations={allStations} />
          </div>
        </div>

        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Suggested Routes</h2>
        <div className="flex flex-col gap-4">
          {sampleRoutes.map((route, i) => (
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
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Repeat className="h-3 w-3" />
                  {route.changes} change{route.changes !== 1 ? "s" : ""}
                </div>
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
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Routes;
