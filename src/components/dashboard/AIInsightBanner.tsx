import { useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIInsight } from "@/hooks/useAIInsight";
import { Skeleton } from "@/components/ui/skeleton";

export function AIInsightBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data, isLoading, error } = useAIInsight();

  if (dismissed) return null;

  // Don't render if there's an error or no insight
  if (error || (!isLoading && !data?.insight)) return null;

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
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {data?.highlightValue ? (
              <>
                {data.insight.split(data.highlightValue)[0]}
                <span className="font-semibold text-[hsl(var(--chart-2))]">
                  {data.highlightValue}
                </span>
                {data.insight.split(data.highlightValue).slice(1).join(data.highlightValue)}
              </>
            ) : (
              data?.insight
            )}
          </p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6 text-muted-foreground hover:text-foreground"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss insight"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
