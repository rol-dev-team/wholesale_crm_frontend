// import type { ProposalFilters } from '@/components/filters/Proposalfilterdrawer';

'use client';
import React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PriceProposalHistoryAPI } from '@/api/priceProposalHistoryApi.js';
import { PrismAPI } from '@/api/prismAPI';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppPagination } from '@/components/common/AppPagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';
import type { ProposalFilters } from '@/components/filters/Proposalfilterdrawer';

// ---- proposal data model ----
interface ProposalItem {
  id: number;
  product_id: number;
  product_name?: string;
  current_price: string;
  proposed_price: string;
  unit: string;
  volume: string;
  total_amount: number;
  status?: 'pending' | 'approved' | 'rejected';
  rejected_note?: string;
  suggested_price?: number;
  suggested_volume?: number;
  rejected_by?: number;
  action_by?: number;
  action_by_name?: string;
  current_unit_cost?: string | number;
  current_quantity?: string | number;
  current_total?: string | number;
  rejected_by_user?: { id: number; name: string };
}

interface Proposal {
  id: number;
  client_id: number;
  client_name?: string;
  kam_name?: string;
  kam_id?: number | string;
  status: 'pending' | 'approved' | 'rejected';
  rejected_note?: string;
  created_by: number;
  current_owner_id: number;
  action_by_name: string;
  created_by_user?: { id: number; name: string; role: string };
  current_owner?: { id: number; name: string };
  branch_id?: number | string;
  supervisor_id?: number | string;
  items: ProposalItem[];
}

interface OrderProposalListHistoryProps {
  filters?: ProposalFilters;
}

export default function OrderProposalListHistory({ filters }: OrderProposalListHistoryProps) {
  const { currentUser, hasPermission } = useAuth();
  const userInfo = getUserInfo();

  const [approvalPipeline, setApprovalPipeline] = useState([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Record<number, string>>({});

  const ITEMS_PER_PAGE = 4;
  const lastPayloadRef = React.useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProposals(page);
  };

  const [rejectingItem, setRejectingItem] = useState<{
    proposal: Proposal;
    item: ProposalItem;
  } | null>(null);

  const [rejectData, setRejectData] = useState({
    status: 'rejected',
    rejected_note: '',
    suggested_price: '',
    suggested_volume: '',
  });

  const [revisingItem, setRevisingItem] = useState(null);
  const [reviseData, setReviseData] = useState({
    proposed_price: '',
    unit: '',
    volume: '',
    proposed_amount: '',
  });

  /* ── Fetch approved + rejected proposals in parallel ──────────── */
  const fetchProposals = async (page = 1) => {
    const basePayload: any = { page, per_page: ITEMS_PER_PAGE };
    if (filters) {
      if (filters.kam && filters.kam !== 'all') basePayload.kam_id = filters.kam;
      if (filters.division && filters.division !== 'all') basePayload.branch_id = filters.division;
      if (filters.supervisor && filters.supervisor !== 'all')
        basePayload.supervisor_id = filters.supervisor;
      if (filters.client && filters.client !== 'all') basePayload.client_id = filters.client;
      if (filters.product && filters.product !== 'all') basePayload.product_id = filters.product;
    }

    const payloadApproved = { ...basePayload, status: 'approved' };
    const payloadRejected = { ...basePayload, status: 'rejected' };
    lastPayloadRef.current = { ...basePayload, page };

    setLoading(true);
    try {
      const [approvedRes, rejectedRes] = await Promise.all([
        PriceProposalHistoryAPI.getAll(payloadApproved),
        PriceProposalHistoryAPI.getAll(payloadRejected),
      ]);

      // ✅ axios wraps response in .data, then your API has its own .data array
      const approvedData = approvedRes?.data?.data ?? approvedRes?.data ?? [];
      const rejectedData = rejectedRes?.data?.data ?? rejectedRes?.data ?? [];

      // console.log('API Response Debug:', {
      //   approvedRes: approvedRes?.data,
      //   rejectedRes: rejectedRes?.data,
      //   approvedDataLength: approvedData.length,
      //   rejectedDataLength: rejectedData.length
      // });

      const combined = [...approvedData, ...rejectedData];
      setProposals(combined);

      // ✅ user_level_info is also nested under .data
      setApprovalPipeline(
        approvedRes?.data?.user_level_info || rejectedRes?.data?.user_level_info || []
      );

      setCurrentPage(page);

      const approvedTotal =
        approvedRes?.data?.meta?.total || approvedRes?.data?.total || approvedData.length || 0;
      const rejectedTotal =
        rejectedRes?.data?.meta?.total || rejectedRes?.data?.total || rejectedData.length || 0;
      const combinedTotal = approvedTotal + rejectedTotal;
      const combinedLastPage = Math.ceil(combinedTotal / ITEMS_PER_PAGE) || 1;
      setTotalPages(combinedLastPage);
      setTotalItems(combinedTotal);

      // console.log('Pagination Debug:', {
      //   approvedTotal,
      //   rejectedTotal,
      //   combinedTotal,
      //   ITEMS_PER_PAGE,
      //   combinedLastPage,
      //   currentPage: page
      // });
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(1);
  }, []);

  // when filters change, reset to first page and re-fetch
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    fetchProposals(1);
  }, [filters]);

  /* ── Frontend filtering ────────────────────────────────────────── */
  const filteredProposals = useMemo(() => {
    if (!filters) return proposals;

    return proposals.filter((p) => {
      if (filters.kam && filters.kam !== 'all') {
        const allowedIds = filters.kam.split(',').map((id) => String(id).trim());
        if (!allowedIds.includes(String(p.kam_id ?? ''))) return false;
      }
      if (filters.division && filters.division !== 'all') {
        if (String(p.branch_id ?? '') !== String(filters.division)) return false;
      }
      if (filters.supervisor && filters.supervisor !== 'all') {
        if (String(p.supervisor_id ?? '') !== String(filters.supervisor)) return false;
      }
      // ✅ product_id is on items[], not on the proposal
      if (filters.product && filters.product !== 'all') {
        const hasProduct = p.items.some(
          (item) => String(item.product_id) === String(filters.product)
        );
        if (!hasProduct) return false;
      }
      return true;
    });
  }, [proposals, filters]);

  /* ── Actions ─────────────────────────────────────────────────── */
  const handleRejectClick = (proposal: Proposal, item: ProposalItem) => {
    setRejectingItem({ proposal, item });
    setRejectData({
      status: 'rejected',
      rejected_note: '',
      suggested_price: item.proposed_price,
      suggested_volume: item.volume,
    });
  };

  const submitReject = async () => {
    if (!rejectingItem) return;
    if (!rejectData.rejected_note.trim()) {
      alert('Rejection reason is required');
      return;
    }
    try {
      const payload = {
        status: rejectData.status,
        rejected_note: rejectData.rejected_note,
        suggested_price: rejectData.suggested_price
          ? Number(rejectData.suggested_price)
          : undefined,
        suggested_volume: rejectData.suggested_volume
          ? Number(rejectData.suggested_volume)
          : undefined,
      };
      await PriceProposalHistoryAPI.rejectItem(rejectingItem.item.id, payload);
      setRejectingItem(null);
      setRejectData({
        status: 'rejected',
        rejected_note: '',
        suggested_price: '',
        suggested_volume: '',
      });
      fetchProposals(lastPayloadRef.current?.page || 1);
    } catch (error: any) {
      console.error('Rejection failed:', error);
      alert(error.response?.data?.message || 'Failed to reject item');
    }
  };

  const handleReviseClick = (item: ProposalItem) => {
    setRevisingItem(item);
    setReviseData({
      proposed_price: item.proposed_price,
      unit: item.unit,
      volume: item.volume,
      proposed_amount: item.total_amount.toString(),
    });
  };

  const submitRevise = async () => {
    if (!revisingItem) return;
    try {
      await PriceProposalHistoryAPI.reviseItem(revisingItem.id, {
        proposed_price: Number(reviseData.proposed_price),
        unit: reviseData.unit,
        volume: Number(reviseData.volume),
        proposed_amount: Number(reviseData.proposed_amount),
      });
      setRevisingItem(null);
      fetchProposals(lastPayloadRef.current?.page || 1);
    } catch (err) {
      console.error('Failed to revise proposal:', err);
      alert('Failed to revise proposal');
    }
  };

  /* ── Helpers ─────────────────────────────────────────────────── */
  const getItemStatusBadge = (status?: string) => {
    if (status === 'approved')
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    if (status === 'rejected')
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    return null;
  };

  const currentLevelPrint = (itemLevel: number) => {
    const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
    if (!step) return <span className="text-gray-400">N/A</span>;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        {`L-${step.level_id} (${step.fullname})`}
      </span>
    );
  };

  const formatPrice = (v?: string | number) => {
    if (v == null) return 'N/A';
    const n = Number(v);
    return isNaN(n) ? 'N/A' : n.toFixed(2);
  };

  const formatQuantity = (v?: string | number) => {
    if (v == null) return 'N/A';
    const n = Number(v);
    return isNaN(n) ? 'N/A' : n.toLocaleString();
  };

  const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
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

  const hasActiveFilters =
    !!filters &&
    ((filters.kam && filters.kam !== 'all') ||
      (filters.division && filters.division !== 'all') ||
      (filters.supervisor && filters.supervisor !== 'all'));

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Approval pipeline display */}
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

      {/* Active filter summary */}
      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filteredProposals.length}</span>{' '}
          of <span className="font-semibold text-foreground">{proposals.length}</span> proposals
        </p>
      )}

      {/* Server-side counts */}
      {!loading && totalItems > 0 && (
        <p className="text-sm text-muted-foreground">
          Server total: <span className="font-semibold text-foreground">{totalItems}</span>{' '}
          proposals <span className="mx-2">|</span> Page{' '}
          <span className="font-semibold">{currentPage}</span> of{' '}
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
                  <TableHead>Item Status</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead>Action By</TableHead>
                  <TableHead>Rejection Note</TableHead>
                  <TableHead>Suggested Price</TableHead>
                  <TableHead>Suggested Volume</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredProposals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={18} className="text-center py-8 text-gray-500">
                      {hasActiveFilters
                        ? 'No proposals match the selected filters'
                        : 'No proposals found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProposals.map((p) =>
                    p.items.map((item, idx) => (
                      <TableRow
                        key={`${p.id}-${item.id}`}
                        className={
                          item.status === 'approved'
                            ? 'bg-green-50/40'
                            : item.status === 'rejected'
                              ? 'bg-red-50/40'
                              : ''
                        }
                      >
                        {idx === 0 && (
                          <>
                            <TableCell rowSpan={p.items.length}>
                              {p.kam_name || p.created_by_user?.name || 'N/A'}
                            </TableCell>
                            <TableCell rowSpan={p.items.length}>
                              {p.client_name || clients[p.client_id] || `Client #${p.client_id}`}
                            </TableCell>
                          </>
                        )}
                        <TableCell>{item.product_name || `Product #${item.product_id}`}</TableCell>
                        <TableCell>{item.current_price}</TableCell>
                        <TableCell>
                          {item.proposed_price}/{item.unit}
                        </TableCell>
                        <TableCell>{item.volume}</TableCell>
                        <TableCell className="font-semibold">
                          {item.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(item.current_unit_cost)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatQuantity(item.current_quantity)}
                        </TableCell>
                        <TableCell className="font-medium text-blue-600">
                          {formatPrice(item.current_total)}
                        </TableCell>
                        <TableCell>
                          {renderInvoiceDifference(item.total_amount, item.current_total)}
                        </TableCell>
                        <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                        <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
                        <TableCell>{item.effective_date}</TableCell>
                        {/* Rejection columns — always visible */}
                        <TableCell>{item.action_by_name || 'N/A'}</TableCell>
                        <TableCell>{item.rejected_note || 'N/A'}</TableCell>
                        <TableCell>
                          {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {item.suggested_volume ? `${item.suggested_volume}/${item.unit}` : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  )
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination controls */}
          {/* <div className="bg-yellow-100 p-4 my-4 rounded border">
            DEBUG: currentPage={currentPage}, totalPages={totalPages}, totalItems={totalItems}, proposals={proposals.length}
          </div> */}
          <AppPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems || proposals.length}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Rejecting:{' '}
              <strong>
                {rejectingItem?.item.product_name || `Product #${rejectingItem?.item.product_id}`}
              </strong>
            </p>
            <FloatingInput
              label="Rejection Reason *"
              value={rejectData.rejected_note}
              onChange={(e) => setRejectData((p) => ({ ...p, rejected_note: e.target.value }))}
            />
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Recommended Price"
                  type="number"
                  step="0.01"
                  value={rejectData.suggested_price}
                  onChange={(e) =>
                    setRejectData((p) => ({ ...p, suggested_price: e.target.value }))
                  }
                />
                <FloatingInput
                  label="Recommended Volume"
                  type="number"
                  value={rejectData.suggested_volume}
                  onChange={(e) =>
                    setRejectData((p) => ({ ...p, suggested_volume: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setRejectingItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={submitReject}>
              Confirm Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Revise Dialog */}
      <Dialog open={!!revisingItem} onOpenChange={() => setRevisingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revise Proposal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <FloatingInput
              label="Proposed Price"
              type="number"
              value={reviseData.proposed_price}
              onChange={(e) => setReviseData((p) => ({ ...p, proposed_price: e.target.value }))}
            />
            <select
              className="w-full border rounded-md px-3 py-2"
              value={reviseData.unit}
              onChange={(e) => setReviseData((p) => ({ ...p, unit: e.target.value }))}
            >
              <option value="">Select Unit</option>
              <option value="MB">MB</option>
              <option value="GB">GB</option>
              <option value="Quantity">Quantity</option>
            </select>
            <FloatingInput
              label="Volume"
              type="number"
              value={reviseData.volume}
              onChange={(e) => setReviseData((p) => ({ ...p, volume: e.target.value }))}
            />
            <FloatingInput
              label="Proposed Amount"
              type="number"
              value={reviseData.proposed_amount}
              onChange={(e) => setReviseData((p) => ({ ...p, proposed_amount: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setRevisingItem(null)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={submitRevise}>
              Submit Revision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
