import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, Upload, X, Loader2 } from 'lucide-react';
import type { ActivityNote } from '@/data/mockData';

interface ActivityNotesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: { content: string }) => void;
}

export function ActivityNotesModal({ open, onClose, onSave }: ActivityNotesModalProps) {
  const [noteContent, setNoteContent] = useState('');

  const handleSave = () => {
    if (!noteContent.trim()) return;

    onSave({
      content: noteContent,
    });

    setNoteContent('');
    onClose();
  };

  const handleClose = () => {
    setNoteContent('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!noteContent.trim()}>
              Save Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
