import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { AIAnalystPopup } from "./AIAnalystPopup";
import { AIAnalystPanel } from "./AIAnalystPanel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

export function AIAnalystFloatingButton() {
  const { isOpen, setIsOpen } = useAIAnalyst();
  const isMobile = useIsMobile();
  const location = useLocation();

  // Hide on the dedicated AI Analyst page
  if (location.pathname === "/dashboard/ai-analyst") {
    return null;
  }

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "fixed z-50 h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg",
          "right-4 md:right-6",
          "bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6",
          "bg-gradient-to-r from-chart-1 to-chart-3 hover:opacity-90",
          "transition-transform duration-200",
          isOpen && !isMobile && "rotate-180"
        )}
      >
        {isOpen && !isMobile ? (
          <X className="h-6 w-6" />
        ) : (
          <Sparkles className="h-6 w-6" />
        )}
      </Button>

      {/* Mobile: Full-screen drawer */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-2xl">
            <SheetHeader className="sr-only">
              <SheetTitle>AI Analyst</SheetTitle>
            </SheetHeader>
            <AIAnalystPanel onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Popup */}
      {!isMobile && isOpen && <AIAnalystPopup onClose={() => setIsOpen(false)} />}
    </>
  );
}
