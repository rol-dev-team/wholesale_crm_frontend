import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActivityTypeBadge } from "./ActivityTypeBadge";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, User, FileText, CheckCircle } from "lucide-react";
import type { Activity, Client } from "@/data/mockData";

interface ActivityDetailModalProps {
  open: boolean;
  onClose: () => void;
  activity: Activity | null;
  client?: Client | null; // ✅ Updated
  onComplete?: (activityId: string) => void;
}

export function ActivityDetailModal({
  open,
  onClose,
  activity,
  client,
  onComplete,
}: ActivityDetailModalProps) {
  if (!activity) return null;

  const isCompleted = !!activity.completedAt;
  const isPast = new Date(activity.scheduledAt) < new Date();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Activity Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Activity Title & Type */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{activity.title}</h3>
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
                    <span className="text-muted-foreground">{client.businessType}</span>
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

          {/* Description */}
          {activity.description && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <p className="text-sm text-foreground pl-6">{activity.description}</p>
            </div>
          )}

                   {/* Address */}
{(activity.type === "physical_meeting" || activity.type === "follow_up") && activity.address && (
  <div className="space-y-1">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <MapPin className="h-4 w-4" />
      Address
    </div>
    <p className="text-sm text-foreground pl-6">
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

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
