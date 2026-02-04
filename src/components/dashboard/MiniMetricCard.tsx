import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

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

// Sample data for demo
const refundData = [
  { value: 2.1 }, { value: 1.8 }, { value: 2.3 }, { value: 1.9 }, 
  { value: 1.5 }, { value: 1.2 }, { value: 1.0 }
];

const failedData = [
  { value: 0.5 }, { value: 0.8 }, { value: 0.6 }, { value: 1.0 }, 
  { value: 1.2 }, { value: 1.5 }, { value: 1.8 }
];

export function MiniMetricCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <MiniMetricCard
        label="Refund Rate"
        value="1.0%"
        trend="down"
        trendValue="-0.5%"
        data={refundData}
        color="success"
      />
      <MiniMetricCard
        label="Failed Payments"
        value="1.8%"
        trend="up"
        trendValue="+0.3%"
        data={failedData}
        color="destructive"
      />
    </div>
  );
}
