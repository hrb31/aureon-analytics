import { cn } from "@/lib/utils";

interface HealthScoreBarProps {
  score: number;
  showLabel?: boolean;
  className?: string;
}

export function HealthScoreBar({ score, showLabel = true, className }: HealthScoreBarProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Determine color based on score
  const getColorClass = () => {
    if (clampedScore >= 70) return "bg-success";
    if (clampedScore >= 40) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full transition-all duration-300", getColorClass())}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-medium tabular-nums w-10 text-right">
          {clampedScore}%
        </span>
      )}
    </div>
  );
}
