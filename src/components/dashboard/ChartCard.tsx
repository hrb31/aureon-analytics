import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function ChartCard({ title, children, isLoading, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
