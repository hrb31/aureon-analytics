import { ChartCard } from "./ChartCard";
import { useRevenueByPlan } from "@/hooks/useDashboardData";
import { Progress } from "@/components/ui/progress";

const PLAN_COLORS: Record<string, string> = {
  Enterprise: "bg-[hsl(var(--chart-1))]",
  Pro: "bg-[hsl(var(--chart-2))]",
  Starter: "bg-[hsl(var(--chart-3))]",
};

const PLAN_DOT_COLORS: Record<string, string> = {
  Enterprise: "bg-[hsl(var(--chart-1))]",
  Pro: "bg-[hsl(var(--chart-2))]",
  Starter: "bg-[hsl(var(--chart-3))]",
};

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

  const planData = data?.map((item) => ({
    name: item.plan_name ?? "Unknown",
    revenue: Number(item.monthly_revenue) ?? 0,
    percentage: Number(item.percentage) ?? 0,
    customers: item.customer_count ?? 0,
  })) ?? [];

  const totalRevenue = planData.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <ChartCard title="Revenue by Plan" isLoading={isLoading}>
      <div className="space-y-5">
        {planData.map((plan) => {
          const colorClass = PLAN_COLORS[plan.name] || "bg-primary";
          const dotColorClass = PLAN_DOT_COLORS[plan.name] || "bg-primary";
          
          return (
            <div key={plan.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${dotColorClass}`} />
                  <span className="text-sm font-medium">{plan.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(plan.revenue)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({plan.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className={`h-full rounded-full transition-all ${colorClass}`}
                  style={{ width: `${plan.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {plan.customers} customers
              </p>
            </div>
          );
        })}
        
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total MRR</span>
            <span className="text-lg font-bold">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(totalRevenue)}
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
