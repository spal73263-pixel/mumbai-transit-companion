import { useState, useEffect } from "react";
import { Ticket, QrCode, Check, CreditCard, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import StationSelector from "@/components/StationSelector";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { calculateFare } from "@/lib/fareCalculator";
import PageTransition from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";

type TrainClass = "2nd" | "1st";
type JourneyType = "single" | "return" | "pass";

interface StationRow { id: string; name: string; line: string; type: string; }

const PASS_OPTIONS = [
  { id: "daily",  name: "Daily Pass",   price: 85,  validity: "1 day",  mode: "suburban" as const, description: "Unlimited suburban travel all day" },
  { id: "weekly", name: "Weekly Pass",  price: 350, validity: "7 days", mode: "suburban" as const, description: "Unlimited suburban travel for a week" },
  { id: "combo",  name: "Combined Pass",price: 500, validity: "7 days", mode: "combined" as const, description: "Suburban + Metro unlimited travel" },
];

const Tickets = () => {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [trainClass, setTrainClass] = useState<TrainClass>("2nd");
  const [journeyType, setJourneyType] = useState<JourneyType>("single");
  const [selectedPass, setSelectedPass] = useState<string | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [stations, setStations] = useState<StationRow[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    supabase.from("stations").select("id, name, line, type").order("name").then(({ data }) => {
      if (data) setStations(data);
    });
  }, []);

  const stationNames = stations.map(s => s.name);

  // Compute fare dynamically
  const fareResult = fromStation && toStation ? calculateFare(fromStation, toStation) : null;

  const getPrice = (): number | null => {
    if (selectedPass) {
      return PASS_OPTIONS.find(p => p.id === selectedPass)?.price ?? null;
    }
    if (!fareResult) return null;
    const base = fareResult.isMetro ? fareResult.fare2nd : (trainClass === "1st" ? fareResult.fare1st : fareResult.fare2nd);
    return journeyType === "return" ? base * 2 : base;
  };

  const getMode = (): string => {
    if (selectedPass) return PASS_OPTIONS.find(p => p.id === selectedPass)?.mode ?? "suburban";
    return fareResult?.isMetro ? "metro" : "suburban";
  };

  const getValidity = (): string => {
    if (selectedPass) return PASS_OPTIONS.find(p => p.id === selectedPass)?.validity ?? "1 day";
    if (fareResult?.isMetro) return "2 hours";
    return journeyType === "return" ? "1 day" : "4 hours";
  };

  const price = getPrice();
  const canPurchase = fromStation && toStation && !loading && user && price !== null && (selectedPass || (fromStation !== toStation));

  const handlePurchase = async () => {
    if (!canPurchase) return;
    setLoading(true);

    const code = "SR-" + Date.now().toString(36).toUpperCase();
    const validUntil = new Date();
    const validity = getValidity();
    if (validity === "4 hours") validUntil.setHours(validUntil.getHours() + 4);
    else if (validity === "2 hours") validUntil.setHours(validUntil.getHours() + 2);
    else if (validity === "1 day") validUntil.setDate(validUntil.getDate() + 1);
    else if (validity === "7 days") validUntil.setDate(validUntil.getDate() + 7);

    const ticketName = selectedPass
      ? PASS_OPTIONS.find(p => p.id === selectedPass)?.name ?? "Pass"
      : `${journeyType === "return" ? "Return" : "Single"} ${trainClass === "1st" ? "1st Class" : "2nd Class"}`;

    const { error } = await supabase.from("tickets").insert({
      user_id: user!.id,
      from_station: fromStation,
      to_station: toStation,
      ticket_type: selectedPass ? "pass" : journeyType,
      mode: getMode(),
      price: price!,
      ticket_code: code,
      qr_data: JSON.stringify({ code, from: fromStation, to: toStation, type: ticketName, class: trainClass }),
      status: "active",
      valid_until: validUntil.toISOString(),
    });

    setLoading(false);
    if (error) {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
      return;
    }

    setTicketCode(code);
    setPurchased(true);
    setTimeout(() => setPurchased(false), 7000);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground theme="tickets" />
      <Header />
      <PageTransition>
      <main className="container py-8 max-w-4xl relative z-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Digital Tickets</h1>
          <p className="text-muted-foreground mt-1">Distance-based fares · Mumbai Suburban & Metro</p>
        </div>

        {/* Station Selection */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-6">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">Select Journey</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <StationSelector label="From" value={fromStation} onChange={setFromStation} stations={stationNames} />
            <StationSelector label="To" value={toStation} onChange={setToStation} stations={stationNames} />
          </div>

          {/* Fare Preview */}
          {fareResult && fromStation && toStation && fromStation !== toStation && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg bg-accent/5 border border-accent/20 p-4"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Fare Estimate · {fareResult.line} · ~{fareResult.km} km
              </p>
              {fareResult.isMetro ? (
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-display font-bold text-2xl text-accent">₹{fareResult.fare2nd}</p>
                    <p className="text-xs text-muted-foreground">Metro fare</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div>
                    <p className="font-display font-bold text-2xl text-accent">₹{fareResult.fare2nd}</p>
                    <p className="text-xs text-muted-foreground">2nd Class</p>
                  </div>
                  <div>
                    <p className="font-display font-bold text-2xl text-rail">₹{fareResult.fare1st}</p>
                    <p className="text-xs text-muted-foreground">1st Class</p>
                  </div>
                  <div className="text-xs text-muted-foreground ml-auto">
                    Return = 2× single fare
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {fromStation && toStation && fromStation === toStation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-crowd-high">
              <AlertCircle className="h-4 w-4" />
              <span>From and To stations cannot be the same.</span>
            </div>
          )}
        </div>

        {/* Ticket Options — only show if stations selected and not same */}
        {fromStation && toStation && fromStation !== toStation && !selectedPass && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-6">
            <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">Ticket Options</h2>

            {/* Journey Type */}
            {fareResult && !fareResult.isMetro && (
              <>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Journey Type</p>
                <div className="flex gap-2 mb-4">
                  {(["single", "return"] as JourneyType[]).map(jt => (
                    <button
                      key={jt}
                      onClick={() => setJourneyType(jt)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        journeyType === jt
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-card text-muted-foreground hover:border-accent/30"
                      )}
                    >
                      {jt === "single" ? "Single Journey" : "Return Journey (same day)"}
                    </button>
                  ))}
                </div>

                {/* Class */}
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Class</p>
                <div className="flex gap-2 mb-2">
                  {(["2nd", "1st"] as TrainClass[]).map(cls => (
                    <button
                      key={cls}
                      onClick={() => setTrainClass(cls)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                        trainClass === cls
                          ? "border-rail bg-rail/10 text-rail"
                          : "border-border bg-card text-muted-foreground hover:border-rail/30"
                      )}
                    >
                      {cls} Class {cls === "1st" ? "(AC)" : ""}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Pass Options */}
        <h2 className="font-display font-semibold text-lg text-foreground mb-3">Or Choose a Pass</h2>
        <div className="grid gap-3 md:grid-cols-3 mb-8">
          {PASS_OPTIONS.map((pass) => (
            <button
              key={pass.id}
              onClick={() => setSelectedPass(selectedPass === pass.id ? null : pass.id)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all duration-200",
                selectedPass === pass.id
                  ? "border-accent bg-accent/5 shadow-card ring-2 ring-accent/20"
                  : "border-border bg-card hover:shadow-card hover:border-accent/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ticket className={cn("h-4 w-4", selectedPass === pass.id ? "text-accent" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm text-card-foreground">{pass.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  pass.mode === "combined" ? "bg-accent/10 text-accent" : "bg-rail/10 text-rail"
                )}>
                  {pass.mode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{pass.description}</p>
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-lg text-card-foreground">₹{pass.price}</span>
                <span className="text-xs text-muted-foreground">Valid: {pass.validity}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Purchase Summary & Button */}
        <AnimatePresence mode="wait">
          {!purchased ? (
            <motion.div key="buy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {price !== null && (
                <div className="rounded-lg border border-border bg-card p-4 mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">
                      {selectedPass
                        ? PASS_OPTIONS.find(p => p.id === selectedPass)?.name
                        : `${fromStation} → ${toStation} · ${journeyType === "return" ? "Return" : "Single"} · ${fareResult?.isMetro ? "Metro" : trainClass + " Class"}`}
                    </p>
                    <p className="text-xs text-muted-foreground">Valid: {getValidity()}</p>
                  </div>
                  <p className="font-display font-bold text-2xl text-accent">₹{price}</p>
                </div>
              )}
              <button
                onClick={handlePurchase}
                disabled={!canPurchase}
                className={cn(
                  "w-full rounded-lg py-3.5 font-semibold text-accent-foreground transition-all flex items-center justify-center gap-2",
                  canPurchase
                    ? "gradient-accent shadow-card hover:opacity-90"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                <CreditCard className="h-5 w-5" />
                {loading ? "Processing..." : price !== null ? `Purchase · ₹${price}` : "Select stations & ticket type"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-lg border-2 border-crowd-low bg-crowd-low/5 p-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-crowd-low flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">Ticket Purchased!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {fromStation} → {toStation} · ₹{price}
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-3">
                <QrCode className="h-8 w-8 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Your QR Ticket</p>
                  <p className="font-mono text-sm font-semibold text-foreground">{ticketCode}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Tickets;
