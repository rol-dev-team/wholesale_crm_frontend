import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActivityTypeBadge } from "./ActivityTypeBadge";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  FileText,
  CheckCircle,
  MessageSquare,
  Paperclip,
  Plus,
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

function NoteItem({ note }: { note: ActivityNote }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="shrink-0">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{note.createdByName}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
        {note.content && (
          <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
        )}
        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {note.attachments.map((attachment, idx) => (
              <a
                key={idx}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
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

  const isCompleted = !!activity.completedAt;
  const isPast = new Date(activity.scheduledAt) < new Date();
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

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {/* Activity Title & Type */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {activity.title}
              </h3>
              <ActivityTypeBadge type={activity.type} />
            </div>

            {/* Client Info */}
            {client && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{client.name}</span>
                  {client.businessType && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {client.businessType}
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Date & Time */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {format(new Date(activity.scheduledAt), "EEEE, MMMM d, yyyy")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(activity.scheduledAt), "h:mm a")}
                </p>
              </div>
              {isCompleted ? (
                <Badge
                  variant="outline"
                  className="ml-auto bg-success/10 text-success border-success/20"
                >
                  Completed
                </Badge>
              ) : isPast ? (
                <Badge
                  variant="outline"
                  className="ml-auto bg-destructive/10 text-destructive border-destructive/20"
                >
                  Overdue
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-auto bg-primary/10 text-primary border-primary/20"
                >
                  Upcoming
                </Badge>
              )}
            </div>

            {/* Description */}
            {activity.description && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm text-foreground pl-6">
                  {activity.description}
                </p>
              </div>
            )}

{/* Address */}
{(activity.type === "physical_meeting" || activity.type === "follow_up") &&
  activity.address && (
    <div className="space-y-1">
      <div className="text-sm font-medium text-muted-foreground">
        Address
      </div>
      <p className="text-sm text-foreground">
        {activity.address}
      </p>
    </div>
)}


            {/* Outcome */}
            {activity.outcome && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Outcome
                </div>
                <p className="text-sm text-foreground pl-6">{activity.outcome}</p>
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <MessageSquare className="h-4 w-4" />
                  Notes ({notes.length})
                </div>
                {onAddNote && (
                  <Button variant="outline" size="sm" onClick={onAddNote}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                )}
              </div>

              {notes.length > 0 ? (
                <div className="border rounded-lg p-3 divide-y">
                  {notes.map((note) => (
                    <NoteItem key={note.id} note={note} />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg p-6 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No notes yet</p>
                  {onAddNote && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={onAddNote}
                      className="mt-2"
                    >
                      Add the first note
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {!isCompleted && onComplete && (
            <Button onClick={() => onComplete(activity.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
