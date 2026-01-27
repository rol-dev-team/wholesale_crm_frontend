import { useState } from 'react';
import { ActivityModal } from './ActivityModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActivityTypeBadge, getActivityIcon } from './ActivityTypeBadge';
import { formatDateTime } from '@/data/mockData';
import { dateTimeFormat } from '@/utility/utility';
import type { Activity, Client } from '@/data/mockData';
import {
  MoreHorizontal,
  Edit,
  CheckCircle,
  Clock,
  Eye,
  Plus,
  MessageSquare,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityStatus = 'upcoming' | 'overdue' | 'completed' | 'cancelled';

export const statusConfig: Record<
  ActivityStatus,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  upcoming: {
    label: 'Upcoming',
    icon: Clock,
    className: 'text-muted-foreground',
  },
  overdue: {
    label: 'Overdue',
    icon: AlertCircle,
    className: 'text-warning font-medium',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    className: 'text-success',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'text-destructive',
  },
};

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onComplete: (activityId: string, message: string) => void; // updated to require message
  onAddActivity?: () => void;
  onViewActivity?: (activity: Activity) => void;
  onAddNote?: (activity: Activity) => void;
  showClientInfo?: boolean;
}

export function ActivityList({
  activities,
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

  const now = new Date();
  console.log('activitylist---', activities);
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-1">No Activities</h3>
          <p className="text-sm text-muted-foreground mb-4">No activities scheduled yet.</p>
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
            <TableHead>Client</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.activity_type_name);
            // const scheduled = new Date(activity.scheduledAt);
            const isCompleted = activity.status === 'completed';
            const isOverdue = activity.status === 'overdue';

            // const notesCount = activity.notes?.length || 0;

            return (
              <TableRow
                key={activity.id}
                className={cn(
                  'hover:bg-muted/50 cursor-pointer',
                  activity.status === 'completed' && 'opacity-70',
                  activity.status === 'overdue' && 'bg-warning/5',
                  activity.status === 'cancelled' && 'opacity-50 line-through'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn('p-2 rounded-lg', isCompleted ? 'bg-success/20' : 'bg-muted')}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isCompleted ? 'text-success' : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {activity.title}
                        {isCompleted && <CheckCircle className="h-4 w-4 text-success" />}

                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          {activity.notes_count}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <ActivityTypeBadge type={activity.activity_type_name} />
                </TableCell>

                <TableCell className="text-muted-foreground">{activity.client_name}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      'text-sm',
                      isOverdue ? 'text-warning font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {dateTimeFormat(activity.activity_schedule)}
                  </span>
                </TableCell>

                <TableCell>
                  {(() => {
                    const status = activity.status as ActivityStatus;
                    const StatusIcon = statusConfig[status].icon;

                    return (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-sm',
                          statusConfig[status].className
                        )}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {statusConfig[status].label}
                      </span>
                    );
                  })()}
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
        // clients={clients}
      />
    </div>
  );
}
