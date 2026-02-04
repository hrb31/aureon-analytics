import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CustomerKPICards } from "@/components/customers/CustomerKPICards";
import { ImmediateAttentionSection } from "@/components/customers/ImmediateAttentionSection";
import { CustomerTable } from "@/components/customers/CustomerTable";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useCustomerHealth, useCustomerKPIs, useImmediateAttentionCustomers } from "@/hooks/useDashboardData";
import { exportToCSV } from "@/lib/export";

export default function Customers() {
  const { data: customers, isLoading: customersLoading } = useCustomerHealth();
  const { data: kpis, isLoading: kpisLoading } = useCustomerKPIs();
  const { data: alertCustomers, isLoading: alertsLoading } = useImmediateAttentionCustomers();

  // Extract unique plan names for filter
  const plans = [...new Set(customers?.map((c) => c.plan_name).filter(Boolean) as string[])];

  const handleExport = () => {
    if (customers) {
      exportToCSV(
        customers.map((c) => ({
          name: c.name ?? "",
          email: c.email ?? "",
          company: c.company ?? "",
          plan: c.plan_name ?? "",
          health_score: c.health_score ?? 0,
          status: c.status ?? "",
          country: c.country ?? "",
        })),
        "customers",
        [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "company", label: "Company" },
          { key: "plan", label: "Plan" },
          { key: "health_score", label: "Health Score" },
          { key: "status", label: "Status" },
          { key: "country", label: "Country" },
        ]
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Customer Directory</h1>
            <p className="text-muted-foreground">
              Monitor customer health and manage relationships.
            </p>
          </div>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* KPI Cards */}
        <CustomerKPICards data={kpis} isLoading={kpisLoading} />

        {/* Immediate Attention Section */}
        <ImmediateAttentionSection
          customers={alertCustomers}
          isLoading={alertsLoading}
        />

        {/* Customer Table */}
        <CustomerTable
          customers={customers?.map((c) => ({
            id: c.id ?? "",
            name: c.name ?? "",
            email: c.email ?? "",
            company: c.company ?? "",
            plan_name: c.plan_name,
            health_score: c.health_score,
            status: c.status,
            created_at: c.created_at,
          }))}
          isLoading={customersLoading}
          plans={plans}
        />
      </div>
    </DashboardLayout>
  );
}
