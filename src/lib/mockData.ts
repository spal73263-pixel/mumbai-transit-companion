export type CrowdLevel = "low" | "medium" | "high";

export const stations = [
  "Churchgate", "Mumbai Central", "Dadar", "Bandra", "Andheri", 
  "Borivali", "Virar", "Thane", "Kalyan", "CST", "Kurla",
  "Ghatkopar", "Panvel", "Navi Mumbai", "Wadala"
];

export const metroStations = [
  "Versova", "Andheri", "WEH", "Chakala", "Airport Road",
  "Marol Naka", "Saki Naka", "Asalpha", "Jagruti Nagar", "Ghatkopar"
];

export interface TrainData {
  id: string;
  trainNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  crowdLevel: CrowdLevel;
  type: "suburban" | "metro";
  platform: string;
  occupancy: number;
}

export const liveTrains: TrainData[] = [
  { id: "1", trainNumber: "S-1042", from: "Churchgate", to: "Virar", departure: "08:15", arrival: "09:45", crowdLevel: "high", type: "suburban", platform: "3", occupancy: 92 },
  { id: "2", trainNumber: "S-1044", from: "Churchgate", to: "Borivali", departure: "08:25", arrival: "09:20", crowdLevel: "medium", type: "suburban", platform: "2", occupancy: 65 },
  { id: "3", trainNumber: "M-101", from: "Versova", to: "Ghatkopar", departure: "08:30", arrival: "09:05", crowdLevel: "low", type: "metro", platform: "1", occupancy: 35 },
  { id: "4", trainNumber: "S-2108", from: "CST", to: "Kalyan", departure: "08:35", arrival: "09:50", crowdLevel: "high", type: "suburban", platform: "5", occupancy: 88 },
  { id: "5", trainNumber: "S-1046", from: "Churchgate", to: "Andheri", departure: "08:40", arrival: "09:10", crowdLevel: "low", type: "suburban", platform: "1", occupancy: 28 },
  { id: "6", trainNumber: "M-103", from: "Ghatkopar", to: "Versova", departure: "08:45", arrival: "09:20", crowdLevel: "medium", type: "metro", platform: "2", occupancy: 55 },
  { id: "7", trainNumber: "S-2110", from: "CST", to: "Panvel", departure: "08:50", arrival: "10:00", crowdLevel: "medium", type: "suburban", platform: "4", occupancy: 60 },
  { id: "8", trainNumber: "S-1048", from: "Bandra", to: "Virar", departure: "08:55", arrival: "10:10", crowdLevel: "low", type: "suburban", platform: "6", occupancy: 22 },
];

export interface RouteOption {
  id: string;
  segments: { from: string; to: string; type: "suburban" | "metro"; line: string; duration: number }[];
  totalDuration: number;
  crowdLevel: CrowdLevel;
  changes: number;
}

export const sampleRoutes: RouteOption[] = [
  {
    id: "r1",
    segments: [{ from: "Churchgate", to: "Andheri", type: "suburban", line: "Western", duration: 35 }],
    totalDuration: 35,
    crowdLevel: "high",
    changes: 0,
  },
  {
    id: "r2",
    segments: [
      { from: "Churchgate", to: "Dadar", type: "suburban", line: "Western", duration: 18 },
      { from: "Dadar", to: "Andheri", type: "suburban", line: "Western", duration: 20 },
    ],
    totalDuration: 42,
    crowdLevel: "low",
    changes: 1,
  },
  {
    id: "r3",
    segments: [
      { from: "CST", to: "Ghatkopar", type: "suburban", line: "Central", duration: 25 },
      { from: "Ghatkopar", to: "Andheri", type: "metro", line: "Metro 1", duration: 22 },
    ],
    totalDuration: 52,
    crowdLevel: "low",
    changes: 1,
  },
];

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  validity: string;
  type: "single" | "return" | "pass";
  mode: "suburban" | "metro" | "combined";
}

export const ticketTypes: TicketType[] = [
  { id: "t1", name: "Single Journey", description: "One-way travel between stations", price: 15, validity: "4 hours", type: "single", mode: "suburban" },
  { id: "t2", name: "Return Journey", description: "Round trip same day", price: 25, validity: "1 day", type: "return", mode: "suburban" },
  { id: "t3", name: "Metro Single", description: "One-way metro travel", price: 20, validity: "2 hours", type: "single", mode: "metro" },
  { id: "t4", name: "Daily Pass", description: "Unlimited suburban travel", price: 85, validity: "1 day", type: "pass", mode: "suburban" },
  { id: "t5", name: "Weekly Pass", description: "Unlimited suburban travel for a week", price: 350, validity: "7 days", type: "pass", mode: "suburban" },
  { id: "t6", name: "Combined Pass", description: "Suburban + Metro unlimited", price: 500, validity: "7 days", type: "pass", mode: "combined" },
];

export const analyticsData = {
  hourlyPassengers: [
    { hour: "6AM", passengers: 12000 },
    { hour: "7AM", passengers: 45000 },
    { hour: "8AM", passengers: 78000 },
    { hour: "9AM", passengers: 85000 },
    { hour: "10AM", passengers: 52000 },
    { hour: "11AM", passengers: 35000 },
    { hour: "12PM", passengers: 28000 },
    { hour: "1PM", passengers: 32000 },
    { hour: "2PM", passengers: 30000 },
    { hour: "3PM", passengers: 35000 },
    { hour: "4PM", passengers: 42000 },
    { hour: "5PM", passengers: 72000 },
    { hour: "6PM", passengers: 88000 },
    { hour: "7PM", passengers: 75000 },
    { hour: "8PM", passengers: 48000 },
    { hour: "9PM", passengers: 25000 },
  ],
  routeDistribution: [
    { route: "Western", passengers: 320000 },
    { route: "Central", passengers: 280000 },
    { route: "Harbour", passengers: 150000 },
    { route: "Metro 1", passengers: 95000 },
    { route: "Metro 2A", passengers: 45000 },
  ],
  stationCrowding: [
    { station: "Dadar", level: 95 },
    { station: "Andheri", level: 88 },
    { station: "CST", level: 82 },
    { station: "Thane", level: 78 },
    { station: "Kurla", level: 75 },
    { station: "Bandra", level: 70 },
    { station: "Borivali", level: 65 },
    { station: "Ghatkopar", level: 60 },
  ],
};
