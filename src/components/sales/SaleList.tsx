import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { Sale, Client, KAM } from "@/data/mockData";

interface SaleListProps {
  sales: Sale[];
  clients: Client[];
  kams: KAM[];
}

type SortKey =
  | "client"
  | "businessEntity"
  | "product"
  | "amount"
  | "closingDate"
  | "kam";

type SortDirection = "asc" | "desc";

export function SaleList({ sales, clients, kams }: SaleListProps) {
  const [sortKey, setSortKey] = useState<SortKey>("closingDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sortedSales = useMemo(() => {
    return [...sales].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortKey) {
        case "client":
          aValue = clients.find(c => c.id === a.clientId)?.name || "";
          bValue = clients.find(c => c.id === b.clientId)?.name || "";
          break;

        case "businessEntity":
          aValue = a.businessEntityName;
          bValue = b.businessEntityName;
          break;

        case "product":
          aValue = a.product;
          bValue = b.product;
          break;

        case "amount":
          aValue = a.salesAmount;
          bValue = b.salesAmount;
          break;

        case "closingDate":
          aValue = new Date(a.closingDate).getTime();
          bValue = new Date(b.closingDate).getTime();
          break;

        case "kam":
          aValue = kams.find(k => k.id === a.kamId)?.name || "";
          bValue = kams.find(k => k.id === b.kamId)?.name || "";
          break;

        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [sales, sortKey, sortDirection, clients, kams]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="ml-1 opacity-40">↕</span>;
    return <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Sales List</CardTitle>
      </CardHeader>

      <CardContent>
        {/* ================= MOBILE VIEW ================= */}
        <div className="md:hidden space-y-3">
          {sortedSales.map(s => {
            const client = clients.find(c => c.id === s.clientId);
            const kam = kams.find(k => k.id === s.kamId);

            return (
              <div key={s.id} className="p-4 rounded-lg border bg-card">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium">{client?.name || "-"}</p>
                    <p className="text-sm text-muted-foreground">{s.product}</p>
                  </div>
                  <Badge variant="secondary">{s.businessEntityName}</Badge>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Amount: {s.salesAmount}</p>
                  <p>
                    Closing:{" "}
                    {new Date(s.closingDate).toLocaleDateString()}
                  </p>
                  {kam && (
                    <Badge variant="outline" className="text-xs">
                      KAM: {kam.name}
                    </Badge>
                  )}
                </div>

                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}

          {sortedSales.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No sales found
            </p>
          )}
        </div>

        {/* ================= DESKTOP VIEW ================= */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort("client")} className="cursor-pointer">
                  Client <SortIcon column="client" />
                </TableHead>
                <TableHead onClick={() => handleSort("businessEntity")} className="cursor-pointer">
                  Business Entity <SortIcon column="businessEntity" />
                </TableHead>
                <TableHead onClick={() => handleSort("product")} className="cursor-pointer">
                  Product <SortIcon column="product" />
                </TableHead>
                <TableHead onClick={() => handleSort("amount")} className="cursor-pointer">
                  Amount <SortIcon column="amount" />
                </TableHead>
                <TableHead onClick={() => handleSort("closingDate")} className="cursor-pointer">
                  Closing Date <SortIcon column="closingDate" />
                </TableHead>
                <TableHead onClick={() => handleSort("kam")} className="cursor-pointer">
                  KAM <SortIcon column="kam" />
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedSales.map(s => {
                const client = clients.find(c => c.id === s.clientId);
                const kam = kams.find(k => k.id === s.kamId);

                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">
                      {client?.name || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.businessEntityName}</Badge>
                    </TableCell>
                    <TableCell>{s.product}</TableCell>
                    <TableCell>{s.salesAmount}</TableCell>
                    <TableCell>
                      {new Date(s.closingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {kam ? (
                        <Badge variant="outline">{kam.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {sortedSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No sales found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
