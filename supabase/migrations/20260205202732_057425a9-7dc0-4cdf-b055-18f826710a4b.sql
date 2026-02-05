-- Add UPDATE policy for ai_conversations so users can rename
CREATE POLICY "Authenticated users can update conversations"
ON public.ai_conversations
FOR UPDATE
USING (true)
WITH CHECK (true);