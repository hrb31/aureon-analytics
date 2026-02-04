
# Phase 5: Polish, New Pages, and Floating AI Chatbot

## Overview

This plan covers three major areas:
1. **AI Analyst Redesign**: Convert from sidebar panel to a floating chatbot bubble in the corner (like the reference image)
2. **New Pages**: Revenue Deep Dive, Acquisition & CAC, and Customer Directory
3. **Phase 5 Polish**: Responsive design, loading states, error handling, accessibility, export functionality

---

## Part 1: AI Analyst Floating Chatbot Redesign

### Current State
The AI Analyst currently opens as a sidebar panel on desktop and a drawer on mobile. Based on your feedback and the reference image, it should instead be a floating button in the bottom-right corner that opens a chat popup/drawer overlay.

### Changes Required

**Update: `src/components/ai-analyst/AIAnalystContainer.tsx`**
- Remove the sticky sidebar approach
- Render a floating button on both desktop and mobile
- When clicked, open a floating chat popup (desktop) or full drawer (mobile)

**Update: `src/components/ai-analyst/AIAnalystDrawer.tsx`**
- This component already has the floating button pattern - extend it to work for desktop too
- Add a floating popup variant for desktop (positioned above the button)

**New Component: `src/components/ai-analyst/AIAnalystPopup.tsx`**
- Desktop floating chat window (similar to Intercom/Drift style)
- Fixed position: bottom-right, above the floating button
- Dimensions: ~400px wide, ~500px tall
- Contains the same AIAnalystPanel content
- Smooth scale-in animation when opening

**Update: `src/components/dashboard/DashboardLayout.tsx`**
- Remove the AI Analyst toggle button from the header
- Remove the AIAnalystContainer from the layout structure
- AI Analyst will now float independently

**Update: `src/components/dashboard/AppSidebar.tsx`**
- Keep the AI Analyst menu item for quick access
- Clicking it will toggle the floating popup

**Visual Design (from reference):**
- Floating button: Gradient blue/purple, sparkles icon, bottom-right corner
- Optional notification dot when insights are available
- Popup has rounded corners, shadow, and smooth animations

---

## Part 2: Customer Directory Page

Based on the reference image, this page includes:

### Page Header
- Title: "Customer Directory"
- Export CSV button

### KPI Cards Row (3 cards)
- **At-Risk Customers**: Count with percentage change vs last week
- **High Value Clients**: Count with "new this month" indicator
- **Churning (30D)**: Count with percentage change vs last month

### Immediate Attention Required Section
- Horizontal row of alert cards for critical customers
- Each card shows: Customer name, plan, alert reason (e.g., "Health Score dropped by 20%", "Payment overdue 15 days", "Usage down by 40%")
- Color-coded alert strips (red for critical, yellow for warning)
- "View all alerts" link

### Customer Table
- Search input: "Search customers by name, ID or email..."
- Filters: All Statuses dropdown, All Plans dropdown
- Columns: Customer (avatar + name + email), Plan, Health Score (progress bar + percentage), Status (badge), Last Activity, Actions (three-dot menu)
- Pagination: "Showing 1 to 10 of 150 customers" with page numbers

### New Files

**`src/pages/Customers.tsx`**
- Main page component with all sections

**`src/components/customers/CustomerKPICards.tsx`**
- The three KPI cards for at-risk, high-value, and churning customers

**`src/components/customers/ImmediateAttentionSection.tsx`**
- The horizontal alert cards for customers needing attention

**`src/components/customers/CustomerTable.tsx`**
- Full-featured table with search, filters, and pagination

**`src/components/customers/CustomerFilters.tsx`**
- Search input and filter dropdowns

**`src/components/customers/HealthScoreBar.tsx`**
- Reusable health score progress bar component

### New Data Hooks

**Update: `src/hooks/useDashboardData.ts`**
Add hooks for:
- `useCustomerKPIs()` - Fetch at-risk count, high-value count, churning count
- `useCustomersWithPagination(page, filters)` - Paginated customer list
- `useImmediateAttentionCustomers()` - Customers with critical alerts

---

## Part 3: Revenue Deep Dive Page

### Page Structure

**Header**
- Title: "Revenue Deep Dive"
- Date range selector
- Export button

**KPI Row**
- Total Revenue (with trend)
- MRR (with trend)
- ARR (with trend)
- Net Revenue Retention

**Main Charts**
- Revenue Over Time (larger, more detailed version with multiple metrics)
- Revenue by Plan breakdown (expanded pie/donut chart)
- MRR Movement chart (new vs expansion vs contraction vs churn)

**Invoice Analysis Table**
- Full invoice list with more columns
- Filter by status, date range, amount range

### New Files

**`src/pages/Revenue.tsx`**
- Main revenue page

**`src/components/revenue/RevenueKPICards.tsx`**
- Revenue-specific KPI cards

**`src/components/revenue/MRRMovementChart.tsx`**
- Stacked bar chart showing MRR changes

**`src/components/revenue/RevenueBreakdownChart.tsx`**
- Detailed revenue breakdown by plan, segment

---

## Part 4: Acquisition & CAC Page

### Page Structure

**Header**
- Title: "Acquisition & CAC"
- Period selector

**KPI Row**
- Total Spend
- Total Conversions
- Average CAC
- Best Performing Channel

**Charts**
- Spend vs Conversions Over Time (dual-axis chart)
- Channel Performance Comparison (already exists - enhance)
- CAC Trend by Channel
- Conversion Funnel (leads → conversions)

### New Files

**`src/pages/Acquisition.tsx`**
- Main acquisition page

**`src/components/acquisition/AcquisitionKPICards.tsx`**
- Acquisition-specific KPIs

**`src/components/acquisition/SpendVsConversionsChart.tsx`**
- Dual-axis trend chart

**`src/components/acquisition/CACTrendChart.tsx`**
- CAC over time by channel

**`src/components/acquisition/ConversionFunnelChart.tsx`**
- Funnel visualization

---

## Part 5: Phase 5 Polish & Quality

### Responsive Design

**Update: `src/components/dashboard/KPIRibbon.tsx`**
- Already has responsive grid - verify breakpoints work well

**Update: `src/pages/Dashboard.tsx`**
- Tighter padding on mobile (p-4 instead of p-6)
- Better stacking for chart grid

**Update: All table components**
- Add horizontal scroll wrapper
- Mobile-friendly card view option for very small screens

### Loading States & Skeletons

**New: `src/components/ui/chart-skeleton.tsx`**
- Animated skeleton that looks like chart placeholder
- Variants for line chart, bar chart, pie chart

**Update: Chart components**
- Use chart-specific skeletons instead of generic Skeleton

### Error Handling

**New: `src/components/ErrorBoundary.tsx`**
- React error boundary with friendly fallback
- Retry button

**Update: All data components**
- Consistent error state with retry functionality

### Accessibility

**Update: `src/index.css`**
```css
/* Focus visible styles */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-ring;
}

/* Skip to content link */
.skip-link {
  @apply sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50;
}
```

**Update: Icon-only buttons**
- Add aria-label to all icon-only buttons
- Ensure proper focus indicators

### Export Functionality

**New: `src/lib/export.ts`**
```typescript
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
): void
```

**Update: `src/components/dashboard/RecentInvoicesTable.tsx`**
- Wire up the Export CSV button

**Update: `src/components/customers/CustomerTable.tsx`**
- Add export functionality

### Animations & Micro-interactions

**Update: `src/index.css`**
- Add hover transitions for cards
- Subtle scale effect on buttons
- Smooth color transitions on badges

---

## Part 6: Routing Updates

**Update: `src/App.tsx`**

Add new routes:
```tsx
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/dashboard/revenue" element={<Revenue />} />
<Route path="/dashboard/acquisition" element={<Acquisition />} />
<Route path="/dashboard/customers" element={<Customers />} />
```

Each page will use `DashboardLayout` for consistent navigation.

---

## New File Structure

```text
src/
├── components/
│   ├── ai-analyst/
│   │   ├── AIAnalystContainer.tsx (updated - floating only)
│   │   ├── AIAnalystDrawer.tsx (updated)
│   │   ├── AIAnalystPopup.tsx (new - desktop floating chat)
│   │   ├── AIAnalystPanel.tsx
│   │   ├── ChatMessage.tsx
│   │   └── SuggestedPrompts.tsx
│   ├── customers/
│   │   ├── CustomerKPICards.tsx
│   │   ├── ImmediateAttentionSection.tsx
│   │   ├── CustomerTable.tsx
│   │   ├── CustomerFilters.tsx
│   │   └── HealthScoreBar.tsx
│   ├── revenue/
│   │   ├── RevenueKPICards.tsx
│   │   ├── MRRMovementChart.tsx
│   │   └── RevenueBreakdownChart.tsx
│   ├── acquisition/
│   │   ├── AcquisitionKPICards.tsx
│   │   ├── SpendVsConversionsChart.tsx
│   │   ├── CACTrendChart.tsx
│   │   └── ConversionFunnelChart.tsx
│   ├── dashboard/ (existing + updates)
│   ├── ErrorBoundary.tsx
│   └── ui/
│       └── chart-skeleton.tsx
├── hooks/
│   ├── useDashboardData.ts (extended with new hooks)
│   └── useAIAnalyst.ts
├── lib/
│   └── export.ts
└── pages/
    ├── Dashboard.tsx
    ├── Revenue.tsx (new)
    ├── Acquisition.tsx (new)
    ├── Customers.tsx (new)
    └── ...
```

---

## Implementation Order

1. **AI Chatbot Redesign** - Convert sidebar to floating popup/drawer
2. **Routing Setup** - Add routes for new pages
3. **Customer Directory Page** - Most detailed page first (reference image)
4. **Revenue Deep Dive Page** - Extended analytics
5. **Acquisition & CAC Page** - Channel performance
6. **Phase 5 Polish** - Export, accessibility, animations
7. **Testing & Refinement** - Cross-browser, responsive testing

---

## Technical Notes

**Floating AI Chatbot:**
- Use `fixed` positioning with `z-50` to float above all content
- Desktop popup: 400px wide, 500px tall, positioned bottom-right with margin
- Mobile: Full-screen drawer (existing Sheet component)
- Smooth animations using Tailwind's `animate-scale-in` or custom keyframes

**Customer Table:**
- Use `@tanstack/react-query` for pagination
- Client-side filtering for status/plan (or server-side if data is large)
- Health score bar: gradient from red (0%) → yellow (50%) → green (100%)

**Export Utility:**
- Convert data array to CSV string
- Handle special characters and escaping
- Trigger download with `Blob` and `URL.createObjectURL`

**Database Views Used:**
- `v_customer_health` - Extended for customer directory
- `v_kpi_summary` - KPI cards
- `v_revenue_over_time` - Revenue charts
- `v_revenue_by_plan` - Plan breakdown
- `v_acquisition_performance` - Channel metrics
