import { useQuery } from "@tanstack/react-query";

const SUPABASE_URL = "https://plmcyayferxcbwsbknss.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbWN5YXlmZXJ4Y2J3c2JrbnNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzc2NjgsImV4cCI6MjA4NTgxMzY2OH0.SQMADNBYSV_XFsp50qCWSgUJDMtPZg_FEzx1zYxdmTY";

interface AIInsightResponse {
  insight: string;
  highlightValue?: string;
  error?: string;
}

export function useAIInsight() {
  return useQuery({
    queryKey: ["ai-insight"],
    queryFn: async (): Promise<AIInsightResponse> => {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/generate-insight`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          return { insight: "", error: "Rate limited. Please try again later." };
        }
        if (response.status === 402) {
          return { insight: "", error: "AI credits exhausted." };
        }
        throw new Error("Failed to generate insight");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    retry: 1,
  });
}
