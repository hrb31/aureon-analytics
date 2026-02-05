import { AIAnalystPanel } from "./AIAnalystPanel";
import { cn } from "@/lib/utils";

interface AIAnalystPopupProps {
  onClose: () => void;
}

export function AIAnalystPopup({ onClose }: AIAnalystPopupProps) {
  return (
    <div
      className={cn(
        "fixed z-50",
        "bottom-20 md:bottom-24 right-4 md:right-6",
        "w-[calc(100vw-2rem)] max-w-[400px] h-[60vh] max-h-[500px]",
        "rounded-2xl shadow-2xl overflow-hidden",
        "border border-border bg-background",
        "animate-scale-in origin-bottom-right"
      )}
    >
      <AIAnalystPanel onClose={onClose} />
    </div>
  );
}
