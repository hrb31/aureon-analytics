import { useCallback } from "react";
import { useAIAnalystContext } from "@/contexts/AIAnalystContext";
import { toast } from "@/hooks/use-toast";

const AI_ANALYST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyst`;

export function useAIAnalyst() {
  const {
    messages,
    addMessage,
    updateMessage,
    clearMessages,
    isLoading,
    setIsLoading,
    isOpen,
    setIsOpen,
  } = useAIAnalystContext();

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      // Add user message
      addMessage({ role: "user", content: userMessage.trim() });

      // Create placeholder for assistant message
      const assistantId = addMessage({ role: "assistant", content: "" });

      setIsLoading(true);
      let assistantContent = "";

      try {
        // Build messages array for API (exclude the empty assistant message we just added)
        const apiMessages = [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user" as const, content: userMessage.trim() },
        ];

        const response = await fetch(AI_ANALYST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          if (response.status === 429) {
            toast({
              title: "Rate Limited",
              description: "Too many requests. Please wait a moment and try again.",
              variant: "destructive",
            });
            throw new Error("Rate limited");
          }
          
          if (response.status === 402) {
            toast({
              title: "Usage Limit Reached",
              description: "AI credits have been exhausted. Please add more credits.",
              variant: "destructive",
            });
            throw new Error("Payment required");
          }
          
          throw new Error(errorData.error || "Failed to get AI response");
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                updateMessage(assistantId, assistantContent);
              }
            } catch {
              // Incomplete JSON, put back in buffer
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }

        // Final flush
        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw) continue;
            if (raw.endsWith("\r")) raw = raw.slice(0, -1);
            if (raw.startsWith(":") || raw.trim() === "") continue;
            if (!raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                updateMessage(assistantId, assistantContent);
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch (error) {
        console.error("AI Analyst error:", error);
        
        // Update the assistant message with error
        if (!assistantContent) {
          updateMessage(
            assistantId,
            "I apologize, but I encountered an error processing your request. Please try again."
          );
        }
        
        if (!(error instanceof Error) || 
            (!error.message.includes("Rate limited") && !error.message.includes("Payment required"))) {
          toast({
            title: "Error",
            description: "Failed to get AI response. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, addMessage, updateMessage, setIsLoading, isLoading]
  );

  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading,
    isOpen,
    setIsOpen,
  };
}
