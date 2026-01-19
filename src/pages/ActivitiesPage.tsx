import { useState, useMemo, useEffect } from "react";
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
import { FilterDrawer } from "@/components/filters/ActivityFilterDrawer"; // ✅ IMPORTANT
import { useAuth } from "@/contexts/AuthContext";
import {
  Client,
  initialActivities,
  initialClients,
  type Activity,
  type ActivityType,
  type ActivityNote,
} from "@/data/mockData";
import { Plus, ListTodo, Clock, Search, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ITEMS_PER_PAGE = 10;

const activityTypeOptions: { value: string; label: string }[] = [

  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "physical_meeting", label: "Physical Meeting" },
  { value: "virtual_meeting", label: "Virtual Meeting" },
  { value: "follow_up", label: "Follow Up" },
];

export default function ActivitiesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [clients] = useState<Client[]>(initialClients);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [noteActivity, setNoteActivity] = useState<Activity | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "pending" | "completed">("all");
  const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [clientFilter, setClientFilter] = useState<string>("all");
const [dateRange, setDateRange] = useState<{
  from?: string;
  to?: string;
}>({});
const clientOptions = clients.map((c) => ({
  label: c.name,
  value: c.id,
}));

  // Pagination_toggle
  const [currentPage, setCurrentPage] = useState(1);

  // Stats
  const pendingActivities = activities.filter((a) => !a.completedAt);
  const overdueActivities = pendingActivities.filter(
    (a) => new Date(a.scheduledAt) < new Date()
  );

  // Filtering logic
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClient =
  clientFilter === "all" || activity.clientId === clientFilter;

const matchesDate =
  (!dateRange.from || new Date(activity.scheduledAt) >= new Date(dateRange.from)) &&
  (!dateRange.to || new Date(activity.scheduledAt) <= new Date(dateRange.to));


      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && !activity.completedAt) ||
        (statusFilter === "completed" && !!activity.completedAt);

      const matchesType =
        typeFilters.length === 0 || typeFilters.includes(activity.type);

        

      return (
  matchesSearch &&
  matchesStatus &&
  matchesType &&
  matchesClient &&
  matchesDate
);

    });
  }, [
  activities,
  searchQuery,
  statusFilter,
  typeFilters,
  clientFilter,
  dateRange,
]);

  // Pagination slice
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, typeFilters]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Manage meetings, calls, and tasks
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <ListTodo className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-bold">{pendingActivities.length}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </div>
        <div className="p-4 border rounded-lg">
          <Clock className="h-5 w-5 text-warning mb-2" />
          <p className="text-2xl font-bold">{overdueActivities.length}</p>
          <p className="text-sm text-muted-foreground">Overdue</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {["all", "pending", "completed"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() =>
                setStatusFilter(status as "all" | "pending" | "completed")
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Active filter chips */}
        {typeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((t) => (
              <span
                key={t}
                className="rounded-md bg-muted px-2 py-1 text-xs"
              >
                {activityTypeOptions.find((o) => o.value === t)?.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <FilterDrawer<string>
  open={isFilterDrawerOpen}
  onClose={() => setIsFilterDrawerOpen(false)}
  title="Filter Activities"
  filters={[
    {
      type: "multi-select",
      label: "Activity Type",
      value: typeFilters,
      onChange: (v) => setTypeFilters(v as ActivityType[]),
      options: activityTypeOptions,
    },
    {
      type: "search-select",
      label: "Client",
      value: clientFilter,
      onChange: setClientFilter,
      options: [
        { label: "All Clients", value: "all" },
        ...clientOptions,
      ],
    },
    {
      type: "date-range",
      label: "Date Range",
      value: dateRange,
      onChange: setDateRange,
    },
  ]}
  onReset={() => {
    setTypeFilters([]);
    setClientFilter("all");
    setDateRange({});
  }}
  onApply={() => setIsFilterDrawerOpen(false)}
/>




      {/* List */}
      <ActivityList
        activities={paginatedActivities}
        clients={clients}
        onEdit={(a) => {
          setEditingActivity(a);
          setIsModalOpen(true);
        }}
        onDelete={(id) => setDeleteActivityId(id)}
        onComplete={(id, outcome) => {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === id
                ? { ...a, completedAt: new Date().toISOString(), outcome }
                : a
            )
          );
        }}
        onViewActivity={setViewingActivity}
        onAddNote={setNoteActivity}
        showClientInfo
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Modals */}
      <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        editingActivity={editingActivity}
        onSave={(data) => {
          if (editingActivity) {
            setActivities((prev) =>
              prev.map((a) =>
                a.id === editingActivity.id ? { ...data, id: a.id } : a
              )
            );
          } else {
            setActivities((prev) => [
              ...prev,
              { ...data, id: `act-${Date.now()}` },
            ]);
          }
          setIsModalOpen(false);
        }}
        clients={clients}
      />

      <ActivityDetailsSheet
        open={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
        client={
          viewingActivity
            ? clients.find((c) => c.id === viewingActivity.clientId) || null
            : null
        }
        onComplete={() => {}}
        onAddNote={() => viewingActivity && setNoteActivity(viewingActivity)}
      />

      <ActivityNotesModal
        open={!!noteActivity}
        onClose={() => setNoteActivity(null)}
        activityId={noteActivity?.id || ""}
        onSave={() => {}}
        currentUserName={currentUser?.name || "User"}
        currentUserId={currentUser?.id || "user-1"}
      />

      <AlertDialog
        open={!!deleteActivityId}
        onOpenChange={(o) => !o && setDeleteActivityId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                setActivities((prev) =>
                  prev.filter((a) => a.id !== deleteActivityId)
                )
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
