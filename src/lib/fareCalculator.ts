// Mumbai Railway Fare Calculator
// Based on actual Mumbai suburban railway zone-based fares

export type TrainClass = "2nd" | "1st";

// Station order along each line (index = zone distance)
const WESTERN_LINE = [
  "Churchgate", "Mumbai Central", "Dadar", "Bandra", "Andheri", "Borivali", "Virar"
];

const CENTRAL_LINE = [
  "CST", "Kurla", "Ghatkopar", "Thane", "Kalyan"
];

const HARBOUR_LINE = [
  "CST", "Wadala", "Panvel"
];

const METRO_LINE = [
  "Versova", "WEH", "Marol Naka", "Saki Naka", "Ghatkopar"
];

// Approximate km distances between consecutive stations on each line
const WESTERN_KM = [0, 3, 9, 12, 19, 30, 60];   // cumulative from Churchgate
const CENTRAL_KM = [0, 12, 17, 34, 54];           // cumulative from CST
const HARBOUR_KM = [0, 12, 46];                    // cumulative from CST
const METRO_KM =   [0, 5, 10, 14, 17];            // cumulative from Versova

function getKm(station: string, line: string[]): [number, number[]] {
  const kmMap: Record<string, number[]> = {
    Churchgate: WESTERN_KM, "Mumbai Central": WESTERN_KM, Dadar: WESTERN_KM,
    Bandra: WESTERN_KM, Andheri: WESTERN_KM, Borivali: WESTERN_KM, Virar: WESTERN_KM,
    CST: CENTRAL_KM, Kurla: CENTRAL_KM, Ghatkopar: CENTRAL_KM,
    Thane: CENTRAL_KM, Kalyan: CENTRAL_KM,
    Wadala: HARBOUR_KM, Panvel: HARBOUR_KM,
    Versova: METRO_KM, WEH: METRO_KM, "Marol Naka": METRO_KM,
    "Saki Naka": METRO_KM,
  };
  const idx = line.indexOf(station);
  const kms = kmMap[station] ?? CENTRAL_KM;
  return [idx, kms];
}

// Indian Railways 2nd class fare slabs (approximate Mumbai suburban)
const SUBURBAN_2ND_SLABS: { maxKm: number; fare: number }[] = [
  { maxKm: 5,   fare: 5  },
  { maxKm: 10,  fare: 10 },
  { maxKm: 15,  fare: 15 },
  { maxKm: 25,  fare: 20 },
  { maxKm: 35,  fare: 30 },
  { maxKm: 50,  fare: 40 },
  { maxKm: 70,  fare: 55 },
  { maxKm: 999, fare: 70 },
];

// 1st class is ~6x the 2nd class fare
const FIRST_CLASS_MULTIPLIER = 6;

function fareFor2nd(km: number): number {
  const slab = SUBURBAN_2ND_SLABS.find(s => km <= s.maxKm);
  return slab ? slab.fare : 70;
}

export interface FareResult {
  km: number;
  fare2nd: number;
  fare1st: number;
  isMetro: boolean;
  line: string;
}

function getLineForStation(station: string): { line: string[]; kms: number[]; name: string; isMetro: boolean } | null {
  if (WESTERN_LINE.includes(station)) return { line: WESTERN_LINE, kms: WESTERN_KM, name: "Western", isMetro: false };
  if (CENTRAL_LINE.includes(station)) return { line: CENTRAL_LINE, kms: CENTRAL_KM, name: "Central", isMetro: false };
  if (HARBOUR_LINE.includes(station)) return { line: HARBOUR_LINE, kms: HARBOUR_KM, name: "Harbour", isMetro: false };
  if (METRO_LINE.includes(station)) return { line: METRO_LINE, kms: METRO_KM, name: "Metro 1", isMetro: true };
  return null;
}

export function calculateFare(from: string, to: string): FareResult | null {
  const fromInfo = getLineForStation(from);
  const toInfo = getLineForStation(to);

  if (!fromInfo || !toInfo) return null;

  // Metro pricing: flat per station
  if (fromInfo.isMetro && toInfo.isMetro) {
    const fromIdx = fromInfo.line.indexOf(from);
    const toIdx = toInfo.line.indexOf(to);
    const stops = Math.abs(fromIdx - toIdx);
    const metroFare = stops <= 1 ? 20 : stops <= 3 ? 30 : 40;
    return { km: stops * 3, fare2nd: metroFare, fare1st: metroFare, isMetro: true, line: "Metro 1" };
  }

  // Same line suburban
  if (fromInfo.name === toInfo.name) {
    const fromIdx = fromInfo.line.indexOf(from);
    const toIdx = toInfo.line.indexOf(to);
    if (fromIdx === -1 || toIdx === -1) return null;
    const km = Math.abs(fromInfo.kms[fromIdx] - fromInfo.kms[toIdx]);
    const fare2nd = fareFor2nd(km);
    return { km, fare2nd, fare1st: fare2nd * FIRST_CLASS_MULTIPLIER, isMetro: false, line: fromInfo.name };
  }

  // Cross-line: CST/Dadar as interchange, add both segment kms
  // Dadar connects Western ↔ Central
  const DADAR_WESTERN_KM = WESTERN_KM[WESTERN_LINE.indexOf("Dadar")]; // 9
  const DADAR_CENTRAL_KM = 0; // treat Dadar as virtual start of Central for cross-line
  // CST connects Central ↔ Harbour
  const CST_HARBOUR_KM = 0;

  let km = 0;
  let lineName = `${fromInfo.name} → ${toInfo.name}`;

  // Western ↔ Central via Dadar
  if ((fromInfo.name === "Western" && toInfo.name === "Central") ||
      (fromInfo.name === "Central" && toInfo.name === "Western")) {
    const wStation = fromInfo.name === "Western" ? from : to;
    const cStation = fromInfo.name === "Central" ? from : to;
    const wIdx = WESTERN_LINE.indexOf(wStation);
    const cIdx = CENTRAL_LINE.indexOf(cStation);
    const wKm = Math.abs(WESTERN_KM[wIdx] - DADAR_WESTERN_KM);
    const cKm = CENTRAL_KM[cIdx];
    km = wKm + cKm + 2; // 2km interchange
    lineName = "Western/Central";
  }
  // Central ↔ Harbour
  else if ((fromInfo.name === "Central" && toInfo.name === "Harbour") ||
           (fromInfo.name === "Harbour" && toInfo.name === "Central")) {
    const cStation = fromInfo.name === "Central" ? from : to;
    const hStation = fromInfo.name === "Harbour" ? from : to;
    const cIdx = CENTRAL_LINE.indexOf(cStation);
    const hIdx = HARBOUR_LINE.indexOf(hStation);
    km = CENTRAL_KM[cIdx] + HARBOUR_KM[hIdx];
    lineName = "Central/Harbour";
  }
  // Suburban + Metro (interchange at Ghatkopar/Andheri)
  else if (fromInfo.isMetro !== toInfo.isMetro) {
    const subStation = fromInfo.isMetro ? to : from;
    const metStation = fromInfo.isMetro ? from : to;
    const subInfo = getLineForStation(subStation);
    const metInfo = getLineForStation(metStation);
    if (!subInfo || !metInfo) return null;
    const subIdx = subInfo.line.indexOf(subStation);
    const subKm = subInfo.kms[subIdx];
    const metIdx = metInfo.line.indexOf(metStation);
    const metKm = metInfo.kms[metIdx];
    km = subKm + metKm;
    lineName = `${subInfo.name} + Metro`;
  } else {
    km = 30; // fallback estimate
  }

  const fare2nd = fareFor2nd(km);
  return { km, fare2nd, fare1st: fare2nd * FIRST_CLASS_MULTIPLIER, isMetro: false, line: lineName };
}
