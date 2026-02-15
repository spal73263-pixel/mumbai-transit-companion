import { cn } from "@/lib/utils";

type CrowdLevel = "low" | "medium" | "high";

interface CrowdIndicatorProps {
  level: CrowdLevel;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const levelConfig = {
  low: { label: "Low", bg: "bg-crowd-low", text: "crowd-low", icon: "●" },
  medium: { label: "Medium", bg: "bg-crowd-medium", text: "crowd-medium", icon: "●●" },
  high: { label: "High", bg: "bg-crowd-high", text: "crowd-high", icon: "●●●" },
};

const sizeClasses = {
  sm: "text-xs gap-1",
  md: "text-sm gap-1.5",
  lg: "text-base gap-2",
};

const dotSizes = {
  sm: "h-2 w-2",
  md: "h-2.5 w-2.5",
  lg: "h-3 w-3",
};

const CrowdIndicator = ({ level, size = "md", showLabel = true }: CrowdIndicatorProps) => {
  const config = levelConfig[level];

  return (
    <div className={cn("flex items-center", sizeClasses[size])}>
      <span className={cn("rounded-full animate-pulse-glow", config.bg, dotSizes[size])} />
      {showLabel && (
        <span className={cn("font-semibold", config.text)}>{config.label}</span>
      )}
    </div>
  );
};

export default CrowdIndicator;
