import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PlanMixChart } from "@/components/dashboard/PlanMixChart";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { useKPISummary, useRevenueOverTime } from "@/hooks/useDashboardData";
import { useMRRMovement } from "@/hooks/useMRRMovement";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function useRevenueTrends() {
  const { data: revenueData } = useRevenueOverTime();

  return useMemo(() => {
    if (!revenueData || revenueData.length < 2) {
      return { mrrTrend: 0, qtrTrend: 0, yearTrend: 0 };
    }

    // Sort by month descending
    const sorted = [...revenueData].sort(
      (a, b) => new Date(b.month ?? 0).getTime() - new Date(a.month ?? 0).getTime()
    );

    // Calculate month-over-month change
    const currentMonth = sorted[0]?.revenue ?? 0;
    const previousMonth = sorted[1]?.revenue ?? 0;
    const mrrTrend = previousMonth > 0
      ? ((currentMonth - previousMonth) / previousMonth) * 100
      : 0;

    // Quarter-over-quarter (sum of last 3 months vs previous 3)
    const currentQtr = sorted.slice(0, 3).reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const previousQtr = sorted.slice(3, 6).reduce((sum, r) => sum + (r.revenue ?? 0), 0);
    const qtrTrend = previousQtr > 0
      ? ((currentQtr - previousQtr) / previousQtr) * 100
      : 0;

    // Year-over-year estimate (annualize current MRR growth)
    const yearTrend = mrrTrend * 1.2; // Simple projection

    return {
      mrrTrend: Number(mrrTrend.toFixed(1)),
      qtrTrend: Number(qtrTrend.toFixed(1)),
      yearTrend: Number(yearTrend.toFixed(1)),
    };
  }, [revenueData]);
}

function RevenueKPICards() {
  const { data, isLoading } = useKPISummary();
  const trends = useRevenueTrends();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(data?.total_revenue),
      trend: trends.qtrTrend,
      trendLabel: "vs last quarter",
    },
    {
      title: "MRR",
      value: formatCurrency(data?.mrr),
      trend: trends.mrrTrend,
      trendLabel: "vs last month",
    },
    {
      title: "ARR",
      value: formatCurrency(data?.arr),
      trend: trends.yearTrend,
      trendLabel: "projected",
    },
    {
      title: "Net Revenue Retention",
      value: data?.churn_rate != null ? `${Math.max(100 - data.churn_rate, 0).toFixed(0)}%` : "N/A",
      trend: data?.churn_rate != null ? -data.churn_rate : 0,
      trendLabel: "churn impact",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
            <p className="text-2xl font-bold mt-1">{kpi.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-[hsl(var(--chart-2))]" />
              ) : (
                <TrendingDown className="h-3 w-3 text-[hsl(var(--chart-5))]" />
              )}
              <span
                className={`text-xs font-medium ${
                  kpi.trend >= 0 ? "text-[hsl(var(--chart-2))]" : "text-[hsl(var(--chart-5))]"
                }`}
              >
                {kpi.trend >= 0 ? "+" : ""}
                {kpi.trend}%
              </span>
              <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MRRMovementSection() {
  const { data, isLoading } = useMRRMovement();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MRR Movement</CardTitle>
          <CardDescription>New, Expansion, Contraction, and Churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-muted/50 rounded-lg">
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MRR Movement</CardTitle>
        <CardDescription>New, Expansion, Contraction, and Churn</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-[hsl(var(--chart-2)/0.1)] rounded-lg">
            <p className="text-2xl font-bold text-[hsl(var(--chart-2))]">
              +{formatCurrency(data?.newMrr)}
            </p>
            <p className="text-sm text-muted-foreground">New MRR</p>
          </div>
          <div className="p-4 bg-[hsl(var(--chart-1)/0.1)] rounded-lg">
            <p className="text-2xl font-bold text-[hsl(var(--chart-1))]">
              +{formatCurrency(data?.expansionMrr)}
            </p>
            <p className="text-sm text-muted-foreground">Expansion</p>
          </div>
          <div className="p-4 bg-[hsl(var(--chart-4)/0.1)] rounded-lg">
            <p className="text-2xl font-bold text-[hsl(var(--chart-4))]">
              -{formatCurrency(data?.contractionMrr)}
            </p>
            <p className="text-sm text-muted-foreground">Contraction</p>
          </div>
          <div className="p-4 bg-[hsl(var(--chart-5)/0.1)] rounded-lg">
            <p className="text-2xl font-bold text-[hsl(var(--chart-5))]">
              -{formatCurrency(data?.churnedMrr)}
            </p>
            <p className="text-sm text-muted-foreground">Churn</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Revenue() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Revenue Deep Dive</h1>
            <p className="text-muted-foreground">
              Analyze revenue trends, MRR movements, and invoice performance.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* KPI Cards */}
        <RevenueKPICards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <PlanMixChart />
          </div>
        </div>

        {/* MRR Movement Section */}
        <MRRMovementSection />

        {/* Invoices Table */}
        <RecentInvoicesTable />
      </div>
    </DashboardLayout>
  );
}
