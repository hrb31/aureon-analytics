import { useIsMobile } from "@/hooks/use-mobile";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { AIAnalystPanel } from "./AIAnalystPanel";
import { AIAnalystDrawer } from "./AIAnalystDrawer";
import { cn } from "@/lib/utils";

export function AIAnalystContainer() {
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useAIAnalyst();

  // Mobile: Render floating button + drawer
  if (isMobile) {
    return <AIAnalystDrawer />;
  }

  // Desktop: Render fixed sidebar panel that stays in viewport
  return (
    <div
      className={cn(
        "shrink-0 transition-all duration-300 ease-in-out h-screen sticky top-0",
        isOpen ? "w-[400px]" : "w-0"
      )}
    >
      {isOpen && (
        <div className="h-screen w-[400px] overflow-hidden">
          <AIAnalystPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
