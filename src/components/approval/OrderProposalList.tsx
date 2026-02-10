// 'use client';
// import React from 'react';
// import { useMemo, useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { PrismAPI } from '@/api/prismAPI';

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { useAuth } from '@/contexts/AuthContext';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

// // ---- proposal data model ----
// interface ProposalItem {
//   id: number;
//   product_id: number;
//   product_name?: string;
//   current_price: string;
//   proposed_price: string;
//   unit: string;
//   volume: string;
//   total_amount: number;
//   status?: 'pending' | 'approved' | 'rejected';
//   rejected_note?: string;
//   suggested_price?: number;
//   suggested_volume?: number;
//   rejected_by?: number;
//   action_by?: number;
//   action_by_name?: string;
//   rejected_by_user?: {
//     id: number;
//     name: string;
//   };
// }

// interface Proposal {
//   id: number;
//   client_id: number;
//   client_name?: string; // This will be populated from PRISM API
//   kam_name?: string;
//   status: 'pending' | 'approved' | 'rejected';
//   rejected_note?: string;
//   created_by: number;
//   current_owner_id: number;
//   action_by_name: string;
//   created_by_user?: {
//     id: number;
//     name: string;
//     role: string;
//   };
//   current_owner?: {
//     id: number;
//     name: string;
//   };

//   items: ProposalItem[];
// }

// export default function OrderProposalList() {
//   const { currentUser, hasPermission } = useAuth();
//   const userInfo = getUserInfo();

//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({}); // Cache for client names

//   // pagination states
//   const ITEMS_PER_PAGE = 10;
//   const lastPayloadRef = React.useRef<any>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [rejectingItem, setRejectingItem] = useState<{
//     proposal: Proposal;
//     item: ProposalItem;
//   } | null>(null);

//   const [rejectData, setRejectData] = useState({
//     rejected_note: '',
//     suggested_price: '',
//     suggested_volume: '',
//   });

//   //count
//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//   });

//   const fetchProposals = async (payload: any) => {
//     lastPayloadRef.current = payload;
//     setLoading(true);

//     try {
//       const res = await PriceProposalAPI.getAll(payload);
//       setProposals(res.data || []);
//       console.log('Fetched proposals:', res);
//       setCurrentPage(res?.meta?.current_page || 1);
//       setTotalPages(res?.meta?.last_page || 1);
//     } catch (error) {
//       console.error('Failed to fetch proposals:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProposals({
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     });
//   }, [filter]);

//   const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm(`Are you sure you want to approve this item?`)) {
//       return;
//     }

//     try {
//       await PriceProposalAPI.approveItem(proposal.id, item.id);
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Approval failed:', error);
//     }
//   };

//   const handleRejectClick = (proposal: Proposal, item: ProposalItem) => {
//     setRejectingItem({ proposal, item });
//     setRejectData({
//       rejected_note: '',
//       suggested_price: item.proposed_price,
//       suggested_volume: item.volume,
//     });
//   };

//   const submitReject = async () => {
//     if (!rejectingItem) return;

//     if (!rejectData.rejected_note.trim()) {
//       alert('Rejection reason is required');
//       return;
//     }

//     try {
//       const payload = {
//         rejected_note: rejectData.rejected_note,
//         suggested_price: rejectData.suggested_price
//           ? Number(rejectData.suggested_price)
//           : undefined,
//         suggested_volume: rejectData.suggested_volume
//           ? Number(rejectData.suggested_volume)
//           : undefined,
//       };

//       await PriceProposalAPI.rejectItem(
//         rejectingItem.proposal.id,
//         rejectingItem.item.id,
//         // currentUser.id,
//         payload
//       );

//       setRejectingItem(null);
//       setRejectData({
//         rejected_note: '',
//         suggested_price: '',
//         suggested_volume: '',
//       });

//       fetchProposals();
//       fetchItemCounts();
//     } catch (error: any) {
//       console.error('Rejection failed:', error);
//       alert(error.response?.data?.message || 'Failed to reject item');
//     }
//   };

//   const canApproveOrReject = (proposal: Proposal) => {
//     const user = getUserInfo();
//     if (!user) return false;

//     const hasApprovalRole = isSupervisor() || isSuperAdmin() || isManagement();

//     return hasApprovalRole;
//   };

//   const getItemStatusBadge = (status?: string) => {
//     if (!status || status === 'pending') {
//       return (
//         <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
//           Pending
//         </span>
//       );
//     }
//     if (status === 'approved') {
//       return (
//         <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
//           Approved
//         </span>
//       );
//     }
//     if (status === 'rejected') {
//       return (
//         <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
//           Rejected
//         </span>
//       );
//     }
//     return null;
//   };

//   if (!currentUser) return null;
//   const currentLevel = 2; // 1 | 2 | 3

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center justify-between">
//         {/* STATUS TOGGLE */}
//         <div className="flex gap-2">
//           {(['pending', 'approved', 'rejected'] as const).map((s) => (
//             <Button
//               key={s}
//               onClick={() => setFilter(s)}
//               className={`
//     relative overflow-visible
//     rounded-md px-4 py-1
//     ${
//       filter === s
//         ? s === 'pending'
//           ? 'bg-yellow-400 text-white hover:bg-yellow-500'
//           : s === 'approved'
//             ? 'bg-green-500 text-white hover:bg-green-600'
//             : 'bg-red-500 text-white hover:bg-red-600'
//         : s === 'pending'
//           ? 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100'
//           : s === 'approved'
//             ? 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100'
//             : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100'
//     }
//   `}
//             >
//               {s.charAt(0).toUpperCase() + s.slice(1)}

//               {/* COUNT BADGE */}
//               {statusCounts[s] > 0 && (
//                 <span
//                   className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
//         flex items-center justify-center rounded-full text-xs font-bold text-white
//         ${s === 'pending' ? 'bg-yellow-400' : s === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}
//                 >
//                   {statusCounts[s]}
//                 </span>
//               )}
//             </Button>
//           ))}
//         </div>

//         {/* STATIC PIPELINE */}
//         {/* <div className="flex items-center gap-2">
//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             Default Supervisor
//           </span>

//           <span className="text-gray-400">→</span>

//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             HOD
//           </span>

//           <span className="text-gray-400">→</span>

//           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             Chairman
//           </span>
//         </div> */}
//       </div>

//       {loading ? (
//         <div className="text-center py-8">Loading...</div>
//       ) : (
//         <div className="border rounded-xl overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>KAM</TableHead>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Current Rate</TableHead>
//                 <TableHead>Proposed Unit Price</TableHead>
//                 <TableHead>Proposed Volume</TableHead>
//                 <TableHead>Total Amount</TableHead>
//                 <TableHead>Item Status</TableHead>

//                 {filter === 'pending' && <TableHead>Pending Under</TableHead>}
//                 {filter === 'rejected' && <TableHead>Rejected By</TableHead>}
//                 {filter === 'rejected' && <TableHead>Rejection Note</TableHead>}
//                 {filter === 'rejected' && <TableHead>Suggested Price</TableHead>}
//                 {filter === 'rejected' && <TableHead>Suggested Volume</TableHead>}

//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {proposals.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={12} className="text-center py-8 text-gray-500">
//                     No proposals found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 proposals.map((p) =>
//                   p.items.map((item, idx) => (
//                     <TableRow key={`${p.id}-${item.id}`}>
//                       {idx === 0 && (
//                         <>
//                           <TableCell rowSpan={p.items.length}>
//                             {p.kam_name || p.created_by_user?.name || 'N/A'}
//                           </TableCell>
//                           <TableCell rowSpan={p.items.length}>
//                             {p.client_name || clients[p.client_id] || `Client #${p.client_id}`}
//                           </TableCell>
//                         </>
//                       )}

//                       <TableCell>{item.product_name || `Product #${item.product_id}`}</TableCell>
//                       <TableCell>{item.current_price}</TableCell>
//                       <TableCell>
//                         {item.proposed_price}/{item.unit}
//                       </TableCell>
//                       <TableCell>{item.volume}</TableCell>
//                       <TableCell className="font-semibold">
//                         {item.total_amount.toLocaleString()}
//                       </TableCell>
//                       <TableCell>{getItemStatusBadge(item.status)}</TableCell>

//                       {idx === 0 && filter === 'pending' && (
//                         <TableCell rowSpan={p.items.length}>
//                           {item.action_by_name || 'N/A'}
//                         </TableCell>
//                       )}

//                       {filter === 'rejected' && (
//                         <>
//                           <TableCell>{item.rejected_by_user?.name || 'N/A'}</TableCell>
//                           <TableCell>{item.rejected_note || 'N/A'}</TableCell>
//                           <TableCell>
//                             {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
//                           </TableCell>
//                           <TableCell>
//                             {item.suggested_volume
//                               ? `${item.suggested_volume}/${item.unit}`
//                               : 'N/A'}
//                           </TableCell>
//                         </>
//                       )}

//                       <TableCell>
//                         <div className="flex gap-2">
//                           {canApproveOrReject(p) && (!item.status || item.status === 'pending') && (
//                             <>
//                               <Button size="sm" onClick={() => handleApproveItem(p, item)}>
//                                 Approve
//                               </Button>
//                               <Button
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => handleRejectClick(p, item)}
//                               >
//                                 Reject
//                               </Button>
//                             </>
//                           )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )
//               )}
//             </TableBody>
//           </Table>
//         </div>
//       )}

//       {/* Reject Item Dialog */}
//       <Dialog open={!!rejectingItem} onOpenChange={() => setRejectingItem(null)}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Reject Item</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <p className="text-sm text-gray-600">
//               Rejecting:{' '}
//               <strong>
//                 {rejectingItem?.item.product_name || `Product #${rejectingItem?.item.product_id}`}
//               </strong>
//             </p>

//             <FloatingInput
//               label="Rejection Reason *"
//               value={rejectData.rejected_note}
//               onChange={(e) =>
//                 setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))
//               }
//             />

//             <div className="border-t pt-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <FloatingInput
//                   label="Recommended Price"
//                   type="number"
//                   step="0.01"
//                   value={rejectData.suggested_price}
//                   onChange={(e) =>
//                     setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))
//                   }
//                 />

//                 <FloatingInput
//                   label="Recommended Volume"
//                   type="number"
//                   value={rejectData.suggested_volume}
//                   onChange={(e) =>
//                     setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="flex gap-2 mt-4">
//             <Button variant="outline" className="flex-1" onClick={() => setRejectingItem(null)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" className="flex-1" onClick={submitReject}>
//               Confirm Reject
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

'use client';
import React from 'react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { PriceProposalAPI } from '@/api/priceProposalApi.js';
import { PrismAPI } from '@/api/prismAPI';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

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
  rejected_by_user?: {
    id: number;
    name: string;
  };
}

interface Proposal {
  id: number;
  client_id: number;
  client_name?: string; // This will be populated from PRISM API
  kam_name?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejected_note?: string;
  created_by: number;
  current_owner_id: number;
  action_by_name: string;
  created_by_user?: {
    id: number;
    name: string;
    role: string;
  };
  current_owner?: {
    id: number;
    name: string;
  };

  items: ProposalItem[];
}

export default function OrderProposalList() {
  const { currentUser, hasPermission } = useAuth();
  const userInfo = getUserInfo();

  const [approvalPipeline, setApprovalPipeline] = useState([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Record<number, string>>({}); // Cache for client names

  // pagination states
  const ITEMS_PER_PAGE = 10;
  const lastPayloadRef = React.useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  //count
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchProposals = async (payload: any) => {
    lastPayloadRef.current = payload;
    setLoading(true);

    try {
      const res = await PriceProposalAPI.getAll(payload);
      setProposals(res.data || []);
      setApprovalPipeline(res.user_level_info || []);
      console.log('Fetched proposals:', res);
      setCurrentPage(res?.meta?.current_page || 1);
      setTotalPages(res?.meta?.last_page || 1);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals({
      page: 1,
      per_page: ITEMS_PER_PAGE,
      status: filter,
    });
  }, [filter]);

  const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
    if (!confirm(`Are you sure you want to approve this item?`)) {
      return;
    }

    if (item.status === 'approved') {
      alert('This item is already approved.');
      return;
    }

    try {
      await PriceProposalAPI.approveItem(item.id, item);
      fetchProposals(lastPayloadRef.current);
    } catch (error) {
      console.error('Failed to approve item:', error);
    }
  };

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

      await PriceProposalAPI.rejectItem(rejectingItem.item.id, payload);

      setRejectingItem(null);
      setRejectData({
        status: 'rejected',
        rejected_note: '',
        suggested_price: '',
        suggested_volume: '',
      });

      fetchProposals(lastPayloadRef.current);
    } catch (error: any) {
      console.error('Rejection failed:', error);
      alert(error.response?.data?.message || 'Failed to reject item');
    }
  };

  // Revise
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
      await PriceProposalAPI.reviseItem(revisingItem.id, {
        proposed_price: Number(reviseData.proposed_price),
        unit: reviseData.unit,
        volume: Number(reviseData.volume),
        proposed_amount: Number(reviseData.proposed_amount),
      });

      setRevisingItem(null);
      fetchProposals(lastPayloadRef.current);
    } catch (err) {
      console.error('Failed to revise proposal:', err);
      alert('Failed to revise proposal');
    }
  };

  const canApproveOrReject = (item: Proposal) => {
    const user = getUserInfo();
    if (!user) return false;

    if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) {
      return false;
    }

    const isDirectApprover = approvalPipeline.some(
      (step: any) =>
        Number(step.user_id) === Number(user.id) &&
        Number(step.level_id) === Number(item.current_level)
    );

    const hasSupervisorFallback = approvalPipeline.some(
      (step: any) =>
        Number(step.user_id) === 9001 && Number(step.level_id) === Number(item.current_level)
    );

    return isDirectApprover || (hasSupervisorFallback && isSupervisor());
  };

  const currentLevelPrint = (itemLevel: number) => {
    const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));

    if (!step) {
      return <span className="text-gray-400">N/A</span>;
    }

    return (
      <span
        className="inline-flex items-center px-2 py-0.5 rounded-full
                 text-xs font-semibold bg-blue-100 text-blue-800"
      >
        {`L-${step.level_id} (${step.fullname})`}
      </span>
    );
  };

  const getItemStatusBadge = (status?: string) => {
    if (!status || status === 'pending') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending
        </span>
      );
    }
    if (status === 'approved') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Approved
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Rejected
        </span>
      );
    }
    return null;
  };

  const formatPrice = (value?: string | number) => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'N/A' : num.toFixed(2);
  };

  const formatQuantity = (value?: string | number) => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? 'N/A' : num.toLocaleString();
  };

  const getInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
    if (totalAmount === undefined || currentTotal === undefined || currentTotal === null) {
      return null;
    }

    const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
    const current =
      typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));

    if (isNaN(total) || isNaN(current)) {
      return null;
    }

    return total - current;
  };

  const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
    const difference = getInvoiceDifference(totalAmount, currentTotal);

    if (difference === null) {
      return <span className="text-gray-400">N/A</span>;
    }

    const isPositive = difference >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <span className={`font-semibold ${color}`}>
        {isPositive ? '+' : ''}
        {difference.toFixed(2)}
      </span>
    );
  };

  console.log('Approval Pipeline:', approvalPipeline);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* STATUS TOGGLE */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <Button
              key={s}
              onClick={() => setFilter(s)}
              className={`
    relative overflow-visible
    rounded-md px-4 py-1
    ${
      filter === s
        ? s === 'pending'
          ? 'bg-yellow-400 text-white hover:bg-yellow-500'
          : s === 'approved'
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-red-500 text-white hover:bg-red-600'
        : s === 'pending'
          ? 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100'
          : s === 'approved'
            ? 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100'
    }
  `}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}

              {/* COUNT BADGE */}
              {statusCounts[s] > 0 && (
                <span
                  className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
        flex items-center justify-center rounded-full text-xs font-bold text-white
        ${s === 'pending' ? 'bg-yellow-400' : s === 'approved' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                  {statusCounts[s]}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* STATIC PIPELINE */}
        {approvalPipeline.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {approvalPipeline.map((step: any, index: number) => {
              const isSupervisorStep = Number(step.user_id) === 9001;
              const isLast = index === approvalPipeline.length - 1;
              const capitalizeFirst = (text?: string) =>
                text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

              return (
                <React.Fragment key={`${step.level_id}-${step.user_id}`}>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {isSupervisorStep
                      ? `${capitalizeFirst(step.fullname)}`
                      : `${capitalizeFirst(step.fullname)}`}
                  </span>

                  {!isLast && <span className="text-gray-400">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
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

                {filter === 'pending' && (
                  <>
                    <TableHead>Requested By</TableHead>{' '}
                  </>
                )}
                {filter === 'rejected' && <TableHead>Rejected By</TableHead>}
                {filter === 'rejected' && <TableHead>Rejection Note</TableHead>}
                {filter === 'rejected' && <TableHead>Suggested Price</TableHead>}
                {filter === 'rejected' && <TableHead>Suggested Volume</TableHead>}

                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {proposals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} className="text-center py-8 text-gray-500">
                    No proposals found
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) =>
                  p.items.map((item, idx) => (
                    <TableRow key={`${p.id}-${item.id}`}>
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

                      {/* NEW COLUMNS - Unit Cost, Quantity, Total Invoice */}
                      <TableCell className="font-medium">
                        {formatPrice(item.current_unit_cost)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatQuantity(item.current_quantity)}
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatPrice(item.current_total)}
                      </TableCell>

                      {/* Invoice Difference Column */}
                      <TableCell>
                        {renderInvoiceDifference(item.total_amount, item.current_total)}
                      </TableCell>

                      <TableCell>{getItemStatusBadge(item.status)}</TableCell>
                      <TableCell>{currentLevelPrint(item.current_level)}</TableCell>

                      {idx === 0 && filter === 'pending' && (
                        <>
                          <TableCell rowSpan={p.items.length}>
                            {p.created_by_name || 'N/A'}
                          </TableCell>
                        </>
                      )}

                      {filter === 'rejected' && (
                        <>
                          <TableCell>{item.action_by_name || 'N/A'}</TableCell>
                          <TableCell>{item.rejected_note || 'N/A'}</TableCell>
                          <TableCell>
                            {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
                          </TableCell>
                          <TableCell>
                            {item.suggested_volume
                              ? `${item.suggested_volume}/${item.unit}`
                              : 'N/A'}
                          </TableCell>
                        </>
                      )}

                      <TableCell>
                        <div className="flex gap-2">
                          {canApproveOrReject(item) &&
                            (!item.status || item.status === 'pending') && (
                              <>
                                <Button size="sm" onClick={() => handleApproveItem(p, item)}>
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectClick(p, item)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                        </div>
                        {item.status == 'rejected' && p.created_by == userInfo?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviseClick(item)}
                          >
                            Revise
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Reject Item Dialog */}
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
              onChange={(e) =>
                setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))
              }
            />

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Recommended Price"
                  type="number"
                  step="0.01"
                  value={rejectData.suggested_price}
                  onChange={(e) =>
                    setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))
                  }
                />

                <FloatingInput
                  label="Recommended Volume"
                  type="number"
                  value={rejectData.suggested_volume}
                  onChange={(e) =>
                    setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))
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

      {/* Revise Item Dialog */}
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
