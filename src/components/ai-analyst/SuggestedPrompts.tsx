import { Sparkles, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  {
    label: "Performance summary",
    prompt: "Give me an executive summary of the current business performance, highlighting key wins and concerns.",
  },
  {
    label: "Revenue drivers",
    prompt: "Analyze the main drivers of revenue growth. Which plans and channels are contributing most?",
  },
  {
    label: "Churn risks",
    prompt: "Identify the key churn risk factors and which customers are most at risk.",
  },
  {
    label: "Channel comparison",
    prompt: "Compare the performance of our acquisition channels. Which ones are most cost-effective?",
  },
];

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Welcome message */}
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-chart-1/20 to-chart-3/20 mb-4">
        <Sparkles className="h-6 w-6 text-chart-1" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">Hi! I'm your AI Analyst</h3>
      
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
        Ask me anything about your metrics, revenue, customers, or trends. I have access to all your business data.
      </p>

      {/* Quick prompts as small chips */}
      <div className="w-full space-y-2">
        <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_PROMPTS.map((item) => (
            <button
              key={item.label}
              onClick={() => onSelect(item.prompt)}
              disabled={disabled}
              className="px-3 py-1.5 text-xs rounded-full border border-border bg-muted/50 hover:bg-muted hover:border-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
