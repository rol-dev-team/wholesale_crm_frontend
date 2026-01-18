import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KAM } from "@/data/mockData";

interface ForwardLeadModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (kamId: string, reason: string) => void;
  kams: KAM[];
  currentKamId?: string;
  leadName: string;
}

export function ForwardLeadModal({
  open,
  onClose,
  onConfirm,
  kams,
  currentKamId,
  leadName,
}: ForwardLeadModalProps) {
  const [selectedKamId, setSelectedKamId] = useState("");
  const [reason, setReason] = useState("");

  const availableKams = kams.filter((k) => k.id !== currentKamId);

  const handleConfirm = () => {
    if (!selectedKamId || !reason.trim()) return;
    onConfirm(selectedKamId, reason.trim());
    setSelectedKamId("");
    setReason("");
  };

  const handleClose = () => {
    setSelectedKamId("");
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forward Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Forward <span className="font-medium text-foreground">{leadName}</span> to another KAM
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="kam-select">Select KAM</Label>
            <Select value={selectedKamId} onValueChange={setSelectedKamId}>
              <SelectTrigger id="kam-select">
                <SelectValue placeholder="Select a KAM" />
              </SelectTrigger>
              <SelectContent>
                {availableKams.map((kam) => (
                  <SelectItem key={kam.id} value={kam.id}>
                    {kam.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for forwarding..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedKamId || !reason.trim()}>
            Forward
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
