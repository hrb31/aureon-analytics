import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Crown, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustomerKPIsData {
  atRiskCount: number;
  atRiskChange: number;
  highValueCount: number;
  highValueNew: number;
  churningCount: number;
  churningChange: number;
}

interface CustomerKPICardsProps {
  data?: CustomerKPIsData;
  isLoading?: boolean;
}

export function CustomerKPICards({ data, isLoading }: CustomerKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "At-Risk Customers",
      value: data?.atRiskCount ?? 0,
      change: data?.atRiskChange ?? 0,
      changeLabel: "vs last week",
      icon: AlertTriangle,
      iconColor: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      title: "High Value Clients",
      value: data?.highValueCount ?? 0,
      change: data?.highValueNew ?? 0,
      changeLabel: "new this month",
      icon: Crown,
      iconColor: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Churning (30D)",
      value: data?.churningCount ?? 0,
      change: data?.churningChange ?? 0,
      changeLabel: "vs last month",
      icon: TrendingDown,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold mt-1">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.change > 0 ? "+" : ""}{card.change}% {card.changeLabel}
                </p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
