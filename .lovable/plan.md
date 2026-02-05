

# Fix Security Definer View: v_mrr_movement

## Problem
The Supabase linter detected that `public.v_mrr_movement` is defined with `SECURITY DEFINER` property. This means the view runs with the privileges of the view creator (typically a superuser) rather than the querying user, bypassing Row Level Security (RLS) policies.

## Root Cause
When `v_mrr_movement` was created in migration `20260204222035`, it was defined without the `security_invoker=on` clause. Other views (`v_kpi_summary`, `v_revenue_over_time`, etc.) were fixed in an earlier migration (`20260204212556`) to use `security_invoker=on`, but this view was created afterward and missed that pattern.

## Solution
Create a database migration to recreate `v_mrr_movement` with the `security_invoker=on` option to match the other analytics views.

## Migration SQL

```sql
-- Fix Security Definer View: v_mrr_movement
-- Recreate with security_invoker=on to respect RLS policies

DROP VIEW IF EXISTS public.v_mrr_movement;

CREATE VIEW public.v_mrr_movement 
WITH (security_invoker=on) AS
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
```

## Impact
- **No code changes required** - The view name and columns remain identical
- **No downtime** - The view will be briefly unavailable during recreation (milliseconds)
- **Better security posture** - View will now respect RLS policies of the querying user

## Implementation
1. Run the database migration using the migration tool
2. Verify the linter warning is resolved in Supabase Dashboard

