import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LogOut, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Temporary header - will be replaced with full navigation sidebar */}
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Aureon Analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={logout} title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content area - placeholder for Phase 3 */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Overview Dashboard</h1>
          <p className="text-muted-foreground">
            Phase 1 complete! The dashboard content will be built in Phase 3.
          </p>
        </div>
      </main>
    </div>
  );
}
