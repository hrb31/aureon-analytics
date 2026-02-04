import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { KPIRibbon } from "@/components/dashboard/KPIRibbon";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PlanMixChart } from "@/components/dashboard/PlanMixChart";
import { ChannelPerformanceChart } from "@/components/dashboard/ChannelPerformanceChart";
import { RecentInvoicesTable } from "@/components/dashboard/RecentInvoicesTable";
import { AtRiskCustomersTable } from "@/components/dashboard/AtRiskCustomersTable";

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelPerformanceChart />
          <div className="hidden lg:block" /> {/* Reserved space for future Growth Dynamics chart */}
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentInvoicesTable />
          <AtRiskCustomersTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
