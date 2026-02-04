import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const success = await login(password);

    if (success) {
      navigate("/");
    } else {
      setError("Invalid access code. Please try again.");
      setPassword("");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle */}
      <header className="absolute top-0 right-0 p-4">
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and branding */}
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Aureon Analytics
            </h1>
            <p className="text-muted-foreground text-sm">
              Enterprise Intelligence Platform
            </p>
          </div>

          {/* Login card */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium uppercase tracking-wider">
                  Authorized Personnel Only
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter access code"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 h-12 text-center tracking-widest"
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive text-center animate-in fade-in slide-in-from-top-1">
                      {error}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium"
                  disabled={isLoading || !password}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Access Dashboard"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground">
            This system is for authorized users only. Unauthorized access attempts are logged.
          </p>
        </div>
      </main>
    </div>
  );
}
