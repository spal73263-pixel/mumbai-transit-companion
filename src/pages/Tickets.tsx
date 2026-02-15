import { useState } from "react";
import { Ticket, QrCode, Check, CreditCard, Train } from "lucide-react";
import Header from "@/components/Header";
import StationSelector from "@/components/StationSelector";
import { ticketTypes, stations, metroStations, type TicketType } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const Tickets = () => {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [purchased, setPurchased] = useState(false);

  const allStations = [...new Set([...stations, ...metroStations])].sort();

  const handlePurchase = () => {
    if (!fromStation || !toStation || !selectedTicket) return;
    setPurchased(true);
    setTimeout(() => setPurchased(false), 4000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Digital Tickets</h1>
          <p className="text-muted-foreground mt-1">Purchase and manage your travel tickets</p>
        </div>

        {/* Station Selection */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-card mb-8">
          <h2 className="font-display font-semibold text-lg text-card-foreground mb-4">Select Journey</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <StationSelector label="From" value={fromStation} onChange={setFromStation} stations={allStations} />
            <StationSelector label="To" value={toStation} onChange={setToStation} stations={allStations} />
          </div>
        </div>

        {/* Ticket Types */}
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
                <span className="font-display font-bold text-lg text-card-foreground">₹{ticket.price}</span>
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
              disabled={!fromStation || !toStation || !selectedTicket}
              className={cn(
                "w-full rounded-lg py-3.5 font-semibold text-accent-foreground transition-all flex items-center justify-center gap-2",
                fromStation && toStation && selectedTicket
                  ? "gradient-accent shadow-card hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <CreditCard className="h-5 w-5" />
              {selectedTicket ? `Purchase for ₹${selectedTicket.price}` : "Select journey & ticket type"}
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
                {fromStation} → {toStation} • {selectedTicket?.name}
              </p>
              <div className="inline-flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-3">
                <QrCode className="h-8 w-8 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Your QR Ticket</p>
                  <p className="font-mono text-sm font-semibold text-foreground">SR-{Date.now().toString(36).toUpperCase()}</p>
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
