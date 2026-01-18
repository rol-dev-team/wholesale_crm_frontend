import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import type { LeadStage } from '@/data/mockData';

interface StageChangeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
  leadName: string;
  fromStage: LeadStage;
  toStage: LeadStage;
}

const stageLabels: Record<LeadStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed: 'Closed',
};

export function StageChangeModal({
  open,
  onClose,
  onConfirm,
  leadName,
  fromStage,
  toStage,
}: StageChangeModalProps) {
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (!note.trim()) {
      setError('Please add a note explaining the stage change.');
      return;
    }
    onConfirm(note.trim());
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stage Change Note</DialogTitle>
          <DialogDescription>
            Moving <span className="font-medium">{leadName}</span> from{' '}
            <span className="font-medium">{stageLabels[fromStage]}</span> to{' '}
            <span className="font-medium">{stageLabels[toStage]}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stage-note">
              Note <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="stage-note"
              placeholder="Explain why this lead is being moved to the new stage..."
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'border-destructive' : ''}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm Change</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
