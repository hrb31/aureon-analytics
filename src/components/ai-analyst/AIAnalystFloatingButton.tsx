import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { AIAnalystPopup } from "./AIAnalystPopup";
import { cn } from "@/lib/utils";

export function AIAnalystFloatingButton() {
  const { isOpen, setIsOpen } = useAIAnalyst();

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-chart-1 to-chart-3 hover:opacity-90",
          "transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>

      {/* Popup */}
      {isOpen && <AIAnalystPopup onClose={() => setIsOpen(false)} />}
    </>
  );
}
