import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationItem } from "./ConversationItem";
import {
  useConversations,
  useDeleteConversation,
  useUpdateConversationTitle,
  groupConversationsByDate,
} from "@/hooks/useConversations";

interface ConversationListProps {
  activeConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
}

export function ConversationList({
  activeConversationId,
  onSelectConversation,
}: ConversationListProps) {
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const updateTitle = useUpdateConversationTitle();

  const handleDelete = (id: string) => {
    deleteConversation.mutate(id);
    if (activeConversationId === id) {
      onSelectConversation(null);
    }
  };

  const handleRename = (id: string, newTitle: string) => {
    updateTitle.mutate({ id, title: newTitle });
  };

  const handleNewChat = () => {
    onSelectConversation(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const groups = groupConversationsByDate(conversations || []);

  const renderGroup = (label: string, items: typeof conversations) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="px-3 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </h3>
        <div className="space-y-0.5">
          {items.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={onSelectConversation}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-muted/30">
      {/* Header */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/20 to-chart-3/20">
            <Sparkles className="h-4 w-4 text-chart-1" />
          </div>
          <h1 className="font-semibold">AI Analyst</h1>
        </div>
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2"
          variant={activeConversationId === null ? "secondary" : "outline"}
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {renderGroup("Today", groups.today)}
          {renderGroup("Yesterday", groups.yesterday)}
          {renderGroup("This Week", groups.thisWeek)}
          {renderGroup("Older", groups.older)}

          {(!conversations || conversations.length === 0) && (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
