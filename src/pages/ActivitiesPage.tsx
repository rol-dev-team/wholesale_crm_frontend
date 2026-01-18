import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ActivityList } from "@/components/activities/ActivityList";
import { ActivityModal } from "@/components/activities/ActivityModal";
import { ActivityDetailsSheet } from "@/components/activities/ActivityDetailsSheet";
import { ActivityNotesModal } from "@/components/activities/ActivityNotesModal";
import { useAuth } from "@/contexts/AuthContext";
import { Client, initialActivities, type Activity, type ActivityType, type ActivityNote } from "@/data/mockData";
import { Plus, ListTodo, Clock, Search, Filter, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { initialClients } from "@/data/mockData";

const activityTypeOptions: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "physical_meeting", label: "Physical Meeting" },
  { value: "virtual_meeting", label: "Virtual Meeting" },
  { value: "follow_up", label: "Follow Up" },
  { value: "task", label: "Task" },
];

const ITEMS_PER_PAGE = 10;

export default function ActivitiesPage() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [clients] = useState<Client[]>(initialClients);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [noteActivity, setNoteActivity] = useState<Activity | null>(null);
  const { toast } = useToast();

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed">("all");
  const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  const pendingActivities = activities.filter((a) => !a.completedAt);
  const overdueActivities = pendingActivities.filter(
    (a) => new Date(a.scheduledAt) < new Date()
  );

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "pending" && !activity.completedAt) ||
        (statusFilter === "completed" && !!activity.completedAt);
      
      const matchesType = typeFilters.length === 0 || typeFilters.includes(activity.type);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [activities, searchQuery, statusFilter, typeFilters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilters]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleSaveActivity = (activityData: Omit<Activity, "id">) => {
    if (editingActivity) {
      setActivities(
        activities.map((a) =>
          a.id === editingActivity.id ? { ...activityData, id: editingActivity.id } : a
        )
      );
      toast({
        title: "Activity Updated",
        description: "The activity has been updated successfully.",
      });
    } else {
      const newActivity: Activity = {
        ...activityData,
        id: `act-${Date.now()}`,
      };
      setActivities([...activities, newActivity]);
      toast({
        title: "Activity Created",
        description: "New activity has been created successfully.",
      });
    }
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = () => {
    if (deleteActivityId) {
      setActivities(activities.filter((a) => a.id !== deleteActivityId));
      toast({
        title: "Activity Deleted",
        description: "The activity has been deleted.",
        variant: "destructive",
      });
      setDeleteActivityId(null);
    }
  };

  const handleCompleteActivity = (activityId: string, outcome: string) => {
    setActivities(
      activities.map((a) =>
        a.id === activityId
          ? { ...a, completedAt: new Date().toISOString(), outcome }
          : a
      )
    );
    toast({
      title: "Activity Completed",
      description: "The activity has been marked as complete.",
    });
    setViewingActivity(null);
  };

  const handleAddNote = (note: Omit<ActivityNote, "id" | "activityId">) => {
    if (!noteActivity) return;
    
    const newNote: ActivityNote = {
      ...note,
      id: `note-${Date.now()}`,
      activityId: noteActivity.id,
    };

    setActivities(
      activities.map((a) =>
        a.id === noteActivity.id
          ? { ...a, notes: [...(a.notes || []), newNote] }
          : a
      )
    );

    // Update viewing activity if open
    if (viewingActivity?.id === noteActivity.id) {
      setViewingActivity({
        ...viewingActivity,
        notes: [...(viewingActivity.notes || []), newNote],
      });
    }

    toast({
      title: "Note Added",
      description: "Your note has been saved.",
    });
  };

  const handleTypeFilterChange = (type: ActivityType, checked: boolean) => {
    if (checked) {
      setTypeFilters([...typeFilters, type]);
    } else {
      setTypeFilters(typeFilters.filter((t) => t !== type));
    }
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setTypeFilters([]);
    setSearchQuery("");
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilters.length > 0 || searchQuery !== "";

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">
            Manage meetings, calls, and tasks for your clients
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="h-4 w-4" />
          New Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <ListTodo className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingActivities.length}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/20">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{overdueActivities.length}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {(statusFilter !== "all" ? 1 : 0) + typeFilters.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-1 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="space-y-2">
                  {[
                    { value: "all", label: "All" },
                    { value: "pending", label: "Pending" },
                    { value: "completed", label: "Completed" },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={statusFilter === option.value}
                        onCheckedChange={() => setStatusFilter(option.value as "all" | "pending" | "completed")}
                      />
                      <label htmlFor={`status-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Type Filter */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Activity Type</p>
                <div className="space-y-2">
                  {activityTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${option.value}`}
                        checked={typeFilters.includes(option.value)}
                        onCheckedChange={(checked) => handleTypeFilterChange(option.value, !!checked)}
                      />
                      <label htmlFor={`type-${option.value}`} className="text-sm cursor-pointer">
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Activity List */}
      <ActivityList
        activities={paginatedActivities}
        clients={clients}
        onEdit={openEditModal}
        onDelete={(id) => setDeleteActivityId(id)}
        onComplete={handleCompleteActivity}
        onAddActivity={openCreateModal}
        onViewActivity={setViewingActivity}
        onAddNote={setNoteActivity}
        showClientInfo
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredActivities.length)} of {filteredActivities.length} activities
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={handleSaveActivity}
        editingActivity={editingActivity}
        clients={clients}  
      />

      {/* Activity Details Sheet */}
      <ActivityDetailsSheet
        open={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
        client={viewingActivity ? clients.find((c) => c.id === viewingActivity.clientId) || null : null}
        onComplete={handleCompleteActivity}
        onAddNote={() => {
          if (viewingActivity) {
            setNoteActivity(viewingActivity);
          }
        }}
      />

      {/* Notes Modal */}
      <ActivityNotesModal
        open={!!noteActivity}
        onClose={() => setNoteActivity(null)}
        activityId={noteActivity?.id || ""}
        onSave={handleAddNote}
        currentUserName={currentUser?.name || "User"}
        currentUserId={currentUser?.id || "user-1"}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteActivityId}
        onOpenChange={(open) => !open && setDeleteActivityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
