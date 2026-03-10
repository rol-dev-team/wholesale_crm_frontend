'use client';
import React from 'react';
import { useMemo, useState, useEffect } from 'react';
import { PriceProposalHistoryAPI } from '@/api/priceProposalHistoryApi.js';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppPagination } from '@/components/common/AppPagination';
import { useAuth } from '@/contexts/AuthContext';
import { getUserInfo } from '@/utility/utility';
import type { ProposalFilters } from '@/components/filters/Proposalfilterdrawer';

// ─────────────────────────────────────────────────────────────────────────────
// Data model — flat row (no items[] nesting, each history row is one record)
// ─────────────────────────────────────────────────────────────────────────────
interface HistoryRow {
  history_id: number;
  price_proposal_item_id: number;
  price_proposal_id: number;

  client_id: number;
  client_name: string;
  kam_id: number | string;
  kam_name: string;
  created_by: number;
  created_by_name: string;

  product_id: number;
  product_name: string;
  current_price: string;
  proposed_price: string;
  unit: string;
  volume: string;
  total_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'erp';
  rejected_note?: string;
  suggested_price?: number;
  suggested_volume?: number;
  action_by?: number;
  action_by_name?: string;
  current_unit_cost?: string | number;
  current_quantity?: string | number;
  current_total?: string | number;
  current_level?: number;
  effective_date?: string;
  created_at?: string;
}

interface OrderProposalListHistoryProps {
  filters?: ProposalFilters;
}

export default function OrderProposalListHistory({ filters }: OrderProposalListHistoryProps) {
  const userInfo = getUserInfo();

  const [approvalPipeline, setApprovalPipeline] = useState<any[]>([]);
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);

  const ITEMS_PER_PAGE = 15;
  const lastPayloadRef = React.useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // ─────────────────────────────────────────────
  // FETCH — single request, all statuses, flat rows
  // ─────────────────────────────────────────────
  const fetchHistory = async (page = 1) => {
    const payload: any = { page, per_page: ITEMS_PER_PAGE };

    if (filters) {
      if (filters.kam && filters.kam !== 'all') payload.kam_id = filters.kam;
      if (filters.division && filters.division !== 'all') payload.branch_id = filters.division;
      if (filters.supervisor && filters.supervisor !== 'all')
        payload.supervisor_id = filters.supervisor;
      if (filters.client && filters.client !== 'all') payload.client_id = filters.client;
      if (filters.product && filters.product !== 'all') payload.product_id = filters.product;
    }

    lastPayloadRef.current = payload;
    setLoading(true);

    try {
      const res = await PriceProposalHistoryAPI.getAll(payload);

      // Backend now returns a flat array of rows under .data
      const data: HistoryRow[] = res?.data?.data ?? res?.data ?? [];
      setRows(data);
      setApprovalPipeline(res?.data?.user_level_info || []);
      setCurrentPage(res?.data?.meta?.current_page || page);
      setTotalPages(res?.data?.meta?.last_page || 1);
      setTotalItems(res?.data?.meta?.total || data.length || 0);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1);
  }, [filters]);

  // ─────────────────────────────────────────────
  // Frontend filtering (for client-side filter fields)
  // ─────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (!filters) return rows;
    return rows.filter((r) => {
      if (filters.kam && filters.kam !== 'all') {
        const ids = filters.kam.split(',').map((id) => String(id).trim());
        if (!ids.includes(String(r.kam_id ?? ''))) return false;
      }
      if (filters.product && filters.product !== 'all') {
        if (String(r.product_id) !== String(filters.product)) return false;
      }
      return true;
    });
  }, [rows, filters]);

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const getStatusBadge = (status?: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
      erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
      pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
    };
    const cfg = map[status ?? ''];
    if (!cfg) return null;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
    );
  };

  const currentLevelPrint = (itemLevel?: number) => {
    const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
    if (!step) return <span className="text-gray-400">N/A</span>;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        {`L-${step.level_id} (${step.fullname})`}
      </span>
    );
  };

  const fmt = (v?: string | number) => {
    if (v == null) return 'N/A';
    const n = Number(v);
    return isNaN(n) ? 'N/A' : n.toFixed(2);
  };

  const fmtQty = (v?: string | number) => {
    if (v == null) return 'N/A';
    const n = Number(v);
    return isNaN(n) ? 'N/A' : n.toLocaleString();
  };

  const invoiceDiff = (totalAmount?: number, currentTotal?: string | number) => {
    if (totalAmount == null || currentTotal == null)
      return <span className="text-gray-400">N/A</span>;
    const diff = Number(totalAmount) - Number(currentTotal);
    if (isNaN(diff)) return <span className="text-gray-400">N/A</span>;
    return (
      <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff >= 0 ? '+' : ''}
        {diff.toFixed(2)}
      </span>
    );
  };

  const rowBg = (status?: string) => {
    if (status === 'approved') return 'bg-green-50/40';
    if (status === 'rejected') return 'bg-red-50/40';
    if (status === 'erp') return 'bg-purple-50/40';
    return '';
  };

  const hasActiveFilters =
    !!filters &&
    ((filters.kam && filters.kam !== 'all') ||
      (filters.division && filters.division !== 'all') ||
      (filters.supervisor && filters.supervisor !== 'all'));

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Approval pipeline */}
      {approvalPipeline.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {approvalPipeline.map((step: any, index: number) => (
            <React.Fragment key={`${step.level_id}-${step.user_id}`}>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {step.fullname?.charAt(0).toUpperCase() + step.fullname?.slice(1)}
              </span>
              {index < approvalPipeline.length - 1 && <span className="text-gray-400">→</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Filter summary */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredRows.length}</span> of{' '}
          <span className="font-semibold text-foreground">{rows.length}</span> records
        </p>
      )}

      {/* Total count */}
      {!loading && totalItems > 0 && (
        <p className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{totalItems}</span> records
          <span className="mx-2">|</span>
          Page <span className="font-semibold">{currentPage}</span> of{' '}
          <span className="font-semibold">{totalPages}</span>
        </p>
      )}

      {/* TABLE */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="border rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>KAM</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Rate</TableHead>
                  <TableHead>Proposed Unit Price</TableHead>
                  <TableHead>Proposed Volume</TableHead>
                  <TableHead>Proposed Amount</TableHead>
                  <TableHead>Current Unit Cost</TableHead>
                  <TableHead>Current Quantity</TableHead>
                  <TableHead>Current Invoice</TableHead>
                  <TableHead>Invoice Difference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Action By</TableHead>
                  <TableHead>Rejection Note</TableHead>
                  <TableHead>Suggested Price</TableHead>
                  <TableHead>Suggested Volume</TableHead>
                  <TableHead>Recorded At</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={20} className="text-center py-8 text-gray-500">
                      {hasActiveFilters
                        ? 'No records match the selected filters'
                        : 'No history found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((row, index) => (
                    <TableRow key={row.history_id} className={rowBg(row.status)}>
                      <TableCell className="text-gray-400 text-xs">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </TableCell>
                      <TableCell>{row.kam_name}</TableCell>
                      <TableCell>{row.client_name}</TableCell>
                      <TableCell>{row.product_name}</TableCell>
                      <TableCell>{row.current_price}</TableCell>
                      <TableCell>
                        {row.proposed_price}/{row.unit}
                      </TableCell>
                      <TableCell>{row.volume}</TableCell>
                      <TableCell className="font-semibold">
                        {Number(row.total_amount).toLocaleString()}
                      </TableCell>
                      <TableCell>{fmt(row.current_unit_cost)}</TableCell>
                      <TableCell>{fmtQty(row.current_quantity)}</TableCell>
                      <TableCell className="text-blue-600">{fmt(row.current_total)}</TableCell>
                      <TableCell>{invoiceDiff(row.total_amount, row.current_total)}</TableCell>
                      <TableCell>{getStatusBadge(row.status)}</TableCell>
                      <TableCell>{currentLevelPrint(row.current_level)}</TableCell>
                      <TableCell>{row.effective_date ?? 'N/A'}</TableCell>
                      <TableCell>{row.action_by_name ?? 'N/A'}</TableCell>
                      <TableCell>{row.rejected_note ?? 'N/A'}</TableCell>
                      <TableCell>
                        {row.suggested_price ? `${row.suggested_price}/${row.unit}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {row.suggested_volume ? `${row.suggested_volume}/${row.unit}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems || rows.length}
            onPageChange={(page) => {
              if (page < 1 || page > totalPages) return;
              fetchHistory(page);
            }}
          />
        </>
      )}
    </div>
  );
}
