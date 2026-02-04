-- Fix Security Definer Views by recreating with security_invoker=on

DROP VIEW IF EXISTS public.v_kpi_summary;
DROP VIEW IF EXISTS public.v_revenue_over_time;
DROP VIEW IF EXISTS public.v_revenue_by_plan;
DROP VIEW IF EXISTS public.v_customer_health;
DROP VIEW IF EXISTS public.v_acquisition_performance;

-- V_KPI_SUMMARY: Core business metrics
CREATE VIEW public.v_kpi_summary 
WITH (security_invoker=on) AS
WITH revenue_totals AS (
    SELECT 
        COALESCE(SUM(amount), 0) AS total_revenue
    FROM public.invoices
    WHERE status = 'paid'
),
mrr_calc AS (
    SELECT 
        COALESCE(SUM(p.price_monthly), 0) AS mrr
    FROM public.customers c
    JOIN public.plans p ON c.plan_id = p.id
    WHERE c.status = 'active'
),
customer_counts AS (
    SELECT 
        COUNT(*) FILTER (WHERE status = 'active') AS active_customers,
        COUNT(*) FILTER (WHERE status = 'churned') AS churned_customers,
        COUNT(*) FILTER (WHERE status = 'new') AS new_customers,
        COUNT(*) AS total_customers
    FROM public.customers
),
acquisition_totals AS (
    SELECT 
        COALESCE(SUM(spend), 0) AS total_spend,
        COALESCE(SUM(conversions), 0) AS total_conversions
    FROM public.acquisition_metrics
)
SELECT 
    rt.total_revenue,
    mc.mrr,
    mc.mrr * 12 AS arr,
    cc.active_customers,
    cc.churned_customers,
    cc.new_customers,
    cc.total_customers,
    CASE 
        WHEN cc.total_customers > 0 
        THEN ROUND((cc.churned_customers::NUMERIC / cc.total_customers) * 100, 2)
        ELSE 0 
    END AS churn_rate,
    CASE 
        WHEN at.total_conversions > 0 
        THEN ROUND(at.total_spend / at.total_conversions, 2)
        ELSE 0 
    END AS cac
FROM revenue_totals rt
CROSS JOIN mrr_calc mc
CROSS JOIN customer_counts cc
CROSS JOIN acquisition_totals at;

-- V_REVENUE_OVER_TIME: Monthly revenue time series
CREATE VIEW public.v_revenue_over_time 
WITH (security_invoker=on) AS
SELECT 
    DATE_TRUNC('month', issued_at)::DATE AS month,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS revenue,
    COUNT(*) AS invoice_count,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count
FROM public.invoices
GROUP BY DATE_TRUNC('month', issued_at)
ORDER BY month;

-- V_REVENUE_BY_PLAN: Revenue breakdown by plan
CREATE VIEW public.v_revenue_by_plan 
WITH (security_invoker=on) AS
SELECT 
    p.name AS plan_name,
    p.price_monthly,
    COUNT(c.id) AS customer_count,
    COUNT(c.id) * p.price_monthly AS monthly_revenue,
    ROUND((COUNT(c.id)::NUMERIC / NULLIF((SELECT COUNT(*) FROM public.customers WHERE status = 'active'), 0)) * 100, 1) AS percentage
FROM public.plans p
LEFT JOIN public.customers c ON c.plan_id = p.id AND c.status = 'active'
GROUP BY p.id, p.name, p.price_monthly
ORDER BY monthly_revenue DESC;

-- V_CUSTOMER_HEALTH: Customer health with risk levels
CREATE VIEW public.v_customer_health 
WITH (security_invoker=on) AS
SELECT 
    c.id,
    c.name,
    c.company,
    c.email,
    c.industry,
    c.country,
    p.name AS plan_name,
    c.health_score,
    c.status,
    CASE 
        WHEN c.health_score >= 80 THEN 'healthy'
        WHEN c.health_score >= 50 THEN 'moderate'
        ELSE 'at_risk'
    END AS risk_level,
    c.created_at
FROM public.customers c
LEFT JOIN public.plans p ON c.plan_id = p.id
ORDER BY c.health_score ASC;

-- V_ACQUISITION_PERFORMANCE: Channel efficiency metrics
CREATE VIEW public.v_acquisition_performance 
WITH (security_invoker=on) AS
SELECT 
    ac.name AS channel_name,
    SUM(am.spend) AS total_spend,
    SUM(am.leads) AS total_leads,
    SUM(am.conversions) AS total_conversions,
    CASE 
        WHEN SUM(am.leads) > 0 
        THEN ROUND((SUM(am.conversions)::NUMERIC / SUM(am.leads)) * 100, 2)
        ELSE 0 
    END AS conversion_rate,
    CASE 
        WHEN SUM(am.conversions) > 0 
        THEN ROUND(SUM(am.spend) / SUM(am.conversions), 2)
        ELSE 0 
    END AS cost_per_acquisition
FROM public.acquisition_channels ac
LEFT JOIN public.acquisition_metrics am ON am.channel_id = ac.id
GROUP BY ac.id, ac.name
ORDER BY total_conversions DESC;