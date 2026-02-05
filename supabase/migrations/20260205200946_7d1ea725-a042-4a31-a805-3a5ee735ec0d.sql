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