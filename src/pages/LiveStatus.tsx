import { useState, useEffect } from "react";
import { Filter, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import TrainCard from "@/components/TrainCard";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { TrainData } from "@/lib/mockData";

const filters = ["All", "Suburban", "Metro", "Low Crowd", "Medium", "High"];

const LiveStatus = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("services")
      .select(`
        id,
        service_number,
        from_station_id,
        to_station_id,
        departure_time,
        arrival_time,
        type,
        platform,
        current_occupancy,
        max_capacity,
        crowd_level,
        stations!services_from_station_id_fkey(name),
        to_station:stations!services_to_station_id_fkey(name)
      `)
      .eq("is_active", true)
      .order("departure_time");

    if (!error && data) {
      const mapped: TrainData[] = data.map((s: any) => ({
        id: s.id,
        trainNumber: s.service_number,
        from: s.stations?.name ?? s.from_station_id,
        to: s.to_station?.name ?? s.to_station_id,
        departure: s.departure_time?.slice(0, 5) ?? "--:--",
        arrival: s.arrival_time?.slice(0, 5) ?? "--:--",
        crowdLevel: (s.crowd_level as "low" | "medium" | "high") ?? "low",
        type: s.type as "suburban" | "metro",
        platform: s.platform ?? "1",
        occupancy: s.max_capacity
          ? Math.round(((s.current_occupancy ?? 0) / s.max_capacity) * 100)
          : 0,
      }));
      setTrains(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();

    // Realtime subscription — crowd levels update live
    const channel = supabase
      .channel("services-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "services" }, () => {
        fetchServices();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = trains.filter((t) => {
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
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Live Train Status</h1>
            <p className="text-muted-foreground mt-1">Real-time occupancy across Mumbai's rail network</p>
          </div>
          <button
            onClick={fetchServices}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
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

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-36 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((train) => (
              <TrainCard key={train.id} {...train} />
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No trains match the selected filter.
          </div>
        )}
      </main>
    </div>
  );
};

export default LiveStatus;
