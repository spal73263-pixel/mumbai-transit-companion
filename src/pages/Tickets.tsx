import { useState } from "react";
import { Ticket, QrCode, Check, CreditCard } from "lucide-react";
import Header from "@/components/Header";
import StationSelector from "@/components/StationSelector";
import { stations, metroStations, type TicketType } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Fixed flat-rate ticket types — prices do NOT vary by route
const ticketTypes: TicketType[] = [
  { id: "t1", name: "Single Journey", description: "One-way travel on suburban rail", price: 15, validity: "4 hours", type: "single", mode: "suburban" },
  { id: "t2", name: "Return Journey", description: "Round trip same day on suburban rail", price: 25, validity: "1 day", type: "return", mode: "suburban" },
  { id: "t3", name: "Metro Single", description: "One-way metro travel", price: 20, validity: "2 hours", type: "single", mode: "metro" },
  { id: "t4", name: "Daily Pass", description: "Unlimited suburban travel all day", price: 85, validity: "1 day", type: "pass", mode: "suburban" },
  { id: "t5", name: "Weekly Pass", description: "Unlimited suburban travel for a week", price: 350, validity: "7 days", type: "pass", mode: "suburban" },
  { id: "t6", name: "Combined Pass", description: "Suburban + Metro unlimited travel", price: 500, validity: "7 days", type: "pass", mode: "combined" },
];

const Tickets = () => {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const allStations = [...new Set([...stations, ...metroStations])].sort();

  const handlePurchase = async () => {
    if (!fromStation || !toStation || !selectedTicket || !user) return;
    setLoading(true);

    const code = "SR-" + Date.now().toString(36).toUpperCase();
    const validUntil = new Date();

    // Set validity period based on ticket type
    if (selectedTicket.validity === "4 hours") validUntil.setHours(validUntil.getHours() + 4);
    else if (selectedTicket.validity === "2 hours") validUntil.setHours(validUntil.getHours() + 2);
    else if (selectedTicket.validity === "1 day") validUntil.setDate(validUntil.getDate() + 1);
    else if (selectedTicket.validity === "7 days") validUntil.setDate(validUntil.getDate() + 7);

    const { error } = await supabase.from("tickets").insert({
      user_id: user.id,
      from_station: fromStation,
      to_station: toStation,
      ticket_type: selectedTicket.type,
      mode: selectedTicket.mode,
      price: selectedTicket.price,
      ticket_code: code,
      qr_data: JSON.stringify({ code, from: fromStation, to: toStation, type: selectedTicket.name }),
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
    setTimeout(() => setPurchased(false), 6000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Digital Tickets</h1>
          <p className="text-muted-foreground mt-1">Purchase and manage your travel tickets — flat-rate fares</p>
        </div>

        {/* Station Selection */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-8">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">Select Journey</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <StationSelector label="From" value={fromStation} onChange={setFromStation} stations={allStations} />
            <StationSelector label="To" value={toStation} onChange={setToStation} stations={allStations} />
          </div>
        </div>

        {/* Ticket Types — fixed prices */}
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Choose Ticket Type</h2>
        <div className="grid gap-3 md:grid-cols-2 mb-8">
          {ticketTypes.map((ticket) => (
            <button
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "rounded-lg border p-4 text-left transition-all duration-200",
                selectedTicket?.id === ticket.id
                  ? "border-accent bg-accent/5 shadow-card ring-2 ring-accent/20"
                  : "border-border bg-card hover:shadow-card hover:border-accent/30"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Ticket className={cn("h-4 w-4", selectedTicket?.id === ticket.id ? "text-accent" : "text-muted-foreground")} />
                  <span className="font-semibold text-sm text-card-foreground">{ticket.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-0.5 rounded",
                  ticket.mode === "metro" ? "bg-metro/10 text-metro" : ticket.mode === "combined" ? "bg-accent/10 text-accent" : "bg-rail/10 text-rail"
                )}>
                  {ticket.mode}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{ticket.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display font-bold text-lg text-card-foreground">₹{ticket.price}</span>
                  <span className="text-xs text-muted-foreground ml-2 font-medium">flat rate</span>
                </div>
                <span className="text-xs text-muted-foreground">Valid: {ticket.validity}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Purchase Button */}
        <AnimatePresence>
          {!purchased ? (
            <button
              onClick={handlePurchase}
              disabled={!fromStation || !toStation || !selectedTicket || loading}
              className={cn(
                "w-full rounded-lg py-3.5 font-semibold text-accent-foreground transition-all flex items-center justify-center gap-2",
                fromStation && toStation && selectedTicket && !loading
                  ? "gradient-accent shadow-card hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <CreditCard className="h-5 w-5" />
              {loading ? "Processing..." : selectedTicket ? `Purchase for ₹${selectedTicket.price}` : "Select journey & ticket type"}
            </button>
          ) : (
            <motion.div
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
                {fromStation} → {toStation} • {selectedTicket?.name} • ₹{selectedTicket?.price} flat rate
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
