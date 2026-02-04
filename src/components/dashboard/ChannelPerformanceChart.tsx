import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartCard } from "./ChartCard";
import { useAcquisitionPerformance } from "@/hooks/useDashboardData";

const CHANNEL_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ChannelPerformanceChart() {
  const { data, isLoading, error } = useAcquisitionPerformance();

  if (error) {
    return (
      <ChartCard title="Acquisition Channel Performance">
        <div className="flex items-center justify-center h-[250px] text-destructive text-sm">
          Failed to load channel data.
        </div>
      </ChartCard>
    );
  }

  const chartData = data?.map((item) => ({
    name: item.channel_name ?? "Unknown",
    conversions: item.total_conversions ?? 0,
    cpa: Number(item.cost_per_acquisition) ?? 0,
  })) ?? [];

  return (
    <ChartCard title="Acquisition Channel Performance" isLoading={isLoading}>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground"
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => {
                if (name === "conversions") {
                  return [value, "Conversions"];
                }
                return [
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(value),
                  "CPA",
                ];
              }}
            />
            <Bar dataKey="conversions" radius={[0, 4, 4, 0]}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHANNEL_COLORS[index % CHANNEL_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
