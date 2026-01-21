import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { KAM } from "@/data/mockData";

interface KAMTableProps {
  kams: KAM[];
  onEdit: (kam: KAM) => void;
  onDelete: (kamId: string) => void;
}

export function KAMTable({ kams, onEdit, onDelete }: KAMTableProps) {
  const getZoneBadgeVariant = (zone: string) => {
    const variants: Record<string, string> = {
      North: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      South: "bg-green-100 text-green-700 hover:bg-green-100",
      East: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      West: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      Central: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    };
    return variants[zone] || "bg-muted text-muted-foreground";
  };

  if (kams.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 text-center">
        <p className="text-muted-foreground">No KAMs found. Create your first KAM to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-medium">Name</TableHead>
            <TableHead className="font-medium">Contact</TableHead>
            <TableHead className="font-medium hidden md:table-cell">Business Entities</TableHead>
            <TableHead className="font-medium hidden lg:table-cell">Reporting To</TableHead>
            <TableHead className="font-medium">Division</TableHead>
            <TableHead className="font-medium">Zone</TableHead>
            <TableHead className="font-medium text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kams.map((kam, index) => (
            <TableRow
              key={kam.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{kam.name}</p>
                  <p className="text-xs text-muted-foreground">{kam.email}</p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{kam.contact}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                  {kam.businessEntities && kam.businessEntities.length > 0 ? (
                    kam.businessEntities.slice(0, 2).map((entity) => (
                      <Badge key={entity} variant="outline" className="text-xs">
                        {entity.length > 15 ? entity.substring(0, 15) + "..." : entity}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                  {kam.businessEntities && kam.businessEntities.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{kam.businessEntities.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground hidden lg:table-cell">{kam.reportingTo}</TableCell>
              <TableCell>
                <Badge variant="secondary">{kam.division}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getZoneBadgeVariant(kam.zone)}>{kam.zone}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(kam)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete KAM</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {kam.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(kam.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
