import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartSkeletonProps {
  variant?: "line" | "bar" | "pie" | "area";
  className?: string;
}

export function ChartSkeleton({ variant = "line", className }: ChartSkeletonProps) {
  return (
    <div className={cn("w-full", className)}>
      {variant === "line" && <LineChartSkeleton />}
      {variant === "bar" && <BarChartSkeleton />}
      {variant === "pie" && <PieChartSkeleton />}
      {variant === "area" && <AreaChartSkeleton />}
    </div>
  );
}

function LineChartSkeleton() {
  return (
    <div className="space-y-3">
      {/* Y-axis labels */}
      <div className="flex items-end gap-2 h-48">
        <div className="flex flex-col justify-between h-full w-8">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
        </div>
        {/* Chart area */}
        <div className="flex-1 relative h-full">
          <Skeleton className="absolute inset-0 opacity-10" />
          <svg className="w-full h-full" preserveAspectRatio="none">
            <path
              d="M0,120 Q50,80 100,100 T200,60 T300,80 T400,40"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted-foreground/20"
            />
          </svg>
        </div>
      </div>
      {/* X-axis labels */}
      <div className="flex justify-between ml-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

function BarChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-48">
        <div className="flex flex-col justify-between h-full w-8">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-6" />
        </div>
        <div className="flex-1 flex items-end gap-3 h-full">
          {[60, 80, 45, 90, 70, 55].map((height, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-between ml-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

function PieChartSkeleton() {
  return (
    <div className="flex items-center justify-center gap-8 h-48">
      <Skeleton className="h-40 w-40 rounded-full" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2 h-48">
        <div className="flex flex-col justify-between h-full w-8">
          <Skeleton className="h-3 w-6" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-6" />
        </div>
        <div className="flex-1 relative h-full">
          <Skeleton className="absolute inset-x-0 bottom-0 h-3/4 opacity-20 rounded-t" />
        </div>
      </div>
      <div className="flex justify-between ml-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}
