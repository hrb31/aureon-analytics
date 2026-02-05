

# Plan: AI Analyst Chat History and Dedicated Page

## Overview

This plan implements a persistent chat history system for the AI Analyst with two distinct interfaces:
1. **Floating Chatbot (bottom-right)**: Session-based quick chats that auto-save when closed
2. **Dedicated AI Analyst Page**: Full-page experience with access to all previous conversations

---

## Architecture

```text
+------------------+     +-------------------+     +------------------+
|  Floating Chat   |     |  AI Analyst Page  |     |    Database      |
|  (Quick Session) |     |  (Full History)   |     |                  |
+--------+---------+     +---------+---------+     +--------+---------+
         |                         |                        |
         |  Save on close          |  Load conversations    |
         +------------------------>|<-----------------------+
                                   |                        |
                                   |  ai_conversations      |
                                   |  ai_messages           |
                                   +------------------------+
```

---

## Part 1: Database Schema

### New Tables

**`ai_conversations`** - Stores conversation metadata
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Auto-generated from first message |
| created_at | TIMESTAMPTZ | When conversation started |
| updated_at | TIMESTAMPTZ | Last activity timestamp |

**`ai_messages`** - Stores individual messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | UUID | Foreign key to ai_conversations |
| role | TEXT | "user" or "assistant" |
| content | TEXT | Message content |
| created_at | TIMESTAMPTZ | Message timestamp |

### RLS Policies
- Read access for authenticated users
- Insert access for authenticated users
- Delete access for authenticated users (to clear history)

---

## Part 2: New Page - AI Analyst

### Route
`/dashboard/ai-analyst`

### Layout
```text
+-----------------------------------------------+
|  AI Analyst                          [+ New]  |
+------------------+----------------------------+
|                  |                            |
|  Conversation    |     Chat Area              |
|  List            |                            |
|                  |     - Messages             |
|  - Today         |     - Input field          |
|  - Yesterday     |                            |
|  - This Week     |                            |
|  - Older         |                            |
|                  |                            |
+------------------+----------------------------+
```

### Features
- **Conversation sidebar**: Lists all past conversations grouped by date
- **Active chat area**: Shows selected conversation with full message history
- **New conversation button**: Starts a fresh chat
- **Delete conversation**: Remove old chats
- **Search**: Find past conversations (optional enhancement)

---

## Part 3: Floating Chat Modifications

### Current Behavior
- Messages stored in React state (lost on refresh)
- Trash button clears messages

### New Behavior
1. **Auto-create conversation**: When user sends first message, create a new conversation in the database
2. **Auto-save messages**: Each message is saved to the database in real-time
3. **Clear on close**: When popup closes, clear the local state (conversation already saved)
4. **Session isolation**: Each time the popup opens, it starts fresh (previous sessions accessible via AI Analyst page)

### Flow
```text
User opens floating chat
        |
        v
  [Empty chat - fresh session]
        |
        v
User sends first message
        |
        v
Create new conversation in DB
        |
        v
Save user message to DB
        |
        v
AI responds (streaming)
        |
        v
Save assistant message to DB
        |
        v
User closes popup
        |
        v
Clear local state
(Conversation persisted in DB)
```

---

## Part 4: Sidebar Navigation Update

### Current
```text
Intelligence
  - AI Analyst (opens floating chat)
```

### New
```text
Intelligence
  - AI Analyst (navigates to /dashboard/ai-analyst)
```

The floating chat remains accessible via the floating button in the bottom-right corner.

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/pages/AIAnalyst.tsx` | Main AI Analyst page with conversation list |
| `src/components/ai-analyst/ConversationList.tsx` | Sidebar showing past conversations |
| `src/components/ai-analyst/ConversationItem.tsx` | Individual conversation row |
| `src/hooks/useConversations.ts` | Hook for fetching/managing conversations |
| `src/hooks/useSaveMessage.ts` | Hook for persisting messages to DB |

### Modified Files
| File | Changes |
|------|---------|
| `src/App.tsx` | Add route for `/dashboard/ai-analyst` |
| `src/components/dashboard/AppSidebar.tsx` | Change AI Analyst to navigate to page instead of opening popup |
| `src/contexts/AIAnalystContext.tsx` | Add `currentConversationId` state |
| `src/hooks/useAIAnalyst.ts` | Add auto-save logic when sending messages |
| `src/components/ai-analyst/AIAnalystPanel.tsx` | Support loading existing conversation |

---

## Part 5: Implementation Details

### Conversation Title Generation
When a conversation is created, the title will be:
- First 50 characters of the user's first message
- Truncated with ellipsis if longer

### Date Grouping Logic
Conversations in the sidebar will be grouped:
- **Today**: Created within the last 24 hours
- **Yesterday**: Created 24-48 hours ago
- **This Week**: Created within the last 7 days
- **Older**: Created more than 7 days ago

### Data Flow for Floating Chat
1. User sends message
2. If no `currentConversationId`, create new conversation via Supabase insert
3. Store returned conversation ID in context
4. Insert user message with conversation ID
5. After AI response completes, insert assistant message
6. On popup close, clear local messages but conversation persists

### Data Flow for AI Analyst Page
1. On page load, fetch all conversations (ordered by updated_at desc)
2. Click conversation to load its messages
3. New messages added to active conversation
4. "New Chat" creates fresh conversation

---

## Database Migration SQL

```sql
-- Create conversations table
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX idx_ai_conversations_updated_at ON ai_conversations(updated_at DESC);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies (authenticated users can access all conversations)
CREATE POLICY "Authenticated users can read conversations" 
  ON ai_conversations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert conversations" 
  ON ai_conversations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can delete conversations" 
  ON ai_conversations FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can read messages" 
  ON ai_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert messages" 
  ON ai_messages FOR INSERT TO authenticated WITH CHECK (true);

-- Function to update conversation's updated_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations 
  SET updated_at = now() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON ai_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();
```

---

## Summary

| Component | Description |
|-----------|-------------|
| Database | 2 new tables (`ai_conversations`, `ai_messages`) with RLS |
| AI Analyst Page | Full-page interface at `/dashboard/ai-analyst` |
| Conversation List | Sidebar with date-grouped past chats |
| Auto-Save | Messages saved to DB in real-time |
| Floating Chat | Starts fresh each session, saves to history |
| Sidebar Nav | Links to dedicated page, not popup |

