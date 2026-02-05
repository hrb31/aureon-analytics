import { useState, useRef, useEffect } from "react";
import { Trash2, MessageSquare, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/hooks/useConversations";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(conversation.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== conversation.title) {
      onRename(conversation.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(conversation.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1 px-2 py-2">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-9 text-sm"
          maxLength={30}
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:h-6 md:w-6 shrink-0"
          onClick={handleSave}
        >
          <Check className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:h-6 md:w-6 shrink-0"
          onClick={handleCancel}
        >
          <X className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-3 py-3 md:py-2 rounded-lg cursor-pointer transition-colors min-w-0",
        isActive
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={() => onSelect(conversation.id)}
    >
      <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 min-w-0 text-sm truncate" title={conversation.title}>
        {conversation.title}
      </span>
      <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:h-6 md:w-6"
          onClick={(e) => {
            e.stopPropagation();
            setEditValue(conversation.title);
            setIsEditing(true);
          }}
        >
          <Pencil className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 md:h-6 md:w-6"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(conversation.id);
          }}
        >
          <Trash2 className="h-4 w-4 md:h-3 md:w-3" />
        </Button>
      </div>
    </div>
  );
}
