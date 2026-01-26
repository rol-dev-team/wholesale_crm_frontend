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




import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingSelect } from "@/components/ui/FloatingSelect";
import { FloatingDatePicker } from "@/components/ui/FloatingDatePicker";
import { SelectItem } from "@/components/ui/select";
import type { Client } from "@/data/mockData";

/* -------------------- TYPES -------------------- */
export interface KAM {
  id: number;
  name: string;
}

interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (payload: any) => void;

  clients: Client[];
  activityTypes: {
    value: number; // activity_type_id
    label: string;
  }[];

  kams?: KAM[];
  userRole?: string;
  userId: number; // logged-in user id
}

/* -------------------- COMPONENT -------------------- */
export function ActivityModal({
  open,
  onClose,
  onSave,
  clients,
  activityTypes=[],
  kams = [],
  userRole,
  userId,
}: ActivityModalProps) {
  const isSupervisor = ["supervisor", "super_admin", "boss"].includes(
    userRole || ""
  );

  /* -------------------- FORM STATE (BACKEND KEYS) -------------------- */
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

    title: "",
    description: "",
    meeting_location: "",
    activity_schedule: "",
    status: "upcoming",
  });

  /* -------------------- FILTER CLIENTS BY KAM -------------------- */
  const filteredClients = useMemo(() => {
    if (!isSupervisor || !formData.kam_id) return clients;
    return clients.filter(
      (client) => client.assignedKamId === formData.kam_id
    );
  }, [clients, formData.kam_id, isSupervisor]);

  /* -------------------- RESET ON OPEN -------------------- */
  useEffect(() => {
    if (open) {
      setFormData({
        kam_id: null,
        client_id: null,
        activity_type_id: null,
        posted_by: userId,

        title: "",
        description: "",
        meeting_location: "",
        activity_schedule: "",
        status: "upcoming",
      });
    }
  }, [open, userId]);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      kam_id: formData.kam_id,
      client_id: formData.client_id,
      activity_type_id: formData.activity_type_id,
      posted_by: formData.posted_by,

      title: formData.title,
      description: formData.description || null,
      meeting_location: formData.meeting_location || null,
      activity_schedule: formData.activity_schedule || null,
      status: formData.status,
    };

    onSave(payload);
    // onClose();
  };

  /* -------------------- UI -------------------- */
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Fill in the task details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* -------------------- KAM (SUPERVISOR ONLY) -------------------- */}
  
            {/* <FloatingSelect
              label="KAM *"
              value={formData.kam_id?.toString() ?? ""}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  kam_id: Number(value),
                  client_id: null,
                })
              }
            >
              {kams.map((kam) => (
                <SelectItem key={kam.id} value={kam.id.toString()}>
                  {kam.name}
                </SelectItem>
              ))}
            </FloatingSelect> */}
            <FloatingSelect
            label="Kam *"
            value={formData.kam_id?.toString() ?? ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                kam_id: Number(value),
              })
            }
          >
            {filteredClients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </FloatingSelect>
       

          {/* -------------------- CLIENT -------------------- */}
          <FloatingSelect
            label="Client *"
            value={formData.client_id?.toString() ?? ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                client_id: Number(value),
              })
            }
          >
            {filteredClients.map((client) => (
              <SelectItem key={client.id} value={client.id.toString()}>
                {client.name}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* -------------------- ACTIVITY TYPE -------------------- */}
          <FloatingSelect
            label="Activity Type *"
            value={formData.activity_type_id?.toString() ?? ""}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                activity_type_id: Number(value),
              })
            }
          >
            {activityTypes.map((type) => (
              <SelectItem key={type.value} value={type.value.toString()}>
                {type.label}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* -------------------- TITLE -------------------- */}
          <FloatingInput
            label="Title *"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          {/* -------------------- DESCRIPTION -------------------- */}
          <FloatingInput
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* -------------------- SCHEDULE -------------------- */}
          <FloatingDatePicker
            label="Scheduled Date & Time"
            value={formData.activity_schedule}
            onChange={(value) =>
              setFormData({ ...formData, activity_schedule: value })
            }
          />

          {/* -------------------- MEETING LOCATION -------------------- */}
          {formData.activity_type_id !== null && (
            <FloatingInput
              label="Meeting Location"
              value={formData.meeting_location}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meeting_location: e.target.value,
                })
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
              // disabled={
              //   !formData.kam_id ||
              //   !formData.client_id ||
              //   !formData.activity_type_id ||
              //   !formData.title
              // }
            >
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
