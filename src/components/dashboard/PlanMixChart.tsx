import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartCard } from "./ChartCard";
import { useRevenueByPlan } from "@/hooks/useDashboardData";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function PlanMixChart() {
  const { data, isLoading, error } = useRevenueByPlan();

  if (error) {
    return (
      <ChartCard title="Revenue by Plan">
        <div className="flex items-center justify-center h-[250px] text-destructive text-sm">
          Failed to load plan data.
        </div>
      </ChartCard>
    );
  }

  const chartData = data?.map((item) => ({
    name: item.plan_name ?? "Unknown",
    value: Number(item.monthly_revenue) ?? 0,
    percentage: item.percentage ?? 0,
  })) ?? [];

  return (
    <ChartCard title="Revenue by Plan" isLoading={isLoading}>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number, name: string) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(value),
                name,
              ]}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
