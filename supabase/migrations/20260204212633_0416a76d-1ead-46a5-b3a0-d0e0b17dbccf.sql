-- Redistribute customers across plans more evenly
-- Starter: ~30%, Pro: ~45%, Enterprise: ~25%

WITH plan_data AS (
    SELECT id, name FROM public.plans
),
customer_rows AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM public.customers
)
UPDATE public.customers c
SET plan_id = (
    SELECT id FROM plan_data 
    WHERE name = CASE 
        WHEN cr.rn % 20 < 6 THEN 'Starter'      -- 30%
        WHEN cr.rn % 20 < 15 THEN 'Pro'          -- 45%
        ELSE 'Enterprise'                         -- 25%
    END
)
FROM customer_rows cr
WHERE c.id = cr.id;