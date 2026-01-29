// import { useState, useEffect, useMemo } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePicker } from '@/components/ui/FloatingDatePicker';
// import { SelectItem } from '@/components/ui/select';
// import type { Client } from '@/data/mockData';
// import { PrismAPI } from '@/api';

// /* -------------------- TYPES -------------------- */

// interface ActivityModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (payload: any) => void;
//   editingActivity?: any;
//   clients: Client[];
//   activityTypes: {
//     value: number; // activity_type_id
//     label: string;
//   }[];
//   kams: {
//     // ✅ ADD THIS
//     value: number;
//     label: string;
//   }[];
//   // kams?: KAM[];
//   userRole?: string;
//   userId: number; // logged-in user id
// }

// type ClientOption = {
//   value: number;
//   label: string;
// };

// /* -------------------- COMPONENT -------------------- */
// export function ActivityModal({
//   open,
//   onClose,
//   onSave,
//   editingActivity,
//   activityTypes = [],
//   kams = [],
//   userRole,
//   userId,
// }: ActivityModalProps) {
//   const isSupervisor = ['supervisor', 'super_admin', 'boss'].includes(userRole || '');

//   console.log('passing kams to modal', kams);
//   /* -------------------- FORM STATE (BACKEND KEYS) -------------------- */
//   const [formData, setFormData] = useState<{
//     kam_id: number | null;
//     client_id: number | null;
//     activity_type_id: number | null;
//     posted_by: number;

//     title: string;
//     description: string;
//     meeting_location: string;
//     activity_schedule: string;
//     status: string;
//   }>({
//     kam_id: null,
//     client_id: null,
//     activity_type_id: null,
//     posted_by: userId,

//     title: '',
//     description: '',
//     meeting_location: '',
//     activity_schedule: '',
//     status: 'upcoming',
//   });

//   const [clientsByKam, setClientsByKam] = useState<ClientOption[]>([]);

//   /* -------------------- RESET ON OPEN -------------------- */
//   useEffect(() => {
//     if (open) {
//       setFormData({
//         kam_id: null,
//         client_id: null,
//         activity_type_id: null,
//         posted_by: userId,

//         title: '',
//         description: '',
//         meeting_location: '',
//         activity_schedule: '',
//         status: 'upcoming',
//       });
//     }
//   }, [open, userId]);

//   useEffect(() => {
//     if (!editingActivity) return;

//     // 🔹 prefill form
//     setFormData({
//       kam_id: Number(editingActivity.kam_id),
//       client_id: Number(editingActivity.client_id),
//       activity_type_id: Number(editingActivity.activity_type_id),
//       title: editingActivity.title ?? '',
//       description: editingActivity.description ?? '',
//       meeting_location: editingActivity.meeting_location ?? '',
//       activity_schedule: editingActivity.activity_schedule ?? '',
//     });

//     // 🔥 EDIT MODE → fetch clients for this KAM
//     if (editingActivity.kam_id) {
//       PrismAPI.getKamWiseClients(editingActivity.kam_id).then((res) => {
//         const options = (res.data || []).map((item: any) => ({
//           value: item.party_id,
//           label: item.client,
//         }));

//         setClientsByKam(options);
//       });
//     }
//   }, [editingActivity]);

//   /* -------------------- SUBMIT -------------------- */
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload = {
//       kam_id: formData.kam_id,
//       client_id: formData.client_id,
//       activity_type_id: formData.activity_type_id,
//       posted_by: formData.posted_by,

//       title: formData.title,
//       description: formData.description || null,
//       meeting_location: formData.meeting_location || null,
//       activity_schedule: formData.activity_schedule || null,
//       status: formData.status,
//     };

//     onSave(payload);
//     // onClose();
//   };

//   console.log('kamcheck', kams);
//   /* -------------------- UI -------------------- */
//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create New Task</DialogTitle>
//           <DialogDescription>Fill in the task details below.</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* -------------------- KAM (SUPERVISOR ONLY) -------------------- */}

//           {/* <FloatingSelect
//             label="Kam *"
//             value={formData.kam_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 kam_id: Number(value),
//                 client_id: null,
//               })
//             }
//           >
//             {kams.map((kam) => (
//               <SelectItem key={kam.value} value={kam.value.toString()}>
//                 {kam.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect> */}

//           <FloatingSelect
//             label="KAM *"
//             value={formData.kam_id?.toString() ?? ''}
//             onValueChange={async (value) => {
//               const kamId = Number(value);

//               setFormData({
//                 ...formData,
//                 kam_id: kamId,
//                 client_id: null, // 👈 reset client
//               });

//               // 👇 fetch clients by kam_id
//               try {
//                 const res = await PrismAPI.getKamWiseClients(kamId);

//                 const options = (res.data || []).map((item: any) => ({
//                   value: item.party_id,
//                   label: item.client,
//                 }));

//                 setClientsByKam(options);
//               } catch (err) {
//                 console.error('Failed to fetch clients', err);
//                 setClientsByKam([]);
//               }
//             }}
//           >
//             {kams.map((kam) => (
//               <SelectItem key={kam.value} value={kam.value.toString()}>
//                 {kam.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- CLIENT -------------------- */}
//           {/* <FloatingSelect
//             label="Client *"
//             value={formData.client_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 client_id: Number(value),
//               })
//             }
//           >
//             {filteredClients.map((client) => (
//               <SelectItem key={client.id} value={client.id.toString()}>
//                 {client.name}
//               </SelectItem>
//             ))}
//           </FloatingSelect> */}

//           <FloatingSelect
//             label="Client *"
//             value={formData.client_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 client_id: Number(value),
//               })
//             }
//             disabled={!formData.kam_id} // 👈 KAM না হলে disable
//           >
//             {clientsByKam.map((client) => (
//               <SelectItem key={client.value} value={client.value.toString()}>
//                 {client.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- ACTIVITY TYPE -------------------- */}
//           <FloatingSelect
//             label="Activity Type *"
//             value={formData.activity_type_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 activity_type_id: Number(value),
//               })
//             }
//           >
//             {activityTypes.map((type) => (
//               <SelectItem key={type.value} value={type.value.toString()}>
//                 {type.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- TITLE -------------------- */}
//           <FloatingInput
//             label="Title *"
//             required
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//           />

//           {/* -------------------- DESCRIPTION -------------------- */}
//           <FloatingInput
//             label="Description"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           />

//           {/* -------------------- SCHEDULE -------------------- */}
//           <FloatingDatePicker
//             label="Scheduled Date & Time"
//             value={formData.activity_schedule}
//             onChange={(value) => setFormData({ ...formData, activity_schedule: value })}
//           />

//           {/* -------------------- MEETING LOCATION -------------------- */}
//           {formData.activity_type_id !== null && (
//             <FloatingInput
//               label="Meeting Location"
//               value={formData.meeting_location}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   meeting_location: e.target.value,
//                 })
//               }
//             />
//           )}

//           {/* -------------------- ACTIONS -------------------- */}
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               // disabled={
//               //   !formData.kam_id ||
//               //   !formData.client_id ||
//               //   !formData.activity_type_id ||
//               //   !formData.title
//               // }
//             >
//               Create Task
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// import { useState, useEffect, useMemo } from "react";
// import { FloatingInput } from "@/components/ui/FloatingInput";
// import { FloatingSelect } from "@/components/ui/FloatingSelect";
// import { FloatingDatePicker } from "@/components/ui/FloatingDatePicker";
// import { SelectItem } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import type { Activity, ActivityType, Client } from "@/data/mockData";

// export interface KAM {
//   id: string;
//   name: string;
//   division?: string;
// }

// export interface ActivityModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (activity: Omit<Activity, "id">) => void;
//   editingActivity?: Activity | null;
//   clients: Client[];
//   activityTypes: {
//     value: number;   // activity_type_id
//     label: string;   // formatted label
//   }[];
//   preselectedClientId?: string;
//   preselectedDate?: Date;
//   kams?: KAM[];
//   userRole?: string;

//   // New props for "complete activity" flow
//   requireMessageForComplete?: boolean;
//   onCompleteWithMessage?: (activityId: string, message: string) => void;
// }

// export function ActivityModal({
//   open,
//   onClose,
//   onSave,
//   editingActivity,
//   clients,
// activityTypes = [],
//   preselectedClientId,
//   preselectedDate,
//   kams = [],
//   userRole,
//   requireMessageForComplete = false,
//   onCompleteWithMessage,
// }: ActivityModalProps) {
//   const isSupervisor = ["supervisor", "super_admin", "boss"].includes(userRole || "");
//   const [selectedKamId, setSelectedKamId] = useState<string>("");
//   const [completionMessage, setCompletionMessage] = useState("");

//   const [formData, setFormData] = useState<{
//     clientId: integer;
//     type: ActivityType | null;
//     title: string;
//     description: string;
//     scheduledAt: string;
//     outcome: string;
//     address: string;
//   }>({
//     clientId: preselectedClientId || "",
//     type: null,
//     title: "",
//     description: "",
//     scheduledAt: "",
//     outcome: "",
//     address: "",
//   });

//   // Filter clients by selected KAM for supervisors
//   const filteredClients = useMemo(() => {
//     if (!isSupervisor || !selectedKamId) return clients;
//     return clients.filter((c) => c.assignedKamId === selectedKamId);
//   }, [clients, selectedKamId, isSupervisor]);

//   useEffect(() => {
//     if (editingActivity) {
//       setFormData({
//         clientId: editingActivity.clientId,
//         type: editingActivity.type,
//         title: editingActivity.title,
//         description: editingActivity.description,
//         scheduledAt: editingActivity.scheduledAt.slice(0, 16),
//         outcome: editingActivity.outcome || "",
//         address: editingActivity.address || "",
//       });

//       if (isSupervisor) {
//         const client = clients.find((c) => c.id === editingActivity.clientId);
//         if (client?.assignedKamId) setSelectedKamId(client.assignedKamId);
//       }
//     } else {
//       setFormData({
//         clientId: preselectedClientId || "",
//         type: null,
//         title: "",
//         description: "",
//         scheduledAt: preselectedDate
//           ? new Date(preselectedDate).toISOString().slice(0, 16)
//           : "",
//         outcome: "",
//         address: "",
//       });
//       setSelectedKamId("");
//       setCompletionMessage("");
//     }
//   }, [editingActivity, preselectedClientId, preselectedDate, open, clients, isSupervisor]);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Handle completion with mandatory message
//     if (requireMessageForComplete && editingActivity && onCompleteWithMessage) {
//       if (!completionMessage.trim()) {
//         alert("Completion message is required!");
//         return;
//       }
//       onCompleteWithMessage(editingActivity.id, completionMessage);
//       onClose();
//       return;
//     }

//     // Regular create/edit
//     onSave({
//       clientId: formData.clientId,
//       type: formData.type,
//       title: formData.title,
//       description: formData.description,
//       scheduledAt: new Date(formData.scheduledAt).toISOString(),
//       completedAt: editingActivity?.completedAt || null,
//       outcome: formData.outcome || null,
//       createdBy: editingActivity?.createdBy || "user-1",
//       notes: editingActivity?.notes,
//       address: formData.address || null,
//     });

//     onClose();
//   };

//   return (
//     <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {requireMessageForComplete
//               ? "Complete Activity"
//               : editingActivity
//               ? "Edit Task"
//               : "Create New Task"}
//           </DialogTitle>
//           <DialogDescription>
//             {requireMessageForComplete
//               ? "Add a message to complete the activity."
//               : "Fill in the task details below."}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid gap-4">
//             {requireMessageForComplete ? (
//               <FloatingInput
//                 label="Completion Message *"
//                 value={completionMessage}
//                 onChange={(e) => setCompletionMessage(e.target.value)}
//                 required
//               />
//             ) : (
//               <>
//                 {/* KAM Selection (Supervisor only) */}
//                 {isSupervisor && kams.length > 0 && (
//                   <FloatingSelect
//                     label="KAM *"
//                     value={selectedKamId}
//                     onValueChange={(value) => {
//                       setSelectedKamId(value);
//                       setFormData({ ...formData, clientId: "" });
//                     }}
//                   >
//                     {kams.map((kam) => (
//                       <SelectItem key={kam.id} value={kam.id}>
//                         {kam.name}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 )}

//                 {/* Client Selection */}
//                 <FloatingSelect
//                   label="Client *"
//                   value={formData.clientId}
//                   onValueChange={(value) => {
//                     if (isSupervisor && kams.length > 0 && !selectedKamId) return;
//                     setFormData({ ...formData, clientId: value });
//                   }}
//                 >
//                   {filteredClients?.map((client) => (
//                     <SelectItem key={client.id} value={client.id}>
//                       {client.name}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Activity Type */}
//                 <FloatingSelect
//                   label="Activity Type *"
//                   value={formData.type}
//                   onValueChange={(value) =>
//                     setFormData({ ...formData, type: value as ActivityType })
//                   }
//                 >
//                   {activityTypes.map((type) => (
//                     <SelectItem key={type.value} value={type.value}>
//                       {type.label}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Title */}
//                 <FloatingInput
//                   label="Title/Reason *"
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   required
//                 />

//                 {/* Description */}
//                 <FloatingInput
//                   label="Description"
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 />

//                 {/* Scheduled At */}
//                 <FloatingDatePicker
//                   label="Scheduled Date & Time *"
//                   value={formData.scheduledAt}
//                   onChange={(value) => setFormData({ ...formData, scheduledAt: value })}
//                 />

//                 {/* Meeting Address */}
//                 {(formData.type === "physical_meeting" || formData.type === "follow_up") && (
//                   <FloatingInput
//                     label="Meeting Address *"
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     required
//                   />
//                 )}

//                 {/* Outcome (edit only) */}
//                 {editingActivity && (
//                   <FloatingInput
//                     label="Outcome"
//                     value={formData.outcome}
//                     onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
//                   />
//                 )}
//               </>
//             )}
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={
//                 requireMessageForComplete
//                   ? !completionMessage.trim()
//                   : !formData.clientId || !formData.title
//               }
//             >
//               {requireMessageForComplete
//                 ? "Complete Activity"
//                 : editingActivity
//                 ? "Save Changes"
//                 : "Create Task"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

// import { useState, useEffect, useMemo } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePicker } from '@/components/ui/FloatingDatePicker';
// import { SelectItem } from '@/components/ui/select';
// import type { Client } from '@/data/mockData';
// import { PrismAPI } from '@/api';

// /* -------------------- TYPES -------------------- */
// // export interface KAM {
// //   id: number;
// //   name: string;
// // }

// interface ActivityModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (payload: any) => void;
//   editingActivity?: any;
//   clients: Client[];
//   activityTypes: {
//     value: number; // activity_type_id
//     label: string;
//   }[];
//   kams: {
//     // ✅ ADD THIS
//     value: number;
//     label: string;
//   }[];
//   // kams?: KAM[];
//   userRole?: string;
//   userId: number; // logged-in user id
// }
// // export interface KAM {
// //   value: number;
// //   label: string;
// // }
// type ClientOption = {
//   value: number;
//   label: string;
// };

// /* -------------------- COMPONENT -------------------- */
// export function ActivityModal({
//   open,
//   onClose,
//   onSave,
//   editingActivity,
//   activityTypes = [],
//   kams = [],
//   userRole,
//   userId,
// }: ActivityModalProps) {
//   const isSupervisor = ['supervisor', 'super_admin', 'boss'].includes(userRole || '');

//   console.log('passing kams to modal', kams);
//   /* -------------------- FORM STATE (BACKEND KEYS) -------------------- */
//   const [formData, setFormData] = useState<{
//     kam_id: number | null;
//     client_id: number | null;
//     activity_type_id: number | null;
//     posted_by: number;

//     title: string;
//     description: string;
//     meeting_location: string;
//     activity_schedule: string;
//     status: string;
//   }>({
//     kam_id: null,
//     client_id: null,
//     activity_type_id: null,
//     posted_by: userId,

//     title: '',
//     description: '',
//     meeting_location: '',
//     activity_schedule: '',
//     status: 'upcoming',
//   });

//   const [clientsByKam, setClientsByKam] = useState<ClientOption[]>([]);

//   /* -------------------- RESET ON OPEN -------------------- */
//   useEffect(() => {
//     if (open) {
//       setFormData({
//         kam_id: null,
//         client_id: null,
//         activity_type_id: null,
//         posted_by: userId,

//         title: '',
//         description: '',
//         meeting_location: '',
//         activity_schedule: '',
//         status: 'upcoming',
//       });
//     }
//   }, [open, userId]);

//   useEffect(() => {
//     if (!editingActivity) return;

//     // 🔹 prefill form
//     setFormData({
//       kam_id: Number(editingActivity.kam_id),
//       client_id: Number(editingActivity.client_id),
//       activity_type_id: Number(editingActivity.activity_type_id),
//       title: editingActivity.title ?? '',
//       description: editingActivity.description ?? '',
//       meeting_location: editingActivity.meeting_location ?? '',
//       activity_schedule: editingActivity.activity_schedule ?? '',
//     });

//     // 🔥 EDIT MODE → fetch clients for this KAM
//     if (editingActivity.kam_id) {
//       PrismAPI.getKamWiseClients(editingActivity.kam_id).then((res) => {
//         const options = (res.data || []).map((item: any) => ({
//           value: item.party_id,
//           label: item.client,
//         }));

//         setClientsByKam(options);
//       });
//     }
//   }, [editingActivity]);

//   /* -------------------- SUBMIT -------------------- */
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const payload = {
//       kam_id: formData.kam_id,
//       client_id: formData.client_id,
//       activity_type_id: formData.activity_type_id,
//       posted_by: formData.posted_by,

//       title: formData.title,
//       description: formData.description || null,
//       meeting_location: formData.meeting_location || null,
//       activity_schedule: formData.activity_schedule || null,
//       status: formData.status,
//     };

//     onSave(payload);
//     // onClose();
//   };

//   console.log('kamcheck', kams);
//   /* -------------------- UI -------------------- */
//   return (
//     <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>Create New Task</DialogTitle>
//           <DialogDescription>Fill in the task details below.</DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* -------------------- KAM (SUPERVISOR ONLY) -------------------- */}

//           {/* <FloatingSelect
//             label="Kam *"
//             value={formData.kam_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 kam_id: Number(value),
//                 client_id: null,
//               })
//             }
//           >
//             {kams.map((kam) => (
//               <SelectItem key={kam.value} value={kam.value.toString()}>
//                 {kam.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect> */}

//           <FloatingSelect
//             label="KAM *"
//             value={formData.kam_id?.toString() ?? ''}
//             onValueChange={async (value) => {
//               const kamId = Number(value);

//               setFormData({
//                 ...formData,
//                 kam_id: kamId,
//                 client_id: null, // 👈 reset client
//               });

//               // 👇 fetch clients by kam_id
//               try {
//                 const res = await PrismAPI.getKamWiseClients(kamId);

//                 const options = (res.data || []).map((item: any) => ({
//                   value: item.party_id,
//                   label: item.client,
//                 }));

//                 setClientsByKam(options);
//               } catch (err) {
//                 console.error('Failed to fetch clients', err);
//                 setClientsByKam([]);
//               }
//             }}
//           >
//             {kams.map((kam) => (
//               <SelectItem key={kam.value} value={kam.value.toString()}>
//                 {kam.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- CLIENT -------------------- */}
//           {/* <FloatingSelect
//             label="Client *"
//             value={formData.client_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 client_id: Number(value),
//               })
//             }
//           >
//             {filteredClients.map((client) => (
//               <SelectItem key={client.id} value={client.id.toString()}>
//                 {client.name}
//               </SelectItem>
//             ))}
//           </FloatingSelect> */}

//           <FloatingSelect
//             label="Client *"
//             value={formData.client_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 client_id: Number(value),
//               })
//             }
//             disabled={!formData.kam_id} // 👈 KAM না হলে disable
//           >
//             {clientsByKam.map((client) => (
//               <SelectItem key={client.value} value={client.value.toString()}>
//                 {client.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- ACTIVITY TYPE -------------------- */}
//           <FloatingSelect
//             label="Activity Type *"
//             value={formData.activity_type_id?.toString() ?? ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 activity_type_id: Number(value),
//               })
//             }
//           >
//             {activityTypes.map((type) => (
//               <SelectItem key={type.value} value={type.value.toString()}>
//                 {type.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- TITLE -------------------- */}
//           <FloatingInput
//             label="Title *"
//             required
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//           />

//           {/* -------------------- DESCRIPTION -------------------- */}
//           <FloatingInput
//             label="Description"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           />

//           {/* -------------------- SCHEDULE -------------------- */}
//           <FloatingDatePicker
//             label="Scheduled Date & Time"
//             value={formData.activity_schedule}
//             onChange={(value) => setFormData({ ...formData, activity_schedule: value })}
//           />

//           {/* -------------------- MEETING LOCATION -------------------- */}
//           {formData.activity_type_id !== null && (
//             <FloatingInput
//               label="Meeting Location"
//               value={formData.meeting_location}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   meeting_location: e.target.value,
//                 })
//               }
//             />
//           )}

//           {/* -------------------- ACTIONS -------------------- */}
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               // disabled={
//               //   !formData.kam_id ||
//               //   !formData.client_id ||
//               //   !formData.activity_type_id ||
//               //   !formData.title
//               // }
//             >
//               Create Task
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

<<<<<<< HEAD
=======








>>>>>>> d8002bc (activity edit)
// import { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePicker } from '@/components/ui/FloatingDatePicker';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api';
// import { Alert, AlertDescription } from '@/components/ui/alert';

// /* -------------------- TYPES -------------------- */
// interface ActivityModalProps {
//   open: boolean;
//   onClose: () => void;
//   onSave: (payload: any) => void;
//   editingActivity?: any;
//   activityTypes: {
//     value: number;
//     label: string;
//   }[];
//   kams: {
//     value: number;
//     label: string;
//   }[];
//   userRole?: string;
//   userId: number;
// }

// type ClientOption = {
//   value: number;
//   label: string;
// };

// /* -------------------- COMPONENT -------------------- */
// export function ActivityModal({
//   open,
//   onClose,
//   onSave,
//   editingActivity,
//   activityTypes = [],
//   kams = [],
//   userRole,
//   userId,
// }: ActivityModalProps) {
//   const isSupervisor = ['supervisor', 'super_admin', 'boss'].includes(userRole || '');

//   /* -------------------- FORM STATE -------------------- */
//   const [formData, setFormData] = useState<{
//     kam_id: number | null;
//     client_id: number | null;
//     activity_type_id: number | null;
//     posted_by: number;
//     title: string;
//     description: string;
//     meeting_location: string;
//     activity_schedule: string;
//     status: string;
//   }>({
//     kam_id: null,
//     client_id: null,
//     activity_type_id: null,
//     posted_by: userId,
//     title: '',
//     description: '',
//     meeting_location: '',
//     activity_schedule: '',
//     status: 'upcoming',
//   });

//   const [clientsByKam, setClientsByKam] = useState<ClientOption[]>([]);
//   const [isLoadingClients, setIsLoadingClients] = useState(false);
//   const [hasPrefilledData, setHasPrefilledData] = useState(false);
<<<<<<< HEAD

=======
  
>>>>>>> d8002bc (activity edit)
//   // Track if options are empty
//   const hasKams = kams.length > 0;
//   const hasActivityTypes = activityTypes.length > 0;

//   /* -------------------- RESET FORM FOR NEW TASK -------------------- */
//   useEffect(() => {
//     if (open && !editingActivity) {
//       // Reset for new task
//       setFormData({
//         kam_id: null,
//         client_id: null,
//         activity_type_id: null,
//         posted_by: userId,
//         title: '',
//         description: '',
//         meeting_location: '',
//         activity_schedule: '',
//         status: 'upcoming',
//       });
//       setClientsByKam([]);
//       setHasPrefilledData(false);
//     }
//   }, [open, editingActivity, userId]);

//   /* -------------------- PREFILL FOR EDIT -------------------- */
//   useEffect(() => {
//     if (!open || !editingActivity || hasPrefilledData) return;

//     console.log('Prefilling edit form with:', editingActivity);
//     console.log('Activity Type ID from editingActivity:', editingActivity.activity_type_id);
//     console.log('Activity Type Name from editingActivity:', editingActivity.activity_type_name);
<<<<<<< HEAD

=======
    
>>>>>>> d8002bc (activity edit)
//     // Prefill form with editing activity data
//     const kamId = Number(editingActivity.kam_id);
//     const clientId = Number(editingActivity.client_id);
//     const activityTypeId = Number(editingActivity.activity_type_id);

//     // Debug: Check what activity type ID we have
//     console.log('Activity Type ID to set:', activityTypeId);
//     console.log('Available activity types:', activityTypes);

//     setFormData({
//       kam_id: kamId,
//       client_id: clientId,
//       activity_type_id: activityTypeId,
//       posted_by: editingActivity.posted_by || userId,
//       title: editingActivity.title || '',
//       description: editingActivity.description || '',
//       meeting_location: editingActivity.meeting_location || '',
<<<<<<< HEAD
//       activity_schedule: editingActivity.activity_schedule
=======
//       activity_schedule: editingActivity.activity_schedule 
>>>>>>> d8002bc (activity edit)
//         ? new Date(editingActivity.activity_schedule).toISOString().slice(0, 16)
//         : '',
//       status: editingActivity.status || 'upcoming',
//     });

//     setHasPrefilledData(true);

//     // Fetch clients for this KAM in edit mode
//     if (kamId) {
//       setIsLoadingClients(true);
//       PrismAPI.getKamWiseClients(kamId)
//         .then((res) => {
//           const options = (res.data || []).map((item: any) => ({
//             value: item.party_id,
//             label: item.client,
//           }));
//           setClientsByKam(options);
//           setIsLoadingClients(false);
//         })
//         .catch((err) => {
//           console.error('Failed to fetch clients', err);
//           setClientsByKam([]);
//           setIsLoadingClients(false);
//         });
//     } else {
//       setClientsByKam([]);
//       setIsLoadingClients(false);
//     }
//   }, [editingActivity, userId, open, hasPrefilledData]);

//   /* -------------------- HANDLE KAM CHANGE -------------------- */
//   const handleKamChange = async (value: string) => {
//     const kamId = value ? Number(value) : null;
<<<<<<< HEAD

=======
    
>>>>>>> d8002bc (activity edit)
//     setFormData({
//       ...formData,
//       kam_id: kamId,
//       client_id: null, // Reset client when KAM changes
//     });

//     if (kamId) {
//       setIsLoadingClients(true);
//       try {
//         const res = await PrismAPI.getKamWiseClients(kamId);
//         const options = (res.data || []).map((item: any) => ({
//           value: item.party_id,
//           label: item.client,
//         }));
//         setClientsByKam(options);
//       } catch (err) {
//         console.error('Failed to fetch clients', err);
//         setClientsByKam([]);
//       } finally {
//         setIsLoadingClients(false);
//       }
//     } else {
//       setClientsByKam([]);
//       setIsLoadingClients(false);
//     }
//   };

//   /* -------------------- SUBMIT -------------------- */
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
<<<<<<< HEAD

//     console.log('Submitting form data:', formData);

=======
    
//     console.log('Submitting form data:', formData);
    
>>>>>>> d8002bc (activity edit)
//     const payload = {
//       ...formData,
//       ...(editingActivity && { id: editingActivity.id }),
//     };

//     onSave(payload);
//   };

//   /* -------------------- DEBUG LOGS -------------------- */
//   useEffect(() => {
//     if (open && editingActivity) {
//       console.log('Modal debug info:', {
//         editingActivity: {
//           id: editingActivity.id,
//           kam_id: editingActivity.kam_id,
//           activity_type_id: editingActivity.activity_type_id,
//           activity_type_name: editingActivity.activity_type_name,
//         },
//         formDataActivityTypeId: formData.activity_type_id,
//         activityTypesAvailable: activityTypes.map(at => ({ id: at.value, label: at.label })),
//         matchingActivityType: activityTypes.find(at => at.value === formData.activity_type_id),
//       });
//     }
//   }, [open, formData, editingActivity, activityTypes]);

//   /* -------------------- FIND ACTIVITY TYPE LABEL -------------------- */
//   const getActivityTypeLabel = (id: number | null) => {
//     if (!id) return 'Unknown';
//     const activityType = activityTypes.find(at => at.value === id);
//     return activityType ? activityType.label : `ID: ${id}`;
//   };

//   /* -------------------- SHOW LOADING STATE IF OPTIONS ARE EMPTY -------------------- */
//   if (open && (!hasKams || !hasActivityTypes)) {
//     return (
//       <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
//         <DialogContent className="sm:max-w-[600px]">
//           {/* <DialogHeader>
//             <DialogTitle>{editingActivity ? "Edit Task" : "Create New Task"}</DialogTitle>
//             <DialogDescription>
//               Loading required data...
//             </DialogDescription>
//           </DialogHeader> */}
<<<<<<< HEAD

=======
          
>>>>>>> d8002bc (activity edit)
//           <div className="space-y-4 py-4">
//             {/* <Alert>
//               <AlertDescription className="flex items-center gap-2">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
//                 Loading KAM and Activity Type options...
//               </AlertDescription>
//             </Alert> */}
<<<<<<< HEAD

=======
            
>>>>>>> d8002bc (activity edit)
//             {/* Show current values if editing */}
//             {editingActivity && (
//               <div className="space-y-3">
//                 <div className="p-3 bg-muted/50 rounded-lg">
//                   <p className="text-sm font-medium">Current KAM: {editingActivity.kam_name || `ID: ${editingActivity.kam_id}`}</p>
//                   <p className="text-sm font-medium mt-2">Current Activity Type: {editingActivity.activity_type_name || `ID: ${editingActivity.activity_type_id}`}</p>
//                   {/* <p className="text-sm text-muted-foreground mt-1">
//                     Note: Activity Type ID from data: {editingActivity.activity_type_id}
//                   </p> */}
//                 </div>
<<<<<<< HEAD

=======
                
>>>>>>> d8002bc (activity edit)
//                 <Button
//                   type="button"
//                   onClick={() => {
//                     // Allow saving with current values even if options aren't loaded
//                     onSave({
//                       ...formData,
//                       id: editingActivity.id,
//                     });
//                   }}
//                   className="w-full"
//                 >
//                   Are You Sure You Want to Proceed
//                 </Button>
//               </div>
//             )}
<<<<<<< HEAD

=======
            
>>>>>>> d8002bc (activity edit)
//             <Button
//               type="button"
//               variant="outline"
//               onClick={onClose}
//               className="w-full"
//             >
//               Cancel
//             </Button>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   /* -------------------- UI -------------------- */
//   return (
//     <Dialog open={open} onOpenChange={(v) => {
//       if (!v) {
//         // Reset state when closing
//         setHasPrefilledData(false);
//         onClose();
//       }
//     }}>
//       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {editingActivity ? "Edit Task" : "Create New Task"}
//           </DialogTitle>
//           <DialogDescription>
<<<<<<< HEAD
//             {editingActivity
=======
//             {editingActivity 
>>>>>>> d8002bc (activity edit)
//               ? "Update the task details below."
//               : "Fill in the task details below."}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* -------------------- KAM SELECTION -------------------- */}
//           <FloatingSelect
//             label="KAM *"
//             value={formData.kam_id?.toString() || ''}
//             onValueChange={handleKamChange}
//             placeholder="Select KAM"
//           >
//             {kams.map((kam) => (
<<<<<<< HEAD
//               <SelectItem
//                 key={kam.value}
=======
//               <SelectItem 
//                 key={kam.value} 
>>>>>>> d8002bc (activity edit)
//                 value={kam.value.toString()}
//               >
//                 {kam.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- CLIENT SELECTION -------------------- */}
//           <FloatingSelect
//             label="Client *"
//             value={formData.client_id?.toString() || ''}
//             onValueChange={(value) =>
//               setFormData({
//                 ...formData,
//                 client_id: value ? Number(value) : null,
//               })
//             }
//             disabled={!formData.kam_id || isLoadingClients}
//             placeholder={isLoadingClients ? "Loading clients..." : "Select Client"}
//           >
//             {clientsByKam.map((client) => (
<<<<<<< HEAD
//               <SelectItem
//                 key={client.value}
=======
//               <SelectItem 
//                 key={client.value} 
>>>>>>> d8002bc (activity edit)
//                 value={client.value.toString()}
//               >
//                 {client.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* -------------------- ACTIVITY TYPE -------------------- */}
//           <FloatingSelect
//             label="Activity Type *"
//             value={formData.activity_type_id?.toString() || ''}
//             onValueChange={(value) => {
//               const newId = value ? Number(value) : null;
<<<<<<< HEAD
//               console.log('Activity Type changed to:', newId,
=======
//               console.log('Activity Type changed to:', newId, 
>>>>>>> d8002bc (activity edit)
//                 'Label:', activityTypes.find(at => at.value === newId)?.label);
//               setFormData({
//                 ...formData,
//                 activity_type_id: newId,
//               });
//             }}
//             placeholder="Select Activity Type"
//           >
//             {activityTypes.map((type) => (
<<<<<<< HEAD
//               <SelectItem
//                 key={type.value}
=======
//               <SelectItem 
//                 key={type.value} 
>>>>>>> d8002bc (activity edit)
//                 value={type.value.toString()}
//               >
//                 {type.label}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Debug info for activity type */}
//           {/* {editingActivity && (
//             <div className="p-2 bg-blue-50 text-xs text-blue-700 rounded">
//               <p>Debug: Activity Type ID from task: {editingActivity.activity_type_id}</p>
//               <p>Debug: Activity Type Name from task: {editingActivity.activity_type_name}</p>
//               <p>Debug: Selected Activity Type ID: {formData.activity_type_id}</p>
//               <p>Debug: Selected Activity Type Label: {getActivityTypeLabel(formData.activity_type_id)}</p>
//             </div>
//           )} */}

//           {/* -------------------- TITLE -------------------- */}
//           <FloatingInput
//             label="Title *"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             required
//           />

//           {/* -------------------- DESCRIPTION -------------------- */}
//           <FloatingInput
//             label="Description"
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//           />

//           {/* -------------------- SCHEDULE -------------------- */}
//           <FloatingDatePicker
//             label="Scheduled Date & Time"
//             value={formData.activity_schedule}
//             onChange={(value) => setFormData({ ...formData, activity_schedule: value })}
//           />

//           {/* -------------------- MEETING LOCATION -------------------- */}
//           {(formData.activity_type_id === 3 || formData.activity_type_id === 5) && (
//             <FloatingInput
//               label="Meeting Location"
//               value={formData.meeting_location}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   meeting_location: e.target.value,
//                 })
//               }
//             />
//           )}

//           {/* -------------------- ACTIONS -------------------- */}
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={() => {
//               setHasPrefilledData(false);
//               onClose();
//             }}>
//               Cancel
//             </Button>
//             <Button
//               type="submit"
//               disabled={
//                 !formData.kam_id ||
//                 !formData.client_id ||
//                 !formData.activity_type_id ||
//                 !formData.title.trim()
//               }
//             >
//               {editingActivity ? "Update Task" : "Create Task"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }

<<<<<<< HEAD
=======






>>>>>>> d8002bc (activity edit)
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingDatePicker } from '@/components/ui/FloatingDatePicker';
import { SelectItem } from '@/components/ui/select';
import { PrismAPI } from '@/api';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

const user = getUserInfo();
const supervisorIds = user?.supervisor_ids || [];
const isAdmin = isSuperAdmin() || isManagement();
const isSup = isSupervisor();
const isKamUser = isKAM();

/* -------------------- TYPES -------------------- */
interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;
  editingActivity?: any;
  activityTypes: {
    value: number;
    label: string;
  }[];
  kams: {
    value: number;
    label: string;
  }[];
  userRole?: string;
  userId: number;
}

type ClientOption = {
  value: number;
  label: string;
};

/* -------------------- COMPONENT -------------------- */
export function ActivityModal({
  open,
  onClose,
  onSave,
  editingActivity,
  activityTypes = [],
  kams = [],
  userRole,
  userId,
}: ActivityModalProps) {
  const isSupervisor = ['supervisor', 'super_admin', 'boss'].includes(userRole || '');

  /* -------------------- FORM STATE -------------------- */
  const [formData, setFormData] = useState<{
    kam_id: number | null;
    client_id: number | null;
    activity_type_id: number | null;
    posted_by: number;
    title: string;
    description: string;
    meeting_location: string;
    activity_schedule: string;
    status: string;
  }>({
    kam_id: null,
    client_id: null,
    activity_type_id: null,
    posted_by: userId,
    title: '',
    description: '',
    meeting_location: '',
    activity_schedule: '',
    status: 'upcoming',
  });

  const [clientsByKam, setClientsByKam] = useState<ClientOption[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
<<<<<<< HEAD

  // Track if options are empty
  const hasKams = kams.length > 0;
  const hasActivityTypes = activityTypes.length > 0;

=======
  
  // Track if options are empty
  const hasKams = kams.length > 0;
  const hasActivityTypes = activityTypes.length > 0;

>>>>>>> d8002bc (activity edit)
  /* -------------------- RESET FORM FOR NEW TASK -------------------- */
  useEffect(() => {
    if (open && !editingActivity) {
      // Reset for new task
      setFormData({
        kam_id: null,
        client_id: null,
        activity_type_id: null,
        posted_by: userId,
        title: '',
        description: '',
        meeting_location: '',
        activity_schedule: '',
        status: 'upcoming',
      });
      setClientsByKam([]);
    }
  }, [open, editingActivity, userId]);

  /* -------------------- FETCH CLIENTS FIRST -------------------- */
  // ✅ Step 1: When editing activity changes, fetch clients for that KAM
  useEffect(() => {
    if (!open || !editingActivity) return;

    const kamId = Number(editingActivity.kam_id);
<<<<<<< HEAD
=======
    console.log('Fetching clients for KAM ID:', kamId);
>>>>>>> d8002bc (activity edit)

    if (kamId) {
      setIsLoadingClients(true);
      PrismAPI.getKamWiseClients(kamId)
        .then((res) => {
          const options = (res.data || []).map((item: any) => ({
            value: item.party_id,
            label: item.client,
          }));
          console.log('Clients fetched successfully:', options);
          setClientsByKam(options);
          setIsLoadingClients(false);
        })
        .catch((err) => {
          console.error('Failed to fetch clients', err);
          setClientsByKam([]);
          setIsLoadingClients(false);
        });
    } else {
      setClientsByKam([]);
      setIsLoadingClients(false);
    }
  }, [editingActivity?.id, open]);

  /* -------------------- PREFILL FORM AFTER CLIENTS ARE LOADED -------------------- */
  // ✅ Step 2: Only prefill AFTER clients are loaded (when clientsByKam changes)
  useEffect(() => {
    if (!open || !editingActivity || isLoadingClients) return;

<<<<<<< HEAD
=======
    console.log('Prefilling form data now (after clients loaded)');
    console.log('Available clients:', clientsByKam);
    
>>>>>>> d8002bc (activity edit)
    const kamId = Number(editingActivity.kam_id);
    const clientId = Number(editingActivity.client_id);
    const activityTypeId = Number(editingActivity.activity_type_id);

    // ✅ Only set form data AFTER clients are available
    setFormData({
      kam_id: kamId,
      client_id: clientId,
      activity_type_id: activityTypeId,
      posted_by: editingActivity.posted_by || userId,
      title: editingActivity.title || '',
      description: editingActivity.description || '',
      meeting_location: editingActivity.meeting_location || '',
<<<<<<< HEAD
      activity_schedule: editingActivity.activity_schedule
=======
      activity_schedule: editingActivity.activity_schedule 
>>>>>>> d8002bc (activity edit)
        ? new Date(editingActivity.activity_schedule).toISOString().slice(0, 16)
        : '',
      status: editingActivity.status || 'upcoming',
    });
  }, [clientsByKam, editingActivity?.id, open, isLoadingClients]);

  /* -------------------- HANDLE KAM CHANGE -------------------- */
  const handleKamChange = async (value: string) => {
    const kamId = value ? Number(value) : null;
<<<<<<< HEAD

=======
    
>>>>>>> d8002bc (activity edit)
    setFormData((prev) => ({
      ...prev,
      kam_id: kamId,
      client_id: null, // Reset client when KAM changes
    }));

    if (kamId) {
      setIsLoadingClients(true);
      try {
        const res = await PrismAPI.getKamWiseClients(kamId);
        const options = (res.data || []).map((item: any) => ({
          value: item.party_id,
          label: item.client,
        }));
<<<<<<< HEAD
        setClientsByKam(options);
      } catch (err) {
=======
        console.log('Clients fetched when KAM changed:', options);
        setClientsByKam(options);
      } catch (err) {
        console.error('Failed to fetch clients', err);
>>>>>>> d8002bc (activity edit)
        setClientsByKam([]);
      } finally {
        setIsLoadingClients(false);
      }
    } else {
      setClientsByKam([]);
      setIsLoadingClients(false);
    }
  };
<<<<<<< HEAD

  useEffect(() => {
    if (user?.role === 'kam' && user?.default_kam_id && open) {
      // 🔑 1️⃣ set KAM
      setFormData((prev) => ({
        ...prev,
        kam_id: user.default_kam_id,
        client_id: null,
      }));

      // 🔑 2️⃣ fetch clients USING SAME LOGIC
      (async () => {
        setIsLoadingClients(true);
        try {
          const res = await PrismAPI.getKamWiseClients(user?.default_kam_id);
          const options = (res?.data || []).map((item: any) => ({
            value: item.party_id,
            label: item.client,
          }));
          setClientsByKam(options);
        } catch {
          setClientsByKam([]);
        } finally {
          setIsLoadingClients(false);
        }
      })();
    }
  }, [user?.role, user?.default_kam_id, open]);
=======
>>>>>>> d8002bc (activity edit)

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
<<<<<<< HEAD

=======
    
    console.log('Submitting form data:', formData);
    
>>>>>>> d8002bc (activity edit)
    const payload = {
      ...formData,
      ...(editingActivity && { id: editingActivity.id }),
    };

    onSave(payload);
  };

  /* -------------------- SHOW LOADING STATE IF OPTIONS ARE EMPTY -------------------- */
  if (open && (!hasKams || !hasActivityTypes)) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="space-y-4 py-4">
            {/* Show current values if editing */}
            {editingActivity && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
<<<<<<< HEAD
                  <p className="text-sm font-medium">
                    Current KAM: {editingActivity.kam_name || `ID: ${editingActivity.kam_id}`}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Current Activity Type:{' '}
                    {editingActivity.activity_type_name ||
                      `ID: ${editingActivity.activity_type_id}`}
                  </p>
                </div>

=======
                  <p className="text-sm font-medium">Current KAM: {editingActivity.kam_name || `ID: ${editingActivity.kam_id}`}</p>
                  <p className="text-sm font-medium mt-2">Current Activity Type: {editingActivity.activity_type_name || `ID: ${editingActivity.activity_type_id}`}</p>
                </div>
                
>>>>>>> d8002bc (activity edit)
                <Button
                  type="button"
                  onClick={() => {
                    // Allow saving with current values even if options aren't loaded
                    onSave({
                      ...formData,
                      id: editingActivity.id,
                    });
                  }}
                  className="w-full"
                >
                  Are You Sure You Want to Proceed
                </Button>
              </div>
            )}
<<<<<<< HEAD

            <Button type="button" variant="outline" onClick={onClose} className="w-full">
=======
            
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
>>>>>>> d8002bc (activity edit)
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* -------------------- UI -------------------- */
  return (
<<<<<<< HEAD
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingActivity ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingActivity ? 'Update the task details below.' : 'Fill in the task details below.'}
=======
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {editingActivity 
              ? "Update the task details below."
              : "Fill in the task details below."}
>>>>>>> d8002bc (activity edit)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* -------------------- KAM SELECTION -------------------- */}
<<<<<<< HEAD

          <FloatingSelect
            label="KAM *"
            value={formData.kam_id?.toString() || ''}
            // onValueChange={handleKamChange}
            placeholder="Select KAM"
            onValueChange={(value) => {
              if (user?.role === 'kam') return; // ⛔ HARD BLOCK
              handleKamChange(value);
            }}
=======
          <FloatingSelect
            label="KAM *"
            value={formData.kam_id?.toString() || ''}
            onValueChange={handleKamChange}
            placeholder="Select KAM"
>>>>>>> d8002bc (activity edit)
          >
            {kams.map((kam) => (
              <SelectItem 
                key={kam.value} 
                value={kam.value.toString()}
              >
                {kam.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* -------------------- CLIENT SELECTION -------------------- */}
          <FloatingSelect
            label="Client *"
            value={formData.client_id?.toString() || ''}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                client_id: value ? Number(value) : null,
              }))
            }
            disabled={!formData.kam_id || isLoadingClients}
<<<<<<< HEAD
            placeholder={isLoadingClients ? 'Loading clients...' : 'Select Client'}
          >
            {clientsByKam.length > 0 ? (
              clientsByKam.map((client) => (
                <SelectItem key={client.value} value={client.value.toString()}>
=======
            placeholder={isLoadingClients ? "Loading clients..." : "Select Client"}
          >
            {clientsByKam.length > 0 ? (
              clientsByKam.map((client) => (
                <SelectItem 
                  key={client.value} 
                  value={client.value.toString()}
                >
>>>>>>> d8002bc (activity edit)
                  {client.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-client" disabled>
                {isLoadingClients ? 'Loading clients...' : 'No clients available'}
              </SelectItem>
            )}
          </FloatingSelect>

          {/* -------------------- ACTIVITY TYPE -------------------- */}
          <FloatingSelect
            label="Activity Type *"
            value={formData.activity_type_id?.toString() || ''}
            onValueChange={(value) => {
              setFormData((prev) => ({
                ...prev,
                activity_type_id: value ? Number(value) : null,
              }));
            }}
            placeholder="Select Activity Type"
          >
            {activityTypes.map((type) => (
              <SelectItem 
                key={type.value} 
                value={type.value.toString()}
              >
                {type.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* -------------------- TITLE -------------------- */}
          <FloatingInput
            label="Title *"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            required
          />

          {/* -------------------- DESCRIPTION -------------------- */}
          <FloatingInput
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          {/* -------------------- SCHEDULE -------------------- */}
          <FloatingDatePicker
            label="Scheduled Date & Time"
            value={formData.activity_schedule}
            onChange={(value) => setFormData((prev) => ({ ...prev, activity_schedule: value }))}
          />

          {/* -------------------- MEETING LOCATION -------------------- */}
          {(formData.activity_type_id === 3 || formData.activity_type_id === 4) && (
            <FloatingInput
              label="Meeting Location"
              value={formData.meeting_location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meeting_location: e.target.value,
                }))
              }
            />
          )}

          {/* -------------------- ACTIONS -------------------- */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !formData.kam_id ||
                !formData.client_id ||
                !formData.activity_type_id ||
                !formData.title.trim()
              }
            >
<<<<<<< HEAD
              {editingActivity ? 'Update Task' : 'Create Task'}
=======
              {editingActivity ? "Update Task" : "Create Task"}
>>>>>>> d8002bc (activity edit)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}