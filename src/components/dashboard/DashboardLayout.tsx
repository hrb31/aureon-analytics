import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AIAnalystContainer } from "@/components/ai-analyst/AIAnalystContainer";
import { AIAnalystProvider } from "@/contexts/AIAnalystContext";
import { Button } from "@/components/ui/button";
import { Sparkles, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useAIAnalystContext } from "@/contexts/AIAnalystContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardHeader() {
  const { isOpen, setIsOpen } = useAIAnalystContext();
  const isMobile = useIsMobile();

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <SidebarTrigger className="-ml-2" />
      
      {/* AI Analyst toggle button - prominent gradient style on desktop */}
      {!isMobile && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={
            isOpen
              ? "gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
              : "gap-2 bg-gradient-to-r from-chart-1 to-chart-3 text-white hover:opacity-90 shadow-md"
          }
          size="sm"
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Analyst</span>
          {isOpen ? (
            <PanelRightClose className="h-4 w-4 ml-1" />
          ) : (
            <PanelRightOpen className="h-4 w-4 ml-1" />
          )}
        </Button>
      )}
    </header>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AIAnalystProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
          <AIAnalystContainer />
        </div>
      </SidebarProvider>
    </AIAnalystProvider>
  );
}
