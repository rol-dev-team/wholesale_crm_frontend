import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityTypeBadge } from "./ActivityTypeBadge";
import { format, parseISO, isValid } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Plus,
  MapPin,
} from "lucide-react";
import type { Activity, Client, ActivityNote } from "@/data/mockData";

interface ActivityDetailsSheetProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  client?: Client | null;
  onComplete?: (activityId: string, outcome?: string) => void;
  onAddNote?: () => void;
}

// Icon wrapper
const IconWrapper = ({ children, bg = "bg-primary/10" }: { children: React.ReactNode; bg?: string }) => (
  <div className={`p-2.5 rounded-xl ${bg} flex items-center justify-center shrink-0`}>{children}</div>
);

// Note item
function NoteItem({ note }: { note: ActivityNote }) {
  const createdAt = note.createdAt && isValid(parseISO(note.createdAt))
    ? format(parseISO(note.createdAt), "MMMM d, yyyy 'at' h:mm:ss a") // ✅ exact date & time
    : "N/A";

  return (
    <div className="flex gap-3 py-2">
      <IconWrapper bg="bg-muted/10">
        <User className="h-4 w-4 text-primary" />
      </IconWrapper>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium text-sm break-words">{note.createdByName}</span>
          <span className="text-xs text-muted-foreground">{createdAt}</span>
        </div>
        {note.content && (
          <p className="text-sm text-foreground break-words whitespace-pre-wrap">{note.content}</p>
        )}
        {note.attachments?.length > 0 && (
          <div className="mt-2 space-y-1">
            {note.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline break-words"
              >
                <Paperclip className="h-3 w-3" />
                {attachment.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityDetailsSheet({
  open,
  onClose,
  activity,
  client,
  onComplete,
  onAddNote,
}: ActivityDetailsSheetProps) {
  if (!activity) return null;

  const scheduledDate =
    activity.scheduledAt && isValid(parseISO(activity.scheduledAt))
      ? parseISO(activity.scheduledAt)
      : null;

  const isCompleted = !!activity.completedAt && activity.completedAt !== "";
  const isPast = scheduledDate ? scheduledDate < new Date() : false;
  const notes = activity.notes || [];

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity Details
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-6 py-4 space-y-6 flex flex-col">
          {/* Title & Type */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground break-words">{activity.title}</h3>
            <ActivityTypeBadge type={activity.type} />
          </div>

          {/* Description */}
          {activity.description && (
            <div className="flex items-start gap-3">
              <IconWrapper bg="bg-muted/10">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </IconWrapper>
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">{activity.description}</p>
            </div>
          )}

          {/* Client Info */}
          {client && (
            <div className="flex items-start gap-3">
              <IconWrapper bg="bg-muted/10">
                <User className="h-4 w-4 text-muted-foreground" />
              </IconWrapper>
              <div className="text-sm font-medium break-words">{client.name}</div>
            </div>
          )}

          {/* Address */}
          {(activity.type === "physical_meeting" || activity.type === "follow_up") && activity.address && (
            <div className="flex items-start gap-3">
              <IconWrapper bg="bg-muted/10">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </IconWrapper>
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">{activity.address}</p>
            </div>
          )}

          {/* Date & Time */}
          {scheduledDate && (
            <div className="flex items-center gap-3">
              <IconWrapper bg="bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </IconWrapper>
              <div className="text-sm">
                <p className="font-medium">{format(scheduledDate, "EEEE, MMMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">{format(scheduledDate, "h:mm a")}</p>
              </div>

              {isCompleted ? (
                <Badge variant="outline" className="ml-auto bg-success/10 text-success border-success/20">
                  Completed
                </Badge>
              ) : isPast ? (
                <Badge variant="outline" className="ml-auto bg-destructive/10 text-destructive border-destructive/20">
                  Overdue
                </Badge>
              ) : (
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary border-primary/20">
                  Upcoming
                </Badge>
              )}
            </div>
          )}

          {/* Outcome */}
          {activity.outcome && (
            <div className="flex items-start gap-3">
              <IconWrapper bg="bg-muted/10">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </IconWrapper>
              <p className="text-sm text-foreground break-words whitespace-pre-wrap">{activity.outcome}</p>
            </div>
          )}

          {/* Notes Section */}
          <div className="flex flex-col space-y-2 w-full">
            {/* Header */}
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground break-words max-w-[calc(100%-100px)]">
                <MessageSquare className="h-4 w-4" />
                Notes ({notes.length})
              </div>
              {onAddNote && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                  onClick={onAddNote}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Note
                </Button>
              )}
            </div>

            {/* Notes container */}
            <div className="border rounded-lg h-48 overflow-y-auto p-3 w-full flex-shrink-0">
              {notes.length > 0 ? (
                <div className="divide-y">
                  {notes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mb-2" />
                  <p className="text-sm break-words">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
