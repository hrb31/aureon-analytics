import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

// Validation schemas
const conversationTitleSchema = z
  .string()
  .min(1, "Title is required")
  .max(50, "Title must be less than 50 characters")
  .transform((val) => {
    // Sanitize: remove HTML tags and dangerous characters
    return val
      .replace(/<[^>]*>/g, "")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, 50);
  });

const messageContentSchema = z
  .string()
  .min(1, "Message cannot be empty")
  .max(10000, "Message must be less than 10,000 characters");

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export function useConversations() {
  return useQuery({
    queryKey: ["ai-conversations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Conversation[];
    },
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["ai-messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (firstMessage: string) => {
      // Validate and sanitize the first message
      const validatedMessage = messageContentSchema.parse(firstMessage);
      
      // Generate AI title with truncated message for safety
      let title = validatedMessage.slice(0, 25) + (validatedMessage.length > 25 ? "..." : "");
      
      try {
        const { data, error } = await supabase.functions.invoke("generate-title", {
          body: { message: validatedMessage.slice(0, 500) }, // Limit message sent for title gen
        });
        
        if (!error && data?.title) {
          title = conversationTitleSchema.parse(data.title);
        }
      } catch (e) {
        console.error("Failed to generate title:", e);
      }

      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({ title })
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
}

export function useUpdateConversationTitle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      // Validate and sanitize the title
      const sanitizedTitle = conversationTitleSchema.parse(title);
      
      const { data, error } = await supabase
        .from("ai_conversations")
        .update({ title: sanitizedTitle })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      // Validate UUID format
      const uuidSchema = z.string().uuid();
      uuidSchema.parse(conversationId);
      
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
}

export function useSaveMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      role,
      content,
    }: {
      conversationId: string;
      role: "user" | "assistant";
      content: string;
    }) => {
      // Validate inputs
      const uuidSchema = z.string().uuid();
      uuidSchema.parse(conversationId);
      
      const validatedContent = messageContentSchema.parse(content);
      
      const { data, error } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: conversationId,
          role,
          content: validatedContent,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ai-messages", variables.conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ["ai-conversations"] });
    },
  });
}

// Helper to group conversations by date
export function groupConversationsByDate(conversations: Conversation[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: {
    today: Conversation[];
    yesterday: Conversation[];
    thisWeek: Conversation[];
    older: Conversation[];
  } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  conversations.forEach((conv) => {
    const date = new Date(conv.updated_at);
    if (date >= today) {
      groups.today.push(conv);
    } else if (date >= yesterday) {
      groups.yesterday.push(conv);
    } else if (date >= thisWeek) {
      groups.thisWeek.push(conv);
    } else {
      groups.older.push(conv);
    }
  });

  return groups;
}
