import { useState } from "react";
import { Phone, Shield, Ambulance, AlertTriangle, MapPin, Search, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";
import PageTransition from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";

interface StationEmergency {
  station: string;
  line: string;
  police: { name: string; number: string }[];
  ambulance: { name: string; number: string }[];
}

const EMERGENCY_DATA: StationEmergency[] = [
  // ── Western Line (Churchgate → Virar) ──
  { station: "Churchgate", line: "Western", police: [{ name: "Marine Drive Police Stn", number: "022-22821478" }], ambulance: [{ name: "GT Hospital", number: "022-22621242" }] },
  { station: "Marine Lines", line: "Western", police: [{ name: "Marine Lines GRP", number: "022-22070757" }], ambulance: [{ name: "GT Hospital", number: "022-22621242" }] },
  { station: "Charni Road", line: "Western", police: [{ name: "V.P. Road Police Stn", number: "022-23863636" }], ambulance: [{ name: "Nair Hospital", number: "022-23027100" }] },
  { station: "Grant Road", line: "Western", police: [{ name: "Grant Road GRP", number: "022-23095757" }], ambulance: [{ name: "Nair Hospital", number: "022-23027100" }] },
  { station: "Mumbai Central", line: "Western", police: [{ name: "Mumbai Central GRP", number: "022-23021234" }], ambulance: [{ name: "Nair Hospital", number: "022-23027100" }] },
  { station: "Elphinstone", line: "Western", police: [{ name: "Lower Parel GRP", number: "022-24934444" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Lower Parel", line: "Western", police: [{ name: "Lower Parel GRP", number: "022-24934444" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Dadar", line: "Western", police: [{ name: "Dadar GRP", number: "022-24131553" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Matunga Road", line: "Western", police: [{ name: "Matunga GRP", number: "022-24143636" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Mahim", line: "Western", police: [{ name: "Mahim Police Stn", number: "022-24441010" }], ambulance: [{ name: "Bhabha Hospital", number: "022-26422434" }] },
  { station: "Bandra", line: "Western", police: [{ name: "Bandra GRP", number: "022-26401011" }], ambulance: [{ name: "Bhabha Hospital", number: "022-26422434" }] },
  { station: "Khar Road", line: "Western", police: [{ name: "Khar Police Stn", number: "022-26482222" }], ambulance: [{ name: "Bhabha Hospital", number: "022-26422434" }] },
  { station: "Santacruz", line: "Western", police: [{ name: "Santacruz GRP", number: "022-26492222" }], ambulance: [{ name: "V.N. Desai Hospital", number: "022-26149888" }] },
  { station: "Vile Parle", line: "Western", police: [{ name: "Vile Parle GRP", number: "022-26104040" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Andheri", line: "Western", police: [{ name: "Andheri GRP", number: "022-26284040" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Jogeshwari", line: "Western", police: [{ name: "Jogeshwari GRP", number: "022-26781234" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Goregaon", line: "Western", police: [{ name: "Goregaon GRP", number: "022-28721010" }], ambulance: [{ name: "ESIC Hospital Goregaon", number: "022-28722222" }] },
  { station: "Malad", line: "Western", police: [{ name: "Malad GRP", number: "022-28821010" }], ambulance: [{ name: "Bhagwati Hospital", number: "022-28922424" }] },
  { station: "Kandivali", line: "Western", police: [{ name: "Kandivali GRP", number: "022-28671234" }], ambulance: [{ name: "Bhagwati Hospital", number: "022-28922424" }] },
  { station: "Borivali", line: "Western", police: [{ name: "Borivali GRP", number: "022-28932222" }], ambulance: [{ name: "Bhagwati Hospital", number: "022-28922424" }] },
  { station: "Dahisar", line: "Western", police: [{ name: "Dahisar GRP", number: "022-28981010" }], ambulance: [{ name: "Bhagwati Hospital", number: "022-28922424" }] },
  { station: "Mira Road", line: "Western", police: [{ name: "Mira Road GRP", number: "022-28112222" }], ambulance: [{ name: "Wockhardt Hospital Mira Rd", number: "022-28555555" }] },
  { station: "Bhayandar", line: "Western", police: [{ name: "Bhayandar GRP", number: "022-28041010" }], ambulance: [{ name: "Bhayandar Sub-District Hosp", number: "022-28041234" }] },
  { station: "Naigaon", line: "Western", police: [{ name: "Naigaon GRP", number: "0250-2321234" }], ambulance: [{ name: "Vasai Civil Hospital", number: "0250-2332222" }] },
  { station: "Vasai Road", line: "Western", police: [{ name: "Vasai Road GRP", number: "0250-2333333" }], ambulance: [{ name: "Vasai Civil Hospital", number: "0250-2332222" }] },
  { station: "Nallasopara", line: "Western", police: [{ name: "Nallasopara GRP", number: "0250-2411010" }], ambulance: [{ name: "Nalasopara PHC", number: "0250-2421234" }] },
  { station: "Virar", line: "Western", police: [{ name: "Virar GRP", number: "0250-2525252" }], ambulance: [{ name: "Virar Civil Hospital", number: "0250-2502502" }] },

  // ── Central Line (CST → Kalyan) ──
  { station: "CST", line: "Central", police: [{ name: "CST GRP", number: "022-22624040" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Masjid", line: "Central", police: [{ name: "Masjid GRP", number: "022-23471010" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Sandhurst Road", line: "Central", police: [{ name: "Sandhurst Rd GRP", number: "022-23783636" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Byculla", line: "Central", police: [{ name: "Byculla GRP", number: "022-23714545" }], ambulance: [{ name: "JJ Hospital", number: "022-23735555" }] },
  { station: "Chinchpokli", line: "Central", police: [{ name: "Chinchpokli GRP", number: "022-23074040" }], ambulance: [{ name: "JJ Hospital", number: "022-23735555" }] },
  { station: "Dadar", line: "Central", police: [{ name: "Dadar GRP", number: "022-24131553" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Matunga", line: "Central", police: [{ name: "Matunga GRP", number: "022-24143636" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Sion", line: "Central", police: [{ name: "Sion GRP", number: "022-24071010" }], ambulance: [{ name: "Lokmanya Tilak Hospital", number: "022-24063636" }] },
  { station: "Kurla", line: "Central", police: [{ name: "Kurla GRP", number: "022-26501010" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Vidyavihar", line: "Central", police: [{ name: "Vidyavihar GRP", number: "022-25091234" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Ghatkopar", line: "Central", police: [{ name: "Ghatkopar GRP", number: "022-25012345" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Vikhroli", line: "Central", police: [{ name: "Vikhroli GRP", number: "022-25771010" }], ambulance: [{ name: "Godrej Memorial Hospital", number: "022-25771234" }] },
  { station: "Kanjurmarg", line: "Central", police: [{ name: "Kanjurmarg GRP", number: "022-25781010" }], ambulance: [{ name: "Godrej Memorial Hospital", number: "022-25771234" }] },
  { station: "Bhandup", line: "Central", police: [{ name: "Bhandup GRP", number: "022-25941010" }], ambulance: [{ name: "MT Agarwal Hospital", number: "022-25961234" }] },
  { station: "Nahur", line: "Central", police: [{ name: "Nahur GRP", number: "022-25671010" }], ambulance: [{ name: "MT Agarwal Hospital", number: "022-25961234" }] },
  { station: "Mulund", line: "Central", police: [{ name: "Mulund GRP", number: "022-25631010" }], ambulance: [{ name: "Fortis Hospital Mulund", number: "022-25994000" }] },
  { station: "Thane", line: "Central", police: [{ name: "Thane GRP", number: "022-25341111" }], ambulance: [{ name: "Thane Civil Hospital", number: "022-25360444" }] },
  { station: "Dombivli", line: "Central", police: [{ name: "Dombivli GRP", number: "0251-2441010" }], ambulance: [{ name: "Shastri Nagar Hospital", number: "0251-2451234" }] },
  { station: "Kalyan", line: "Central", police: [{ name: "Kalyan GRP", number: "0251-2313131" }], ambulance: [{ name: "Kalyan Civil Hospital", number: "0251-2210299" }] },

  // ── Harbour Line (CST → Panvel) ──
  { station: "CST", line: "Harbour", police: [{ name: "CST GRP", number: "022-22624040" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Masjid", line: "Harbour", police: [{ name: "Masjid GRP", number: "022-23471010" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Sandhurst Road", line: "Harbour", police: [{ name: "Sandhurst Rd GRP", number: "022-23783636" }], ambulance: [{ name: "St. George Hospital", number: "022-22620242" }] },
  { station: "Byculla", line: "Harbour", police: [{ name: "Byculla GRP", number: "022-23714545" }], ambulance: [{ name: "JJ Hospital", number: "022-23735555" }] },
  { station: "Chinchpokli", line: "Harbour", police: [{ name: "Chinchpokli GRP", number: "022-23074040" }], ambulance: [{ name: "JJ Hospital", number: "022-23735555" }] },
  { station: "Dadar", line: "Harbour", police: [{ name: "Dadar GRP", number: "022-24131553" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Matunga", line: "Harbour", police: [{ name: "Matunga GRP", number: "022-24143636" }], ambulance: [{ name: "KEM Hospital", number: "022-24136051" }] },
  { station: "Sion", line: "Harbour", police: [{ name: "Sion GRP", number: "022-24071010" }], ambulance: [{ name: "Lokmanya Tilak Hospital", number: "022-24063636" }] },
  { station: "Kurla", line: "Harbour", police: [{ name: "Kurla GRP", number: "022-26501010" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Chunabhatti", line: "Harbour", police: [{ name: "Chunabhatti GRP", number: "022-25221010" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "GTB Nagar", line: "Harbour", police: [{ name: "GTB Nagar GRP", number: "022-25231010" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Wadala", line: "Harbour", police: [{ name: "Wadala GRP", number: "022-24131010" }], ambulance: [{ name: "LTMG Hospital", number: "022-24063636" }] },
  { station: "Mankhurd", line: "Harbour", police: [{ name: "Mankhurd GRP", number: "022-25561010" }], ambulance: [{ name: "Urban Health Centre Mankhurd", number: "022-25561234" }] },
  { station: "Vashi", line: "Harbour", police: [{ name: "Vashi Police Stn", number: "022-27892222" }], ambulance: [{ name: "NMMC Hospital", number: "022-27823056" }] },
  { station: "Nerul", line: "Harbour", police: [{ name: "Nerul Police Stn", number: "022-27712222" }], ambulance: [{ name: "DY Patil Hospital", number: "022-27711234" }] },
  { station: "Belapur", line: "Harbour", police: [{ name: "CBD Belapur Police Stn", number: "022-27571010" }], ambulance: [{ name: "MGM Hospital", number: "022-27561234" }] },
  { station: "Kharghar", line: "Harbour", police: [{ name: "Kharghar Police Stn", number: "022-27741010" }], ambulance: [{ name: "Kharghar PHC", number: "022-27741234" }] },
  { station: "Panvel", line: "Harbour", police: [{ name: "Panvel GRP", number: "022-27451010" }], ambulance: [{ name: "Panvel Sub-District Hospital", number: "022-27452222" }] },

  // ── Metro 1 (Versova → Ghatkopar) ──
  { station: "Versova", line: "Metro 1", police: [{ name: "Versova Police Stn", number: "022-26312222" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "D.N. Nagar", line: "Metro 1", police: [{ name: "D.N. Nagar Police Stn", number: "022-26301010" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Azad Nagar", line: "Metro 1", police: [{ name: "Azad Nagar Metro Security", number: "022-26321010" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "WEH", line: "Metro 1", police: [{ name: "Andheri GRP", number: "022-26284040" }], ambulance: [{ name: "Cooper Hospital", number: "022-26207254" }] },
  { station: "Marol Naka", line: "Metro 1", police: [{ name: "MIDC Police Stn", number: "022-28361010" }], ambulance: [{ name: "Seven Hills Hospital", number: "022-67676767" }] },
  { station: "Saki Naka", line: "Metro 1", police: [{ name: "Saki Naka Police Stn", number: "022-28511010" }], ambulance: [{ name: "Seven Hills Hospital", number: "022-67676767" }] },
  { station: "Jagruti Nagar", line: "Metro 1", police: [{ name: "Jagruti Nagar Metro Security", number: "022-25021010" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
  { station: "Ghatkopar", line: "Metro 1", police: [{ name: "Ghatkopar GRP", number: "022-25012345" }], ambulance: [{ name: "Rajawadi Hospital", number: "022-25220708" }] },
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
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground theme="sos" />
      <Header />
      <PageTransition>
      <main className="container py-6 space-y-6 relative z-10">
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
      </PageTransition>
    </div>
  );
};

export default SOS;
