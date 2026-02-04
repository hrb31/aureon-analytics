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

  // Desktop: Render persistent collapsible sidebar
  return (
    <div
      className={cn(
        "shrink-0 transition-all duration-300 ease-in-out",
        isOpen ? "w-[400px]" : "w-0"
      )}
    >
      {isOpen && (
        <div className="h-full w-[400px]">
          <AIAnalystPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
