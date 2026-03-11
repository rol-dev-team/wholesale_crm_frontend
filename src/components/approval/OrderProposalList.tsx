// 'use client';
// import React from 'react';
// import { useMemo, useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { PrismAPI } from '@/api/prismAPI';
// import { AppPagination } from '@/components/common/AppPagination';

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
//   current_unit_cost?: string | number;
//   current_quantity?: string | number;
//   current_total?: string | number;
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

//   const [approvalPipeline, setApprovalPipeline] = useState([]);
//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({}); // Cache for client names

//   // pagination states
//   const ITEMS_PER_PAGE = 4;
//   const lastPayloadRef = React.useRef<any>(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [rejectingItem, setRejectingItem] = useState<{
//     proposal: Proposal;
//     item: ProposalItem;
//   } | null>(null);

//   const [rejectData, setRejectData] = useState({
//     status: 'rejected',
//     rejected_note: '',
//     suggested_price: '',
//     suggested_volume: '',
//   });

//   const [revisingItem, setRevisingItem] = useState(null);
//   const [reviseData, setReviseData] = useState({
//     proposed_price: '',
//     unit: '',
//     volume: '',
//     proposed_amount: '',
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
//       setApprovalPipeline(res.user_level_info || []);
//       console.log('Fetched proposals:', res);
//       setCurrentPage(res?.meta?.current_page || 1);
//       setTotalPages(res?.meta?.last_page || 1);
//       setStatusCounts((prev) => ({
//         ...prev,
//         [payload.status]: res?.meta?.total || 0,
//       }));
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

//     if (item.status === 'approved') {
//       alert('This item is already approved.');
//       return;
//     }

//     try {
//       await PriceProposalAPI.approveItem(item.id, item);
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Failed to approve item:', error);
//     }
//   };

//   const handleRejectClick = (proposal: Proposal, item: ProposalItem) => {
//     setRejectingItem({ proposal, item });
//     setRejectData({
//       status: 'rejected',
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
//         status: rejectData.status,
//         rejected_note: rejectData.rejected_note,
//         suggested_price: rejectData.suggested_price
//           ? Number(rejectData.suggested_price)
//           : undefined,
//         suggested_volume: rejectData.suggested_volume
//           ? Number(rejectData.suggested_volume)
//           : undefined,
//       };

//       await PriceProposalAPI.rejectItem(rejectingItem.item.id, payload);

//       setRejectingItem(null);
//       setRejectData({
//         status: 'rejected',
//         rejected_note: '',
//         suggested_price: '',
//         suggested_volume: '',
//       });

//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Rejection failed:', error);
//       alert(error.response?.data?.message || 'Failed to reject item');
//     }
//   };

//   // Revise
//   const handleReviseClick = (item: ProposalItem) => {
//     setRevisingItem(item);
//     setReviseData({
//       proposed_price: item.proposed_price,
//       unit: item.unit,
//       volume: item.volume,
//       proposed_amount: item.total_amount.toString(),
//     });
//   };

//   const submitRevise = async () => {
//     if (!revisingItem) return;

//     try {
//       await PriceProposalAPI.reviseItem(revisingItem.id, {
//         proposed_price: Number(reviseData.proposed_price),
//         unit: reviseData.unit,
//         volume: Number(reviseData.volume),
//         proposed_amount: Number(reviseData.proposed_amount),
//       });

//       setRevisingItem(null);
//       fetchProposals(lastPayloadRef.current);
//     } catch (err) {
//       console.error('Failed to revise proposal:', err);
//       alert('Failed to revise proposal');
//     }
//   };

//   // const canApproveOrReject = (item: Proposal) => {
//   //   const user = getUserInfo();
//   //   if (!user) return false;

//   //   if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) {
//   //     return false;
//   //   }

//   //   const isDirectApprover = approvalPipeline.some(
//   //     (step: any) =>
//   //       Number(step.user_id) === Number(user.id) &&
//   //       Number(step.level_id) === Number(item.current_level)
//   //   );

//   //   const hasSupervisorFallback = approvalPipeline.some(
//   //     (step: any) =>
//   //       Number(step.user_id) === 9001 && Number(step.level_id) === Number(item.current_level)
//   //   );

//   //   return isDirectApprover || (hasSupervisorFallback && isSupervisor());
//   // };

//   const canApproveOrReject = (item: Proposal) => {
//     const user = getUserInfo();
//     if (!user) return false;

//     if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) {
//       return false;
//     }

//     const isDirectApprover = approvalPipeline.some(
//       (step: any) =>
//         Number(step.user_id) === Number(user.id) &&
//         Number(step.level_id) === Number(item.current_level)
//     );

//     // ✅ RULE 1: direct approver → always allow (ignore creator check)
//     if (isDirectApprover) {
//       return true;
//     }

//     // 🔒 RULE 0:
//     // Either same supervisor OR privileged role
//     const hasSupervisorMatch =
//       user.default_kam_id && Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
//     console.log('hasSupervisorMatch', hasSupervisorMatch);
//     // 🔐 RULE 1: privileged role (any one is enough)
//     const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();
//     console.log('hasPrivilegedRole', {
//       hasPrivilegedRole,
//       isSupervisor,
//       isSuperAdmin,
//       isManagement,
//     });
//     // ❌ MUST satisfy BOTH
//     if (!hasSupervisorMatch || !hasPrivilegedRole) {
//       console.log('Access denied: missing supervisor match or privileged role');
//       return false;
//     }
//     const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);

//     // 🚫 RULE 2: supervisor cannot approve own created item (if not direct approver)
//     if (isCreatedBySupervisor) {
//       return false;
//     }

//     const hasSupervisorFallback =
//       approvalPipeline.some(
//         (step: any) =>
//           Number(step.user_id) === 9001 && Number(step.level_id) === Number(item.current_level)
//       ) &&
//       (isManagement() || isSupervisor() || isSuperAdmin());

//     return hasSupervisorFallback;
//   };

//   const currentLevelPrint = (itemLevel: number) => {
//     const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));

//     if (!step) {
//       return <span className="text-gray-400">N/A</span>;
//     }

//     return (
//       <span
//         className="inline-flex items-center px-2 py-0.5 rounded-full
//                  text-xs font-semibold bg-blue-100 text-blue-800"
//       >
//         {`L-${step.level_id} (${step.fullname})`}
//       </span>
//     );
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

//   const formatPrice = (value?: string | number) => {
//     if (value === undefined || value === null) return 'N/A';
//     const num = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(num) ? 'N/A' : num.toFixed(2);
//   };

//   const formatQuantity = (value?: string | number) => {
//     if (value === undefined || value === null) return 'N/A';
//     const num = typeof value === 'string' ? parseFloat(value) : value;
//     return isNaN(num) ? 'N/A' : num.toLocaleString();
//   };

//   const getInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     if (totalAmount === undefined || currentTotal === undefined || currentTotal === null) {
//       return null;
//     }

//     const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
//     const current =
//       typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));

//     if (isNaN(total) || isNaN(current)) {
//       return null;
//     }

//     return total - current;
//   };

//   const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     const difference = getInvoiceDifference(totalAmount, currentTotal);

//     if (difference === null) {
//       return <span className="text-gray-400">N/A</span>;
//     }

//     const isPositive = difference >= 0;
//     const color = isPositive ? 'text-green-600' : 'text-red-600';

//     return (
//       <span className={`font-semibold ${color}`}>
//         {isPositive ? '+' : ''}
//         {difference.toFixed(2)}
//       </span>
//     );
//   };

//   const handleDeleteItem = async (item: ProposalItem) => {
//     if (!confirm('Are you sure you want to delete this proposal item?')) return;
//     try {
//       await PriceProposalAPI.deleteItem(item.id);

//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Delete failed:', error);
//       alert('Failed to delete item');
//     }
//   };

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
//         {approvalPipeline.length > 0 && (
//           <div className="flex items-center gap-2 flex-wrap">
//             {approvalPipeline.map((step: any, index: number) => {
//               const isSupervisorStep = Number(step.user_id) === 9001;
//               const isLast = index === approvalPipeline.length - 1;
//               const capitalizeFirst = (text?: string) =>
//                 text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

//               return (
//                 <React.Fragment key={`${step.level_id}-${step.user_id}`}>
//                   <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                     {isSupervisorStep
//                       ? `${capitalizeFirst(step.fullname)}`
//                       : `${capitalizeFirst(step.fullname)}`}
//                   </span>

//                   {!isLast && <span className="text-gray-400">→</span>}
//                 </React.Fragment>
//               );
//             })}
//           </div>
//         )}
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
//                 <TableHead>Proposed Amount</TableHead>
//                 <TableHead>Current Unit Cost</TableHead>
//                 <TableHead>Current Quantity</TableHead>
//                 <TableHead>Current Invoice</TableHead>
//                 <TableHead>Invoice Difference</TableHead>
//                 <TableHead>Item Status</TableHead>
//                 <TableHead>Current Level</TableHead>
//                 <TableHead>Effective Date</TableHead>

//                 {filter === 'pending' && (
//                   <>
//                     <TableHead>Requested By</TableHead>{' '}
//                   </>
//                 )}
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
//                   <TableCell colSpan={18} className="text-center py-8 text-gray-500">
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

//                       {/* NEW COLUMNS - Unit Cost, Quantity, Total Invoice */}
//                       <TableCell className="font-medium">
//                         {formatPrice(item.current_unit_cost)}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatQuantity(item.current_quantity)}
//                       </TableCell>
//                       <TableCell className="font-medium text-blue-600">
//                         {formatPrice(item.current_total)}
//                       </TableCell>

//                       {/* Invoice Difference Column */}
//                       <TableCell>
//                         {renderInvoiceDifference(item.total_amount, item.current_total)}
//                       </TableCell>

//                       <TableCell>{getItemStatusBadge(item.status)}</TableCell>
//                       <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
//                       <TableCell>{item.effective_date}</TableCell>

//                       {idx === 0 && filter === 'pending' && (
//                         <>
//                           <TableCell rowSpan={p.items.length}>
//                             {p.created_by_name || 'N/A'}
//                           </TableCell>
//                         </>
//                       )}

//                       {filter === 'rejected' && (
//                         <>
//                           <TableCell>{item.action_by_name || 'N/A'}</TableCell>
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
//                           {canApproveOrReject(item) &&
//                             (!item.status || item.status === 'pending') && (
//                               <>
//                                 <Button
//                                   type="button"
//                                   size="sm"
//                                   // onClick={() => handleApproveItem(p, item)}
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleApproveItem(p, item);
//                                   }}
//                                 >
//                                   Approve
//                                 </Button>
//                                 <Button
//                                   type="button"
//                                   size="sm"
//                                   variant="destructive"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleRejectClick(p, item);
//                                   }}
//                                 >
//                                   Reject
//                                 </Button>
//                               </>
//                             )}

//                           {item.status == 'rejected' && p.created_by == userInfo?.id && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="destructive"
//                               onClick={() => handleReviseClick(item)}
//                             >
//                               Revise
//                             </Button>
//                           )}

//                           {(item.status === 'pending' || item.status === 'rejected') &&
//                             item.created_by === userInfo?.id && (
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="outline"
//                                 onClick={() => handleDeleteItem(item)}
//                               >
//                                 Delete
//                               </Button>
//                             )}
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 )
//               )}
//             </TableBody>
//           </Table>

//           {totalPages > 1 && (
//             <div className="flex justify-end mt-4">
//               <AppPagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) =>
//                   fetchProposals({
//                     ...lastPayloadRef.current,
//                     page,
//                   })
//                 }
//               />
//             </div>
//           )}
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

//       {/* Revise Item Dialog */}
//       <Dialog open={!!revisingItem} onOpenChange={() => setRevisingItem(null)}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Revise Proposal</DialogTitle>
//           </DialogHeader>

//           <div className="space-y-4">
//             <FloatingInput
//               label="Proposed Price"
//               type="number"
//               value={reviseData.proposed_price}
//               onChange={(e) => setReviseData((p) => ({ ...p, proposed_price: e.target.value }))}
//             />

//             <select
//               className="w-full border rounded-md px-3 py-2"
//               value={reviseData.unit}
//               onChange={(e) => setReviseData((p) => ({ ...p, unit: e.target.value }))}
//             >
//               <option value="">Select Unit</option>
//               <option value="MB">MB</option>
//               <option value="GB">GB</option>
//               <option value="Quantity">Quantity</option>
//             </select>

//             <FloatingInput
//               label="Volume"
//               type="number"
//               value={reviseData.volume}
//               onChange={(e) => setReviseData((p) => ({ ...p, volume: e.target.value }))}
//             />

//             <FloatingInput
//               label="Proposed Amount"
//               type="number"
//               value={reviseData.proposed_amount}
//               onChange={(e) => setReviseData((p) => ({ ...p, proposed_amount: e.target.value }))}
//             />
//           </div>

//           <div className="flex gap-2 mt-4">
//             <Button variant="outline" className="flex-1" onClick={() => setRevisingItem(null)}>
//               Cancel
//             </Button>
//             <Button className="flex-1" onClick={submitRevise}>
//               Submit Revision
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// code by smair vai

'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PriceProposalAPI } from '@/api/priceProposalApi.js';
import { AppPagination } from '@/components/common/AppPagination';

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
import { isSuperAdmin, isManagement, isSupervisor, getUserInfo } from '@/utility/utility';

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
  status?: 'pending' | 'approved' | 'rejected' | 'erp';
  rejected_note?: string;
  suggested_price?: number;
  suggested_volume?: number;
  rejected_by?: number;
  action_by?: number;
  action_by_name?: string;
  current_unit_cost?: string | number;
  current_quantity?: string | number;
  current_total?: string | number;
  current_level?: number;
  effective_date?: string;
  created_by?: number;
  created_by_supervisor_id?: number;
}

interface Proposal {
  id: number;
  client_id: number;
  client_name?: string;
  kam_name?: string;
  status: 'pending' | 'approved' | 'rejected' | 'erp';
  rejected_note?: string;
  created_by: number;
  created_by_name?: string;
  current_owner_id: number;
  action_by_name?: string;
  created_by_supervisor_id?: number;
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
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Record<number, string>>({});

  // pagination
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

  const [revisingItem, setRevisingItem] = useState<ProposalItem | null>(null);
  const [reviseData, setReviseData] = useState({
    proposed_price: '',
    unit: '',
    volume: '',
    proposed_amount: '',
  });

  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    erp: 0,
  });

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  const fetchProposals = async (payload: any) => {
    lastPayloadRef.current = payload;
    setLoading(true);
    try {
      const res = await PriceProposalAPI.getAll(payload);
      setProposals(res.data || []);
      setApprovalPipeline(res.user_level_info || []);
      setCurrentPage(res?.meta?.current_page || 1);
      setTotalPages(res?.meta?.last_page || 1);
      setStatusCounts((prev) => ({
        ...prev,
        [payload.status]: res?.meta?.total || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals({ page: 1, per_page: ITEMS_PER_PAGE, status: filter });
  }, [filter]);

  // ─────────────────────────────────────────────
  // APPROVE
  // ─────────────────────────────────────────────
  const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
    if (!confirm('Are you sure you want to approve this item?')) return;
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

  // ─────────────────────────────────────────────
  // REJECT
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // REVISE
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // POST TO ERP  (approved → erp)  ✅ individual item
  // ─────────────────────────────────────────────
  const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
    if (!confirm('Are you sure you want to post this item to ERP?')) return;
    try {
      await PriceProposalAPI.storeStatusTrack(proposal.id, {
        status: {
          status: 'erp',
          item_id: item.id, // ← send item_id for individual update
        },
      });
      fetchProposals(lastPayloadRef.current);
    } catch (error: any) {
      console.error('Failed to post to ERP:', error);
      alert(error.response?.data?.message || 'Failed to post to ERP');
    }
  };

  // ─────────────────────────────────────────────
  // UNPOST FROM ERP  (erp → approved)  ✅ individual item
  // ─────────────────────────────────────────────
  const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
    if (!confirm('Are you sure you want to unpost this item from ERP?')) return;
    try {
      await PriceProposalAPI.storeStatusTrack(proposal.id, {
        status: {
          status: 'approved',
          item_id: item.id, // ← send item_id for individual update
        },
      });
      fetchProposals(lastPayloadRef.current);
    } catch (error: any) {
      console.error('Failed to unpost from ERP:', error);
      alert(error.response?.data?.message || 'Failed to unpost from ERP');
    }
  };

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────
  const handleDeleteItem = async (item: ProposalItem) => {
    if (!confirm('Are you sure you want to delete this proposal item?')) return;
    try {
      await PriceProposalAPI.deleteItem(item.id);
      fetchProposals(lastPayloadRef.current);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete item');
    }
  };

  // ─────────────────────────────────────────────
  // PERMISSIONS
  // ─────────────────────────────────────────────
  const canApproveOrReject = (item: ProposalItem) => {
    const user = getUserInfo();
    if (!user) return false;
    if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) return false;

    const isDirectApprover = approvalPipeline.some(
      (step: any) =>
        Number(step.user_id) === Number(user.id) &&
        Number(step.level_id) === Number(item.current_level)
    );

    if (isDirectApprover) return true;

    const hasSupervisorMatch =
      user.default_kam_id && Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
    const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();

    if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

    const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
    if (isCreatedBySupervisor) return false;

    const hasSupervisorFallback =
      approvalPipeline.some(
        (step: any) =>
          Number(step.user_id) === 9001 && Number(step.level_id) === Number(item.current_level)
      ) &&
      (isManagement() || isSupervisor() || isSuperAdmin());

    return hasSupervisorFallback;
  };

  // Only super_admin and management can post/unpost to ERP
  const canPostToErp = () => isSuperAdmin() || isManagement();

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  const currentLevelPrint = (itemLevel?: number) => {
    const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
    if (!step) return <span className="text-gray-400">N/A</span>;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        {`L-${step.level_id} (${step.fullname})`}
      </span>
    );
  };

  const getItemStatusBadge = (status?: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
      erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
    };
    const cfg = map[status ?? 'pending'] ?? map['pending'];
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
    );
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

  const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
    if (totalAmount === undefined || currentTotal === undefined || currentTotal === null)
      return <span className="text-gray-400">N/A</span>;
    const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
    const current =
      typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
    if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
    const diff = total - current;
    return (
      <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff >= 0 ? '+' : ''}
        {diff.toFixed(2)}
      </span>
    );
  };

  // ─────────────────────────────────────────────
  // TAB CONFIG
  // ─────────────────────────────────────────────
  const tabConfig = [
    {
      key: 'pending' as const,
      label: 'Pending',
      activeClass: 'bg-yellow-400 text-white hover:bg-yellow-500',
      inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100',
      badgeClass: 'bg-yellow-400',
    },
    {
      key: 'approved' as const,
      label: 'Approved',
      activeClass: 'bg-green-500 text-white hover:bg-green-600',
      inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100',
      badgeClass: 'bg-green-500',
    },
    {
      key: 'rejected' as const,
      label: 'Rejected',
      activeClass: 'bg-red-500 text-white hover:bg-red-600',
      inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100',
      badgeClass: 'bg-red-500',
    },
    {
      key: 'erp' as const,
      label: 'Posted in ERP',
      activeClass: 'bg-purple-500 text-white hover:bg-purple-600',
      inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-100',
      badgeClass: 'bg-purple-500',
    },
  ];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between">
        {/* STATUS TABS */}
        <div className="flex gap-2">
          {tabConfig.map(({ key, label, activeClass, inactiveClass, badgeClass }) => (
            <Button
              key={key}
              onClick={() => setFilter(key)}
              className={`relative overflow-visible rounded-md px-4 py-1 ${
                filter === key ? activeClass : inactiveClass
              }`}
            >
              {label}
              {statusCounts[key] > 0 && (
                <span
                  className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
                    flex items-center justify-center rounded-full text-xs font-bold text-white
                    ${badgeClass}`}
                >
                  {statusCounts[key]}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* APPROVAL PIPELINE */}
        {approvalPipeline.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {approvalPipeline.map((step: any, index: number) => {
              const isLast = index === approvalPipeline.length - 1;
              const cap = (t?: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
              return (
                <React.Fragment key={`${step.level_id}-${step.user_id}`}>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {cap(step.fullname)}
                  </span>
                  {!isLast && <span className="text-gray-400">→</span>}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* ── TABLE ── */}
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
                <TableHead>Effective Date</TableHead>
                {filter === 'pending' && <TableHead>Requested By</TableHead>}
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
                  <TableCell colSpan={18} className="text-center py-8 text-gray-500">
                    No proposals found
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) =>
                  p.items.map((item, idx) => (
                    <TableRow key={`${p.id}-${item.id}`}>
                      {/* KAM + Client — span all item rows of this proposal */}
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

                      {/* Pending — Requested By (spans all item rows) */}
                      {idx === 0 && filter === 'pending' && (
                        <TableCell rowSpan={p.items.length}>{p.created_by_name || 'N/A'}</TableCell>
                      )}

                      {/* Rejected columns */}
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

                      {/* ── ACTIONS ── */}
                      <TableCell>
                        <div className="flex gap-2 flex-wrap">
                          {/* Approve / Reject — pending tab only */}
                          {canApproveOrReject(item) &&
                            (!item.status || item.status === 'pending') && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApproveItem(p, item);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectClick(p, item);
                                  }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                          {/* ✅ Post to ERP — approved tab, individual item */}
                          {filter === 'approved' &&
                            item.status === 'approved' &&
                            canPostToErp() && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePostToErp(p, item);
                                }}
                              >
                                Posted in ERP
                              </Button>
                            )}

                          {/* ✅ Unpost from ERP — erp tab, individual item */}
                          {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-purple-500 text-purple-700 hover:bg-purple-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnpostFromErp(p, item);
                              }}
                            >
                              Unposted in ERP
                            </Button>
                          )}

                          {/* Revise — rejected items created by current user */}
                          {item.status === 'rejected' && p.created_by === userInfo?.id && (
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReviseClick(item)}
                            >
                              Revise
                            </Button>
                          )}

                          {/* Delete — pending or rejected items created by current user */}
                          {(item.status === 'pending' || item.status === 'rejected') &&
                            item.created_by === userInfo?.id && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteItem(item)}
                              >
                                Delete
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex justify-end mt-4">
              <AppPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchProposals({ ...lastPayloadRef.current, page })}
              />
            </div>
          )}
        </div>
      )}

      {/* ── REJECT DIALOG ── */}
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

      {/* ── REVISE DIALOG ── */}
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
