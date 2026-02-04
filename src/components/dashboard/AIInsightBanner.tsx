import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AIInsightBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative flex items-start gap-4 rounded-lg border border-[hsl(var(--chart-1)/0.3)] bg-[hsl(var(--chart-1)/0.08)] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--chart-1))]">
        <Sparkles className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--chart-1))]">
            AI Insight
          </span>
        </div>
        <p className="text-sm text-foreground">
          Revenue from Enterprise customers increased by <span className="font-semibold text-[hsl(var(--chart-2))]">23%</span> this month. 
          This is driven primarily by 3 new Enterprise signups and reduced churn in the segment.
        </p>
        <button className="text-sm font-medium text-[hsl(var(--chart-1))] hover:underline">
          View detailed anomaly report →
        </button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
