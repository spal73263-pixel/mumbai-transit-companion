import { Link } from "react-router-dom";
import { Train, Ticket, Map, BarChart3, QrCode, Shield, ArrowRight, Users, Clock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-mumbai.jpg";
import Header from "@/components/Header";
import TrainCard from "@/components/TrainCard";
import { liveTrains } from "@/lib/mockData";

const features = [
  { icon: QrCode, title: "QR Digital Tickets", description: "Buy, scan, and manage tickets digitally. No more queues." },
  { icon: Users, title: "Live Crowd Status", description: "Real-time occupancy levels for every train and metro." },
  { icon: Map, title: "Smart Routes", description: "AI-powered alternate route suggestions to avoid crowds." },
  { icon: Shield, title: "Secure Access", description: "QR-validated boarding for accurate journey tracking." },
  { icon: BarChart3, title: "Admin Analytics", description: "Deep insights into passenger movement patterns." },
  { icon: Clock, title: "Real-Time Alerts", description: "Instant notifications for delays and congestion." },
];

const stats = [
  { value: "7.5M+", label: "Daily Passengers" },
  { value: "340+", label: "Stations" },
  { value: "2,500+", label: "Daily Services" },
  { value: "99.2%", label: "On-time Rate" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Mumbai Railway Network" className="w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-85" />
        </div>
        <div className="relative container py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6 backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              Live tracking active
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground leading-tight mb-4">
              Smarter Commutes for{" "}
              <span className="text-accent">Mumbai</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl">
              Real-time crowd tracking, digital ticketing, and intelligent route planning for Mumbai's suburban railway and metro network.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tickets"
                className="inline-flex items-center gap-2 rounded-lg gradient-accent px-6 py-3 font-semibold text-accent-foreground shadow-elevated hover:opacity-90 transition-opacity"
              >
                <Ticket className="h-5 w-5" />
                Book Tickets
              </Link>
              <Link
                to="/live"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
              >
                <Train className="h-5 w-5" />
                Live Status
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6 py-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-accent">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Live Trains Preview */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Live Train Status</h2>
            <p className="text-muted-foreground mt-1">Real-time occupancy across the network</p>
          </div>
          <Link
            to="/live"
            className="hidden md:flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liveTrains.slice(0, 6).map((train) => (
            <TrainCard key={train.id} {...train} />
          ))}
        </div>
        <Link
          to="/live"
          className="md:hidden flex items-center justify-center gap-1 text-sm font-medium text-accent mt-6 hover:underline"
        >
          View all trains <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Everything You Need to Commute Smarter
            </h2>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              A unified platform for Mumbai's entire rail and metro network
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i, duration: 0.5 }}
                className="rounded-lg border border-border bg-background p-6 shadow-card hover:shadow-elevated transition-all duration-300"
              >
                <div className="rounded-lg gradient-accent w-10 h-10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="container py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg gradient-accent p-2">
                <Train className="h-5 w-5 text-accent-foreground" />
              </div>
              <span className="font-display font-bold text-lg">SmartRail Mumbai</span>
            </div>
            <p className="text-sm text-primary-foreground/60">
              © 2026 SmartRail Mumbai. Transforming urban commutes.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
