import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIAnalystContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => string;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
}

const AIAnalystContext = createContext<AIAnalystContextType | undefined>(undefined);

export function AIAnalystProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpenState] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Clear messages when closing the popup (conversation already saved)
  const setIsOpen = useCallback((open: boolean) => {
    setIsOpenState(open);
    if (!open) {
      // Clear local state when popup closes - conversation is already saved
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, []);

  const addMessage = useCallback((message: Omit<ChatMessage, "id" | "timestamp">) => {
    const id = crypto.randomUUID();
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return id;
  }, []);

  const updateMessage = useCallback((id: string, content: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, content } : msg))
    );
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  return (
    <AIAnalystContext.Provider
      value={{
        isOpen,
        setIsOpen,
        messages,
        addMessage,
        updateMessage,
        clearMessages,
        isLoading,
        setIsLoading,
        currentConversationId,
        setCurrentConversationId,
      }}
    >
      {children}
    </AIAnalystContext.Provider>
  );
}

export function useAIAnalystContext() {
  const context = useContext(AIAnalystContext);
  if (context === undefined) {
    throw new Error("useAIAnalystContext must be used within an AIAnalystProvider");
  }
  return context;
}
