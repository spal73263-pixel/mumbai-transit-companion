import { useState } from "react";
import { Filter } from "lucide-react";
import Header from "@/components/Header";
import TrainCard from "@/components/TrainCard";
import { liveTrains } from "@/lib/mockData";
import { cn } from "@/lib/utils";

const filters = ["All", "Suburban", "Metro", "Low Crowd", "Medium", "High"];

const LiveStatus = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = liveTrains.filter((t) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Suburban") return t.type === "suburban";
    if (activeFilter === "Metro") return t.type === "metro";
    if (activeFilter === "Low Crowd") return t.crowdLevel === "low";
    if (activeFilter === "Medium") return t.crowdLevel === "medium";
    if (activeFilter === "High") return t.crowdLevel === "high";
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Live Train Status</h1>
          <p className="text-muted-foreground mt-1">Real-time occupancy across Mumbai's rail network</p>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f
                  ? "gradient-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((train) => (
            <TrainCard key={train.id} {...train} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No trains match the selected filter.
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveStatus;
