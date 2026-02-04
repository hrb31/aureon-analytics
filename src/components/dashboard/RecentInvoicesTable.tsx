import { format, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRecentInvoices } from "@/hooks/useDashboardData";
import { Download, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  paid: {
    bg: "bg-[hsl(var(--chart-2)/0.15)]",
    text: "text-[hsl(var(--chart-2))]",
    dot: "bg-[hsl(var(--chart-2))]",
  },
  pending: {
    bg: "bg-[hsl(var(--chart-4)/0.15)]",
    text: "text-[hsl(var(--chart-4))]",
    dot: "bg-[hsl(var(--chart-4))]",
  },
  overdue: {
    bg: "bg-[hsl(var(--chart-5)/0.15)]",
    text: "text-[hsl(var(--chart-5))]",
    dot: "bg-[hsl(var(--chart-5))]",
  },
};

const avatarColors = [
  "bg-[hsl(var(--chart-1))]",
  "bg-[hsl(var(--chart-2))]",
  "bg-[hsl(var(--chart-3))]",
  "bg-[hsl(var(--chart-4))]",
  "bg-[hsl(var(--chart-5))]",
];

function getInitials(company: string): string {
  return company
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(company: string): string {
  const index = company.charCodeAt(0) % avatarColors.length;
  return avatarColors[index];
}

export function RecentInvoicesTable() {
  const { data, isLoading, error } = useRecentInvoices(8);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive text-sm">Failed to load invoices.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="text-base font-medium">Detailed Invoices</CardTitle>
          {data && (
            <Badge variant="secondary" className="text-xs">
              {data.length} records
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Invoice ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((invoice, index) => {
                const company = invoice.customers?.company ?? "Unknown";
                const style = statusStyles[invoice.status] ?? statusStyles.pending;
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #INV-{invoice.id.slice(0, 5).toUpperCase()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${getAvatarColor(company)}`}>
                          {getInitials(company)}
                        </div>
                        <span className="font-medium">{company}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(invoice.amount)}
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${style.bg} ${style.text}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {format(parseISO(invoice.issued_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Download PDF</DropdownMenuItem>
                          <DropdownMenuItem>Send reminder</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
