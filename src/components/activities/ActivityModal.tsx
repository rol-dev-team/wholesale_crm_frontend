import { useState, useEffect, useMemo } from "react";
import { FloatingInput } from "@/components/ui/floatingInput";
import { FloatingSelect } from "@/components/ui/floatingSelect";
import { FloatingDatePicker } from "@/components/ui/FloatingDatePicker";
import { SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Activity, ActivityType, Client } from "@/data/mockData";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


export interface KAM {
  id: string;
  name: string;
  division?: string;
}

export interface ActivityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (activity: Omit<Activity, "id">) => void;
  editingActivity?: Activity | null;
  clients: Client[];
  preselectedClientId?: string;
  preselectedDate?: Date;
  kams?: KAM[];
  userRole?: string;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: "physical_meeting", label: "Physical Meeting" },
  { value: "virtual_meeting", label: "Virtual Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "follow_up", label: "Follow-up" },
];

export function ActivityModal({
  open,
  onClose,
  onSave,
  editingActivity,
  clients,
  preselectedClientId,
  preselectedDate,
  kams = [],
  userRole,
}: ActivityModalProps) {
  const isSupervisor = userRole === 'supervisor' || userRole === 'super_admin' || userRole === 'boss';
  const [selectedKamId, setSelectedKamId] = useState<string>("");

  const [formData, setFormData] = useState<{
  clientId: string;
  type: ActivityType | null;
  title: string;
  description: string;
  scheduledAt:string;
  outcome: string;
  address: string;
}>({
  clientId: preselectedClientId || "",
  type: null,
  title: "",
  description: "",
  scheduledAt: "",
  outcome: "",
  address: "",
});


  // Filter clients based on selected KAM for supervisors
  const filteredClients = useMemo(() => {
    if (!isSupervisor || !selectedKamId) return clients;
    return clients.filter(c => c.assignedKamId === selectedKamId);
  }, [clients, selectedKamId, isSupervisor]);

  const [location, setLocation] = useState<
    { lat: number; lng: number; address?: string } | undefined
  >();

  // const getDefaultScheduledAt = (date?: Date) => {
  //   if (date) {
  //     const d = new Date(date);
  //     d.setHours(9, 0, 0, 0);
  //     return d.toISOString().slice(0, 16);
  //   }
  //   return new Date().toISOString().slice(0, 16);
  // };

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        clientId: editingActivity.clientId,
        type: editingActivity.type,
        title: editingActivity.title,
        description: editingActivity.description,
        scheduledAt: editingActivity.scheduledAt.slice(0, 16),
        outcome: editingActivity.outcome || "",
        address: editingActivity.address || "",
      });

      // Location handling removed

      // Set KAM based on client's assigned KAM
      if (isSupervisor) {
        const client = clients.find(c => c.id === editingActivity.clientId);
        if (client?.assignedKamId) {
          setSelectedKamId(client.assignedKamId);
        }
      }
    } else {
      setFormData({
        clientId: preselectedClientId || "",
        type: null,
        title: "",
        description: "",
        scheduledAt: preselectedDate
  ? new Date(preselectedDate).toISOString().slice(0, 16)
  : "",

        outcome: "",
        address: "",
});

      setLocation(undefined);
      setSelectedKamId("");
    }
  }, [editingActivity, preselectedClientId, preselectedDate, open, clients, isSupervisor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      clientId: formData.clientId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      scheduledAt: new Date(formData.scheduledAt).toISOString(),
      completedAt: editingActivity?.completedAt || null,
      outcome: formData.outcome || null,
      createdBy: editingActivity?.createdBy || "user-1",
      notes: editingActivity?.notes,
      address: formData.address || null,
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            Fill in the task details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* KAM Selection (Supervisor only) */}
            {isSupervisor && kams.length > 0 && (
              <FloatingSelect
  label="KAM *"
  value={selectedKamId}
  onValueChange={(value) => {
    setSelectedKamId(value);
    setFormData({ ...formData, clientId: "" });
  }}
>
  {kams.map((kam) => (
    <SelectItem key={kam.id} value={kam.id}>
      {kam.name}
    </SelectItem>
  ))}
</FloatingSelect>

            )}

            {/* Client Selection */}
                          <FloatingSelect
                label="Client *"
                value={formData.clientId}
                onValueChange={(value) => {
                  if (isSupervisor && kams.length > 0 && !selectedKamId) return;
                  setFormData({ ...formData, clientId: value });
                }}
              >

              {filteredClients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* Activity Type */}
            <FloatingSelect
              label="Activity Type *"
              value={formData.type}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  type: value as ActivityType,
                })
              }
            >
              {activityTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* Title */}
            <FloatingInput
              label="Title/Reason *"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            {/* Description */}
                        <FloatingInput
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />

            {/* Scheduled At */}
            <FloatingDatePicker
  label="Scheduled Date & Time *"
  value={formData.scheduledAt}
  onChange={(value) =>
    setFormData({ ...formData, scheduledAt: value })
  }
/>


            {/* Meeting Location as Text Input */}
            {(formData.type === "physical_meeting" || formData.type === "follow_up") && (
              <FloatingInput
                label="Meeting Address *"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            )}

            {/* Outcome (edit only) */}
            {editingActivity && (
              <FloatingInput
                label="Outcome"
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.clientId || !formData.title}
            >
              {editingActivity ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}