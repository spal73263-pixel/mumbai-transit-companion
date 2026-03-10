import { useState, useEffect } from "react";
import { Filter, RefreshCw, MapPin, QrCode, CreditCard, Check, Map, Bell } from "lucide-react";
import LiveTrainTracker from "@/components/LiveTrainTracker";
import TrainApproachNotifier from "@/components/TrainApproachNotifier";
import Header from "@/components/Header";
import TrainCard from "@/components/TrainCard";
import StationSelector from "@/components/StationSelector";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { calculateFare } from "@/lib/fareCalculator";
import { motion, AnimatePresence } from "framer-motion";
import type { TrainData } from "@/lib/mockData";
import PageTransition from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";

const filters = ["All", "Suburban", "Metro", "Low Crowd", "Medium", "High"];

const LiveStatus = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [stations, setStations] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

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

    supabase.from("stations").select("name").order("name").then(({ data }) => {
      if (data) setStations(data.map(s => s.name));
    });

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

  // Further filter by from/to if set
  const stationFiltered = filtered.filter((t) => {
    if (fromStation && t.from !== fromStation) return false;
    if (toStation && t.to !== toStation) return false;
    return true;
  });

  const fareResult = fromStation && toStation && fromStation !== toStation ? calculateFare(fromStation, toStation) : null;

  const handleQuickBook = async () => {
    if (!user) {
      toast({ title: "Login required", description: "Please sign in to book a ticket.", variant: "destructive" });
      return;
    }
    if (!fareResult || !fromStation || !toStation) return;

    setBooking(true);
    const code = "SR-" + Date.now().toString(36).toUpperCase();
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + (fareResult.isMetro ? 2 : 4));

    const { error } = await supabase.from("tickets").insert({
      user_id: user.id,
      from_station: fromStation,
      to_station: toStation,
      ticket_type: "single",
      mode: fareResult.isMetro ? "metro" : "suburban",
      price: fareResult.fare2nd,
      ticket_code: code,
      qr_data: JSON.stringify({ code, from: fromStation, to: toStation, fare: fareResult.fare2nd }),
      status: "active",
      valid_until: validUntil.toISOString(),
    });

    setBooking(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
      return;
    }

    setTicketCode(code);
    setBooked(true);
    setTimeout(() => setBooked(false), 8000);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground theme="trains" />
      <Header />
      <PageTransition>
      <main className="container py-8 relative z-10">
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

        {/* Live GPS Train Tracker Map */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Map className="h-4 w-4 text-accent" />
            <h2 className="font-display font-semibold text-lg text-foreground">Live Train Tracker</h2>
            <span className="text-xs text-muted-foreground ml-1">• GPS positions update every 3s</span>
            <span className="relative flex h-2.5 w-2.5 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crowd-low opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-crowd-low"></span>
            </span>
          </div>
          <LiveTrainTracker />
        </div>

        {/* Train Approach Notifications */}
        <div className="mb-6">
          <TrainApproachNotifier />
        </div>

        {/* Station filter + Quick Book */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card mb-6">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-card-foreground">Filter by Journey</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <StationSelector label="From" value={fromStation} onChange={setFromStation} stations={stations} />
            <StationSelector label="To" value={toStation} onChange={setToStation} stations={stations} />
          </div>

          <AnimatePresence mode="wait">
            {fareResult && !booked && (
              <motion.div
                key="fare"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between rounded-lg bg-accent/5 border border-accent/20 p-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Quick Book · {fareResult.line}</p>
                    <p className="text-sm text-card-foreground">{fromStation} → {toStation} · 2nd Class · {fareResult.isMetro ? "Metro" : "Suburban"}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-display font-bold text-2xl text-accent">₹{fareResult.fare2nd}</p>
                    <button
                      onClick={handleQuickBook}
                      disabled={booking || !user}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-5 py-2.5 font-semibold text-sm text-accent-foreground transition-all",
                        user ? "gradient-accent hover:opacity-90 shadow-card" : "bg-muted text-muted-foreground cursor-not-allowed"
                      )}
                    >
                      <CreditCard className="h-4 w-4" />
                      {booking ? "Booking..." : "Book & Get QR"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {booked && (
              <motion.div
                key="qr"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="rounded-lg border-2 border-crowd-low bg-crowd-low/5 p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-crowd-low flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-1">Ticket Booked!</h3>
                <p className="text-sm text-muted-foreground mb-4">{fromStation} → {toStation} · ₹{fareResult?.fare2nd}</p>

                {/* QR Code display */}
                <div className="inline-flex flex-col items-center gap-3 rounded-xl bg-card border border-border p-6 shadow-card">
                  <div className="w-40 h-40 bg-foreground rounded-lg flex items-center justify-center relative overflow-hidden">
                    {/* Simulated QR pattern */}
                    <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-0.5">
                      {Array.from({ length: 64 }, (_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-[1px]",
                            Math.random() > 0.4 ? "bg-card" : "bg-transparent"
                          )}
                        />
                      ))}
                    </div>
                    <QrCode className="h-8 w-8 text-card relative z-10" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Scan with phone camera</p>
                    <p className="font-mono text-sm font-semibold text-foreground">{ticketCode}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mt-4">
                  Valid for {fareResult?.isMetro ? "2 hours" : "4 hours"} · Show at entry gate
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
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
            {stationFiltered.map((train) => (
              <TrainCard key={train.id} {...train} />
            ))}
          </div>
        )}
        {!loading && stationFiltered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            No trains match the selected filter.
          </div>
        )}
      </main>
      </PageTransition>
    </div>
  );
};

export default LiveStatus;
