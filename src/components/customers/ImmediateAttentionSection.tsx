import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AlertTriangle, ChevronRight, CreditCard, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AlertCustomer {
  id: string;
  name: string;
  company: string;
  plan: string;
  alertType: "health" | "payment" | "usage";
  alertMessage: string;
  severity: "critical" | "warning";
}

interface ImmediateAttentionSectionProps {
  customers?: AlertCustomer[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

const alertIcons = {
  health: AlertTriangle,
  payment: CreditCard,
  usage: TrendingDown,
};

const severityColors = {
  critical: "border-l-destructive bg-destructive/5",
  warning: "border-l-warning bg-warning/5",
};

export function ImmediateAttentionSection({
  customers = [],
  isLoading,
  onViewAll,
}: ImmediateAttentionSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="min-w-[280px] border-l-4">
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (customers.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Immediate Attention Required
          </CardTitle>
          {onViewAll && (
            <Button variant="link" size="sm" onClick={onViewAll} className="text-xs">
              View all alerts
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {customers.map((customer) => {
              const Icon = alertIcons[customer.alertType];
              return (
                <Card
                  key={customer.id}
                  className={`min-w-[280px] border-l-4 ${severityColors[customer.severity]}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.company}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {customer.plan}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="whitespace-normal">{customer.alertMessage}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
