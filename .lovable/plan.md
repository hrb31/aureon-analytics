

# Mobile Layout Optimization Plan

## Summary
This plan addresses visibility and layout issues across the application for mobile viewing. The main areas requiring attention are:

1. **AI Analyst Page** - Fixed sidebar hidden on mobile with no way to access conversation history
2. **Floating Chat Button** - Position conflicts with potential bottom navigation on some devices
3. **Conversation List** - Action buttons and titles need better touch-friendly spacing
4. **Chat Messages** - Content can overflow on narrow screens
5. **Dashboard Layout** - Header padding too generous for mobile

---

## Changes Overview

### 1. AI Analyst Page - Responsive Layout
**Problem**: The conversation sidebar is a fixed 288px (`w-72`) and does not respond to mobile. On screens narrower than the sidebar width, the chat area gets squashed.

**Solution**: 
- Hide sidebar on mobile by default, show as a slide-out drawer
- Add a toggle button in the mobile header to reveal conversation history
- Full-width chat area on mobile

### 2. Conversation Item - Touch-Friendly Actions
**Problem**: Edit/delete icons are small and hard to tap on touch devices.

**Solution**:
- Increase tap target size from 24px to 36px on mobile
- Slightly larger icons for touch targets
- Clearer visual separation between items

### 3. Chat Message Bubbles - Prevent Overflow
**Problem**: Long messages or code blocks can cause horizontal overflow.

**Solution**:
- Add `break-words` and `overflow-wrap: anywhere` to message content
- Ensure markdown code blocks wrap properly

### 4. Suggested Prompts - Mobile-Friendly Grid
**Problem**: Prompt chips may wrap awkwardly on narrow screens.

**Solution**:
- Single column layout on very small screens
- Ensure padding doesn't compress content too much

### 5. Floating AI Button - Safe Area Positioning
**Problem**: The fixed `bottom-6 right-6` position may overlap with mobile browser chrome or notch areas.

**Solution**:
- Use `safe-area-inset-bottom` for devices with notches/home indicators
- Slightly smaller button on mobile (56px → 48px)

### 6. Dashboard Header - Compact Mobile Header
**Problem**: `px-6` padding is too wide on mobile, wasting horizontal space.

**Solution**:
- Use `px-4 md:px-6` for responsive padding

---

## Technical Details

### File: `src/pages/AIAnalyst.tsx`
- Wrap sidebar in a responsive container: `hidden md:block md:w-72`
- Add mobile sidebar toggle using Sheet component
- Add a menu/history button in the header visible only on mobile
- Adjust container height: `h-[calc(100vh-3.5rem)]` on mobile to account for header

### File: `src/components/ai-analyst/ConversationItem.tsx`
- Increase button sizes: `h-6 w-6` → `h-9 w-9 md:h-6 md:w-6`
- Increase icon sizes: `h-3 w-3` → `h-4 w-4 md:h-3 md:w-3`
- Add more padding between items

### File: `src/components/ai-analyst/ChatMessage.tsx`
- Add `break-words` class to message content
- Ensure `max-w-full` on message container
- Reduce horizontal padding on mobile: `p-4` → `p-3 md:p-4`

### File: `src/components/ai-analyst/SuggestedPrompts.tsx`
- Make prompt grid responsive: `flex flex-wrap` → `grid grid-cols-2 sm:flex sm:flex-wrap`
- Reduce padding on mobile

### File: `src/components/ai-analyst/AIAnalystFloatingButton.tsx`
- Add safe area inset: `bottom-6` → `bottom-6 pb-safe`
- Responsive button size: `h-14 w-14` → `h-12 w-12 md:h-14 md:w-14`

### File: `src/components/dashboard/DashboardLayout.tsx`
- Responsive header padding: `px-6` → `px-4 md:px-6`

### File: `src/index.css` 
- Add CSS for safe-area-inset if not present

---

## Visual Flow (Mobile)

```text
+---------------------------+
| ≡  AI Analyst      [📜]   |  ← Hamburger opens main nav, history icon opens conversation drawer
+---------------------------+
|                           |
|   "How can I help you?"   |
|                           |
|   [prompt] [prompt]       |
|   [prompt] [prompt]       |
|                           |
+---------------------------+
| [Ask about your metrics...|
|                      [→] ]|
+---------------------------+
              [★]            ← Floating button with safe-area spacing
```

---

## Implementation Order

1. **AIAnalyst.tsx** - Add mobile drawer for conversation list
2. **ConversationItem.tsx** - Larger touch targets
3. **ChatMessage.tsx** - Text wrapping fixes
4. **SuggestedPrompts.tsx** - Responsive grid
5. **AIAnalystFloatingButton.tsx** - Safe area positioning
6. **DashboardLayout.tsx** - Header padding

