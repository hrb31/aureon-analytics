import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useKPISummary() {
  return useQuery({
    queryKey: ["kpi-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_kpi_summary")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useRevenueOverTime() {
  return useQuery({
    queryKey: ["revenue-over-time"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_revenue_over_time")
        .select("*")
        .order("month", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useRevenueByPlan() {
  return useQuery({
    queryKey: ["revenue-by-plan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_revenue_by_plan")
        .select("*")
        .order("monthly_revenue", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useAcquisitionPerformance() {
  return useQuery({
    queryKey: ["acquisition-performance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_acquisition_performance")
        .select("*")
        .order("total_conversions", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useRecentInvoices(limit = 10) {
  return useQuery({
    queryKey: ["recent-invoices", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          amount,
          status,
          issued_at,
          paid_at,
          customer_id,
          customers (
            company,
            name
          )
        `)
        .order("issued_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

export function useAtRiskCustomers(limit = 10) {
  return useQuery({
    queryKey: ["at-risk-customers", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_customer_health")
        .select("*")
        .eq("risk_level", "high")
        .order("health_score", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data;
    },
  });
}

// Customer Directory hooks
export function useCustomerHealth() {
  return useQuery({
    queryKey: ["customer-health"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_customer_health")
        .select("*")
        .order("health_score", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useCustomerKPIs() {
  return useQuery({
    queryKey: ["customer-kpis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_customer_health")
        .select("*");
      
      if (error) throw error;

      const atRisk = data?.filter((c) => c.risk_level === "high") ?? [];
      const highValue = data?.filter((c) => (c.health_score ?? 0) >= 80) ?? [];
      const churned = data?.filter((c) => c.status === "churned") ?? [];

      return {
        atRiskCount: atRisk.length,
        atRiskChange: -5, // Mock change - would need historical data
        highValueCount: highValue.length,
        highValueNew: 3, // Mock - would need date-based query
        churningCount: churned.length,
        churningChange: 2, // Mock change
      };
    },
  });
}

export function useImmediateAttentionCustomers() {
  return useQuery({
    queryKey: ["immediate-attention-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_customer_health")
        .select("*")
        .eq("risk_level", "high")
        .order("health_score", { ascending: true })
        .limit(5);

      if (error) throw error;

      // Transform to alert format
      return data?.map((customer) => {
        const severity: "critical" | "warning" = (customer.health_score ?? 0) < 30 ? "critical" : "warning";
        return {
          id: customer.id ?? "",
          name: customer.name ?? "",
          company: customer.company ?? "",
          plan: customer.plan_name ?? "",
          alertType: "health" as const,
          alertMessage: `Health Score dropped to ${customer.health_score ?? 0}%`,
          severity,
        };
      }) ?? [];
    },
  });
}
