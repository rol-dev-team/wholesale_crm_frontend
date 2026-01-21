import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X, Loader2 } from "lucide-react";
import type { ActivityNote } from "@/data/mockData";

interface ActivityNotesModalProps {
  open: boolean;
  onClose: () => void;
  activityId: string;
  onSave: (note: {
    content: string;
    attachments?: { name: string; type: string; url: string }[];
    createdAt: string;
    createdById: string;
    createdByName: string;
  }) => void;
  currentUserName: string;
  currentUserId: string;
}


const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".jpg", ".jpeg"];

export function ActivityNotesModal({
  open,
  onClose,
  activityId,
  onSave,
  currentUserName,
  currentUserId,
}: ActivityNotesModalProps) {
  const [noteContent, setNoteContent] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; type: string; url: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    
    const validFiles: { name: string; type: string; url: string }[] = [];
    
    Array.from(files).forEach((file) => {
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (ALLOWED_FILE_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension)) {
        // In a real app, you'd upload to storage here
        // For now, create a local URL
        validFiles.push({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
        });
      }
    });

    setAttachments((prev) => [...prev, ...validFiles]);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
  if (!noteContent.trim() && attachments.length === 0) return;

 onSave({
  content: noteContent,
  attachments: attachments.length > 0 ? attachments : undefined,
  createdAt: new Date().toISOString(),   // current timestamp
  createdById: currentUserId,           // user who added the note
  createdByName: currentUserName,       // display name
});

  setNoteContent("");
  setAttachments([]);
  onClose();
};


  const handleClose = () => {
    setNoteContent("");
    setAttachments([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Add Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note Content */}
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              placeholder="Write your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload files
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PDF, DOCX, JPG, JPEG
              </p>
            </div>
          </div>

          {/* Attachment List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!noteContent.trim() && attachments.length === 0}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Note"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
