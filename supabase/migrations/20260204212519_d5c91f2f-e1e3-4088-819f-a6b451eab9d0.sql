-- =============================================
-- PHASE 2: Aureon Analytics Database Schema
-- =============================================

-- 1. PLANS TABLE
CREATE TABLE public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    price_monthly NUMERIC(10, 2) NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.plans FOR SELECT TO authenticated USING (true);

-- 2. ACQUISITION CHANNELS TABLE
CREATE TABLE public.acquisition_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.acquisition_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.acquisition_channels FOR SELECT TO authenticated USING (true);

-- 3. CUSTOMERS TABLE
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    company TEXT NOT NULL,
    industry TEXT NOT NULL,
    country TEXT NOT NULL,
    plan_id UUID REFERENCES public.plans(id),
    acquisition_channel_id UUID REFERENCES public.acquisition_channels(id),
    health_score INTEGER NOT NULL DEFAULT 70 CHECK (health_score >= 0 AND health_score <= 100),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'churned', 'at_risk', 'new')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.customers FOR SELECT TO authenticated USING (true);

-- 4. INVOICES TABLE
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'refunded')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.invoices FOR SELECT TO authenticated USING (true);

-- 5. REVENUE EVENTS TABLE
CREATE TABLE public.revenue_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('new', 'renewal', 'expansion', 'churn', 'contraction')),
    amount NUMERIC(10, 2) NOT NULL,
    event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.revenue_events FOR SELECT TO authenticated USING (true);

-- 6. ACQUISITION METRICS TABLE
CREATE TABLE public.acquisition_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES public.acquisition_channels(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
    leads INTEGER NOT NULL DEFAULT 0,
    conversions INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(channel_id, month)
);

ALTER TABLE public.acquisition_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.acquisition_metrics FOR SELECT TO authenticated USING (true);

-- 7. USAGE METRICS TABLE
CREATE TABLE public.usage_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    logins INTEGER NOT NULL DEFAULT 0,
    api_calls INTEGER NOT NULL DEFAULT 0,
    feature_usage JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(customer_id, month)
);

ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated read access" ON public.usage_metrics FOR SELECT TO authenticated USING (true);

-- =============================================
-- ANALYTICAL VIEWS
-- =============================================

-- V_KPI_SUMMARY: Core business metrics
CREATE OR REPLACE VIEW public.v_kpi_summary AS
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
CREATE OR REPLACE VIEW public.v_revenue_over_time AS
SELECT 
    DATE_TRUNC('month', issued_at)::DATE AS month,
    SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS revenue,
    COUNT(*) AS invoice_count,
    SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_count
FROM public.invoices
GROUP BY DATE_TRUNC('month', issued_at)
ORDER BY month;

-- V_REVENUE_BY_PLAN: Revenue breakdown by plan
CREATE OR REPLACE VIEW public.v_revenue_by_plan AS
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
CREATE OR REPLACE VIEW public.v_customer_health AS
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
CREATE OR REPLACE VIEW public.v_acquisition_performance AS
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

-- =============================================
-- SEED DATA
-- =============================================

-- Insert Plans
INSERT INTO public.plans (name, price_monthly, features) VALUES
('Starter', 29.00, '["5 users", "Basic analytics", "Email support"]'),
('Pro', 99.00, '["25 users", "Advanced analytics", "Priority support", "API access"]'),
('Enterprise', 299.00, '["Unlimited users", "Custom analytics", "Dedicated support", "Full API", "SSO"]');

-- Insert Acquisition Channels
INSERT INTO public.acquisition_channels (name) VALUES
('Organic Search'),
('Paid Search'),
('Social Media'),
('Referral'),
('Direct'),
('Email Marketing'),
('Content Marketing'),
('Partner');

-- Insert 150+ Customers (using generate_series for variety)
WITH plan_ids AS (
    SELECT id, name, price_monthly FROM public.plans
),
channel_ids AS (
    SELECT id, name FROM public.acquisition_channels
),
industries AS (
    SELECT unnest(ARRAY['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing', 'Education', 'Media', 'Consulting', 'Real Estate', 'Legal']) AS industry
),
countries AS (
    SELECT unnest(ARRAY['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'Netherlands', 'Sweden', 'Singapore', 'Japan']) AS country
),
companies AS (
    SELECT unnest(ARRAY[
        'Acme Corp', 'TechFlow Inc', 'DataSync Labs', 'CloudNine Systems', 'Innovate AI', 
        'Quantum Solutions', 'NexGen Tech', 'Apex Digital', 'Stellar Software', 'Prime Analytics',
        'Alpha Dynamics', 'Beta Industries', 'Gamma Ventures', 'Delta Systems', 'Epsilon Labs',
        'Zeta Corp', 'Theta Tech', 'Iota Solutions', 'Kappa Digital', 'Lambda Innovations',
        'Mu Technologies', 'Nu Enterprises', 'Xi Software', 'Omicron Data', 'Pi Analytics',
        'Rho Systems', 'Sigma Tech', 'Tau Digital', 'Upsilon Labs', 'Phi Innovations',
        'Chi Solutions', 'Psi Corp', 'Omega Tech', 'Nova Systems', 'Cosmos Data',
        'Nebula Inc', 'Pulsar Tech', 'Quasar Labs', 'Vortex Systems', 'Horizon Digital',
        'Summit Solutions', 'Pinnacle Tech', 'Vertex Labs', 'Zenith Corp', 'Paragon Systems',
        'Atlas Digital', 'Titan Tech', 'Phoenix Labs', 'Falcon Systems', 'Eagle Software',
        'Hawk Analytics', 'Osprey Tech', 'Condor Labs', 'Raven Systems', 'Swift Digital',
        'Blaze Tech', 'Ember Labs', 'Spark Systems', 'Flare Digital', 'Ignite Corp',
        'Fusion Tech', 'Catalyst Labs', 'Momentum Systems', 'Velocity Digital', 'Surge Corp',
        'Wave Technologies', 'Current Labs', 'Flow Systems', 'Stream Digital', 'River Tech',
        'Ocean Analytics', 'Lake Systems', 'Spring Labs', 'Creek Digital', 'Pond Tech',
        'Forest Systems', 'Grove Labs', 'Meadow Digital', 'Field Corp', 'Valley Tech',
        'Mountain Systems', 'Peak Labs', 'Ridge Digital', 'Cliff Corp', 'Canyon Tech',
        'Desert Systems', 'Oasis Labs', 'Dune Digital', 'Mesa Corp', 'Plains Tech',
        'Prairie Systems', 'Steppe Labs', 'Tundra Digital', 'Arctic Corp', 'Polar Tech',
        'Equator Systems', 'Tropic Labs', 'Monsoon Digital', 'Breeze Corp', 'Gale Tech',
        'Storm Systems', 'Thunder Labs', 'Lightning Digital', 'Cloud Corp', 'Sky Tech',
        'Stellar Systems', 'Comet Labs', 'Meteor Digital', 'Asteroid Corp', 'Planet Tech',
        'Galaxy Systems', 'Universe Labs', 'Cosmos Digital', 'Infinity Corp', 'Beyond Tech',
        'Frontier Systems', 'Pioneer Labs', 'Explorer Digital', 'Voyager Corp', 'Navigator Tech',
        'Compass Systems', 'Anchor Labs', 'Harbor Digital', 'Port Corp', 'Marina Tech',
        'Lighthouse Systems', 'Beacon Labs', 'Signal Digital', 'Radar Corp', 'Sonar Tech',
        'Echo Systems', 'Resonance Labs', 'Vibration Digital', 'Frequency Corp', 'Amplitude Tech',
        'Wavelength Systems', 'Spectrum Labs', 'Prism Digital', 'Lens Corp', 'Focus Tech',
        'Vision Systems', 'Insight Labs', 'Clarity Digital', 'Lucid Corp', 'Crystal Tech',
        'Diamond Systems', 'Ruby Labs', 'Sapphire Digital', 'Emerald Corp', 'Jade Tech'
    ]) AS company
)
INSERT INTO public.customers (name, email, company, industry, country, plan_id, acquisition_channel_id, health_score, status, created_at)
SELECT 
    'User ' || row_number() OVER () AS name,
    lower(replace(c.company, ' ', '')) || row_number() OVER () || '@example.com' AS email,
    c.company,
    (SELECT industry FROM industries ORDER BY random() LIMIT 1),
    (SELECT country FROM countries ORDER BY random() LIMIT 1),
    (SELECT id FROM plan_ids ORDER BY random() LIMIT 1),
    (SELECT id FROM channel_ids ORDER BY random() LIMIT 1),
    (20 + floor(random() * 80))::INTEGER AS health_score,
    CASE 
        WHEN random() < 0.75 THEN 'active'
        WHEN random() < 0.85 THEN 'at_risk'
        WHEN random() < 0.95 THEN 'churned'
        ELSE 'new'
    END AS status,
    NOW() - (random() * INTERVAL '365 days') AS created_at
FROM companies c
LIMIT 155;

-- Generate 12 months of invoices for active customers
INSERT INTO public.invoices (customer_id, amount, status, issued_at, paid_at)
SELECT 
    c.id,
    p.price_monthly,
    CASE 
        WHEN random() < 0.85 THEN 'paid'
        WHEN random() < 0.92 THEN 'pending'
        WHEN random() < 0.97 THEN 'overdue'
        ELSE 'refunded'
    END,
    DATE_TRUNC('month', NOW() - (gs.month || ' months')::INTERVAL),
    CASE 
        WHEN random() < 0.85 
        THEN DATE_TRUNC('month', NOW() - (gs.month || ' months')::INTERVAL) + (floor(random() * 15) || ' days')::INTERVAL
        ELSE NULL
    END
FROM public.customers c
JOIN public.plans p ON c.plan_id = p.id
CROSS JOIN generate_series(0, 11) AS gs(month)
WHERE c.status IN ('active', 'at_risk');

-- Generate revenue events
INSERT INTO public.revenue_events (customer_id, event_type, amount, event_date)
SELECT 
    c.id,
    CASE 
        WHEN c.created_at > NOW() - INTERVAL '30 days' THEN 'new'
        WHEN c.status = 'churned' THEN 'churn'
        WHEN random() < 0.1 THEN 'expansion'
        ELSE 'renewal'
    END,
    CASE 
        WHEN c.status = 'churned' THEN -p.price_monthly
        WHEN random() < 0.1 THEN p.price_monthly * 0.5
        ELSE p.price_monthly
    END,
    CASE 
        WHEN c.created_at > NOW() - INTERVAL '30 days' THEN c.created_at
        ELSE NOW() - (random() * INTERVAL '365 days')
    END
FROM public.customers c
JOIN public.plans p ON c.plan_id = p.id;

-- Generate acquisition metrics for 12 months per channel
INSERT INTO public.acquisition_metrics (channel_id, month, spend, leads, conversions)
SELECT 
    ac.id,
    DATE_TRUNC('month', NOW() - (gs.month || ' months')::INTERVAL)::DATE,
    CASE ac.name
        WHEN 'Paid Search' THEN 8000 + floor(random() * 4000)
        WHEN 'Social Media' THEN 5000 + floor(random() * 3000)
        WHEN 'Email Marketing' THEN 2000 + floor(random() * 1500)
        WHEN 'Content Marketing' THEN 3000 + floor(random() * 2000)
        WHEN 'Partner' THEN 1500 + floor(random() * 1000)
        ELSE 500 + floor(random() * 500)
    END,
    CASE ac.name
        WHEN 'Paid Search' THEN 150 + floor(random() * 100)
        WHEN 'Organic Search' THEN 200 + floor(random() * 150)
        WHEN 'Social Media' THEN 180 + floor(random() * 120)
        WHEN 'Content Marketing' THEN 120 + floor(random() * 80)
        ELSE 50 + floor(random() * 50)
    END,
    CASE ac.name
        WHEN 'Referral' THEN 15 + floor(random() * 10)
        WHEN 'Organic Search' THEN 12 + floor(random() * 8)
        WHEN 'Paid Search' THEN 10 + floor(random() * 8)
        ELSE 5 + floor(random() * 5)
    END
FROM public.acquisition_channels ac
CROSS JOIN generate_series(0, 11) AS gs(month);

-- Generate usage metrics for active customers
INSERT INTO public.usage_metrics (customer_id, month, logins, api_calls, feature_usage)
SELECT 
    c.id,
    DATE_TRUNC('month', NOW() - (gs.month || ' months')::INTERVAL)::DATE,
    CASE p.name
        WHEN 'Enterprise' THEN 500 + floor(random() * 500)
        WHEN 'Pro' THEN 200 + floor(random() * 200)
        ELSE 50 + floor(random() * 100)
    END,
    CASE p.name
        WHEN 'Enterprise' THEN 50000 + floor(random() * 50000)
        WHEN 'Pro' THEN 10000 + floor(random() * 15000)
        ELSE 1000 + floor(random() * 2000)
    END,
    jsonb_build_object(
        'dashboard', floor(random() * 100),
        'reports', floor(random() * 50),
        'exports', floor(random() * 30),
        'api', floor(random() * 80)
    )
FROM public.customers c
JOIN public.plans p ON c.plan_id = p.id
CROSS JOIN generate_series(0, 11) AS gs(month)
WHERE c.status IN ('active', 'at_risk', 'new');