import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, clearMessages, isLoading } = useAIAnalyst();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

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

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-background border-l border-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-3/20">
            <Sparkles className="h-4 w-4 text-chart-1" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Analyst</h2>
            <p className="text-xs text-muted-foreground">Ask anything about your data</p>
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
              aria-label="Close AI Analyst"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages area */}
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

      {/* Chat input - prominent and always visible */}
      <form
        onSubmit={handleSubmit}
        className="shrink-0 p-4 border-t border-border bg-muted/30"
      >
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your metrics..."
              disabled={isLoading}
              rows={1}
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-12"
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
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
