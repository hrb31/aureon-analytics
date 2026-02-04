

# Phase 4 & 5: AI Analyst + Polish & Quality

## Summary

Implement the AI Analyst feature as a conversational sidebar/drawer that queries your Supabase data and provides consultancy-style analytics insights. Then add responsive design polish, accessibility improvements, and export functionality.

---

## Phase 4: AI Analyst

### Step 1: Edge Function for AI Chat

**New File: `supabase/functions/ai-analyst/index.ts`**

Create an edge function that:
- Receives user questions about the data
- Queries relevant Supabase views to get current metrics
- Sends context + question to Lovable AI (google/gemini-3-flash-preview)
- Streams responses back with consultancy-style formatting
- Handles rate limits (429) and payment errors (402)

**Update: `supabase/config.toml`**
- Add `[functions.ai-analyst]` with `verify_jwt = false`

**System Prompt Design:**
```text
You are an expert analytics consultant for Aureon Analytics, a SaaS metrics platform.
You have access to real-time business data including:
- Revenue metrics (MRR, ARR, total revenue)
- Customer health scores and churn rates
- Acquisition channel performance and CAC
- Invoice and payment data

When answering questions:
1. Reference specific numbers from the provided data
2. Identify drivers, risks, and implications
3. Use consultancy-style reasoning
4. Keep responses concise but insightful
5. Highlight actionable recommendations when relevant
```

---

### Step 2: AI Chat Context Provider

**New File: `src/contexts/AIAnalystContext.tsx`**

Create a context to manage:
- Panel open/close state
- Conversation history (messages array)
- Loading state during streaming
- Functions to send messages and clear history

---

### Step 3: AI Analyst Hook

**New File: `src/hooks/useAIAnalyst.ts`**

Implement streaming chat functionality:
- `sendMessage(question: string)` - Sends question, streams response
- SSE parsing for token-by-token rendering
- Error handling for 429/402 with user-friendly toasts
- Auto-fetch current metrics before first message

---

### Step 4: AI Analyst Panel Component

**New File: `src/components/ai-analyst/AIAnalystPanel.tsx`**

Desktop persistent sidebar panel featuring:
- Header with "AI Analyst" title and close button
- Scrollable message history with markdown rendering
- User messages (right-aligned) and assistant messages (left-aligned)
- Suggested prompts section when empty:
  - "Summarize this period's performance"
  - "What's driving revenue growth?"
  - "Analyze churn risk factors"
  - "Compare acquisition channels"
  - "Forecast Q4 growth"
- Input field with send button
- Loading indicator during streaming

---

### Step 5: AI Analyst Mobile Drawer

**New File: `src/components/ai-analyst/AIAnalystDrawer.tsx`**

Mobile slide-out drawer using Sheet component:
- Floating button (fixed bottom-right) to open
- Uses same panel content as desktop
- Smooth slide-in animation from right
- Full-height drawer experience

---

### Step 6: AI Analyst Container

**New File: `src/components/ai-analyst/AIAnalystContainer.tsx`**

Responsive wrapper that renders:
- Desktop: Persistent sidebar panel (collapsible, ~400px wide)
- Mobile: Floating button + Sheet drawer

Uses `useIsMobile()` hook to determine which to render.

---

### Step 7: Integrate into Dashboard Layout

**Update: `src/components/dashboard/DashboardLayout.tsx`**

Add the AI Analyst container to the layout:
```
SidebarProvider
├── AppSidebar (left navigation)
├── SidebarInset (main content)
└── AIAnalystContainer (right panel/drawer)
```

Add an AI button in the header to toggle the panel.

---

### Step 8: Message Components

**New File: `src/components/ai-analyst/ChatMessage.tsx`**

Styled message bubbles:
- User messages: Right-aligned, primary color background
- Assistant messages: Left-aligned, muted background
- Markdown rendering using react-markdown
- Timestamp display
- Typing indicator for streaming

---

## Phase 5: Polish & Quality

### Step 9: Responsive Design Improvements

**Update: `src/components/dashboard/KPIRibbon.tsx`**
- 2-column grid on mobile, 3-column on tablet, 6-column on desktop

**Update: `src/components/dashboard/RecentInvoicesTable.tsx`**
- Horizontal scroll wrapper on mobile
- Optional: Card-based view for very small screens

**Update: `src/pages/Dashboard.tsx`**
- Adjust padding and spacing for mobile
- Stack charts vertically on mobile

**Update: `src/components/dashboard/DashboardLayout.tsx`**
- Add hamburger menu trigger visibility
- Ensure header works well on mobile

---

### Step 10: Loading States & Skeletons

**Update: `src/components/dashboard/ChartCard.tsx`**
- Add proper skeleton loader that matches chart dimensions
- Smooth fade-in when data loads

**New File: `src/components/ui/chart-skeleton.tsx`**
- Animated chart placeholder (lines for line charts, bars for bar charts)

---

### Step 11: Error Handling

**New File: `src/components/ErrorBoundary.tsx`**
- Catch rendering errors
- Display friendly error message with retry button

**Update: All chart/table components**
- Add error state handling with "Failed to load" message
- Retry button to refetch data

---

### Step 12: Accessibility Improvements

**Update: `src/index.css`**
- Add focus-visible styles for keyboard navigation
- Ensure minimum contrast ratios

**Update: Interactive components**
- Add proper aria-labels to icon-only buttons
- Ensure all interactive elements are focusable
- Add skip-to-content link

---

### Step 13: Subtle Animations

**Update: `src/index.css`**
- Add transition utilities for hover states
- Fade-in animation for cards on load

**Update: Card components**
- Subtle hover elevation effect
- Smooth color transitions on status badges

---

### Step 14: Export Functionality

**New File: `src/lib/export.ts`**
- `exportToCSV(data, filename)` utility function
- Handle array of objects to CSV conversion
- Trigger browser download

**Update: `src/components/dashboard/RecentInvoicesTable.tsx`**
- Already has Export CSV button - wire it up

**Update: `src/components/dashboard/AtRiskCustomersTable.tsx`**
- Add Export button to header

**Update: Chart components**
- Add "Export Data" option in chart headers

---

## New File Structure

```text
src/
├── components/
│   ├── ai-analyst/
│   │   ├── AIAnalystContainer.tsx
│   │   ├── AIAnalystPanel.tsx
│   │   ├── AIAnalystDrawer.tsx
│   │   ├── ChatMessage.tsx
│   │   └── SuggestedPrompts.tsx
│   ├── dashboard/ (updated files)
│   ├── ErrorBoundary.tsx
│   └── ui/
│       └── chart-skeleton.tsx
├── contexts/
│   └── AIAnalystContext.tsx
├── hooks/
│   └── useAIAnalyst.ts
├── lib/
│   └── export.ts
└── pages/ (updated)

supabase/functions/
└── ai-analyst/
    └── index.ts
```

---

## Technical Notes

**AI Integration:**
- Uses Lovable AI Gateway (LOVABLE_API_KEY already configured)
- Default model: google/gemini-3-flash-preview
- Streaming SSE for real-time response rendering
- Context includes current KPI data from Supabase views

**Responsive Breakpoints:**
- Mobile: < 768px (useIsMobile hook)
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Dependencies:**
- react-markdown (needs to be added for message rendering)

**Error Handling:**
- 429 errors: "Rate limit exceeded, please try again in a moment"
- 402 errors: "Usage limit reached"
- Network errors: Generic retry message

---

## Data Flow for AI Analyst

```text
User Question
     ↓
Frontend (useAIAnalyst hook)
     ↓
Edge Function (ai-analyst)
     ↓
Query Supabase Views → Get current metrics
     ↓
Build context prompt with real data
     ↓
Call Lovable AI Gateway (streaming)
     ↓
Stream tokens back to frontend
     ↓
Render in ChatMessage with markdown
```

---

## Implementation Order

1. Edge function for AI chat (backend first)
2. AI context and hook (state management)
3. AI panel and drawer components (UI)
4. Integrate into dashboard layout
5. Responsive design updates
6. Loading states and error handling
7. Accessibility improvements
8. Export functionality
9. Final polish and animations

