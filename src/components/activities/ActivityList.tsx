import { useState } from "react";
import { ActivityModal } from "./ActivityModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ActivityTypeBadge, getActivityIcon } from "./ActivityTypeBadge";
import { formatDateTime } from "@/data/mockData";
import type { Activity, Client } from "@/data/mockData";
import {
  MoreHorizontal,
  Edit,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityListProps {
  activities: Activity[];
  clients: Client[];
  onEdit: (activity: Activity) => void;
  onComplete: (activityId: string, message: string) => void; // updated to require message
  onAddActivity?: () => void;
  onViewActivity?: (activity: Activity) => void;
  onAddNote?: (activity: Activity) => void;
  showClientInfo?: boolean;
}

export function ActivityList({
  activities,
  clients,
  onEdit,
  onComplete,
  onAddActivity,
  onViewActivity,
  onAddNote,
  showClientInfo = false,
}: ActivityListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [requireMessageForComplete, setRequireMessageForComplete] = useState(false);

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };

  const sortedActivities = [...activities].sort((a, b) => {
    if (!a.completedAt && b.completedAt) return -1;
    if (a.completedAt && !b.completedAt) return 1;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  const now = new Date();

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No Activities</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No activities scheduled yet.
          </p>
          {onAddActivity && (
            <Button onClick={onAddActivity} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Activity
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Activity</TableHead>
            <TableHead>Type</TableHead>
            {showClientInfo && <TableHead>Client</TableHead>}
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const scheduled = new Date(activity.scheduledAt);
            const isCompleted = !!activity.completedAt;
            const isPastDue = !isCompleted && scheduled < now;
            const isPending = !isCompleted && scheduled >= now;
            const notesCount = activity.notes?.length || 0;

            return (
              <TableRow
                key={activity.id}
                className={cn(
                  "hover:bg-muted/50 cursor-pointer",
                  isCompleted && "opacity-70",
                  isPastDue && "bg-warning/5"
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isCompleted ? "bg-success/20" : "bg-muted"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4",
                          isCompleted ? "text-success" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {activity.title}
                        {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}
                        {notesCount > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {notesCount}
                          </span>
                        )}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <ActivityTypeBadge type={activity.type} />
                </TableCell>

                {showClientInfo && (
                  <TableCell className="text-muted-foreground">
                    {getClientName(activity.clientId)}
                  </TableCell>
                )}

                <TableCell>
                  <span
                    className={cn(
                      "text-sm",
                      isPastDue ? "text-warning font-medium" : "text-muted-foreground"
                    )}
                  >
                    {formatDateTime(activity.scheduledAt)}
                  </span>
                </TableCell>

                <TableCell>
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-sm text-success">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                  ) : isPastDue ? (
                    <span className="inline-flex items-center gap-1 text-sm text-warning">
                      <Clock className="h-3 w-3" />
                      Overdue
                    </span>
                  ) : isPending ? (
                    <span className="text-sm text-muted-foreground">Pending</span>
                  ) : null}
                </TableCell>

                <TableCell>
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onAddNote && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onAddNote(activity)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}

                    {onViewActivity && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onViewActivity(activity)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingActivity(activity);
                            setModalOpen(true);
                            setRequireMessageForComplete(false); // normal edit
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>

                        {!isCompleted && (
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingActivity(activity);
                              setModalOpen(true);
                              setRequireMessageForComplete(true); // require message for complete
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Activity Modal (edit or complete) */}
      <ActivityModal
        open={modalOpen}
        editingActivity={editingActivity}
        requireMessageForComplete={requireMessageForComplete}
        onClose={() => {
          setModalOpen(false);
          setEditingActivity(null);
          setRequireMessageForComplete(false);
        }}
        onSave={(updatedActivity) => {
          if (!editingActivity) return;
          onEdit({ ...updatedActivity, id: editingActivity.id });
          setModalOpen(false);
          setEditingActivity(null);
          setRequireMessageForComplete(false);
        }}
        onCompleteWithMessage={(activityId, message) => {
          onComplete(activityId, message);
          setModalOpen(false);
          setEditingActivity(null);
          setRequireMessageForComplete(false);
        }}
        clients={clients}
      />
    </div>
  );
}
