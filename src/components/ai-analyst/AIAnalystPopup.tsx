import { AIAnalystPanel } from "./AIAnalystPanel";
import { cn } from "@/lib/utils";

interface AIAnalystPopupProps {
  onClose: () => void;
}

export function AIAnalystPopup({ onClose }: AIAnalystPopupProps) {
  return (
    <div
      className={cn(
        "fixed bottom-24 right-6 z-50",
        "w-[400px] h-[500px]",
        "rounded-2xl shadow-2xl overflow-hidden",
        "border border-border bg-background",
        "animate-scale-in origin-bottom-right"
      )}
    >
      <AIAnalystPanel onClose={onClose} />
    </div>
  );
}
