import { motion } from "framer-motion";
import { Train, Ticket, MapPin, Shield, QrCode, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "trains" | "tickets" | "routes" | "sos" | "scanner" | "schedule";

const configs: Record<Theme, { icons: typeof Train[]; color: string; count: number }> = {
  trains: { icons: [Train, Clock, Train], color: "text-accent/[0.06]", count: 6 },
  tickets: { icons: [Ticket, QrCode, Ticket], color: "text-accent/[0.06]", count: 5 },
  routes: { icons: [MapPin, Train, MapPin], color: "text-accent/[0.06]", count: 5 },
  sos: { icons: [Shield, Shield, Shield], color: "text-destructive/[0.06]", count: 4 },
  scanner: { icons: [QrCode, QrCode, QrCode], color: "text-accent/[0.06]", count: 4 },
  schedule: { icons: [Clock, Train, Clock], color: "text-accent/[0.06]", count: 5 },
};

interface AnimatedBackgroundProps {
  theme: Theme;
}

const AnimatedBackground = ({ theme }: AnimatedBackgroundProps) => {
  const { icons, color, count } = configs[theme];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {Array.from({ length: count }).map((_, i) => {
        const Icon = icons[i % icons.length];
        const size = 28 + (i % 3) * 16;
        const duration = 18 + i * 5;
        const startX = (i * 20) % 80;
        const startY = 10 + (i * 15) % 70;

        return (
          <motion.div
            key={i}
            className={cn("absolute", color)}
            style={{ left: `${startX}%`, top: `${startY}%` }}
            animate={{
              y: [0, -30, 10, -20, 0],
              x: [0, 15, -10, 20, 0],
              rotate: [0, 8, -5, 3, 0],
            }}
            transition={{
              duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.2,
            }}
          >
            <Icon style={{ width: size, height: size }} />
          </motion.div>
        );
      })}

      {/* Subtle moving gradient orbs */}
      <motion.div
        className="absolute w-72 h-72 rounded-full bg-accent/[0.03] blur-3xl"
        style={{ top: "20%", right: "-5%" }}
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-96 h-96 rounded-full bg-primary/[0.02] blur-3xl"
        style={{ bottom: "10%", left: "-10%" }}
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
    </div>
  );
};

export default AnimatedBackground;
