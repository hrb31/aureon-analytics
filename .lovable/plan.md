

# Aureon Analytics - Implementation Plan

## Overview
An enterprise-grade analytics dashboard MVP for **Aureon Analytics** featuring an Overview dashboard with AI Analyst, simple password authentication, and responsive light/dark theming.

---

## Phase 1: Foundation & Access

### Simple Password Gate
- Clean branded login page matching your design reference
- Single shared password to access the demo
- "Aureon Analytics" branding with "Authorized Personnel Only" messaging
- Password stored securely in environment variables
- Session persistence so users don't re-enter password on refresh

### Theme System
- System preference detection on first visit
- Manual toggle between light and dark modes
- Both themes polished to enterprise standard
- Smooth transitions between themes

---

## Phase 2: Database & Data Architecture

### Supabase Schema
Create the core analytics tables:
- **customers** - Company profiles with health scores and status
- **plans** - Starter, Pro, Enterprise tiers
- **invoices** - Payment records with status tracking
- **revenue_events** - Revenue movements (new, renewal, churn)
- **acquisition_channels** - Marketing channels
- **acquisition_metrics** - Spend and conversion data
- **usage_metrics** - Customer activity tracking

### Analytical Views
Pre-computed views for dashboard performance:
- **v_kpi_summary** - Revenue, MRR, ARR, active customers, churn rate, CAC
- **v_revenue_over_time** - Time-series revenue data
- **v_revenue_by_plan** - Revenue breakdown by plan type
- **v_customer_health** - Customer health with risk levels
- **v_acquisition_performance** - Channel efficiency metrics

### Synthetic Data Seeding
- 150+ realistic fake customers across industries
- 12 months of invoice history
- Varied health scores and statuses
- Marketing spend across multiple channels
- Realistic patterns (growth trends, seasonal variation, some churn)

---

## Phase 3: Overview Dashboard

### Navigation Sidebar
- Aureon Analytics branding with logo
- Navigation items: Overview, Revenue, Acquisition, Customers
- Settings and Administration section
- User profile display at bottom
- Collapsible on mobile

### KPI Ribbon
Top-level metrics with trend indicators:
- Total Revenue with % change
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Active Customers
- Churn Rate
- New vs Churned
- CAC

### Dashboard Visualizations
- **Revenue Trends** - Line chart showing monthly performance
- **Growth Dynamics** - Bar chart comparing new vs churned customers
- **Plan Mix** - Donut chart showing customer distribution by plan
- **Channel Performance** - Horizontal bar chart of revenue by acquisition source

### Data Tables
- Recent invoices with status badges
- At-risk customers highlighted

### Filters
- Date range selector (Last 30 Days, Q3, YTD)
- Plan filter
- Channel filter
- Region/Country filter

---

## Phase 4: AI Analyst

### Lovable AI Integration
- Edge function calling Lovable AI Gateway
- System prompt tuned for consultancy-style analytics insights
- Queries the Supabase analytical views for grounded responses

### UI Behavior
- **Desktop**: Persistent sidebar panel on the right
- **Mobile**: Floating button that opens a slide-out drawer
- Smooth open/close animations

### Conversation Features
- Natural language questions about the data
- Suggested prompts ("Summarize this period", "Analyze churn spikes", "Growth forecast for Q4")
- Consultancy-tone responses (drivers, risks, implications)
- Monthly summary auto-generated on panel open

### AI Capabilities
- Answer questions about revenue, acquisition, customer health
- Explain trends and anomalies
- Identify risks (high churn, CAC spikes)
- Provide period-over-period comparisons
- Executive-style summaries

---

## Phase 5: Polish & Quality

### Responsive Design
- Desktop-first with tablet and mobile breakpoints
- Navigation collapses to hamburger menu on mobile
- Charts resize appropriately
- Tables become scrollable cards on small screens

### Enterprise Polish
- Consistent spacing and typography
- Proper loading states and skeleton screens
- Error handling with graceful fallbacks
- Subtle animations and micro-interactions
- Accessibility compliance (contrast, focus states)

### Export Functionality
- Export data buttons (CSV format)
- Filter segments option on charts

---

## Future Phases (After MVP)

These pages are documented for later expansion:

1. **Revenue Deep Dive** - Detailed revenue analysis, invoice breakdown, refunds tracking
2. **Acquisition & CAC** - Spend vs acquisition trends, channel efficiency, optimization insights
3. **Customer Directory** - Full customer list with health scores, drill-down capability, at-risk alerts
4. **Settings** - Theme preferences, notification settings

---

## Technical Approach

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui components
- **Charts**: Recharts (already installed)
- **Backend**: Supabase PostgreSQL with analytical views
- **AI**: OpenAI API via Supabase Edge Function
- **Auth**: Simple password check via Edge Function

