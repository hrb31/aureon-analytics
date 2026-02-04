import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AIAnalystContainer } from "@/components/ai-analyst/AIAnalystContainer";
import { AIAnalystProvider } from "@/contexts/AIAnalystContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardHeader() {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
      <SidebarTrigger className="-ml-2" />
    </header>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AIAnalystProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </div>
        {/* Floating AI Analyst - outside main content flow */}
        <AIAnalystContainer />
      </SidebarProvider>
    </AIAnalystProvider>
  );
}
