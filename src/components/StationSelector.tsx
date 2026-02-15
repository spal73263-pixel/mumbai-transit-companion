import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  stations: string[];
}

const StationSelector = ({ label, value, onChange, stations }: StationSelectorProps) => {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-lg border border-input bg-card pl-10 pr-4 py-3",
            "text-sm font-medium text-card-foreground",
            "focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
            "transition-all appearance-none cursor-pointer"
          )}
        >
          <option value="">Select station</option>
          {stations.map((station) => (
            <option key={station} value={station}>{station}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default StationSelector;
