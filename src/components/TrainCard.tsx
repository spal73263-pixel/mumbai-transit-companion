import { Train, Clock, Users } from "lucide-react";
import CrowdIndicator from "./CrowdIndicator";
import TrainPositionStrip from "./TrainPositionStrip";
import { cn } from "@/lib/utils";

type CrowdLevel = "low" | "medium" | "high";

interface TrainCardProps {
  trainNumber: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  crowdLevel: CrowdLevel;
  type: "suburban" | "metro";
  platform?: string;
  occupancy: number;
}

const TrainCard = ({
  trainNumber,
  from,
  to,
  departure,
  arrival,
  crowdLevel,
  type,
  platform,
  occupancy,
}: TrainCardProps) => {
  return (
    <div className="group rounded-lg border border-border bg-card p-4 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-md p-1.5",
            type === "metro" ? "bg-metro/10" : "bg-rail/10"
          )}>
            <Train className={cn(
              "h-4 w-4",
              type === "metro" ? "text-metro" : "text-rail"
            )} />
          </div>
          <div>
            <span className="font-display font-semibold text-sm text-card-foreground">{trainNumber}</span>
            <span className={cn(
              "ml-2 text-xs font-medium px-1.5 py-0.5 rounded",
              type === "metro" ? "bg-metro/10 text-metro" : "bg-rail/10 text-rail"
            )}>
              {type === "metro" ? "Metro" : "Suburban"}
            </span>
          </div>
        </div>
        <CrowdIndicator level={crowdLevel} size="sm" />
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="text-center">
          <p className="font-display font-bold text-lg text-card-foreground">{departure}</p>
          <p className="text-xs text-muted-foreground">{from}</p>
        </div>
        <div className="flex-1 flex items-center gap-1">
          <div className="h-px flex-1 bg-border" />
          <Train className="h-3 w-3 text-muted-foreground" />
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-lg text-card-foreground">{arrival}</p>
          <p className="text-xs text-muted-foreground">{to}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span>{occupancy}% full</span>
        </div>
        {platform && (
          <span>Platform {platform}</span>
        )}
      </div>

      {/* Occupancy bar */}
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            crowdLevel === "low" && "bg-crowd-low",
            crowdLevel === "medium" && "bg-crowd-medium",
            crowdLevel === "high" && "bg-crowd-high",
          )}
          style={{ width: `${occupancy}%` }}
        />
      </div>
    </div>
  );
};

export default TrainCard;
