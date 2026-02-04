

# Phase 3: Overview Dashboard - Implementation Plan

## Summary

Transform the current placeholder dashboard into a fully functional analytics Overview page featuring a navigation sidebar, KPI ribbon, interactive charts, and data tables - all powered by the Supabase analytical views.

---

## Implementation Steps

### Step 1: Dashboard Layout with Sidebar

Create the main layout structure using shadcn's Sidebar components:

**New Files:**
- `src/components/dashboard/AppSidebar.tsx` - Navigation sidebar component
- `src/components/dashboard/DashboardLayout.tsx` - Layout wrapper with SidebarProvider

**Sidebar Features:**
- Aureon Analytics branding with logo at top
- Navigation menu: Overview (active), Revenue, Acquisition, Customers
- Settings section at bottom
- Theme toggle and logout in footer
- Collapsible design (icon mode on collapse, sheet on mobile)

---

### Step 2: KPI Ribbon

Create the metrics ribbon displaying key business indicators:

**New Files:**
- `src/components/dashboard/KPICard.tsx` - Reusable KPI card component
- `src/components/dashboard/KPIRibbon.tsx` - Container with all KPIs

**Metrics to Display (from v_kpi_summary):**
- Total Revenue ($141,867)
- MRR ($12,665)
- ARR ($151,980)
- Active Customers (105)
- Churn Rate (6%)
- CAC ($322.87)

Each card will show:
- Metric label
- Current value (formatted appropriately)
- Trend indicator placeholder (for future period-over-period comparison)

---

### Step 3: Data Hooks

Create React Query hooks for fetching dashboard data:

**New File:**
- `src/hooks/useDashboardData.ts`

**Hooks:**
- `useKPISummary()` - Fetches v_kpi_summary
- `useRevenueOverTime()` - Fetches v_revenue_over_time (12 months)
- `useRevenueByPlan()` - Fetches v_revenue_by_plan
- `useAcquisitionPerformance()` - Fetches v_acquisition_performance
- `useRecentInvoices()` - Fetches recent invoices with customer data
- `useAtRiskCustomers()` - Fetches customers with low health scores

---

### Step 4: Dashboard Charts

Build the visualization section using Recharts:

**New Files:**
- `src/components/dashboard/RevenueChart.tsx` - Line chart for monthly revenue trends
- `src/components/dashboard/PlanMixChart.tsx` - Donut/pie chart for revenue by plan
- `src/components/dashboard/ChannelPerformanceChart.tsx` - Horizontal bar chart for acquisition channels
- `src/components/dashboard/ChartCard.tsx` - Wrapper component with title and loading states

**Chart Layout:**
- Top row: Revenue Trends (full width or 2/3) + Plan Mix (1/3)
- Bottom row: Channel Performance (half) + reserved space for Growth Dynamics

---

### Step 5: Data Tables

Create the tables section for detailed data:

**New Files:**
- `src/components/dashboard/RecentInvoicesTable.tsx` - Recent invoices with status badges
- `src/components/dashboard/AtRiskCustomersTable.tsx` - Customers with low health scores

**Table Features:**
- Status badges (paid = green, pending = yellow, overdue = red)
- Company name, amount, date columns
- At-risk highlighting for low health scores
- Responsive: becomes scrollable on mobile

---

### Step 6: Dashboard Overview Page

Update the main Dashboard page to compose all components:

**Modified File:**
- `src/pages/Dashboard.tsx`

**Structure:**
```
DashboardLayout (SidebarProvider)
├── AppSidebar
└── Main Content
    ├── Page Header ("Overview")
    ├── KPIRibbon
    ├── Charts Grid
    │   ├── RevenueChart
    │   ├── PlanMixChart
    │   └── ChannelPerformanceChart
    └── Tables Section
        ├── RecentInvoicesTable
        └── AtRiskCustomersTable
```

---

### Step 7: Loading & Error States

Add polish with proper loading states:

**Components:**
- Skeleton loaders for KPI cards
- Chart placeholder skeletons
- Table loading states
- Error boundaries with retry buttons

---

## File Structure After Implementation

```
src/
├── components/
│   └── dashboard/
│       ├── AppSidebar.tsx
│       ├── DashboardLayout.tsx
│       ├── KPICard.tsx
│       ├── KPIRibbon.tsx
│       ├── ChartCard.tsx
│       ├── RevenueChart.tsx
│       ├── PlanMixChart.tsx
│       ├── ChannelPerformanceChart.tsx
│       ├── RecentInvoicesTable.tsx
│       └── AtRiskCustomersTable.tsx
├── hooks/
│   └── useDashboardData.ts
└── pages/
    └── Dashboard.tsx (updated)
```

---

## Technical Notes

- **Charts**: Using Recharts (already installed) with ResponsiveContainer for proper sizing
- **Data Fetching**: React Query with automatic caching and refetch on window focus
- **Formatting**: Currency amounts with Intl.NumberFormat, percentages with 1 decimal
- **Responsive**: Grid layout collapses to single column on mobile
- **Theme**: All charts will respect light/dark mode using CSS variables

---

## Not Included in This Phase

The following will be addressed in later phases:
- Filters (date range, plan, channel) - Phase 3 extension or Phase 5
- AI Analyst panel - Phase 4
- Export functionality - Phase 5
- Revenue, Acquisition, and Customer detail pages - Future phases

