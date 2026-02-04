import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAtRiskCustomers } from "@/hooks/useDashboardData";
import { AlertTriangle } from "lucide-react";

export function AtRiskCustomersTable() {
  const { data, isLoading, error } = useAtRiskCustomers(8);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            At-Risk Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">Failed to load customers.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          At-Risk Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Health Score</TableHead>
                <TableHead className="text-right">Industry</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">
                    {customer.company ?? "Unknown"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.plan_name ?? "No Plan"}</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-destructive font-medium">
                      {customer.health_score}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {customer.industry ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No at-risk customers found. Great news!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
