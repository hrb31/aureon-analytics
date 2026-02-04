import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "./ChartCard";
import { useRevenueOverTime } from "@/hooks/useDashboardData";
import { format, parseISO } from "date-fns";
import { TrendingUp } from "lucide-react";

export function RevenueChart() {
  const { data, isLoading, error } = useRevenueOverTime();

  if (error) {
    return (
      <ChartCard title="Revenue Trends">
        <div className="flex items-center justify-center h-[300px] text-destructive text-sm">
          Failed to load revenue data.
        </div>
      </ChartCard>
    );
  }

  const chartData = data?.map((item) => ({
    month: item.month ? format(parseISO(item.month), "MMM yy") : "",
    revenue: item.revenue ?? 0,
  })) ?? [];

  // Calculate total and trend
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const lastTwoMonths = chartData.slice(-2);
  const trend = lastTwoMonths.length === 2 
    ? ((lastTwoMonths[1].revenue - lastTwoMonths[0].revenue) / lastTwoMonths[0].revenue * 100).toFixed(1)
    : "0";

  return (
    <ChartCard 
      title="Revenue Trend" 
      isLoading={isLoading}
      action={
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-xs font-medium rounded-md bg-primary text-primary-foreground">
            Monthly
          </button>
          <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted">
            Weekly
          </button>
          <button className="px-3 py-1 text-xs font-medium rounded-md text-muted-foreground hover:bg-muted">
            Daily
          </button>
        </div>
      }
    >
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(totalRevenue)}
        </span>
        <span className="flex items-center gap-1 text-sm font-medium text-[hsl(var(--chart-2))]">
          <TrendingUp className="h-4 w-4" />
          +{trend}%
        </span>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              className="fill-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value),
                "Revenue",
              ]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
