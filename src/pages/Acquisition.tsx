import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelPerformanceChart } from "@/components/dashboard/ChannelPerformanceChart";
import { useAcquisitionPerformance, useKPISummary } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, DollarSign, Award } from "lucide-react";

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function AcquisitionKPICards() {
  const { data: kpiData, isLoading: kpiLoading } = useKPISummary();
  const { data: channels, isLoading: channelsLoading } = useAcquisitionPerformance();

  const isLoading = kpiLoading || channelsLoading;

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

  const totalSpend = channels?.reduce((sum, c) => sum + (c.total_spend ?? 0), 0) ?? 0;
  const totalConversions = channels?.reduce((sum, c) => sum + (c.total_conversions ?? 0), 0) ?? 0;
  const bestChannel = channels?.[0]?.channel_name ?? "—";

  const kpis = [
    {
      title: "Total Spend",
      value: formatCurrency(totalSpend),
      icon: DollarSign,
      iconColor: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Total Conversions",
      value: totalConversions.toLocaleString(),
      icon: Users,
      iconColor: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    {
      title: "Average CAC",
      value: formatCurrency(kpiData?.cac),
      icon: TrendingUp,
      iconColor: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Best Channel",
      value: bestChannel,
      icon: Award,
      iconColor: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold mt-1">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ConversionFunnelChart() {
  const { data: channels, isLoading } = useAcquisitionPerformance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    );
  }

  const totalLeads = channels?.reduce((sum, c) => sum + (c.total_leads ?? 0), 0) ?? 0;
  const totalConversions = channels?.reduce((sum, c) => sum + (c.total_conversions ?? 0), 0) ?? 0;
  const overallRate = totalLeads > 0 ? ((totalConversions / totalLeads) * 100).toFixed(1) : "0";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Leads to conversions overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Leads */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Total Leads</span>
              <span className="text-sm text-muted-foreground">{totalLeads.toLocaleString()}</span>
            </div>
            <div className="h-8 bg-chart-1/20 rounded-lg w-full flex items-center justify-center">
              <span className="text-sm font-medium text-chart-1">100%</span>
            </div>
          </div>
          
          {/* Conversions */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Conversions</span>
              <span className="text-sm text-muted-foreground">{totalConversions.toLocaleString()}</span>
            </div>
            <div 
              className="h-8 bg-success/20 rounded-lg flex items-center justify-center transition-all"
              style={{ width: `${Math.max(Number(overallRate), 10)}%` }}
            >
              <span className="text-sm font-medium text-success">{overallRate}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CACByChannelTable() {
  const { data: channels, isLoading } = useAcquisitionPerformance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>CAC by Channel</CardTitle>
        <CardDescription>Cost per acquisition breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {channels?.map((channel) => (
            <div key={channel.channel_name} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="font-medium text-sm">{channel.channel_name}</span>
              <div className="text-right">
                <p className="font-bold text-sm">{formatCurrency(channel.cost_per_acquisition)}</p>
                <p className="text-xs text-muted-foreground">
                  {((channel.conversion_rate ?? 0) * 100).toFixed(1)}% conv.
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Acquisition() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Acquisition & CAC</h1>
          <p className="text-muted-foreground">
            Track acquisition channels, spend efficiency, and conversion metrics.
          </p>
        </div>

        {/* KPI Cards */}
        <AcquisitionKPICards />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChannelPerformanceChart />
          <ConversionFunnelChart />
        </div>

        {/* CAC by Channel */}
        <CACByChannelTable />
      </div>
    </DashboardLayout>
  );
}
