import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Users, 
  Calendar 
} from "lucide-react";

interface SuggestedPromptsProps {
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

const SUGGESTED_PROMPTS = [
  {
    icon: TrendingUp,
    label: "Summarize this period's performance",
    prompt: "Give me an executive summary of the current business performance, highlighting key wins and concerns.",
  },
  {
    icon: BarChart3,
    label: "What's driving revenue growth?",
    prompt: "Analyze the main drivers of revenue growth. Which plans and channels are contributing most?",
  },
  {
    icon: AlertTriangle,
    label: "Analyze churn risk factors",
    prompt: "Identify the key churn risk factors and which customers are most at risk. What patterns do you see?",
  },
  {
    icon: Users,
    label: "Compare acquisition channels",
    prompt: "Compare the performance of our acquisition channels. Which ones are most cost-effective?",
  },
  {
    icon: Calendar,
    label: "Forecast next quarter",
    prompt: "Based on current trends, what's your forecast for next quarter's performance? What should we focus on?",
  },
];

export function SuggestedPrompts({ onSelect, disabled }: SuggestedPromptsProps) {
  return (
    <div className="space-y-3 p-4">
      <p className="text-sm text-muted-foreground text-center">
        Ask me anything about your business metrics, or try one of these:
      </p>
      <div className="space-y-2">
        {SUGGESTED_PROMPTS.map((item) => (
          <Button
            key={item.label}
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-3 px-4 text-left"
            onClick={() => onSelect(item.prompt)}
            disabled={disabled}
          >
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{item.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
