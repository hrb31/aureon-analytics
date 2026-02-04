import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Send, Trash2, Sparkles } from "lucide-react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { ChatMessage } from "./ChatMessage";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { cn } from "@/lib/utils";

interface AIAnalystPanelProps {
  className?: string;
  onClose?: () => void;
}

export function AIAnalystPanel({ className, onClose }: AIAnalystPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, clearMessages, isLoading } = useAIAnalyst();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handlePromptSelect = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-l border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-3/20">
            <Sparkles className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Analyst</h2>
            <p className="text-xs text-muted-foreground">Powered by Lovable AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={clearMessages}
              title="Clear conversation"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        {messages.length === 0 ? (
          <SuggestedPrompts onSelect={handlePromptSelect} disabled={isLoading} />
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isStreaming={
                  isLoading &&
                  index === messages.length - 1 &&
                  message.role === "assistant"
                }
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 p-4 border-t border-border"
      >
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your metrics..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
