'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Props {
  targets: any[];
  onEdit: (t: any) => void;
}

export function TargetsTable({ targets, onEdit }: Props) {
  if (!targets.length) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        No targets found
      </div>
    );
  }

  const getPeriodLabel = (t: any) => {
    if (t.target_type === 'monthly') {
      return format(new Date(t.target_month), 'MMMM yyyy');
    }

    if (t.target_type === 'quarterly') {
      const m = new Date(t.target_month).getMonth();
      const q = Math.floor(m / 3) + 1;
      return `Q${q} ${new Date(t.target_month).getFullYear()}`;
    }

    if (t.target_type === 'yearly') {
      return new Date(t.target_month).getFullYear();
    }

    return '-';
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
         <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>KAM</TableHead>
            <TableHead>Supervisor</TableHead>
            <TableHead>Division</TableHead>
            <TableHead className="text-right">Target Amount</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {targets.map((t, i) => (
            <TableRow key={t.id || i}>
              <TableCell>{getPeriodLabel(t)}</TableCell>
              <TableCell className="capitalize">{t.target_type}</TableCell>
              <TableCell>{t.kam_name || t.kam_id || '—'}</TableCell>
              <TableCell>{t.supervisor_name || t.supervisor_id || '—'}</TableCell>
              <TableCell>{t.division || '—'}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(t.amount)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {t.created_at ? format(new Date(t.created_at), 'dd MMM yyyy') : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onEdit(t)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
