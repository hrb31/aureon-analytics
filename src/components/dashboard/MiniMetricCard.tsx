import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { usePaymentMetrics } from "@/hooks/usePaymentMetrics";
import { Skeleton } from "@/components/ui/skeleton";

interface MiniMetricCardProps {
  label: string;
  value: string;
  trend: "up" | "down";
  trendValue: string;
  data: { value: number }[];
  color: "success" | "destructive";
}

export function MiniMetricCard({
  label,
  value,
  trend,
  trendValue,
  data,
  color,
}: MiniMetricCardProps) {
  const chartColor = color === "success" 
    ? "hsl(var(--chart-2))" 
    : "hsl(var(--chart-5))";
  
  const trendColor = color === "success"
    ? "text-[hsl(var(--chart-2))]"
    : "text-[hsl(var(--chart-5))]";

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{value}</span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                <TrendIcon className="h-3 w-3" />
                {trendValue}
              </span>
            </div>
          </div>
          <div className="h-12 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MiniMetricCards() {
  const { data, isLoading } = usePaymentMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const refundTrendPrefix = data?.refundTrend && data.refundTrend <= 0 ? "" : "+";
  const failedTrendPrefix = data?.failedTrend && data.failedTrend <= 0 ? "" : "+";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MiniMetricCard
        label="Refund Rate"
        value={`${data?.refundRate ?? 0}%`}
        trend={data?.trendDirection?.refund ?? "down"}
        trendValue={`${refundTrendPrefix}${data?.refundTrend ?? 0}%`}
        data={data?.refundSparkline ?? []}
        color={data?.trendDirection?.refund === "down" ? "success" : "destructive"}
      />
      <MiniMetricCard
        label="Failed Payments"
        value={`${data?.failedRate ?? 0}%`}
        trend={data?.trendDirection?.failed ?? "up"}
        trendValue={`${failedTrendPrefix}${data?.failedTrend ?? 0}%`}
        data={data?.failedSparkline ?? []}
        color={data?.trendDirection?.failed === "up" ? "destructive" : "success"}
      />
    </div>
  );
}
