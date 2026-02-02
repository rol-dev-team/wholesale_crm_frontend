// TargetsTable.tsx
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
import { AppPagination } from '@/components/common/AppPagination';

interface Props {
  targets: any[]; // current page data
  onEdit: (t: any) => void;
  currentPage: number; // controlled by parent
  totalPages: number; // total pages
  onPageChange: (page: number) => void; // callback to parent
}

export function TargetsTable({ targets, onEdit }: Props) {
  const getPeriodLabel = (t: any) => {
    if (!t?.target_month) return '-';
    const date = new Date(t.target_month);

    if (t.target_type === 'monthly') return format(date, 'MMMM yyyy');
    if (t.target_type === 'quarterly') {
      const q = Math.floor(date.getMonth() / 3) + 1;
      return `Q${q} ${date.getFullYear()}`;
    }
    if (t.target_type === 'yearly') return date.getFullYear();

    return '-';
  };

  console.log('Rendered TargetsTable', targets);
  return (
    <div className="flex flex-col gap-4">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10 border-b">
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
              <TableRow key={t.id || i} className="h-12">
                <TableCell>{getPeriodLabel(t)}</TableCell>
                <TableCell className="capitalize">{t.target_type}</TableCell>
                <TableCell>{t.kam_name || t.kam_id || '—'}</TableCell>
                <TableCell>{t.supervisor_name || t.supervisor_id || '—'}</TableCell>
                <TableCell>{t.division || '—'}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(t.amount)}</TableCell>
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
    </div>
  );
}
