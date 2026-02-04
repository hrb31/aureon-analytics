import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import { useAIAnalyst } from "@/hooks/useAIAnalyst";
import { AIAnalystPanel } from "./AIAnalystPanel";

export function AIAnalystDrawer() {
  const { isOpen, setIsOpen } = useAIAnalyst();

  return (
    <>
      {/* Floating button for mobile */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-br from-chart-1 to-chart-3 hover:from-chart-1/90 hover:to-chart-3/90"
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>

      {/* Slide-out drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>AI Analyst</SheetTitle>
          </SheetHeader>
          <AIAnalystPanel onClose={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
