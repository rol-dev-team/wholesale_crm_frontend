

// // code by smair vai

// 'use client';
// import React from 'react';
// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { AppPagination } from '@/components/common/AppPagination';
// import { ApprovalFilterDrawer } from '@/components/filters/ApprovalFilterDrawer';
// import { Filter } from 'lucide-react';

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
// import { isSuperAdmin, isManagement, isSupervisor, getUserInfo } from '@/utility/utility';

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
//   status?: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   suggested_price?: number;
//   suggested_volume?: number;
//   rejected_by?: number;
//   action_by?: number;
//   action_by_name?: string;
//   current_unit_cost?: string | number;
//   current_quantity?: string | number;
//   current_total?: string | number;
//   current_level?: number;
//   effective_date?: string;
//   created_by?: number;
//   created_by_supervisor_id?: number;
// }

// interface Proposal {
//   id: number;
//   client_id: number;
//   client_name?: string;
//   kam_name?: string;
//   status: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   created_by: number;
//   created_by_name?: string;
//   current_owner_id: number;
//   action_by_name?: string;
//   created_by_supervisor_id?: number;
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
//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({});

//   // pagination
//   const ITEMS_PER_PAGE = 10;
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

//   const [revisingItem, setRevisingItem] = useState<ProposalItem | null>(null);
//   const [reviseData, setReviseData] = useState({
//     proposed_price: '',
//     unit: '',
//     volume: '',
//     proposed_amount: '',
//   });

//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     erp: 0,
//   });

//   // Filter states
//   const [kams, setKams] = useState([]);
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [startYear, setStartYear] = useState<string>('');
//   const [endYear, setEndYear] = useState<string>('');

//   // ─────────────────────────────────────────────
//   // FETCH
//   // ─────────────────────────────────────────────
//   const getFilterPayload = () => {
//     const payload: any = {
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };
//     if (kamFilter !== 'all') payload.kam_id = kamFilter;
//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;
//     return payload;
//   };

//   const fetchProposals = async (payload: any) => {
//     lastPayloadRef.current = payload;
//     setLoading(true);
//     try {
//       const res = await PriceProposalAPI.getAll(payload);
//       setProposals(res.data || []);
//       setApprovalPipeline(res.user_level_info || []);
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
//     fetchProposals(getFilterPayload());
//   }, [filter, kamFilter, clientTypeFilter, startYear, endYear]);

//   // ─────────────────────────────────────────────
//   // APPROVE
//   // ─────────────────────────────────────────────
//   const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to approve this item?')) return;
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

//   // ─────────────────────────────────────────────
//   // REJECT
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // REVISE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // POST TO ERP  (approved → erp)  ✅ individual item
//   // ─────────────────────────────────────────────
//   const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to post this item to ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: {
//           status: 'erp',
//           item_id: item.id, // ← send item_id for individual update
//         },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to post to ERP:', error);
//       alert(error.response?.data?.message || 'Failed to post to ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // UNPOST FROM ERP  (erp → approved)  ✅ individual item
//   // ─────────────────────────────────────────────
//   const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to unpost this item from ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: {
//           status: 'approved',
//           item_id: item.id, // ← send item_id for individual update
//         },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to unpost from ERP:', error);
//       alert(error.response?.data?.message || 'Failed to unpost from ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // DELETE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // PERMISSIONS
//   // ─────────────────────────────────────────────
//   const canApproveOrReject = (item: ProposalItem) => {
//     const user = getUserInfo();
//     if (!user) return false;
//     if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) return false;

//     const isDirectApprover = approvalPipeline.some(
//       (step: any) =>
//         Number(step.user_id) === Number(user.id) &&
//         Number(step.level_id) === Number(item.current_level)
//     );

//     if (isDirectApprover) return true;

//     const hasSupervisorMatch =
//       user.default_kam_id && Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
//     const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();

//     if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

//     const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
//     if (isCreatedBySupervisor) return false;

//     const hasSupervisorFallback =
//       approvalPipeline.some(
//         (step: any) =>
//           Number(step.user_id) === 9001 && Number(step.level_id) === Number(item.current_level)
//       ) &&
//       (isManagement() || isSupervisor() || isSuperAdmin());

//     return hasSupervisorFallback;
//   };

//   // Only super_admin and management can post/unpost to ERP
//   const canPostToErp = () => isSuperAdmin() || isManagement();

//   // ─────────────────────────────────────────────
//   // UI HELPERS
//   // ─────────────────────────────────────────────
//   const currentLevelPrint = (itemLevel?: number) => {
//     const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
//     if (!step) return <span className="text-gray-400">N/A</span>;
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//         {`L-${step.level_id} (${step.fullname})`}
//       </span>
//     );
//   };

//   const getItemStatusBadge = (status?: string) => {
//     const map: Record<string, { label: string; cls: string }> = {
//       pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
//       approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
//       rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
//       erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
//     };
//     const cfg = map[status ?? 'pending'] ?? map['pending'];
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
//     );
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

//   const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     if (totalAmount === undefined || currentTotal === undefined || currentTotal === null)
//       return <span className="text-gray-400">N/A</span>;
//     const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
//     const current =
//       typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
//     if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
//     const diff = total - current;
//     return (
//       <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//         {diff >= 0 ? '+' : ''}
//         {diff.toFixed(2)}
//       </span>
//     );
//   };

//   // ─────────────────────────────────────────────
//   // TAB CONFIG
//   // ─────────────────────────────────────────────
//   const tabConfig = [
//     {
//       key: 'pending' as const,
//       label: 'Pending',
//       activeClass: 'bg-yellow-400 text-white hover:bg-yellow-500',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100',
//       badgeClass: 'bg-yellow-400',
//     },
//     {
//       key: 'approved' as const,
//       label: 'Approved',
//       activeClass: 'bg-green-500 text-white hover:bg-green-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100',
//       badgeClass: 'bg-green-500',
//     },
//     {
//       key: 'rejected' as const,
//       label: 'Rejected',
//       activeClass: 'bg-red-500 text-white hover:bg-red-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100',
//       badgeClass: 'bg-red-500',
//     },
//     {
//       key: 'erp' as const,
//       label: 'Posted in ERP',
//       activeClass: 'bg-purple-500 text-white hover:bg-purple-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-100',
//       badgeClass: 'bg-purple-500',
//     },
//   ];

//   // ─────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────
//   return (
//     <div className="space-y-4">
//       {/* ── TOP BAR ── */}
//       <div className="flex items-center justify-between">
//         {/* STATUS TABS */}
//         <div className="flex gap-2">
//           {tabConfig.map(({ key, label, activeClass, inactiveClass, badgeClass }) => (
//             <Button
//               key={key}
//               onClick={() => setFilter(key)}
//               className={`relative overflow-visible rounded-md px-4 py-1 ${
//                 filter === key ? activeClass : inactiveClass
//               }`}
//             >
//               {label}
//               {statusCounts[key] > 0 && (
//                 <span
//                   className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
//                     flex items-center justify-center rounded-full text-xs font-bold text-white
//                     ${badgeClass}`}
//                 >
//                   {statusCounts[key]}
//                 </span>
//               )}
//             </Button>
//           ))}
//         </div>

//         {/* FILTER BUTTON AND APPROVAL PIPELINE */}
//         <div className="flex items-center gap-4">
//           <ApprovalFilterDrawer
//             division="all"
//             setDivision={() => {}}
//             kam={kamFilter}
//             setKam={setKamFilter}
//             clientType={clientTypeFilter}
//             setClientType={setClientTypeFilter}
//             kams={kams}
//             setKams={setKams}
//             viewMode="yearly"
//             setViewMode={() => {}}
//             startYear={startYear}
//             setStartYear={setStartYear}
//             endYear={endYear}
//             setEndYear={setEndYear}
//             onFilterChange={() => fetchProposals(getFilterPayload())}
//             userRole="super_admin"
//           />

//           {/* APPROVAL PIPELINE */}
//           {approvalPipeline.length > 0 && (
//             <div className="flex items-center gap-2 flex-wrap">
//               {approvalPipeline.map((step: any, index: number) => {
//                 const isLast = index === approvalPipeline.length - 1;
//                 const cap = (t?: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
//                 return (
//                   <React.Fragment key={`${step.level_id}-${step.user_id}`}>
//                     <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                       {cap(step.fullname)}
//                     </span>
//                     {!isLast && <span className="text-gray-400">→</span>}
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── TABLE ── */}
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
//                 {filter === 'pending' && <TableHead>Requested By</TableHead>}
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
//                       {/* KAM + Client — span all item rows of this proposal */}
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
//                       <TableCell className="font-medium">
//                         {formatPrice(item.current_unit_cost)}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatQuantity(item.current_quantity)}
//                       </TableCell>
//                       <TableCell className="font-medium text-blue-600">
//                         {formatPrice(item.current_total)}
//                       </TableCell>
//                       <TableCell>
//                         {renderInvoiceDifference(item.total_amount, item.current_total)}
//                       </TableCell>
//                       <TableCell>{getItemStatusBadge(item.status)}</TableCell>
//                       <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
//                       <TableCell>{item.effective_date}</TableCell>

//                       {/* Pending — Requested By (spans all item rows) */}
//                       {idx === 0 && filter === 'pending' && (
//                         <TableCell rowSpan={p.items.length}>{p.created_by_name || 'N/A'}</TableCell>
//                       )}

//                       {/* Rejected columns */}
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

//                       {/* ── ACTIONS ── */}
//                       <TableCell>
//                         <div className="flex gap-2 flex-wrap">
//                           {/* Approve / Reject — pending tab only */}
//                           {canApproveOrReject(item) &&
//                             (!item.status || item.status === 'pending') && (
//                               <>
//                                 <Button
//                                   type="button"
//                                   size="sm"
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

//                           {/* ✅ Post to ERP — approved tab, individual item */}
//                           {filter === 'approved' &&
//                             item.status === 'approved' &&
//                             canPostToErp() && (
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 className="bg-purple-600 hover:bg-purple-700 text-white"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handlePostToErp(p, item);
//                                 }}
//                               >
//                                 Posted in ERP
//                               </Button>
//                             )}

//                           {/* ✅ Unpost from ERP — erp tab, individual item */}
//                           {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="outline"
//                               className="border-purple-500 text-purple-700 hover:bg-purple-50"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleUnpostFromErp(p, item);
//                               }}
//                             >
//                               Unposted in ERP
//                             </Button>
//                           )}

//                           {/* Revise — rejected items created by current user */}
//                           {item.status === 'rejected' && p.created_by === userInfo?.id && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="destructive"
//                               onClick={() => handleReviseClick(item)}
//                             >
//                               Revise
//                             </Button>
//                           )}

//                           {/* Delete — pending or rejected items created by current user */}
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
//                 onPageChange={(page) => fetchProposals({ ...lastPayloadRef.current, page })}
//               />
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── REJECT DIALOG ── */}
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

//       {/* ── REVISE DIALOG ── */}
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

// 'use client';
// import React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { AppPagination } from '@/components/common/AppPagination';
// import { ApprovalFilterDrawer } from '@/components/filters/ApprovalFilterDrawer';

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
// import { isSuperAdmin, isManagement, isSupervisor, getUserInfo } from '@/utility/utility';

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
//   status?: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   suggested_price?: number;
//   suggested_volume?: number;
//   rejected_by?: number;
//   action_by?: number;
//   action_by_name?: string;
//   current_unit_cost?: string | number;
//   current_quantity?: string | number;
//   current_total?: string | number;
//   current_level?: number;
//   effective_date?: string;
//   created_by?: number;
//   created_by_supervisor_id?: number;
// }

// interface Proposal {
//   id: number;
//   client_id: number;
//   client_name?: string;
//   kam_name?: string;
//   kam_id?: number;
//   status: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   created_by: number;
//   created_by_name?: string;
//   current_owner_id: number;
//   action_by_name?: string;
//   created_by_supervisor_id?: number;
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
//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({});

//   // pagination
//   const ITEMS_PER_PAGE = 10;
//   const lastPayloadRef = useRef<any>(null);
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

//   const [revisingItem, setRevisingItem] = useState<ProposalItem | null>(null);
//   const [reviseData, setReviseData] = useState({
//     proposed_price: '',
//     unit: '',
//     volume: '',
//     proposed_amount: '',
//   });

//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     erp: 0,
//   });

//   // ─── Filter states ───
//   const [kams, setKams] = useState<any[]>([]);
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [startYear, setStartYear] = useState<string>('');
//   const [endYear, setEndYear] = useState<string>('');

//   // ─────────────────────────────────────────────
//   // BUILD API PAYLOAD — includes kam_id for backend filtering
//   // ─────────────────────────────────────────────
//   const buildApiPayload = (page = 1) => {
//     const payload: any = {
//       page,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };

//     // ✅ Send kam_id to backend when a specific KAM is selected
//     if (kamFilter !== 'all') payload.kam_id = kamFilter;

//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;

//     return payload;
//   };

//   // ─────────────────────────────────────────────
//   // FETCH
//   // ─────────────────────────────────────────────
//   const fetchProposals = async (payload: any) => {
//     lastPayloadRef.current = payload;
//     setLoading(true);
//     try {
//       const res = await PriceProposalAPI.getAll(payload);
//       setProposals(res.data || []);
//       setApprovalPipeline(res.user_level_info || []);
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

//   // Re-fetch whenever any filter changes (including kamFilter → sends to backend)
//   useEffect(() => {
//     fetchProposals(buildApiPayload());
//   }, [filter, kamFilter, clientTypeFilter, startYear, endYear]);

//   // ─────────────────────────────────────────────
//   // APPROVE
//   // ─────────────────────────────────────────────
//   const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to approve this item?')) return;
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

//   // ─────────────────────────────────────────────
//   // REJECT
//   // ─────────────────────────────────────────────
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
//         suggested_price: rejectData.suggested_price ? Number(rejectData.suggested_price) : undefined,
//         suggested_volume: rejectData.suggested_volume ? Number(rejectData.suggested_volume) : undefined,
//       };
//       await PriceProposalAPI.rejectItem(rejectingItem.item.id, payload);
//       setRejectingItem(null);
//       setRejectData({ status: 'rejected', rejected_note: '', suggested_price: '', suggested_volume: '' });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Rejection failed:', error);
//       alert(error.response?.data?.message || 'Failed to reject item');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // REVISE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // POST TO ERP
//   // ─────────────────────────────────────────────
//   const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to post this item to ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: { status: 'erp', item_id: item.id },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to post to ERP:', error);
//       alert(error.response?.data?.message || 'Failed to post to ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // UNPOST FROM ERP
//   // ─────────────────────────────────────────────
//   const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to unpost this item from ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: { status: 'approved', item_id: item.id },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to unpost from ERP:', error);
//       alert(error.response?.data?.message || 'Failed to unpost from ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // DELETE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // PERMISSIONS
//   // ─────────────────────────────────────────────
//   const canApproveOrReject = (item: ProposalItem) => {
//     const user = getUserInfo();
//     if (!user) return false;
//     if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) return false;

//     const isDirectApprover = approvalPipeline.some(
//       (step: any) =>
//         Number(step.user_id) === Number(user.id) &&
//         Number(step.level_id) === Number(item.current_level)
//     );
//     if (isDirectApprover) return true;

//     const hasSupervisorMatch =
//       user.default_kam_id &&
//       Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
//     const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();
//     if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

//     const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
//     if (isCreatedBySupervisor) return false;

//     return (
//       approvalPipeline.some(
//         (step: any) =>
//           Number(step.user_id) === 9001 &&
//           Number(step.level_id) === Number(item.current_level)
//       ) &&
//       (isManagement() || isSupervisor() || isSuperAdmin())
//     );
//   };

//   const canPostToErp = () => isSuperAdmin() || isManagement();

//   // ─────────────────────────────────────────────
//   // UI HELPERS
//   // ─────────────────────────────────────────────
//   const currentLevelPrint = (itemLevel?: number) => {
//     const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
//     if (!step) return <span className="text-gray-400">N/A</span>;
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//         {`L-${(step as any).level_id} (${(step as any).fullname})`}
//       </span>
//     );
//   };

//   const getItemStatusBadge = (status?: string) => {
//     const map: Record<string, { label: string; cls: string }> = {
//       pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
//       approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
//       rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
//       erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
//     };
//     const cfg = map[status ?? 'pending'] ?? map['pending'];
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
//     );
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

//   const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     if (totalAmount === undefined || currentTotal === undefined || currentTotal === null)
//       return <span className="text-gray-400">N/A</span>;
//     const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
//     const current = typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
//     if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
//     const diff = total - current;
//     return (
//       <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//         {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
//       </span>
//     );
//   };

//   // Active KAM label for filter pill
//   const selectedKamLabel =
//     kamFilter !== 'all'
//       ? kams.find((k: any) => String(k.kam_id) === kamFilter)?.kam_name ?? kamFilter
//       : null;

//   // ─────────────────────────────────────────────
//   // TAB CONFIG
//   // ─────────────────────────────────────────────
//   const tabConfig = [
//     {
//       key: 'pending' as const,
//       label: 'Pending',
//       activeClass: 'bg-yellow-400 text-white hover:bg-yellow-500',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100',
//       badgeClass: 'bg-yellow-400',
//     },
//     {
//       key: 'approved' as const,
//       label: 'Approved',
//       activeClass: 'bg-green-500 text-white hover:bg-green-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100',
//       badgeClass: 'bg-green-500',
//     },
//     {
//       key: 'rejected' as const,
//       label: 'Rejected',
//       activeClass: 'bg-red-500 text-white hover:bg-red-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100',
//       badgeClass: 'bg-red-500',
//     },
//     {
//       key: 'erp' as const,
//       label: 'Posted in ERP',
//       activeClass: 'bg-purple-500 text-white hover:bg-purple-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-100',
//       badgeClass: 'bg-purple-500',
//     },
//   ];

//   // ─────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────
//   return (
//     <div className="space-y-4">
//       {/* ── TOP BAR ── */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         {/* STATUS TABS */}
//         <div className="flex gap-2 flex-wrap">
//           {tabConfig.map(({ key, label, activeClass, inactiveClass, badgeClass }) => (
//             <Button
//               key={key}
//               onClick={() => setFilter(key)}
//               className={`relative overflow-visible rounded-md px-4 py-1 ${
//                 filter === key ? activeClass : inactiveClass
//               }`}
//             >
//               {label}
//               {statusCounts[key] > 0 && (
//                 <span
//                   className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
//                     flex items-center justify-center rounded-full text-xs font-bold text-white
//                     ${badgeClass}`}
//                 >
//                   {statusCounts[key]}
//                 </span>
//               )}
//             </Button>
//           ))}
//         </div>

//         {/* FILTER DRAWER + PIPELINE */}
//         <div className="flex items-center gap-4 flex-wrap">
//           <ApprovalFilterDrawer
//             division="all"
//             setDivision={() => {}}
//             kam={kamFilter}
//             // ✅ setKam updates kamFilter state → triggers useEffect → API called with kam_id
//             setKam={setKamFilter}
//             clientType={clientTypeFilter}
//             setClientType={setClientTypeFilter}
//             kams={kams}
//             setKams={setKams}
//             viewMode="yearly"
//             setViewMode={() => {}}
//             startYear={startYear}
//             setStartYear={setStartYear}
//             endYear={endYear}
//             setEndYear={setEndYear}
//             // ✅ onFilterChange: useEffect handles fetch automatically via state changes
//             // This is only needed if drawer doesn't update state before calling this
//             onFilterChange={() => fetchProposals(buildApiPayload())}
//             userRole="super_admin"
//           />

//           {/* APPROVAL PIPELINE */}
//           {approvalPipeline.length > 0 && (
//             <div className="flex items-center gap-2 flex-wrap">
//               {approvalPipeline.map((step: any, index: number) => {
//                 const isLast = index === approvalPipeline.length - 1;
//                 const cap = (t?: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
//                 return (
//                   <React.Fragment key={`${step.level_id}-${step.user_id}`}>
//                     <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                       {cap(step.fullname)}
//                     </span>
//                     {!isLast && <span className="text-gray-400">→</span>}
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── ACTIVE KAM FILTER PILL ── */}
//       {selectedKamLabel && (
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-500">Filtering by KAM:</span>
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             {selectedKamLabel}
//             <button
//               onClick={() => setKamFilter('all')}
//               className="ml-1 text-blue-500 hover:text-blue-800 font-bold leading-none"
//               title="Clear KAM filter"
//             >
//               ×
//             </button>
//           </span>
//           <span className="text-xs text-gray-400">
//             ({proposals.length} proposals)
//           </span>
//         </div>
//       )}

//       {/* ── TABLE ── */}
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
//                 {filter === 'pending' && <TableHead>Requested By</TableHead>}
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
//                     {selectedKamLabel
//                       ? `No proposals found for KAM: ${selectedKamLabel}`
//                       : 'No proposals found'}
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
//                       <TableCell>{item.proposed_price}/{item.unit}</TableCell>
//                       <TableCell>{item.volume}</TableCell>
//                       <TableCell className="font-semibold">
//                         {item.total_amount.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatPrice(item.current_unit_cost)}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatQuantity(item.current_quantity)}
//                       </TableCell>
//                       <TableCell className="font-medium text-blue-600">
//                         {formatPrice(item.current_total)}
//                       </TableCell>
//                       <TableCell>
//                         {renderInvoiceDifference(item.total_amount, item.current_total)}
//                       </TableCell>
//                       <TableCell>{getItemStatusBadge(item.status)}</TableCell>
//                       <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
//                       <TableCell>{item.effective_date}</TableCell>

//                       {idx === 0 && filter === 'pending' && (
//                         <TableCell rowSpan={p.items.length}>
//                           {p.created_by_name || 'N/A'}
//                         </TableCell>
//                       )}

//                       {filter === 'rejected' && (
//                         <>
//                           <TableCell>{item.action_by_name || 'N/A'}</TableCell>
//                           <TableCell>{item.rejected_note || 'N/A'}</TableCell>
//                           <TableCell>
//                             {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
//                           </TableCell>
//                           <TableCell>
//                             {item.suggested_volume ? `${item.suggested_volume}/${item.unit}` : 'N/A'}
//                           </TableCell>
//                         </>
//                       )}

//                       {/* ── ACTIONS ── */}
//                       <TableCell>
//                         <div className="flex gap-2 flex-wrap">
//                           {canApproveOrReject(item) && (!item.status || item.status === 'pending') && (
//                             <>
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 onClick={(e) => { e.stopPropagation(); handleApproveItem(p, item); }}
//                               >
//                                 Approve
//                               </Button>
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={(e) => { e.stopPropagation(); handleRejectClick(p, item); }}
//                               >
//                                 Reject
//                               </Button>
//                             </>
//                           )}

//                           {filter === 'approved' && item.status === 'approved' && canPostToErp() && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               className="bg-purple-600 hover:bg-purple-700 text-white"
//                               onClick={(e) => { e.stopPropagation(); handlePostToErp(p, item); }}
//                             >
//                               Posted in ERP
//                             </Button>
//                           )}

//                           {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="outline"
//                               className="border-purple-500 text-purple-700 hover:bg-purple-50"
//                               onClick={(e) => { e.stopPropagation(); handleUnpostFromErp(p, item); }}
//                             >
//                               Unposted in ERP
//                             </Button>
//                           )}

//                           {item.status === 'rejected' && p.created_by === userInfo?.id && (
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
//                 onPageChange={(page) => fetchProposals({ ...lastPayloadRef.current, page })}
//               />
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── REJECT DIALOG ── */}
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
//               onChange={(e) => setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))}
//             />
//             <div className="border-t pt-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <FloatingInput
//                   label="Recommended Price"
//                   type="number"
//                   step="0.01"
//                   value={rejectData.suggested_price}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))}
//                 />
//                 <FloatingInput
//                   label="Recommended Volume"
//                   type="number"
//                   value={rejectData.suggested_volume}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))}
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

//       {/* ── REVISE DIALOG ── */}
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











// 'use client';
// import React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { AppPagination } from '@/components/common/AppPagination';
// import { ApprovalFilterDrawer } from '@/components/filters/ApprovalFilterDrawer';

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
// import { isSuperAdmin, isManagement, isSupervisor, getUserInfo } from '@/utility/utility';

// interface ProposalItem {
//   id: number;
//   product_id: number;
//   product_name?: string;
//   current_price: string;
//   proposed_price: string;
//   unit: string;
//   volume: string;
//   total_amount: number;
//   status?: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   suggested_price?: number;
//   suggested_volume?: number;
//   rejected_by?: number;
//   action_by?: number;
//   action_by_name?: string;
//   current_unit_cost?: string | number;
//   current_quantity?: string | number;
//   current_total?: string | number;
//   current_level?: number;
//   effective_date?: string;
//   created_by?: number;
//   created_by_supervisor_id?: number;
// }

// interface Proposal {
//   id: number;
//   client_id: number;
//   client_name?: string;
//   kam_name?: string;
//   kam_id?: number;
//   status: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   created_by: number;
//   created_by_name?: string;
//   current_owner_id: number;
//   action_by_name?: string;
//   created_by_supervisor_id?: number;
//   created_by_user?: { id: number; name: string; role: string };
//   current_owner?: { id: number; name: string };
//   items: ProposalItem[];
// }

// export default function OrderProposalList() {
//   const { currentUser, hasPermission } = useAuth();
//   const userInfo = getUserInfo();

//   const [approvalPipeline, setApprovalPipeline] = useState([]);
//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({});

//   const ITEMS_PER_PAGE = 10;
//   const lastPayloadRef = useRef<any>(null);
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

//   const [revisingItem, setRevisingItem] = useState<ProposalItem | null>(null);
//   const [reviseData, setReviseData] = useState({
//     proposed_price: '',
//     unit: '',
//     volume: '',
//     proposed_amount: '',
//   });

//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     erp: 0,
//   });

//   const [kams, setKams] = useState<any[]>([]);
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [startYear, setStartYear] = useState<string>('');
//   const [endYear, setEndYear] = useState<string>('');

//   // ─────────────────────────────────────────────
//   // FETCH
//   // ─────────────────────────────────────────────
//   const fetchProposals = async (payload: any) => {
//     lastPayloadRef.current = payload;
//     setLoading(true);
//     try {
//       const res = await PriceProposalAPI.getAll(payload);
//       setProposals(res.data || []);
//       setApprovalPipeline(res.user_level_info || []);
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

//   // ─────────────────────────────────────────────
//   // ✅ BUILD PAYLOAD INLINE — no stale closure risk
//   // ─────────────────────────────────────────────
//   useEffect(() => {
//     const payload: any = {
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };
//     if (kamFilter !== 'all') payload.kam_id = kamFilter;
//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;

//     console.log('🔥 useEffect firing with kamFilter:', kamFilter, '| payload:', payload);
//     fetchProposals(payload);
//   }, [filter, kamFilter, clientTypeFilter, startYear, endYear]);

//   // ─────────────────────────────────────────────
//   // ✅ onFilterChange — called from drawer with the NEW kam value directly
//   //    This handles the edge case where the same KAM is reselected
//   //    (state doesn't change → useEffect won't fire → need manual fetch)
//   // ─────────────────────────────────────────────
//   const handleFilterChange = (newKam: string) => {
//     const payload: any = {
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };
//     if (newKam !== 'all') payload.kam_id = newKam;
//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;

//     console.log('🔥 handleFilterChange called with newKam:', newKam, '| payload:', payload);
//     fetchProposals(payload);
//   };

//   // ─────────────────────────────────────────────
//   // APPROVE
//   // ─────────────────────────────────────────────
//   const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to approve this item?')) return;
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

//   // ─────────────────────────────────────────────
//   // REJECT
//   // ─────────────────────────────────────────────
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
//         suggested_price: rejectData.suggested_price ? Number(rejectData.suggested_price) : undefined,
//         suggested_volume: rejectData.suggested_volume
//           ? Number(rejectData.suggested_volume)
//           : undefined,
//       };
//       await PriceProposalAPI.rejectItem(rejectingItem.item.id, payload);
//       setRejectingItem(null);
//       setRejectData({ status: 'rejected', rejected_note: '', suggested_price: '', suggested_volume: '' });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Rejection failed:', error);
//       alert(error.response?.data?.message || 'Failed to reject item');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // REVISE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // POST TO ERP
//   // ─────────────────────────────────────────────
//   const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to post this item to ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: { status: 'erp', item_id: item.id },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to post to ERP:', error);
//       alert(error.response?.data?.message || 'Failed to post to ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // UNPOST FROM ERP
//   // ─────────────────────────────────────────────
//   const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to unpost this item from ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, {
//         status: { status: 'approved', item_id: item.id },
//       });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to unpost from ERP:', error);
//       alert(error.response?.data?.message || 'Failed to unpost from ERP');
//     }
//   };

//   // ─────────────────────────────────────────────
//   // DELETE
//   // ─────────────────────────────────────────────
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

//   // ─────────────────────────────────────────────
//   // PERMISSIONS
//   // ─────────────────────────────────────────────
//   const canApproveOrReject = (item: ProposalItem) => {
//     const user = getUserInfo();
//     if (!user) return false;
//     if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) return false;

//     const isDirectApprover = approvalPipeline.some(
//       (step: any) =>
//         Number(step.user_id) === Number(user.id) &&
//         Number(step.level_id) === Number(item.current_level)
//     );
//     if (isDirectApprover) return true;

//     const hasSupervisorMatch =
//       user.default_kam_id &&
//       Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
//     const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();
//     if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

//     const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
//     if (isCreatedBySupervisor) return false;

//     return (
//       approvalPipeline.some(
//         (step: any) =>
//           Number(step.user_id) === 9001 &&
//           Number(step.level_id) === Number(item.current_level)
//       ) &&
//       (isManagement() || isSupervisor() || isSuperAdmin())
//     );
//   };

//   const canPostToErp = () => isSuperAdmin() || isManagement();

//   // ─────────────────────────────────────────────
//   // UI HELPERS
//   // ─────────────────────────────────────────────
//   const currentLevelPrint = (itemLevel?: number) => {
//     const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
//     if (!step) return <span className="text-gray-400">N/A</span>;
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//         {`L-${(step as any).level_id} (${(step as any).fullname})`}
//       </span>
//     );
//   };

//   const getItemStatusBadge = (status?: string) => {
//     const map: Record<string, { label: string; cls: string }> = {
//       pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
//       approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
//       rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
//       erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
//     };
//     const cfg = map[status ?? 'pending'] ?? map['pending'];
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
//     );
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

//   const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     if (totalAmount === undefined || currentTotal === undefined || currentTotal === null)
//       return <span className="text-gray-400">N/A</span>;
//     const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
//     const current =
//       typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
//     if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
//     const diff = total - current;
//     return (
//       <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//         {diff >= 0 ? '+' : ''}
//         {diff.toFixed(2)}
//       </span>
//     );
//   };

//   const selectedKamLabel =
//     kamFilter !== 'all'
//       ? kams.find((k: any) => String(k.kam_id) === kamFilter)?.kam_name ?? kamFilter
//       : null;

//   // ─────────────────────────────────────────────
//   // TAB CONFIG
//   // ─────────────────────────────────────────────
//   const tabConfig = [
//     {
//       key: 'pending' as const,
//       label: 'Pending',
//       activeClass: 'bg-yellow-400 text-white hover:bg-yellow-500',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100',
//       badgeClass: 'bg-yellow-400',
//     },
//     {
//       key: 'approved' as const,
//       label: 'Approved',
//       activeClass: 'bg-green-500 text-white hover:bg-green-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100',
//       badgeClass: 'bg-green-500',
//     },
//     {
//       key: 'rejected' as const,
//       label: 'Rejected',
//       activeClass: 'bg-red-500 text-white hover:bg-red-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100',
//       badgeClass: 'bg-red-500',
//     },
//     {
//       key: 'erp' as const,
//       label: 'Posted in ERP',
//       activeClass: 'bg-purple-500 text-white hover:bg-purple-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-100',
//       badgeClass: 'bg-purple-500',
//     },
//   ];

//   // ─────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────
//   return (
//     <div className="space-y-4">
//       {/* ── TOP BAR ── */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         {/* STATUS TABS */}
//         <div className="flex gap-2 flex-wrap">
//           {tabConfig.map(({ key, label, activeClass, inactiveClass, badgeClass }) => (
//             <Button
//               key={key}
//               onClick={() => setFilter(key)}
//               className={`relative overflow-visible rounded-md px-4 py-1 ${
//                 filter === key ? activeClass : inactiveClass
//               }`}
//             >
//               {label}
//               {statusCounts[key] > 0 && (
//                 <span
//                   className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
//                     flex items-center justify-center rounded-full text-xs font-bold text-white
//                     ${badgeClass}`}
//                 >
//                   {statusCounts[key]}
//                 </span>
//               )}
//             </Button>
//           ))}
//         </div>

//         {/* FILTER DRAWER + PIPELINE */}
//         <div className="flex items-center gap-4 flex-wrap">
//           <ApprovalFilterDrawer
//             division="all"
//             setDivision={() => {}}
//             kam={kamFilter}
//             setKam={setKamFilter}
//             clientType={clientTypeFilter}
//             setClientType={setClientTypeFilter}
//             kams={kams}
//             setKams={setKams}
//             viewMode="yearly"
//             setViewMode={() => {}}
//             startYear={startYear}
//             setStartYear={setStartYear}
//             endYear={endYear}
//             setEndYear={setEndYear}
//             // ✅ passes the resolved finalKam directly — no stale closure
//             onFilterChange={handleFilterChange}
//             userRole="super_admin"
//           />

//           {/* APPROVAL PIPELINE */}
//           {approvalPipeline.length > 0 && (
//             <div className="flex items-center gap-2 flex-wrap">
//               {approvalPipeline.map((step: any, index: number) => {
//                 const isLast = index === approvalPipeline.length - 1;
//                 const cap = (t?: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
//                 return (
//                   <React.Fragment key={`${step.level_id}-${step.user_id}`}>
//                     <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                       {cap(step.fullname)}
//                     </span>
//                     {!isLast && <span className="text-gray-400">→</span>}
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── ACTIVE KAM FILTER PILL ── */}
//       {selectedKamLabel && (
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-500">Filtering by KAM:</span>
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             {selectedKamLabel}
//             <button
//               onClick={() => setKamFilter('all')}
//               className="ml-1 text-blue-500 hover:text-blue-800 font-bold leading-none"
//               title="Clear KAM filter"
//             >
//               ×
//             </button>
//           </span>
//           <span className="text-xs text-gray-400">({proposals.length} proposals)</span>
//         </div>
//       )}

//       {/* ── TABLE ── */}
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
//                 {filter === 'pending' && <TableHead>Requested By</TableHead>}
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
//                     {selectedKamLabel
//                       ? `No proposals found for KAM: ${selectedKamLabel}`
//                       : 'No proposals found'}
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
//                       <TableCell>{item.proposed_price}/{item.unit}</TableCell>
//                       <TableCell>{item.volume}</TableCell>
//                       <TableCell className="font-semibold">
//                         {item.total_amount.toLocaleString()}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatPrice(item.current_unit_cost)}
//                       </TableCell>
//                       <TableCell className="font-medium">
//                         {formatQuantity(item.current_quantity)}
//                       </TableCell>
//                       <TableCell className="font-medium text-blue-600">
//                         {formatPrice(item.current_total)}
//                       </TableCell>
//                       <TableCell>
//                         {renderInvoiceDifference(item.total_amount, item.current_total)}
//                       </TableCell>
//                       <TableCell>{getItemStatusBadge(item.status)}</TableCell>
//                       <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
//                       <TableCell>{item.effective_date}</TableCell>

//                       {idx === 0 && filter === 'pending' && (
//                         <TableCell rowSpan={p.items.length}>
//                           {p.created_by_name || 'N/A'}
//                         </TableCell>
//                       )}

//                       {filter === 'rejected' && (
//                         <>
//                           <TableCell>{item.action_by_name || 'N/A'}</TableCell>
//                           <TableCell>{item.rejected_note || 'N/A'}</TableCell>
//                           <TableCell>
//                             {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
//                           </TableCell>
//                           <TableCell>
//                             {item.suggested_volume ? `${item.suggested_volume}/${item.unit}` : 'N/A'}
//                           </TableCell>
//                         </>
//                       )}

//                       {/* ── ACTIONS ── */}
//                       <TableCell>
//                         <div className="flex gap-2 flex-wrap">
//                           {canApproveOrReject(item) && (!item.status || item.status === 'pending') && (
//                             <>
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 onClick={(e) => { e.stopPropagation(); handleApproveItem(p, item); }}
//                               >
//                                 Approve
//                               </Button>
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={(e) => { e.stopPropagation(); handleRejectClick(p, item); }}
//                               >
//                                 Reject
//                               </Button>
//                             </>
//                           )}

//                           {filter === 'approved' && item.status === 'approved' && canPostToErp() && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               className="bg-purple-600 hover:bg-purple-700 text-white"
//                               onClick={(e) => { e.stopPropagation(); handlePostToErp(p, item); }}
//                             >
//                               Posted in ERP
//                             </Button>
//                           )}

//                           {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="outline"
//                               className="border-purple-500 text-purple-700 hover:bg-purple-50"
//                               onClick={(e) => { e.stopPropagation(); handleUnpostFromErp(p, item); }}
//                             >
//                               Unposted in ERP
//                             </Button>
//                           )}

//                           {item.status === 'rejected' && p.created_by === userInfo?.id && (
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
//                 onPageChange={(page) => fetchProposals({ ...lastPayloadRef.current, page })}
//               />
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── REJECT DIALOG ── */}
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
//               onChange={(e) => setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))}
//             />
//             <div className="border-t pt-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <FloatingInput
//                   label="Recommended Price"
//                   type="number"
//                   step="0.01"
//                   value={rejectData.suggested_price}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))}
//                 />
//                 <FloatingInput
//                   label="Recommended Volume"
//                   type="number"
//                   value={rejectData.suggested_volume}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))}
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

//       {/* ── REVISE DIALOG ── */}
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





// 'use client';
// import React from 'react';
// import { useState, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import { AppPagination } from '@/components/common/AppPagination';
// import { ApprovalFilterDrawer } from '@/components/filters/ApprovalFilterDrawer';

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
// import { isSuperAdmin, isManagement, isSupervisor, getUserInfo } from '@/utility/utility';

// interface ProposalItem {
//   id: number;
//   product_id: number;
//   product_name?: string;
//   current_price: string;
//   proposed_price: string;
//   unit: string;
//   volume: string;
//   total_amount: number;
//   status?: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   suggested_price?: number;
//   suggested_volume?: number;
//   rejected_by?: number;
//   action_by?: number;
//   action_by_name?: string;
//   current_unit_cost?: string | number;
//   current_quantity?: string | number;
//   current_total?: string | number;
//   current_level?: number;
//   effective_date?: string;
//   created_by?: number;
//   created_by_supervisor_id?: number;
//   service_uid?: string;
// }

// interface Proposal {
//   id: number;
//   client_id: number;
//   client_name?: string;
//   kam_name?: string;
//   kam_id?: number;
//   status: 'pending' | 'approved' | 'rejected' | 'erp';
//   rejected_note?: string;
//   created_by: number;
//   created_by_name?: string;
//   current_owner_id: number;
//   action_by_name?: string;
//   created_by_supervisor_id?: number;
//   created_by_user?: { id: number; name: string; role: string };
//   current_owner?: { id: number; name: string };
//   items: ProposalItem[];
// }

// // Helper to find the parent proposal for an item
// function findProposalForItem(proposals: Proposal[], itemId: number): Proposal | undefined {
//   return proposals.find((p) => p.items.some((i) => i.id === itemId));
// }

// export default function OrderProposalList() {
//   const { currentUser, hasPermission } = useAuth();
//   const userInfo = getUserInfo();

//   const [approvalPipeline, setApprovalPipeline] = useState([]);
//   const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
//   const [proposals, setProposals] = useState<Proposal[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clients, setClients] = useState<Record<number, string>>({});

//   // ── SELECTION STATE ──
//   const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
//   const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
//   const [bulkRejectNote, setBulkRejectNote] = useState('');
//   const [bulkLoading, setBulkLoading] = useState(false);

//   const ITEMS_PER_PAGE = 10;
//   const lastPayloadRef = useRef<any>(null);
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

//   const [revisingItem, setRevisingItem] = useState<ProposalItem | null>(null);
//   const [reviseData, setReviseData] = useState({
//     proposed_price: '',
//     unit: '',
//     volume: '',
//     proposed_amount: '',
//   });

//   const [statusCounts, setStatusCounts] = useState({
//     pending: 0,
//     approved: 0,
//     rejected: 0,
//     erp: 0,
//   });

//   const [kams, setKams] = useState<any[]>([]);
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [startYear, setStartYear] = useState<string>('');
//   const [endYear, setEndYear] = useState<string>('');

//   // ─────────────────────────────────────────────
//   // PERMISSIONS  (must be defined before selectableItems)
//   // ─────────────────────────────────────────────
//   function canApproveOrReject(item: ProposalItem) {
//     const user = getUserInfo();
//     if (!user) return false;
//     if (!Array.isArray(approvalPipeline) || approvalPipeline.length === 0) return false;

//     const isDirectApprover = approvalPipeline.some(
//       (step: any) =>
//         Number(step.user_id) === Number(user.id) &&
//         Number(step.level_id) === Number(item.current_level)
//     );
//     if (isDirectApprover) return true;

//     const hasSupervisorMatch =
//       user.default_kam_id &&
//       Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
//     const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();
//     if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

//     const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
//     if (isCreatedBySupervisor) return false;

//     return (
//       approvalPipeline.some(
//         (step: any) =>
//           Number(step.user_id) === 9001 &&
//           Number(step.level_id) === Number(item.current_level)
//       ) &&
//       (isManagement() || isSupervisor() || isSuperAdmin())
//     );
//   }

//   const canPostToErp = () => isSuperAdmin() || isManagement();

//   // Determine if an item row is selectable
//   const isItemSelectable = (item: ProposalItem, proposal: Proposal): boolean => {
//     if (filter === 'pending') return canApproveOrReject(item) && (!item.status || item.status === 'pending');
//     if (filter === 'approved') return item.status === 'approved' && canPostToErp();
//     if (filter === 'erp') return item.status === 'erp' && canPostToErp();
//     if (filter === 'rejected') return proposal.created_by === userInfo?.id;
//     return false;
//   };

//   // ─────────────────────────────────────────────
//   // All flat items across all proposals
//   // ─────────────────────────────────────────────
//   const allItems: ProposalItem[] = proposals.flatMap((p) => p.items);

//   // Items that are selectable (actionable for current user)
//   const selectableItems = allItems.filter((item) => {
//     if (filter === 'pending') return canApproveOrReject(item);
//     if (filter === 'approved') return canPostToErp();
//     if (filter === 'erp') return canPostToErp();
//     if (filter === 'rejected') {
//       const proposal = findProposalForItem(proposals, item.id);
//       return proposal?.created_by === userInfo?.id;
//     }
//     return false;
//   });

//   const allSelectableIds = selectableItems.map((i) => i.id);
//   const allSelected =
//     allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedItemIds.has(id));
//   const someSelected = allSelectableIds.some((id) => selectedItemIds.has(id));

//   // ─────────────────────────────────────────────
//   // FETCH
//   // ─────────────────────────────────────────────
//   const fetchProposals = async (payload: any) => {
//     lastPayloadRef.current = payload;
//     setLoading(true);
//     setSelectedItemIds(new Set()); // clear selection on fetch
//     try {
//       const res = await PriceProposalAPI.getAll(payload);
//       setProposals(res.data || []);
//       setApprovalPipeline(res.user_level_info || []);
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
//     const payload: any = {
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };
//     if (kamFilter !== 'all') payload.kam_id = kamFilter;
//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;
//     fetchProposals(payload);
//   }, [filter, kamFilter, clientTypeFilter, startYear, endYear]);

//   const handleFilterChange = (newKam: string) => {
//     const payload: any = {
//       page: 1,
//       per_page: ITEMS_PER_PAGE,
//       status: filter,
//     };
//     if (newKam !== 'all') payload.kam_id = newKam;
//     if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
//     if (startYear) payload.start_year = startYear;
//     if (endYear) payload.end_year = endYear;
//     fetchProposals(payload);
//   };

//   // ─────────────────────────────────────────────
//   // SELECTION HANDLERS
//   // ─────────────────────────────────────────────
//   const toggleItem = (itemId: number) => {
//     setSelectedItemIds((prev) => {
//       const next = new Set(prev);
//       if (next.has(itemId)) next.delete(itemId);
//       else next.add(itemId);
//       return next;
//     });
//   };

//   const toggleSelectAll = () => {
//     if (allSelected) {
//       setSelectedItemIds(new Set());
//     } else {
//       setSelectedItemIds(new Set(allSelectableIds));
//     }
//   };

//   // ─────────────────────────────────────────────
//   // BULK ACTIONS
//   // ─────────────────────────────────────────────
//   const getSelectedItems = () =>
//     allItems.filter((item) => selectedItemIds.has(item.id));

//   const handleBulkApprove = async () => {
//     const items = getSelectedItems();
//     if (!items.length) return;
//     if (!confirm(`Approve ${items.length} selected item(s)?`)) return;
//     setBulkLoading(true);
//     try {
//       await Promise.all(items.map((item) => PriceProposalAPI.approveItem(item.id, item)));
//       setSelectedItemIds(new Set());
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Bulk approve failed:', error);
//       alert('Some items failed to approve.');
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const handleBulkRejectSubmit = async () => {
//     if (!bulkRejectNote.trim()) {
//       alert('Rejection reason is required');
//       return;
//     }
//     const items = getSelectedItems();
//     setBulkLoading(true);
//     try {
//       await Promise.all(
//         items.map((item) =>
//           PriceProposalAPI.rejectItem(item.id, {
//             status: 'rejected',
//             rejected_note: bulkRejectNote,
//           })
//         )
//       );
//       setBulkRejectOpen(false);
//       setBulkRejectNote('');
//       setSelectedItemIds(new Set());
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Bulk reject failed:', error);
//       alert('Some items failed to reject.');
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const handleBulkPostToErp = async () => {
//     const items = getSelectedItems();
//     if (!items.length) return;
//     if (!confirm(`Post ${items.length} selected item(s) to ERP?`)) return;
//     setBulkLoading(true);
//     try {
//       await Promise.all(
//         items.map((item) => {
//           const proposal = findProposalForItem(proposals, item.id)!;
//           return PriceProposalAPI.storeStatusTrack(proposal.id, {
//             status: { status: 'erp', item_id: item.id },
//           });
//         })
//       );
//       setSelectedItemIds(new Set());
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Bulk post to ERP failed:', error);
//       alert('Some items failed to post.');
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const handleBulkUnpostFromErp = async () => {
//     const items = getSelectedItems();
//     if (!items.length) return;
//     if (!confirm(`Unpost ${items.length} selected item(s) from ERP?`)) return;
//     setBulkLoading(true);
//     try {
//       await Promise.all(
//         items.map((item) => {
//           const proposal = findProposalForItem(proposals, item.id)!;
//           return PriceProposalAPI.storeStatusTrack(proposal.id, {
//             status: { status: 'approved', item_id: item.id },
//           });
//         })
//       );
//       setSelectedItemIds(new Set());
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Bulk unpost failed:', error);
//       alert('Some items failed to unpost.');
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   const handleBulkDelete = async () => {
//     const items = getSelectedItems();
//     if (!items.length) return;
//     if (!confirm(`Delete ${items.length} selected item(s)?`)) return;
//     setBulkLoading(true);
//     try {
//       await Promise.all(items.map((item) => PriceProposalAPI.deleteItem(item.id)));
//       setSelectedItemIds(new Set());
//       fetchProposals(lastPayloadRef.current);
//     } catch (error) {
//       console.error('Bulk delete failed:', error);
//       alert('Some items failed to delete.');
//     } finally {
//       setBulkLoading(false);
//     }
//   };

//   // ─────────────────────────────────────────────
//   // SINGLE ITEM ACTIONS
//   // ─────────────────────────────────────────────
//   const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to approve this item?')) return;
//     if (item.status === 'approved') { alert('This item is already approved.'); return; }
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
//     if (!rejectData.rejected_note.trim()) { alert('Rejection reason is required'); return; }
//     try {
//       const payload = {
//         status: rejectData.status,
//         rejected_note: rejectData.rejected_note,
//         suggested_price: rejectData.suggested_price ? Number(rejectData.suggested_price) : undefined,
//         suggested_volume: rejectData.suggested_volume ? Number(rejectData.suggested_volume) : undefined,
//       };
//       await PriceProposalAPI.rejectItem(rejectingItem.item.id, payload);
//       setRejectingItem(null);
//       setRejectData({ status: 'rejected', rejected_note: '', suggested_price: '', suggested_volume: '' });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Rejection failed:', error);
//       alert(error.response?.data?.message || 'Failed to reject item');
//     }
//   };

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

//   const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to post this item to ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, { status: { status: 'erp', item_id: item.id } });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to post to ERP:', error);
//       alert(error.response?.data?.message || 'Failed to post to ERP');
//     }
//   };

//   const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
//     if (!confirm('Are you sure you want to unpost this item from ERP?')) return;
//     try {
//       await PriceProposalAPI.storeStatusTrack(proposal.id, { status: { status: 'approved', item_id: item.id } });
//       fetchProposals(lastPayloadRef.current);
//     } catch (error: any) {
//       console.error('Failed to unpost from ERP:', error);
//       alert(error.response?.data?.message || 'Failed to unpost from ERP');
//     }
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

//   // ─────────────────────────────────────────────
//   // UI HELPERS
//   // ─────────────────────────────────────────────
//   const currentLevelPrint = (itemLevel?: number) => {
//     const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
//     if (!step) return <span className="text-gray-400">N/A</span>;
//     return (
//       <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//         {`L-${(step as any).level_id} (${(step as any).fullname})`}
//       </span>
//     );
//   };

//   const getItemStatusBadge = (status?: string) => {
//     const map: Record<string, { label: string; cls: string }> = {
//       pending: { label: 'Pending', cls: 'bg-yellow-100 text-yellow-800' },
//       approved: { label: 'Approved', cls: 'bg-green-100 text-green-800' },
//       rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800' },
//       erp: { label: 'ERP', cls: 'bg-purple-100 text-purple-800' },
//     };
//     const cfg = map[status ?? 'pending'] ?? map['pending'];
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.cls}`}>{cfg.label}</span>
//     );
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

//   const renderInvoiceDifference = (totalAmount?: number, currentTotal?: string | number) => {
//     if (totalAmount === undefined || currentTotal === undefined || currentTotal === null)
//       return <span className="text-gray-400">N/A</span>;
//     const total = typeof totalAmount === 'number' ? totalAmount : parseFloat(String(totalAmount));
//     const current = typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
//     if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
//     const diff = total - current;
//     return (
//       <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
//         {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
//       </span>
//     );
//   };

//   const selectedKamLabel =
//     kamFilter !== 'all'
//       ? kams.find((k: any) => String(k.kam_id) === kamFilter)?.kam_name ?? kamFilter
//       : null;

//   const selectedCount = selectedItemIds.size;

//   // ─────────────────────────────────────────────
//   // TAB CONFIG
//   // ─────────────────────────────────────────────
//   const tabConfig = [
//     {
//       key: 'pending' as const,
//       label: 'Pending',
//       activeClass: 'bg-yellow-400 text-white hover:bg-yellow-500',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-yellow-100',
//       badgeClass: 'bg-yellow-400',
//     },
//     {
//       key: 'approved' as const,
//       label: 'Approved',
//       activeClass: 'bg-green-500 text-white hover:bg-green-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-green-100',
//       badgeClass: 'bg-green-500',
//     },
//     {
//       key: 'rejected' as const,
//       label: 'Rejected',
//       activeClass: 'bg-red-500 text-white hover:bg-red-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-red-100',
//       badgeClass: 'bg-red-500',
//     },
//     {
//       key: 'erp' as const,
//       label: 'Posted in ERP',
//       activeClass: 'bg-purple-500 text-white hover:bg-purple-600',
//       inactiveClass: 'bg-white text-gray-700 border border-gray-300 hover:bg-purple-100',
//       badgeClass: 'bg-purple-500',
//     },
//   ];

//   // ─────────────────────────────────────────────
//   // RENDER
//   // ─────────────────────────────────────────────
//   return (
//     <div className="space-y-4">
//       {/* ── TOP BAR ── */}
//       <div className="flex items-center justify-between flex-wrap gap-3">
//         {/* STATUS TABS */}
//         <div className="flex gap-2 flex-wrap">
//           {tabConfig.map(({ key, label, activeClass, inactiveClass, badgeClass }) => (
//             <Button
//               key={key}
//               onClick={() => setFilter(key)}
//               className={`relative overflow-visible rounded-md px-4 py-1 ${
//                 filter === key ? activeClass : inactiveClass
//               }`}
//             >
//               {label}
//               {statusCounts[key] > 0 && (
//                 <span
//                   className={`absolute -top-2 -right-2 min-w-[20px] h-5 px-1
//                     flex items-center justify-center rounded-full text-xs font-bold text-white
//                     ${badgeClass}`}
//                 >
//                   {statusCounts[key]}
//                 </span>
//               )}
//             </Button>
//           ))}
//         </div>

//         {/* FILTER DRAWER + PIPELINE */}
//         <div className="flex items-center gap-4 flex-wrap">
//           <ApprovalFilterDrawer
//             division="all"
//             setDivision={() => {}}
//             kam={kamFilter}
//             setKam={setKamFilter}
//             clientType={clientTypeFilter}
//             setClientType={setClientTypeFilter}
//             kams={kams}
//             setKams={setKams}
//             viewMode="yearly"
//             setViewMode={() => {}}
//             startYear={startYear}
//             setStartYear={setStartYear}
//             endYear={endYear}
//             setEndYear={setEndYear}
//             onFilterChange={handleFilterChange}
//             userRole="super_admin"
//           />

//           {approvalPipeline.length > 0 && (
//             <div className="flex items-center gap-2 flex-wrap">
//               {approvalPipeline.map((step: any, index: number) => {
//                 const isLast = index === approvalPipeline.length - 1;
//                 const cap = (t?: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1) : '');
//                 return (
//                   <React.Fragment key={`${step.level_id}-${step.user_id}`}>
//                     <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//                       {cap(step.fullname)}
//                     </span>
//                     {!isLast && <span className="text-gray-400">→</span>}
//                   </React.Fragment>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── ACTIVE KAM FILTER PILL ── */}
//       {selectedKamLabel && (
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-500">Filtering by KAM:</span>
//           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
//             {selectedKamLabel}
//             <button
//               onClick={() => setKamFilter('all')}
//               className="ml-1 text-blue-500 hover:text-blue-800 font-bold leading-none"
//               title="Clear KAM filter"
//             >
//               ×
//             </button>
//           </span>
//           <span className="text-xs text-gray-400">({proposals.length} proposals)</span>
//         </div>
//       )}

//       {/* ── BULK ACTION TOOLBAR ── */}
//       {selectedCount > 0 && (
//         <div className="flex items-center gap-3 flex-wrap px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
//           <span className="text-sm font-semibold text-gray-700">
//             {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
//           </span>
//           <div className="h-4 w-px bg-gray-300" />

//           {/* Pending tab bulk actions */}
//           {filter === 'pending' && (
//             <>
//               <Button
//                 size="sm"
//                 disabled={bulkLoading}
//                 onClick={handleBulkApprove}
//               >
//                 {bulkLoading ? 'Processing...' : `Approve (${selectedCount})`}
//               </Button>
//               <Button
//                 size="sm"
//                 variant="destructive"
//                 disabled={bulkLoading}
//                 onClick={() => setBulkRejectOpen(true)}
//               >
//                 Reject ({selectedCount})
//               </Button>
//             </>
//           )}

//           {/* Approved tab bulk actions */}
//           {filter === 'approved' && canPostToErp() && (
//             <Button
//               size="sm"
//               className="bg-purple-600 hover:bg-purple-700 text-white"
//               disabled={bulkLoading}
//               onClick={handleBulkPostToErp}
//             >
//               {bulkLoading ? 'Processing...' : `Post to ERP (${selectedCount})`}
//             </Button>
//           )}

//           {/* ERP tab bulk actions */}
//           {filter === 'erp' && canPostToErp() && (
//             <Button
//               size="sm"
//               variant="outline"
//               className="border-purple-500 text-purple-700 hover:bg-purple-50"
//               disabled={bulkLoading}
//               onClick={handleBulkUnpostFromErp}
//             >
//               {bulkLoading ? 'Processing...' : `Unpost from ERP (${selectedCount})`}
//             </Button>
//           )}

//           {/* Rejected tab bulk actions */}
//           {filter === 'rejected' && (
//             <Button
//               size="sm"
//               variant="outline"
//               className="border-red-400 text-red-600 hover:bg-red-50"
//               disabled={bulkLoading}
//               onClick={handleBulkDelete}
//             >
//               {bulkLoading ? 'Processing...' : `Delete (${selectedCount})`}
//             </Button>
//           )}

//           <Button
//             size="sm"
//             variant="ghost"
//             className="ml-auto text-gray-500"
//             onClick={() => setSelectedItemIds(new Set())}
//           >
//             Clear selection
//           </Button>
//         </div>
//       )}

//       {/* ── TABLE ── */}
//       {loading ? (
//         <div className="text-center py-8">Loading...</div>
//       ) : (
//         <div className="border rounded-xl overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 {/* SELECT-ALL CHECKBOX */}
//                 <TableHead className="w-10">
//                   {allSelectableIds.length > 0 && (
//                     <Checkbox
//                       checked={allSelected}
//                       onCheckedChange={toggleSelectAll}
//                       aria-label="Select all"
//                       style={{ marginLeft: "-8px" }}
//                       // indeterminate state: some but not all selected
//                       ref={(el) => {
//                         if (el) (el as any).indeterminate = someSelected && !allSelected;
//                       }}
//                     />
//                   )}
//                 </TableHead>
//                 <TableHead>KAM</TableHead>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Product</TableHead>
//                 <TableHead>Service</TableHead>
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
//                 {filter === 'pending' && <TableHead>Requested By</TableHead>}
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
//                   <TableCell colSpan={20} className="text-center py-8 text-gray-500">
//                     {selectedKamLabel
//                       ? `No proposals found for KAM: ${selectedKamLabel}`
//                       : 'No proposals found'}
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 proposals.map((p) =>
//                   p.items.map((item, idx) => {
//                     const selectable = isItemSelectable(item, p);
//                     const isChecked = selectedItemIds.has(item.id);

//                     return (
//                       <TableRow
//                         key={`${p.id}-${item.id}`}
//                         className={isChecked ? 'bg-blue-50' : undefined}
//                       >
//                         {/* CHECKBOX CELL */}
//                         <TableCell>
//                           {selectable ? (
//                             <Checkbox
//                               checked={isChecked}
//                               onCheckedChange={() => toggleItem(item.id)}
//                               aria-label={`Select item ${item.id}`}
//                             />
//                           ) : (
//                             <span className="block w-4" /> // placeholder to keep alignment
//                           )}
//                         </TableCell>

//                         {idx === 0 && (
//                           <>
//                             <TableCell rowSpan={p.items.length}>
//                               {p.kam_name || p.created_by_user?.name || 'N/A'}
//                             </TableCell>
//                             <TableCell rowSpan={p.items.length}>
//                               {p.client_name || clients[p.client_id] || `Client #${p.client_id}`}
//                             </TableCell>
//                           </>
//                         )}

//                         <TableCell>{item.product_name || `Product #${item.product_id}`}</TableCell>
//                         <TableCell>
//                           {item.service_uid ? (
//                             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
//                               {item.service_uid}
//                             </span>
//                           ) : (
//                             <span className="text-gray-400">—</span>
//                           )}
//                         </TableCell>
//                         <TableCell>{item.current_price}</TableCell>
//                         <TableCell>{item.proposed_price}/{item.unit}</TableCell>
//                         <TableCell>{item.volume}</TableCell>
//                         <TableCell className="font-semibold">
//                           {item.total_amount.toLocaleString()}
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           {formatPrice(item.current_unit_cost)}
//                         </TableCell>
//                         <TableCell className="font-medium">
//                           {formatQuantity(item.current_quantity)}
//                         </TableCell>
//                         <TableCell className="font-medium text-blue-600">
//                           {formatPrice(item.current_total)}
//                         </TableCell>
//                         <TableCell>
//                           {renderInvoiceDifference(item.total_amount, item.current_total)}
//                         </TableCell>
//                         <TableCell>{getItemStatusBadge(item.status)}</TableCell>
//                         <TableCell>{currentLevelPrint(item.current_level)}</TableCell>
//                         <TableCell>{item.effective_date}</TableCell>

//                         {idx === 0 && filter === 'pending' && (
//                           <TableCell rowSpan={p.items.length}>
//                             {p.created_by_name || 'N/A'}
//                           </TableCell>
//                         )}

//                         {filter === 'rejected' && (
//                           <>
//                             <TableCell>{item.action_by_name || 'N/A'}</TableCell>
//                             <TableCell>{item.rejected_note || 'N/A'}</TableCell>
//                             <TableCell>
//                               {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
//                             </TableCell>
//                             <TableCell>
//                               {item.suggested_volume ? `${item.suggested_volume}/${item.unit}` : 'N/A'}
//                             </TableCell>
//                           </>
//                         )}

//                         {/* ── SINGLE-ROW ACTIONS ── */}
//                         <TableCell>
//                           <div className="flex gap-2 flex-wrap">
//                             {canApproveOrReject(item) && (!item.status || item.status === 'pending') && (
//                               <>
//                                 <Button
//                                   type="button"
//                                   size="sm"
//                                   onClick={(e) => { e.stopPropagation(); handleApproveItem(p, item); }}
//                                 >
//                                   Approve
//                                 </Button>
//                                 <Button
//                                   type="button"
//                                   size="sm"
//                                   variant="destructive"
//                                   onClick={(e) => { e.stopPropagation(); handleRejectClick(p, item); }}
//                                 >
//                                   Reject
//                                 </Button>
//                               </>
//                             )}

//                             {filter === 'approved' && item.status === 'approved' && canPostToErp() && (
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 className="bg-purple-600 hover:bg-purple-700 text-white"
//                                 onClick={(e) => { e.stopPropagation(); handlePostToErp(p, item); }}
//                               >
//                                 Posted in ERP
//                               </Button>
//                             )}

//                             {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="outline"
//                                 className="border-purple-500 text-purple-700 hover:bg-purple-50"
//                                 onClick={(e) => { e.stopPropagation(); handleUnpostFromErp(p, item); }}
//                               >
//                                 Unposted in ERP
//                               </Button>
//                             )}

//                             {item.status === 'rejected' && p.created_by === userInfo?.id && (
//                               <Button
//                                 type="button"
//                                 size="sm"
//                                 variant="destructive"
//                                 onClick={() => handleReviseClick(item)}
//                               >
//                                 Revise
//                               </Button>
//                             )}

//                             {(item.status === 'pending' || item.status === 'rejected') &&
//                               item.created_by === userInfo?.id && (
//                                 <Button
//                                   type="button"
//                                   size="sm"
//                                   variant="outline"
//                                   onClick={() => handleDeleteItem(item)}
//                                 >
//                                   Delete
//                                 </Button>
//                               )}
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })
//                 )
//               )}
//             </TableBody>
//           </Table>

//           {totalPages > 1 && (
//             <div className="flex justify-end mt-4">
//               <AppPagination
//                 currentPage={currentPage}
//                 totalPages={totalPages}
//                 onPageChange={(page) => fetchProposals({ ...lastPayloadRef.current, page })}
//               />
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── REJECT DIALOG (single item) ── */}
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
//               onChange={(e) => setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))}
//             />
//             <div className="border-t pt-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <FloatingInput
//                   label="Recommended Price"
//                   type="number"
//                   step="0.01"
//                   value={rejectData.suggested_price}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))}
//                 />
//                 <FloatingInput
//                   label="Recommended Volume"
//                   type="number"
//                   value={rejectData.suggested_volume}
//                   onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))}
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

//       {/* ── BULK REJECT DIALOG ── */}
//       <Dialog open={bulkRejectOpen} onOpenChange={() => setBulkRejectOpen(false)}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Bulk Reject ({selectedCount} items)</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <p className="text-sm text-gray-600">
//               This rejection reason will be applied to all{' '}
//               <strong>{selectedCount}</strong> selected items.
//             </p>
//             <FloatingInput
//               label="Rejection Reason *"
//               value={bulkRejectNote}
//               onChange={(e) => setBulkRejectNote(e.target.value)}
//             />
//           </div>
//           <div className="flex gap-2 mt-4">
//             <Button
//               variant="outline"
//               className="flex-1"
//               onClick={() => { setBulkRejectOpen(false); setBulkRejectNote(''); }}
//             >
//               Cancel
//             </Button>
//             <Button
//               variant="destructive"
//               className="flex-1"
//               disabled={bulkLoading}
//               onClick={handleBulkRejectSubmit}
//             >
//               {bulkLoading ? 'Rejecting...' : `Confirm Reject (${selectedCount})`}
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── REVISE DIALOG ── */}
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



'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PriceProposalAPI } from '@/api/priceProposalApi.js';
import { AppPagination } from '@/components/common/AppPagination';
import { ApprovalFilterDrawer } from '@/components/filters/ApprovalFilterDrawer';

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
  service_uid?: string;
}

interface Proposal {
  id: number;
  client_id: number;
  client_name?: string;
  kam_name?: string;
  kam_id?: number;
  status: 'pending' | 'approved' | 'rejected' | 'erp';
  rejected_note?: string;
  created_by: number;
  created_by_name?: string;
  current_owner_id: number;
  action_by_name?: string;
  created_by_supervisor_id?: number;
  created_by_user?: { id: number; name: string; role: string };
  current_owner?: { id: number; name: string };
  items: ProposalItem[];
}

// Helper to find the parent proposal for an item
function findProposalForItem(proposals: Proposal[], itemId: number): Proposal | undefined {
  return proposals.find((p) => p.items.some((i) => i.id === itemId));
}

export default function OrderProposalList() {
  const { currentUser, hasPermission } = useAuth();
  const userInfo = getUserInfo();

  const [approvalPipeline, setApprovalPipeline] = useState([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'erp'>('pending');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Record<number, string>>({});

  // ── CONFIRM DIALOG STATE ──
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    message: string;
    onConfirm: () => void;
  }>({ open: false, message: '', onConfirm: () => {} });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, message, onConfirm });
  };
  const closeConfirm = () => setConfirmDialog((prev) => ({ ...prev, open: false }));

  // ── TOAST STATE ──
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [bulkRejectOpen, setBulkRejectOpen] = useState(false);
  const [bulkRejectNote, setBulkRejectNote] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;
  const lastPayloadRef = useRef<any>(null);
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

  const [kams, setKams] = useState<any[]>([]);
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
  const [startYear, setStartYear] = useState<string>('');
  const [endYear, setEndYear] = useState<string>('');

  // ─────────────────────────────────────────────
  // PERMISSIONS  (must be defined before selectableItems)
  // ─────────────────────────────────────────────
  function canApproveOrReject(item: ProposalItem) {
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
      user.default_kam_id &&
      Number(user.default_kam_id) === Number(item.created_by_supervisor_id);
    const hasPrivilegedRole = isSupervisor() || isSuperAdmin() || isManagement();
    if (!hasSupervisorMatch || !hasPrivilegedRole) return false;

    const isCreatedBySupervisor = isSupervisor() && Number(user.id) === Number(item.created_by);
    if (isCreatedBySupervisor) return false;

    return (
      approvalPipeline.some(
        (step: any) =>
          Number(step.user_id) === 9001 &&
          Number(step.level_id) === Number(item.current_level)
      ) &&
      (isManagement() || isSupervisor() || isSuperAdmin())
    );
  }

  const canPostToErp = () => isSuperAdmin() || isManagement();

  // Determine if an item row is selectable
  const isItemSelectable = (item: ProposalItem, proposal: Proposal): boolean => {
    if (filter === 'pending') return canApproveOrReject(item) && (!item.status || item.status === 'pending');
    if (filter === 'approved') return item.status === 'approved' && canPostToErp();
    if (filter === 'erp') return item.status === 'erp' && canPostToErp();
    if (filter === 'rejected') return proposal.created_by === userInfo?.id;
    return false;
  };

  // ─────────────────────────────────────────────
  // All flat items across all proposals
  // ─────────────────────────────────────────────
  const allItems: ProposalItem[] = proposals.flatMap((p) => p.items);

  // Items that are selectable (actionable for current user)
  const selectableItems = allItems.filter((item) => {
    if (filter === 'pending') return canApproveOrReject(item);
    if (filter === 'approved') return canPostToErp();
    if (filter === 'erp') return canPostToErp();
    if (filter === 'rejected') {
      const proposal = findProposalForItem(proposals, item.id);
      return proposal?.created_by === userInfo?.id;
    }
    return false;
  });

  const allSelectableIds = selectableItems.map((i) => i.id);
  const allSelected =
    allSelectableIds.length > 0 && allSelectableIds.every((id) => selectedItemIds.has(id));
  const someSelected = allSelectableIds.some((id) => selectedItemIds.has(id));

  // ─────────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────────
  const fetchProposals = async (payload: any) => {
    lastPayloadRef.current = payload;
    setLoading(true);
    setSelectedItemIds(new Set()); // clear selection on fetch
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
    const payload: any = {
      page: 1,
      per_page: ITEMS_PER_PAGE,
      status: filter,
    };
    if (kamFilter !== 'all') payload.kam_id = kamFilter;
    if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
    if (startYear) payload.start_year = startYear;
    if (endYear) payload.end_year = endYear;
    fetchProposals(payload);
  }, [filter, kamFilter, clientTypeFilter, startYear, endYear]);

  const handleFilterChange = (newKam: string) => {
    const payload: any = {
      page: 1,
      per_page: ITEMS_PER_PAGE,
      status: filter,
    };
    if (newKam !== 'all') payload.kam_id = newKam;
    if (clientTypeFilter !== 'All Client') payload.client_type = clientTypeFilter;
    if (startYear) payload.start_year = startYear;
    if (endYear) payload.end_year = endYear;
    fetchProposals(payload);
  };

  // ─────────────────────────────────────────────
  // SELECTION HANDLERS
  // ─────────────────────────────────────────────
  const toggleItem = (itemId: number) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(allSelectableIds));
    }
  };

  // ─────────────────────────────────────────────
  // BULK ACTIONS
  // ─────────────────────────────────────────────
  const getSelectedItems = () =>
    allItems.filter((item) => selectedItemIds.has(item.id));

  const handleBulkApprove = async () => {
    const items = getSelectedItems();
    if (!items.length) return;
    showConfirm(`Approve ${items.length} selected item(s)?`, async () => {
      setBulkLoading(true);
      try {
        const results = await Promise.allSettled(
          items.map((item) => PriceProposalAPI.approveItem(item.id, { status: 'pending' }))
        );
        const failed = results.filter((r) => r.status === 'rejected');
        if (failed.length) {
          const reasons = failed.map((r: any) =>
            r.reason?.response?.data?.message || r.reason?.response?.data?.error || 'Unknown error'
          );
          showToast(`${failed.length} item(s) failed: ${reasons.join(', ')}`, 'error');
        } else {
          showToast(`${items.length} item(s) approved successfully`, 'success');
        }
        setSelectedItemIds(new Set());
        fetchProposals(lastPayloadRef.current);
      } catch (error: any) {
        showToast(error?.response?.data?.message || 'Bulk approve failed', 'error');
      } finally {
        setBulkLoading(false);
      }
    });
  };

  const handleBulkRejectSubmit = async () => {
    if (!bulkRejectNote.trim()) {
      showToast('Rejection reason is required', 'error');
      return;
    }
    const items = getSelectedItems();
    setBulkLoading(true);
    try {
      await Promise.all(
        items.map((item) =>
          PriceProposalAPI.rejectItem(item.id, {
              status: 'rejected',
              rejected_note: bulkRejectNote,
            })
        )
      );
      setBulkRejectOpen(false);
      setBulkRejectNote('');
      setSelectedItemIds(new Set());
      showToast(`${items.length} item(s) rejected`, 'success');
      fetchProposals(lastPayloadRef.current);
    } catch (error) {
      console.error('Bulk reject failed:', error);
      showToast('Some items failed to reject.', 'error');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkPostToErp = async () => {
    const items = getSelectedItems();
    if (!items.length) return;
    showConfirm(`Post ${items.length} selected item(s) to ERP?`, async () => {
      setBulkLoading(true);
      try {
        await Promise.all(
          items.map((item) => {
            const proposal = findProposalForItem(proposals, item.id)!;
            return PriceProposalAPI.storeStatusTrack(proposal.id, {
              status: { status: 'erp', item_id: item.id },
            });
          })
        );
        setSelectedItemIds(new Set());
        showToast(`${items.length} item(s) posted to ERP`, 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error) {
        showToast('Some items failed to post.', 'error');
      } finally {
        setBulkLoading(false);
      }
    });
  };

  const handleBulkUnpostFromErp = async () => {
    const items = getSelectedItems();
    if (!items.length) return;
    showConfirm(`Unpost ${items.length} selected item(s) from ERP?`, async () => {
      setBulkLoading(true);
      try {
        await Promise.all(
          items.map((item) => {
            const proposal = findProposalForItem(proposals, item.id)!;
            return PriceProposalAPI.storeStatusTrack(proposal.id, {
              status: { status: 'approved', item_id: item.id },
            });
          })
        );
        setSelectedItemIds(new Set());
        showToast(`${items.length} item(s) unposted from ERP`, 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error) {
        showToast('Some items failed to unpost.', 'error');
      } finally {
        setBulkLoading(false);
      }
    });
  };

  const handleBulkDelete = async () => {
    const items = getSelectedItems();
    if (!items.length) return;
    showConfirm(`Delete ${items.length} selected item(s)?`, async () => {
      setBulkLoading(true);
      try {
        await Promise.all(items.map((item) => PriceProposalAPI.deleteItem(item.id)));
        setSelectedItemIds(new Set());
        showToast(`${items.length} item(s) deleted`, 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error) {
        showToast('Some items failed to delete.', 'error');
      } finally {
        setBulkLoading(false);
      }
    });
  };

  // ─────────────────────────────────────────────
  // SINGLE ITEM ACTIONS
  // ─────────────────────────────────────────────
  const handleApproveItem = async (proposal: Proposal, item: ProposalItem) => {
    if (item.status === 'approved') { showToast('This item is already approved.', 'error'); return; }
    try {
      // approveItem(id, payload) calls api.post(url, { status: payload })
      // so we pass the inner object directly — backend receives { status: { status: 'pending' } }
      const res = await PriceProposalAPI.approveItem(item.id, { status: 'pending' });
      console.log('✅ Approve response:', res);
      showToast('Item approved successfully', 'success');
      fetchProposals(lastPayloadRef.current);
    } catch (error: any) {
      console.error('❌ Failed to approve item:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || JSON.stringify(error?.response?.data) || 'Failed to approve item';
      showToast(`Approve failed: ${msg}`, 'error');
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
    if (!rejectData.rejected_note.trim()) { showToast('Rejection reason is required', 'error'); return; }
    try {
      // rejectItem(id, payload) calls api.post(url, { status: payload })
      // so pass the inner object directly
      await PriceProposalAPI.rejectItem(rejectingItem.item.id, {
        status: 'rejected',
        rejected_note: rejectData.rejected_note,
        suggested_price: rejectData.suggested_price ? Number(rejectData.suggested_price) : undefined,
        suggested_volume: rejectData.suggested_volume ? Number(rejectData.suggested_volume) : undefined,
      });
      setRejectingItem(null);
      setRejectData({ status: 'rejected', rejected_note: '', suggested_price: '', suggested_volume: '' });
      showToast('Item rejected', 'success');
      fetchProposals(lastPayloadRef.current);
    } catch (error: any) {
      console.error('Rejection failed:', error);
      showToast(error.response?.data?.message || 'Failed to reject item', 'error');
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

  const handlePostToErp = async (proposal: Proposal, item: ProposalItem) => {
    showConfirm('Post this item to ERP?', async () => {
      try {
        await PriceProposalAPI.storeStatusTrack(proposal.id, { status: { status: 'erp', item_id: item.id } });
        showToast('Item posted to ERP', 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Failed to post to ERP', 'error');
      }
    });
  };

  const handleUnpostFromErp = async (proposal: Proposal, item: ProposalItem) => {
    showConfirm('Unpost this item from ERP?', async () => {
      try {
        await PriceProposalAPI.storeStatusTrack(proposal.id, { status: { status: 'approved', item_id: item.id } });
        showToast('Item unposted from ERP', 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error: any) {
        showToast(error.response?.data?.message || 'Failed to unpost from ERP', 'error');
      }
    });
  };

  const handleDeleteItem = async (item: ProposalItem) => {
    showConfirm('Delete this proposal item?', async () => {
      try {
        await PriceProposalAPI.deleteItem(item.id);
        showToast('Item deleted', 'success');
        fetchProposals(lastPayloadRef.current);
      } catch (error) {
        showToast('Failed to delete item', 'error');
      }
    });
  };

  // ─────────────────────────────────────────────
  // UI HELPERS
  // ─────────────────────────────────────────────
  const currentLevelPrint = (itemLevel?: number) => {
    const step = approvalPipeline.find((s: any) => Number(s.level_id) === Number(itemLevel));
    if (!step) return <span className="text-gray-400">N/A</span>;
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
        {`L-${(step as any).level_id} (${(step as any).fullname})`}
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
    const current = typeof currentTotal === 'number' ? currentTotal : parseFloat(String(currentTotal));
    if (isNaN(total) || isNaN(current)) return <span className="text-gray-400">N/A</span>;
    const diff = total - current;
    return (
      <span className={`font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(2)}
      </span>
    );
  };

  const selectedKamLabel =
    kamFilter !== 'all'
      ? kams.find((k: any) => String(k.kam_id) === kamFilter)?.kam_name ?? kamFilter
      : null;

  const selectedCount = selectedItemIds.size;

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* STATUS TABS */}
        <div className="flex gap-2 flex-wrap">
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

        {/* FILTER DRAWER + PIPELINE */}
        <div className="flex items-center gap-4 flex-wrap">
          <ApprovalFilterDrawer
            division="all"
            setDivision={() => {}}
            kam={kamFilter}
            setKam={setKamFilter}
            clientType={clientTypeFilter}
            setClientType={setClientTypeFilter}
            kams={kams}
            setKams={setKams}
            viewMode="yearly"
            setViewMode={() => {}}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            onFilterChange={handleFilterChange}
            userRole="super_admin"
          />

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
      </div>

      {/* ── ACTIVE KAM FILTER PILL ── */}
      {selectedKamLabel && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Filtering by KAM:</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            {selectedKamLabel}
            <button
              onClick={() => setKamFilter('all')}
              className="ml-1 text-blue-500 hover:text-blue-800 font-bold leading-none"
              title="Clear KAM filter"
            >
              ×
            </button>
          </span>
          <span className="text-xs text-gray-400">({proposals.length} proposals)</span>
        </div>
      )}

      {/* ── BULK ACTION TOOLBAR ── */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 flex-wrap px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm">
          <span className="text-sm font-semibold text-gray-700">
            {selectedCount} item{selectedCount > 1 ? 's' : ''} selected
          </span>
          <div className="h-4 w-px bg-gray-300" />

          {/* Pending tab bulk actions */}
          {filter === 'pending' && (
            <>
              <Button
                size="sm"
                disabled={bulkLoading}
                onClick={handleBulkApprove}
              >
                {bulkLoading ? 'Processing...' : `Approve (${selectedCount})`}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={bulkLoading}
                onClick={() => setBulkRejectOpen(true)}
              >
                Reject ({selectedCount})
              </Button>
            </>
          )}

          {/* Approved tab bulk actions */}
          {filter === 'approved' && canPostToErp() && (
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={bulkLoading}
              onClick={handleBulkPostToErp}
            >
              {bulkLoading ? 'Processing...' : `Post to ERP (${selectedCount})`}
            </Button>
          )}

          {/* ERP tab bulk actions */}
          {filter === 'erp' && canPostToErp() && (
            <Button
              size="sm"
              variant="outline"
              className="border-purple-500 text-purple-700 hover:bg-purple-50"
              disabled={bulkLoading}
              onClick={handleBulkUnpostFromErp}
            >
              {bulkLoading ? 'Processing...' : `Unpost from ERP (${selectedCount})`}
            </Button>
          )}

          {/* Rejected tab bulk actions */}
          {filter === 'rejected' && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-50"
              disabled={bulkLoading}
              onClick={handleBulkDelete}
            >
              {bulkLoading ? 'Processing...' : `Delete (${selectedCount})`}
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            className="ml-auto text-gray-500"
            onClick={() => setSelectedItemIds(new Set())}
          >
            Clear selection
          </Button>
        </div>
      )}

      {/* ── TABLE ── */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="border rounded-xl overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* SELECT-ALL CHECKBOX */}
                <TableHead className="w-10">
                  {allSelectableIds.length > 0 && (
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      style={{ marginLeft: "-8px" }}
                      aria-label="Select all"
                      // indeterminate state: some but not all selected
                      ref={(el) => {
                        if (el) (el as any).indeterminate = someSelected && !allSelected;
                      }}
                    />
                  )}
                </TableHead>
                <TableHead>KAM</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Service</TableHead>
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
                  <TableCell colSpan={20} className="text-center py-8 text-gray-500">
                    {selectedKamLabel
                      ? `No proposals found for KAM: ${selectedKamLabel}`
                      : 'No proposals found'}
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((p) =>
                  p.items.map((item, idx) => {
                    const selectable = isItemSelectable(item, p);
                    const isChecked = selectedItemIds.has(item.id);

                    return (
                      <TableRow
                        key={`${p.id}-${item.id}`}
                        className={isChecked ? 'bg-blue-50' : undefined}
                      >
                        {/* CHECKBOX CELL */}
                        <TableCell>
                          {selectable ? (
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleItem(item.id)}
                              aria-label={`Select item ${item.id}`}
                            />
                          ) : (
                            <span className="block w-4" /> // placeholder to keep alignment
                          )}
                        </TableCell>

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
                        <TableCell>
                          {item.service_uid ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                              {item.service_uid}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </TableCell>
                        <TableCell>{item.current_price}</TableCell>
                        <TableCell>{item.proposed_price}/{item.unit}</TableCell>
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

                        {idx === 0 && filter === 'pending' && (
                          <TableCell rowSpan={p.items.length}>
                            {p.created_by_name || 'N/A'}
                          </TableCell>
                        )}

                        {filter === 'rejected' && (
                          <>
                            <TableCell>{item.action_by_name || 'N/A'}</TableCell>
                            <TableCell>{item.rejected_note || 'N/A'}</TableCell>
                            <TableCell>
                              {item.suggested_price ? `${item.suggested_price}/${item.unit}` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              {item.suggested_volume ? `${item.suggested_volume}/${item.unit}` : 'N/A'}
                            </TableCell>
                          </>
                        )}

                        {/* ── SINGLE-ROW ACTIONS ── */}
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {canApproveOrReject(item) && (!item.status || item.status === 'pending') && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleApproveItem(p, item); }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => { e.stopPropagation(); handleRejectClick(p, item); }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}

                            {filter === 'approved' && item.status === 'approved' && canPostToErp() && (
                              <Button
                                type="button"
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={(e) => { e.stopPropagation(); handlePostToErp(p, item); }}
                              >
                                Posted in ERP
                              </Button>
                            )}

                            {filter === 'erp' && item.status === 'erp' && canPostToErp() && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-purple-500 text-purple-700 hover:bg-purple-50"
                                onClick={(e) => { e.stopPropagation(); handleUnpostFromErp(p, item); }}
                              >
                                Unposted in ERP
                              </Button>
                            )}

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
                    );
                  })
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

      {/* ── REJECT DIALOG (single item) ── */}
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
              onChange={(e) => setRejectData((prev) => ({ ...prev, rejected_note: e.target.value }))}
            />
            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Recommended Price"
                  type="number"
                  step="0.01"
                  value={rejectData.suggested_price}
                  onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_price: e.target.value }))}
                />
                <FloatingInput
                  label="Recommended Volume"
                  type="number"
                  value={rejectData.suggested_volume}
                  onChange={(e) => setRejectData((prev) => ({ ...prev, suggested_volume: e.target.value }))}
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

      {/* ── BULK REJECT DIALOG ── */}
      <Dialog open={bulkRejectOpen} onOpenChange={() => setBulkRejectOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Reject ({selectedCount} items)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This rejection reason will be applied to all{' '}
              <strong>{selectedCount}</strong> selected items.
            </p>
            <FloatingInput
              label="Rejection Reason *"
              value={bulkRejectNote}
              onChange={(e) => setBulkRejectNote(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setBulkRejectOpen(false); setBulkRejectNote(''); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={bulkLoading}
              onClick={handleBulkRejectSubmit}
            >
              {bulkLoading ? 'Rejecting...' : `Confirm Reject (${selectedCount})`}
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

      {/* ── CONFIRM DIALOG ── */}
      <Dialog open={confirmDialog.open} onOpenChange={closeConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-2">{confirmDialog.message}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={closeConfirm}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                closeConfirm();
                confirmDialog.onConfirm();
              }}
            >
              Confirm
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── TOAST ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium transition-all
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}