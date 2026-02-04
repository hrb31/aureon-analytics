

# Plan: Remove Placeholder Data, Add Dynamic AI Insights, and Colorful Charts

## Overview

This plan addresses three key issues:
1. **Placeholder/Mock Data**: Several components use hardcoded values that should come from the database
2. **AI Insight Banner**: Currently shows static text - needs to generate real AI-powered insights or be removed
3. **Bar Chart Colors**: The horizontal bar chart uses a single white/muted color - needs a vibrant multi-color scheme

---

## Part 1: Identify and Replace Placeholder Data

### Current Issues Found

| Location | Issue | Fix |
|----------|-------|-----|
| `MiniMetricCard.tsx` (lines 66-74, 76-95) | Hardcoded refund/failed payment data | Add database table or calculate from invoices |
| `Revenue.tsx` (lines 44-65) | Hardcoded trend percentages (12.5%, 8.2%, etc.) | Calculate from historical data |
| `Revenue.tsx` (lines 129-153) | Hardcoded MRR Movement values ($12,400, $8,200, etc.) | Create database view or calculate from revenue_events |
| `useDashboardData.ts` (lines 133-137) | Mock change values (-5%, 3, 2%) | Calculate from historical snapshots |

### Database Changes Required

**New Table: `payment_metrics`**
To track refund rate and failed payments over time:

```sql
CREATE TABLE payment_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  total_payments INTEGER DEFAULT 0,
  failed_payments INTEGER DEFAULT 0,
  refunds INTEGER DEFAULT 0,
  refund_amount NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_metrics ENABLE ROW LEVEL SECURITY;

-- Add read policy
CREATE POLICY "Allow authenticated read access" ON payment_metrics
  FOR SELECT TO authenticated USING (true);
```

**New View: `v_mrr_movement`**
To calculate MRR movement (new, expansion, contraction, churn):

```sql
CREATE VIEW v_mrr_movement AS
WITH current_month AS (
  SELECT DATE_TRUNC('month', CURRENT_DATE) as month_start
),
monthly_revenue AS (
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
  SUM(CASE WHEN previous_revenue = 0 AND current_revenue > 0 THEN current_revenue ELSE 0 END) as new_mrr,
  SUM(CASE WHEN previous_revenue > 0 AND current_revenue > previous_revenue THEN current_revenue - previous_revenue ELSE 0 END) as expansion_mrr,
  SUM(CASE WHEN previous_revenue > 0 AND current_revenue < previous_revenue AND current_revenue > 0 THEN previous_revenue - current_revenue ELSE 0 END) as contraction_mrr,
  SUM(CASE WHEN previous_revenue > 0 AND current_revenue = 0 THEN previous_revenue ELSE 0 END) as churned_mrr
FROM revenue_changes
WHERE month >= DATE_TRUNC('month', CURRENT_DATE);
```

### Seed Data for New Tables

Insert realistic payment metrics:

```sql
INSERT INTO payment_metrics (month, total_payments, failed_payments, refunds, refund_amount)
SELECT 
  generate_series(
    DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '6 months',
    DATE_TRUNC('month', CURRENT_DATE),
    INTERVAL '1 month'
  ) as month,
  FLOOR(RANDOM() * 50 + 100)::int as total_payments,
  FLOOR(RANDOM() * 5 + 1)::int as failed_payments,
  FLOOR(RANDOM() * 3 + 1)::int as refunds,
  FLOOR(RANDOM() * 500 + 100) as refund_amount;
```

---

## Part 2: AI Insight Banner - Generate Real Insights

### Current State
The `AIInsightBanner.tsx` shows static hardcoded text about Enterprise revenue increasing by 23%.

### Solution Options

**Option A: Remove the Banner (Simplest)**
Remove the `<AIInsightBanner />` from `Dashboard.tsx` until a proper AI insight system is built.

**Option B: Generate Dynamic Insights (Recommended)**
Create a Supabase Edge Function that analyzes current metrics and generates an insight.

### Implementation (Option B)

**New Edge Function: `generate-insight`**

```typescript
// supabase/functions/generate-insight/index.ts
// Analyzes current metrics and generates a single key insight
// Uses the Lovable AI gateway to generate natural language insights
// Returns: { insight: string, detailsAvailable: boolean }
```

**Update: `AIInsightBanner.tsx`**

```typescript
// Fetch insight from edge function on mount
// Show loading skeleton while fetching
// Display generated insight or hide if none available
// Cache insight for session to avoid repeated API calls
```

**New Hook: `useAIInsight`**

```typescript
// src/hooks/useAIInsight.ts
export function useAIInsight() {
  return useQuery({
    queryKey: ["ai-insight"],
    queryFn: async () => {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-insight`, {
        headers: { Authorization: `Bearer ${ANON_KEY}` }
      });
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}
```

---

## Part 3: Colorful Bar Charts

### Current Issue
`ChannelPerformanceChart.tsx` uses `fill="hsl(var(--primary))"` which is a single muted color (white/gray in dark mode).

### Solution
Assign distinct colors to each channel bar using the chart color palette.

**Update: `ChannelPerformanceChart.tsx`**

```typescript
const CHANNEL_COLORS = [
  "hsl(var(--chart-1))", // Cyan
  "hsl(var(--chart-2))", // Emerald
  "hsl(var(--chart-3))", // Violet
  "hsl(var(--chart-4))", // Amber
  "hsl(var(--chart-5))", // Rose
  "hsl(var(--chart-1))", // Repeat for more channels
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

// Transform data to include color
const chartData = data?.map((item, index) => ({
  name: item.channel_name ?? "Unknown",
  conversions: item.total_conversions ?? 0,
  fill: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
})) ?? [];

// Use Cell component for individual bar colors
<Bar dataKey="conversions" radius={[0, 4, 4, 0]}>
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.fill} />
  ))}
</Bar>
```

---

## Part 4: Fix Remaining Hardcoded Values

### Revenue Page KPIs

**Update: `Revenue.tsx`**

Create a hook to calculate real trend percentages:

```typescript
// Calculate trend by comparing current period to previous
function useRevenueTrends() {
  const { data: revenueData } = useRevenueOverTime();
  
  // Calculate MoM, QoQ, YoY changes from actual data
  const calculateTrend = (periods: number) => {
    // Compare sum of last N periods vs previous N periods
  };
  
  return {
    mrrTrend: calculateTrend(1),  // Month over month
    qtrTrend: calculateTrend(3),  // Quarter over quarter
    yearTrend: calculateTrend(12), // Year over year
  };
}
```

### MRR Movement Section

**Update: `Revenue.tsx`**

Replace hardcoded values with data from `v_mrr_movement` view:

```typescript
function useMRRMovement() {
  return useQuery({
    queryKey: ["mrr-movement"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_mrr_movement")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });
}
```

### Mini Metric Cards

**Update: `MiniMetricCard.tsx`**

Create hook for payment metrics:

```typescript
function usePaymentMetrics() {
  return useQuery({
    queryKey: ["payment-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_metrics")
        .select("*")
        .order("month", { ascending: false })
        .limit(7);
      if (error) throw error;
      
      // Calculate refund rate and failed payment rate
      // Generate sparkline data from last 7 months
      return {
        refundRate: calculateRefundRate(data),
        failedRate: calculateFailedRate(data),
        refundTrend: calculateTrend(data, 'refunds'),
        failedTrend: calculateTrend(data, 'failed_payments'),
        refundSparkline: data.map(d => ({ value: d.refunds })),
        failedSparkline: data.map(d => ({ value: d.failed_payments })),
      };
    },
  });
}
```

### Customer KPIs Change Percentages

**Update: `useDashboardData.ts`**

The current implementation has mock values. Since we don't have historical snapshots, we have two options:

1. **Simple**: Remove the change percentage display
2. **Better**: Add a `customer_snapshots` table to track weekly/monthly counts

For now, we'll calculate based on created_at dates:

```typescript
// Calculate "new this month" from customers created in last 30 days
const newThisMonth = data?.filter(c => {
  const created = new Date(c.created_at);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created >= thirtyDaysAgo;
}).length ?? 0;
```

---

## Summary of Files to Create/Update

### New Files
- `supabase/functions/generate-insight/index.ts` - AI insight generation
- `src/hooks/useAIInsight.ts` - Hook for AI insight

### Database Migrations
- Create `payment_metrics` table
- Create `v_mrr_movement` view
- Seed `payment_metrics` with sample data

### Updated Files
- `src/components/dashboard/AIInsightBanner.tsx` - Dynamic AI insights
- `src/components/dashboard/ChannelPerformanceChart.tsx` - Multi-color bars
- `src/components/dashboard/MiniMetricCard.tsx` - Real payment metrics
- `src/pages/Revenue.tsx` - Real trends and MRR movement
- `src/hooks/useDashboardData.ts` - Real calculations instead of mocks

---

## Implementation Order

1. Database migrations (tables and views)
2. Seed payment_metrics data
3. Update ChannelPerformanceChart with colors (quick win)
4. Update useDashboardData to remove mock values
5. Create usePaymentMetrics hook and update MiniMetricCards
6. Update Revenue.tsx with real MRR movement
7. Create generate-insight edge function
8. Update AIInsightBanner to use dynamic insights
9. Test all components in both light and dark mode

---

## Technical Notes

**Chart Colors:**
- Using Recharts `<Cell>` component to assign individual colors to each bar
- Colors cycle through the 5 chart colors defined in CSS variables

**AI Insight Caching:**
- 30-minute stale time prevents excessive API calls
- Insight regenerates when user revisits after cache expires

**Database Views:**
- `v_mrr_movement` uses window functions to compare month-over-month revenue
- Payment metrics table enables historical trending

