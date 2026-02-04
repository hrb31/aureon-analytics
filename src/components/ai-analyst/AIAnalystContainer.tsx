import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { useIsMobile } from "@/hooks/use-mobile";
import { AIAnalystPanel } from "./AIAnalystPanel";
import { AIAnalystPopup } from "./AIAnalystPopup";

export function AIAnalystContainer() {
  const isMobile = useIsMobile();
  const { isOpen, setIsOpen } = useAIAnalyst();

  return (
    <>
      {/* Floating button - always visible in bottom-right corner */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-chart-1 to-chart-3 hover:from-chart-1/90 hover:to-chart-3/90"
        size="icon"
        aria-label={isOpen ? "Close AI Analyst" : "Open AI Analyst"}
      >
        <Sparkles className="h-6 w-6 text-white" />
      </Button>

      {/* Mobile: Slide-out drawer */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>AI Analyst</SheetTitle>
            </SheetHeader>
            <AIAnalystPanel onClose={() => setIsOpen(false)} />
          </SheetContent>
        </Sheet>
      )}

      {/* Desktop: Floating popup */}
      {!isMobile && isOpen && (
        <AIAnalystPopup onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
