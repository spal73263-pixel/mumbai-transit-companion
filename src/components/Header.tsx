import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Train, Menu, X, Ticket, Map, LayoutDashboard, Bell, QrCode, LogIn, LogOut, UserCircle, AlertTriangle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Live Status", path: "/live", icon: Train },
  { label: "Tickets", path: "/tickets", icon: Ticket },
  { label: "Routes", path: "/routes", icon: Map },
  { label: "Schedule", path: "/schedule", icon: CalendarClock },
  { label: "SOS", path: "/sos", icon: AlertTriangle },
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="rounded-lg gradient-accent p-2">
            <Train className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-foreground">SmartRail</span>
            <span className="font-display font-bold text-lg text-accent"> Mumbai</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-accent/10 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/scan"
            className="hidden md:flex items-center gap-1.5 rounded-lg gradient-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-card hover:opacity-90 transition-opacity"
          >
            <QrCode className="h-4 w-4" />
            Scan QR
          </Link>
          <button className="relative p-2 rounded-md text-muted-foreground hover:bg-muted transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-crowd-high" />
          </button>
          {user ? (
            <button
              onClick={() => signOut()}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <Link
              to="/auth"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <nav className="container py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
              <Link
                to="/scan"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg gradient-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground mt-1"
              >
                <QrCode className="h-4 w-4" />
                Scan QR
              </Link>
              {user ? (
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
