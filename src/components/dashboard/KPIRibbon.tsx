import { DollarSign, TrendingUp, Users, UserMinus, Target, Calendar } from "lucide-react";
import { KPICard, KPICardSkeleton } from "./KPICard";
import { useKPISummary } from "@/hooks/useDashboardData";

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return "0%";
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("en-US").format(value);
}

export function KPIRibbon() {
  const { data: kpi, isLoading, error } = useKPISummary();

  if (error) {
    return (
      <div className="text-destructive text-sm">
        Failed to load KPIs. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <KPICard
        label="Total Revenue"
        value={formatCurrency(kpi?.total_revenue)}
        icon={DollarSign}
      />
      <KPICard
        label="MRR"
        value={formatCurrency(kpi?.mrr)}
        icon={Calendar}
      />
      <KPICard
        label="ARR"
        value={formatCurrency(kpi?.arr)}
        icon={TrendingUp}
      />
      <KPICard
        label="Active Customers"
        value={formatNumber(kpi?.active_customers)}
        icon={Users}
      />
      <KPICard
        label="Churn Rate"
        value={formatPercent(kpi?.churn_rate)}
        icon={UserMinus}
      />
      <KPICard
        label="CAC"
        value={formatCurrency(kpi?.cac)}
        icon={Target}
      />
    </div>
  );
}
