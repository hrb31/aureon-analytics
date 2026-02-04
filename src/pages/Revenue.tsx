import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PlanMixChart } from "@/components/dashboard/PlanMixChart";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { useKPISummary } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function RevenueKPICards() {
  const { data, isLoading } = useKPISummary();

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
      trend: 12.5,
      trendLabel: "vs last quarter",
    },
    {
      title: "MRR",
      value: formatCurrency(data?.mrr),
      trend: 8.2,
      trendLabel: "vs last month",
    },
    {
      title: "ARR",
      value: formatCurrency(data?.arr),
      trend: 15.3,
      trendLabel: "vs last year",
    },
    {
      title: "Net Revenue Retention",
      value: "108%",
      trend: 3.5,
      trendLabel: "vs last quarter",
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
                <TrendingUp className="h-3 w-3 text-success" />
              ) : (
                <TrendingDown className="h-3 w-3 text-destructive" />
              )}
              <span
                className={`text-xs font-medium ${
                  kpi.trend >= 0 ? "text-success" : "text-destructive"
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

        {/* MRR Movement Chart */}
        <Card>
          <CardHeader>
            <CardTitle>MRR Movement</CardTitle>
            <CardDescription>New, Expansion, Contraction, and Churn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">+$12,400</p>
                <p className="text-sm text-muted-foreground">New MRR</p>
              </div>
              <div className="p-4 bg-chart-1/10 rounded-lg">
                <p className="text-2xl font-bold text-chart-1">+$8,200</p>
                <p className="text-sm text-muted-foreground">Expansion</p>
              </div>
              <div className="p-4 bg-warning/10 rounded-lg">
                <p className="text-2xl font-bold text-warning">-$3,100</p>
                <p className="text-sm text-muted-foreground">Contraction</p>
              </div>
              <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">-$2,400</p>
                <p className="text-sm text-muted-foreground">Churn</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <RecentInvoicesTable />
      </div>
    </DashboardLayout>
  );
}
