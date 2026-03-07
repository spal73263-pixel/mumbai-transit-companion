import { useState, useRef, useEffect } from "react";
import { MapPin, Search, X, Train } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface StationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  stations: string[];
}

const StationSelector = ({ label, value, onChange, stations }: StationSelectorProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? stations.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : stations;

  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.parentElement?.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (station: string) => {
    onChange(station);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[highlightIndex]) {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIndex, open]);

  return (
    <div className="flex flex-col gap-1.5 relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <input
          ref={inputRef}
          type="text"
          placeholder={value || "Search station..."}
          value={open ? query : ""}
          onFocus={() => { setOpen(true); setQuery(""); }}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-lg border border-input bg-card pl-10 pr-10 py-3",
            "text-sm font-medium text-card-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "transition-all placeholder:text-muted-foreground",
            !open && value && "placeholder:text-card-foreground"
          )}
        />
        {value && !open && (
          <button
            onClick={() => { onChange(""); setQuery(""); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {value && !open && (
          <div className="absolute left-10 top-1/2 -translate-y-1/2 pointer-events-none">
            <span className="text-sm font-medium text-card-foreground">{value}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-elevated"
          >
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No stations found
              </div>
            ) : (
              filtered.map((station, i) => (
                <button
                  key={station}
                  onClick={() => handleSelect(station)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors",
                    i === highlightIndex
                      ? "bg-accent/10 text-accent"
                      : "text-popover-foreground hover:bg-muted",
                    station === value && "font-semibold"
                  )}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{station}</span>
                  {station === value && (
                    <span className="ml-auto text-xs text-accent">Selected</span>
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StationSelector;
