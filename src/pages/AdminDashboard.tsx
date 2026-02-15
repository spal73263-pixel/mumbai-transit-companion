import { Users, TrendingUp, AlertTriangle, Train } from "lucide-react";
import Header from "@/components/Header";
import { analyticsData } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["hsl(24 95% 53%)", "hsl(220 60% 40%)", "hsl(160 60% 40%)", "hsl(210 80% 50%)", "hsl(38 92% 50%)"];

const summaryCards = [
  { label: "Today's Passengers", value: "7.82M", change: "+4.2%", icon: Users, color: "text-accent" },
  { label: "Avg. Occupancy", value: "72%", change: "+2.1%", icon: TrendingUp, color: "text-metro" },
  { label: "Active Alerts", value: "3", change: "", icon: AlertTriangle, color: "text-crowd-high" },
  { label: "Active Services", value: "2,341", change: "98.5%", icon: Train, color: "text-rail" },
];

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Network analytics and passenger monitoring</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div key={card.label} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <card.icon className={cn("h-5 w-5", card.color)} />
                {card.change && (
                  <span className="text-xs font-medium text-crowd-low">{card.change}</span>
                )}
              </div>
              <p className="font-display font-bold text-2xl text-card-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Hourly Passengers Chart */}
          <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-4">Hourly Passenger Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.hourlyPassengers}>
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(1)}k passengers`, "Volume"]}
                />
                <Bar dataKey="passengers" fill="hsl(24, 95%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Route Distribution */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-semibold text-foreground mb-4">Route Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.routeDistribution}
                  dataKey="passengers"
                  nameKey="route"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                >
                  {analyticsData.routeDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${(value / 1000).toFixed(0)}k`, "Passengers"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-3">
              {analyticsData.routeDistribution.map((r, i) => (
                <div key={r.route} className="flex items-center gap-1.5 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{r.route}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Station Crowding */}
        <div className="rounded-lg border border-border bg-card p-5 shadow-card mt-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Station Congestion Levels</h3>
          <div className="space-y-3">
            {analyticsData.stationCrowding.map((station) => (
              <div key={station.station} className="flex items-center gap-4">
                <span className="w-24 text-sm font-medium text-card-foreground">{station.station}</span>
                <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      station.level >= 80 ? "bg-crowd-high" : station.level >= 60 ? "bg-crowd-medium" : "bg-crowd-low"
                    )}
                    style={{ width: `${station.level}%` }}
                  />
                </div>
                <span className={cn(
                  "text-sm font-semibold w-10 text-right",
                  station.level >= 80 ? "text-crowd-high" : station.level >= 60 ? "text-crowd-medium" : "text-crowd-low"
                )}>
                  {station.level}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
