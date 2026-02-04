import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMetricRow {
  id: string;
  month: string;
  total_payments: number;
  failed_payments: number;
  refunds: number;
  refund_amount: number;
}

export function usePaymentMetrics() {
  return useQuery({
    queryKey: ["payment-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_metrics")
        .select("*")
        .order("month", { ascending: true })
        .limit(7);

      if (error) throw error;

      const metrics = data as PaymentMetricRow[];

      if (!metrics || metrics.length === 0) {
        return {
          refundRate: 0,
          refundTrend: 0,
          failedRate: 0,
          failedTrend: 0,
          refundSparkline: [],
          failedSparkline: [],
          trendDirection: {
            refund: "down" as const,
            failed: "up" as const,
          },
        };
      }

      // Calculate current rates from latest month
      const latest = metrics[metrics.length - 1];
      const previous = metrics.length > 1 ? metrics[metrics.length - 2] : null;

      const refundRate = latest.total_payments > 0
        ? (latest.refunds / latest.total_payments) * 100
        : 0;

      const failedRate = latest.total_payments > 0
        ? (latest.failed_payments / latest.total_payments) * 100
        : 0;

      // Calculate trend (change from previous month)
      let refundTrend = 0;
      let failedTrend = 0;

      if (previous && previous.total_payments > 0) {
        const prevRefundRate = (previous.refunds / previous.total_payments) * 100;
        const prevFailedRate = (previous.failed_payments / previous.total_payments) * 100;
        refundTrend = refundRate - prevRefundRate;
        failedTrend = failedRate - prevFailedRate;
      }

      return {
        refundRate: Number(refundRate.toFixed(1)),
        refundTrend: Number(refundTrend.toFixed(1)),
        failedRate: Number(failedRate.toFixed(1)),
        failedTrend: Number(failedTrend.toFixed(1)),
        refundSparkline: metrics.map((m) => ({
          value: m.total_payments > 0 ? (m.refunds / m.total_payments) * 100 : 0,
        })),
        failedSparkline: metrics.map((m) => ({
          value: m.total_payments > 0 ? (m.failed_payments / m.total_payments) * 100 : 0,
        })),
        trendDirection: {
          refund: refundTrend <= 0 ? ("down" as const) : ("up" as const),
          failed: failedTrend >= 0 ? ("up" as const) : ("down" as const),
        },
      };
    },
  });
}
