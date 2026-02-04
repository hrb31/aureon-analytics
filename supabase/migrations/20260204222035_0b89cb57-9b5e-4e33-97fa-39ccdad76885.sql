-- Create payment_metrics table for tracking refund and failed payment data
CREATE TABLE public.payment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  total_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  refunds INTEGER DEFAULT 0,
  refund_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_metrics ENABLE ROW LEVEL SECURITY;

-- Add read policy for authenticated users
CREATE POLICY "Allow authenticated read access" ON public.payment_metrics
  FOR SELECT TO authenticated USING (true);

-- Create v_mrr_movement view for MRR movement calculations
CREATE OR REPLACE VIEW public.v_mrr_movement AS
WITH monthly_revenue AS (
  SELECT 
    c.id as customer_id,
    DATE_TRUNC('month', i.issued_at) as month,
    SUM(i.amount) as revenue
  FROM invoices i
  JOIN customers c ON i.customer_id = c.id
  WHERE i.status = 'paid'
  GROUP BY c.id, DATE_TRUNC('month', i.issued_at)
),
revenue_changes AS (
  SELECT
    m1.customer_id,
    m1.month,
    m1.revenue as current_revenue,
    COALESCE(m2.revenue, 0) as previous_revenue
  FROM monthly_revenue m1
  LEFT JOIN monthly_revenue m2 
    ON m1.customer_id = m2.customer_id 
    AND m1.month = m2.month + INTERVAL '1 month'
)
SELECT
  COALESCE(SUM(CASE WHEN previous_revenue = 0 AND current_revenue > 0 THEN current_revenue ELSE 0 END), 0) as new_mrr,
  COALESCE(SUM(CASE WHEN previous_revenue > 0 AND current_revenue > previous_revenue THEN current_revenue - previous_revenue ELSE 0 END), 0) as expansion_mrr,
  COALESCE(SUM(CASE WHEN previous_revenue > 0 AND current_revenue < previous_revenue AND current_revenue > 0 THEN previous_revenue - current_revenue ELSE 0 END), 0) as contraction_mrr,
  COALESCE(SUM(CASE WHEN previous_revenue > 0 AND current_revenue = 0 THEN previous_revenue ELSE 0 END), 0) as churned_mrr
FROM revenue_changes
WHERE month >= DATE_TRUNC('month', CURRENT_DATE);

-- Seed payment_metrics with realistic data for the last 7 months
INSERT INTO public.payment_metrics (month, total_payments, failed_payments, refunds, refund_amount)
VALUES
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months', 105, 2, 1, 250),
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '5 months', 112, 3, 2, 480),
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '4 months', 118, 2, 1, 320),
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months', 125, 4, 2, 550),
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months', 130, 3, 1, 280),
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month', 138, 2, 2, 420),
  (DATE_TRUNC('month', CURRENT_DATE), 142, 2, 1, 350);