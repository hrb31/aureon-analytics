import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Send, Sparkles, History } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ConversationList } from "@/components/ai-analyst/ConversationList";
import { ChatMessage } from "@/components/ai-analyst/ChatMessage";
import { SuggestedPrompts } from "@/components/ai-analyst/SuggestedPrompts";
import {
  useConversationMessages,
  useCreateConversation,
  useSaveMessage,
  type Message,
} from "@/hooks/useConversations";
import { toast } from "@/hooks/use-toast";

const AI_ANALYST_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-analyst`;

export default function AIAnalyst() {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: dbMessages } = useConversationMessages(activeConversationId);
  const createConversation = useCreateConversation();
  const saveMessage = useSaveMessage();

  // Merge DB messages with local messages for display
  const messages = activeConversationId ? (dbMessages || []) : localMessages;

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // Reset when switching conversations
  useEffect(() => {
    setStreamingContent("");
    setLocalMessages([]);
  }, [activeConversationId]);

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setMobileDrawerOpen(false);
  };

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return;

      const trimmedMessage = userMessage.trim();
      setIsLoading(true);
      setStreamingContent("");

      let conversationId = activeConversationId;

      // Create new conversation if needed
      if (!conversationId) {
        try {
          const conv = await createConversation.mutateAsync(trimmedMessage);
          conversationId = conv.id;
          setActiveConversationId(conv.id);
        } catch (error) {
          console.error("Failed to create conversation:", error);
          toast({
            title: "Error",
            description: "Failed to create conversation. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Save user message
      try {
        await saveMessage.mutateAsync({
          conversationId,
          role: "user",
          content: trimmedMessage,
        });
      } catch (error) {
        console.error("Failed to save user message:", error);
      }

      // Build messages for API
      const currentMessages = messages.map((m) => ({ role: m.role, content: m.content }));
      currentMessages.push({ role: "user" as const, content: trimmedMessage });

      let assistantContent = "";

      try {
        const response = await fetch(AI_ANALYST_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: currentMessages }),
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
                setStreamingContent(assistantContent);
              }
            } catch {
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
                setStreamingContent(assistantContent);
              }
            } catch {
              /* ignore */
            }
          }
        }

        // Save assistant message
        if (assistantContent && conversationId) {
          try {
            await saveMessage.mutateAsync({
              conversationId,
              role: "assistant",
              content: assistantContent,
            });
          } catch (error) {
            console.error("Failed to save assistant message:", error);
          }
        }
      } catch (error) {
        console.error("AI Analyst error:", error);

        if (!assistantContent) {
          const errorMessage =
            "I apologize, but I encountered an error processing your request. Please try again.";
          if (conversationId) {
            try {
              await saveMessage.mutateAsync({
                conversationId,
                role: "assistant",
                content: errorMessage,
              });
            } catch {
              /* ignore */
            }
          }
        }

        if (
          !(error instanceof Error) ||
          (!error.message.includes("Rate limited") && !error.message.includes("Payment required"))
        ) {
          toast({
            title: "Error",
            description: "Failed to get AI response. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
        setStreamingContent("");
      }
    },
    [activeConversationId, isLoading, messages, createConversation, saveMessage]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  // Convert Message to ChatMessage format
  const displayMessages = messages.map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: new Date(m.created_at),
  }));

  // Add streaming message if present
  if (streamingContent) {
    displayMessages.push({
      id: "streaming",
      role: "assistant" as const,
      content: streamingContent,
      timestamp: new Date(),
    });
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-3.5rem)] gap-0 -m-4 md:-m-6">
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-72 border-r border-border shrink-0">
          <ConversationList
            activeConversationId={activeConversationId}
            onSelectConversation={setActiveConversationId}
          />
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {/* Mobile Header with History Button */}
          <div className="md:hidden flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
            <h1 className="text-sm font-medium">AI Analyst</h1>
            <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <History className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] max-w-80 p-0">
                <ConversationList
                  activeConversationId={activeConversationId}
                  onSelectConversation={handleSelectConversation}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            {displayMessages.length === 0 && !activeConversationId ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-md px-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-chart-1/20 to-chart-3/20 mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-chart-1" />
                    </div>
                    <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                    <p className="text-muted-foreground text-sm">
                      Ask me anything about your analytics data, trends, or insights.
                    </p>
                  </div>
                </div>
                <SuggestedPrompts onSelect={handlePromptSelect} disabled={isLoading} />
              </div>
            ) : displayMessages.length === 0 ? (
              <SuggestedPrompts onSelect={handlePromptSelect} disabled={isLoading} />
            ) : (
              <div className="divide-y divide-border">
                {displayMessages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={
                      isLoading &&
                      message.id === "streaming"
                    }
                  />
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <form onSubmit={handleSubmit} className="shrink-0 p-3 md:p-4 border-t border-border bg-muted/30">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your metrics..."
                    rows={1}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pr-12"
                    style={{ minHeight: "42px", maxHeight: "120px" }}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-1.5 bottom-1.5 h-8 w-8 rounded-md bg-gradient-to-r from-chart-1 to-chart-3 hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center hidden sm:block">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
