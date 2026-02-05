import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("ai_conversations")
        .insert({ title: title.slice(0, 50) + (title.length > 50 ? "..." : "") })
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
      const { data, error } = await supabase
        .from("ai_messages")
        .insert({
          conversation_id: conversationId,
          role,
          content,
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
