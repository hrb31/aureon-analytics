import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AIInsightResponse {
  insight: string;
  highlightValue?: string;
  error?: string;
}

export function useAIInsight() {
  return useQuery({
    queryKey: ["ai-insight"],
    queryFn: async (): Promise<AIInsightResponse> => {
      const { data, error } = await supabase.functions.invoke<AIInsightResponse>(
        "generate-insight",
        {
          method: "POST",
        }
      );

      if (error) {
        // Handle specific error codes
        if (error.message?.includes("429")) {
          return { insight: "", error: "Rate limited. Please try again later." };
        }
        if (error.message?.includes("402")) {
          return { insight: "", error: "AI credits exhausted." };
        }
        throw error;
      }

      if (data?.error) {
        return { insight: "", error: data.error };
      }

      return data || { insight: "" };
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 1,
  });
}
