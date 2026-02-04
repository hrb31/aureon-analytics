import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPIRibbon } from "@/components/dashboard/KPIRibbon";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PlanMixChart } from "@/components/dashboard/PlanMixChart";
import { ChannelPerformanceChart } from "@/components/dashboard/ChannelPerformanceChart";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { AtRiskCustomersTable } from "@/components/dashboard/AtRiskCustomersTable";
import { AIInsightBanner } from "@/components/dashboard/AIInsightBanner";
import { MiniMetricCards } from "@/components/dashboard/MiniMetricCard";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Key metrics and performance insights at a glance.
          </p>
        </div>

        {/* AI Insight Banner */}
        <AIInsightBanner />

        {/* KPI Ribbon */}
        <KPIRibbon />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <PlanMixChart />
          </div>
        </div>

        {/* Mini Metric Cards */}
        <MiniMetricCards />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelPerformanceChart />
          <AtRiskCustomersTable />
        </div>

        {/* Invoices Table - Full Width */}
        <RecentInvoicesTable />
      </div>
    </DashboardLayout>
  );
}
