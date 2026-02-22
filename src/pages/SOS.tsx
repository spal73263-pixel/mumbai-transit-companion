import { useState } from "react";
import { Phone, Shield, Ambulance, AlertTriangle, MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

interface StationEmergency {
  station: string;
  line: string;
  police: { name: string; number: string }[];
  ambulance: { name: string; number: string }[];
}

const EMERGENCY_DATA: StationEmergency[] = [
  // Western Line
  { station: "Churchgate", line: "Western", police: [{ name: "Marine Drive Police Station", number: "022-22821478" }], ambulance: [{ name: "GT Hospital Ambulance", number: "022-22621242" }] },
  { station: "Mumbai Central", line: "Western", police: [{ name: "Mumbai Central GRP", number: "022-23021234" }], ambulance: [{ name: "Nair Hospital Ambulance", number: "022-23027100" }] },
  { station: "Dadar", line: "Western", police: [{ name: "Dadar GRP", number: "022-24131553" }], ambulance: [{ name: "KEM Hospital Ambulance", number: "022-24136051" }] },
  { station: "Bandra", line: "Western", police: [{ name: "Bandra GRP", number: "022-26401011" }], ambulance: [{ name: "Bhabha Hospital Ambulance", number: "022-26422434" }] },
  { station: "Andheri", line: "Western", police: [{ name: "Andheri GRP", number: "022-26284040" }], ambulance: [{ name: "Cooper Hospital Ambulance", number: "022-26207254" }] },
  { station: "Borivali", line: "Western", police: [{ name: "Borivali GRP", number: "022-28932222" }], ambulance: [{ name: "Bhagwati Hospital Ambulance", number: "022-28922424" }] },
  { station: "Virar", line: "Western", police: [{ name: "Virar GRP", number: "0250-2525252" }], ambulance: [{ name: "Virar Civil Hospital", number: "0250-2502502" }] },

  // Central Line
  { station: "CST", line: "Central", police: [{ name: "CST GRP", number: "022-22624040" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Kurla", line: "Central", police: [{ name: "Kurla GRP", number: "022-26501010" }], ambulance: [{ name: "Rajawadi Hospital Ambulance", number: "022-25220708" }] },
  { station: "Ghatkopar", line: "Central", police: [{ name: "Ghatkopar GRP", number: "022-25012345" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Thane", line: "Central", police: [{ name: "Thane GRP", number: "022-25341111" }], ambulance: [{ name: "Thane Civil Hospital", number: "022-25360444" }] },
  { station: "Kalyan", line: "Central", police: [{ name: "Kalyan GRP", number: "0251-2313131" }], ambulance: [{ name: "Kalyan Civil Hospital", number: "0251-2210299" }] },

  // Harbour Line
  { station: "Vashi", line: "Harbour", police: [{ name: "Vashi Police Station", number: "022-27892222" }], ambulance: [{ name: "NMMC Hospital", number: "022-27823056" }] },
  { station: "Panvel", line: "Harbour", police: [{ name: "Panvel GRP", number: "022-27451010" }], ambulance: [{ name: "Panvel Sub-District Hospital", number: "022-27452222" }] },

  // Metro 1
  { station: "Versova", line: "Metro 1", police: [{ name: "Versova Police Station", number: "022-26312222" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Ghatkopar", line: "Metro 1", police: [{ name: "Ghatkopar Metro Security", number: "022-25011111" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
];

const UNIVERSAL_NUMBERS = [
  { label: "Police", number: "100", icon: Shield, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { label: "Ambulance", number: "108", icon: Ambulance, color: "bg-red-500/10 text-red-600 dark:text-red-400" },
  { label: "Railway Helpline", number: "139", icon: Phone, color: "bg-green-500/10 text-green-600 dark:text-green-400" },
  { label: "Women Helpline", number: "1091", icon: Phone, color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
  { label: "Disaster Mgmt", number: "1916", icon: AlertTriangle, color: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
];

const LINE_COLORS: Record<string, string> = {
  Western: "border-l-blue-500",
  Central: "border-l-red-500",
  Harbour: "border-l-green-500",
  "Metro 1": "border-l-purple-500",
};

const SOS = () => {
  const [search, setSearch] = useState("");
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  const filtered = EMERGENCY_DATA.filter(
    (s) =>
      s.station.toLowerCase().includes(search.toLowerCase()) ||
      s.line.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-destructive/10 border border-destructive/30 p-5 flex items-start gap-4"
        >
          <div className="rounded-full bg-destructive/20 p-3 shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">SOS — Emergency Contacts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tap any number to call instantly. Find police &amp; ambulance contacts near your station.
            </p>
          </div>
        </motion.div>

        {/* Universal numbers */}
        <section>
          <h2 className="font-display font-semibold text-foreground mb-3">Quick Dial</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {UNIVERSAL_NUMBERS.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className={cn("rounded-full p-2.5", item.color)}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                <span className="font-display font-bold text-lg text-foreground">{item.number}</span>
              </a>
            ))}
          </div>
        </section>

        {/* Station search */}
        <section>
          <h2 className="font-display font-semibold text-foreground mb-3">Station-wise Contacts</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search station or line..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((station) => {
                const key = `${station.station}-${station.line}`;
                const isOpen = expandedStation === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      "rounded-lg border border-border bg-card overflow-hidden border-l-4",
                      LINE_COLORS[station.line] ?? "border-l-muted"
                    )}
                  >
                    <button
                      onClick={() => setExpandedStation(isOpen ? null : key)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <span className="font-semibold text-sm text-foreground">{station.station}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{station.line} Line</span>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-3">
                            {/* Police */}
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Police</span>
                              </div>
                              {station.police.map((p) => (
                                <a
                                  key={p.number}
                                  href={`tel:${p.number}`}
                                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 mb-1 hover:bg-muted transition-colors"
                                >
                                  <span className="text-sm text-foreground">{p.name}</span>
                                  <span className="text-sm font-mono font-semibold text-accent">{p.number}</span>
                                </a>
                              ))}
                            </div>
                            {/* Ambulance */}
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <Ambulance className="h-3.5 w-3.5 text-red-500" />
                                <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Ambulance</span>
                              </div>
                              {station.ambulance.map((a) => (
                                <a
                                  key={a.number}
                                  href={`tel:${a.number}`}
                                  className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 mb-1 hover:bg-muted transition-colors"
                                >
                                  <span className="text-sm text-foreground">{a.name}</span>
                                  <span className="text-sm font-mono font-semibold text-accent">{a.number}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No stations found for "{search}"</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default SOS;
