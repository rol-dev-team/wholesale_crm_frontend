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
import {
  FloatingLabelInput,
  FloatingLabelTextarea,
} from "@/components/ui/floating-label-input";
import {
  FloatingLabelSelect,
  FloatingSelectItem,
} from "@/components/ui/floating-label-select";
import type { Activity, ActivityType, Client } from "@/data/mockData";

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
  { value: "task", label: "Task" },
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

  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    type: "call" as ActivityType,
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

  const getDefaultScheduledAt = (date?: Date) => {
    if (date) {
      const d = new Date(date);
      d.setHours(9, 0, 0, 0);
      return d.toISOString().slice(0, 16);
    }
    return new Date().toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        clientId: editingActivity.clientId,
        type: editingActivity.type,
        title: editingActivity.title,
        description: editingActivity.description,
        scheduledAt: editingActivity.scheduledAt.slice(0, 16),
        outcome: editingActivity.outcome || "",
        address: "",
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
        type: "call",
        title: "",
        description: "",
        scheduledAt: getDefaultScheduledAt(preselectedDate),
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
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingActivity ? "Edit Activity" : "Create New Activity"}
          </DialogTitle>
          <DialogDescription>
            Fill in the activity details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            {/* KAM Selection (Supervisor only) */}
            {isSupervisor && kams.length > 0 && (
              <FloatingLabelSelect
                label="KAM *"
                value={selectedKamId}
                onValueChange={(value) => {
                  setSelectedKamId(value);
                  setFormData({ ...formData, clientId: "" }); // Reset client when KAM changes
                }}
              >
                {kams.map((kam) => (
                  <FloatingSelectItem key={kam.id} value={kam.id}>
                    {kam.name}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>
            )}

            {/* Client Selection */}
            <FloatingLabelSelect
              label="Client *"
              value={formData.clientId}
              onValueChange={(value) =>
                setFormData({ ...formData, clientId: value })
              }
              disabled={isSupervisor && kams.length > 0 && !selectedKamId}
            >
              {filteredClients?.map((client) => (
                <FloatingSelectItem key={client.id} value={client.id}>
                  {client.name}
                </FloatingSelectItem>
              ))}
            </FloatingLabelSelect>

            {/* Activity Type */}
            <FloatingLabelSelect
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
                <FloatingSelectItem key={type.value} value={type.value}>
                  {type.label}
                </FloatingSelectItem>
              ))}
            </FloatingLabelSelect>

            {/* Title */}
            <FloatingLabelInput
              label="Title *"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            {/* Description */}
            <FloatingLabelTextarea
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              rows={3}
            />

            {/* Scheduled At */}
            <FloatingLabelInput
              label="Scheduled Date & Time *"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  scheduledAt: e.target.value,
                })
              }
              required
            />

            {/* Meeting Location as Text Input */}
            {(formData.type === "physical_meeting" || formData.type === "follow_up") && (
              <FloatingLabelInput
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
              <FloatingLabelTextarea
                label="Outcome"
                value={formData.outcome}
                onChange={(e) =>
                  setFormData({ ...formData, outcome: e.target.value })
                }
                rows={3}
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
              {editingActivity ? "Save Changes" : "Create Activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}