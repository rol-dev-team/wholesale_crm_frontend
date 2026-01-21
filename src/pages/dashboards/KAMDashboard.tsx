import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityModal } from "@/components/activities/ActivityModal";
import { ActivityDetailsSheet } from "@/components/activities/ActivityDetailsSheet";
import { ActivityNotesModal } from "@/components/activities/ActivityNotesModal";
import { ActivityList } from "@/components/activities/ActivityList";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Filter, Plus, Activity, Clock, Target, TrendingUp } from "lucide-react";
import { FilterDrawer } from "@/components/filters/ActivityFilterDrawer";
import { AppPagination } from "@/components/common/AppPagination";
import { KpiCard } from "@/components/common/KpiCard";


import {
  initialClients,
  initialActivities,
  initialKAMs,
  initialSales,
  initialTargets,
  formatCurrency,
  type Client,
  type Activity as ActivityType,
  type ActivityType as ActivityTypeEnum,
  type ActivityNote,
} from "@/data/mockData";
import { toast } from "@/hooks/use-toast";

export default function KAMDashboard() {
  const { currentUser } = useAuth();

  const [clients] = useState<Client[]>(initialClients);
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [kams] = useState(initialKAMs);
  const [sales] = useState(initialSales);
  const [targets] = useState(initialTargets);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<ActivityType | null>(null);
  const [noteActivity, setNoteActivity] = useState<ActivityType | null>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string>();
  const [noteModalOpen, setNoteModalOpen] = useState(false);


const handleAddNoteFromList = (activity: ActivityType) => {
  setNoteActivity(activity);
};

//* ---------------- PAGINATION ---------------- */
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);


  // Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const [activityStatusFilter, setActivityStatusFilter] = useState<"All" | "Completed" | "Pending" | "Overdue">("All");

  const [activityTypeFilter, setActivityTypeFilter] =
  useState<ActivityTypeEnum[]>([]);

  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: string; to?: string }>({});

  /* ---------------- KAM FILTERING ---------------- */
  const myKam = kams.find((k) => k.userId === currentUser?.id);

  const allMyClients = useMemo(() => {
    if (!myKam) return clients.filter((c) => c.createdBy === currentUser?.id);
    return clients.filter((c) => c.assignedKamId === myKam.id || c.createdBy === currentUser?.id);
  }, [clients, myKam, currentUser]);

  const myActivities = useMemo(() => {
    const myClientIds = allMyClients.map((c) => c.id);
    return activities.filter(
      (a) => myClientIds.includes(a.clientId) || a.createdBy === currentUser?.id
    );
  }, [activities, allMyClients, currentUser]);

  const mySales = useMemo(() => {
    if (!myKam) return [];
    return sales.filter(s => s.kamId === myKam.id);
  }, [sales, myKam]);

  //pagination reset on filter change
useEffect(() => {
  setCurrentPage(1);
}, [
  activityStatusFilter,
  activityTypeFilter,
  clientFilter,
  dateRangeFilter,
]);

  /* ---------------- FILTERED ACTIVITIES ---------------- */
  const now = new Date();

const filteredActivities = useMemo(() => {
  return myActivities.filter((a) => {
    const scheduled = new Date(a.scheduledAt);
    const isCompleted = !!a.completedAt;
    const isPast = scheduled < now;

    // Status filter
    if (activityStatusFilter === "Completed" && !isCompleted) return false;
    if (activityStatusFilter === "Pending" && (!isCompleted && !isPast) === false) return false;
    if (activityStatusFilter === "Overdue" && (!isCompleted || !isPast) === false) return false;

    // Better version:
    if (activityStatusFilter === "Pending" && (isCompleted || isPast)) return false; // pending = future
    if (activityStatusFilter === "Overdue" && (isCompleted || !isPast)) return false; // overdue = past & not completed

    // Activity type filter
    if (
      activityTypeFilter.length > 0 &&
      !activityTypeFilter.includes(a.type)
    ) {
      return false;
    }

    // Client filter
    if (clientFilter !== "all" && a.clientId !== clientFilter) return false;

    // Date range filter
    if (dateRangeFilter.from && scheduled < new Date(dateRangeFilter.from)) return false;
    if (dateRangeFilter.to && scheduled > new Date(new Date(dateRangeFilter.to).setHours(23,59,59,999))) return false;

    return true;
  });
}, [myActivities, activityStatusFilter, activityTypeFilter, clientFilter, dateRangeFilter]);


  const totalPages = Math.max(
  1,
  Math.ceil(filteredActivities.length / PAGE_SIZE)
);

const paginatedActivities = useMemo(() => {
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return filteredActivities.slice(start, end);
}, [filteredActivities, currentPage]);


  /* ---------------- DATE HELPERS ---------------- */
  // const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const isSameMonth = (dateStr: string, m: number, y: number) => {
    const d = new Date(dateStr);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  /* ---------------- ACTIVITY METRICS ---------------- */
  const currentMonthActivities = myActivities.filter((a) =>
    isSameMonth(a.scheduledAt, currentMonth, currentYear)
  );

  const lastMonthActivities = myActivities.filter((a) =>
    isSameMonth(a.scheduledAt, lastMonth, lastMonthYear)
  );

  const currentMonthPendingActivities = currentMonthActivities.filter((a) => !a.completedAt);

  /* ---------------- SALES METRICS (Achieved) ---------------- */
  const currentMonthSales = mySales.filter(s => isSameMonth(s.closingDate, currentMonth, currentYear));
  const lastMonthSales = mySales.filter(s => isSameMonth(s.closingDate, lastMonth, lastMonthYear));

  const currentMonthSalesTotal = currentMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);
  const lastMonthSalesTotal = lastMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);

  /* ---------------- TARGET METRICS ---------------- */
  const currentMonthName = new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const lastMonthName = new Date(lastMonthYear, lastMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const myCurrentTarget = targets.find(t => t.kamId === myKam?.id && t.month === currentMonthName);
  const myLastTarget = targets.find(t => t.kamId === myKam?.id && t.month === lastMonthName);

  const currentMonthTarget = myCurrentTarget?.revenueTarget || 0;
  const lastMonthTarget = myLastTarget?.revenueTarget || 0;

  /* ---------------- HANDLERS ---------------- */
  const handleCreateActivity = (activityData: Omit<ActivityType, "id">) => {
    const newActivity: ActivityType = { ...activityData, id: `activity-${Date.now()}` };
    setActivities((prev) => [...prev, newActivity]);
    toast({ title: "Activity Created", description: "New activity has been scheduled." });
  };

  const handleCompleteActivity = (activityId: string, outcome: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, completedAt: new Date().toISOString(), outcome }
          : a
      )
    );
    toast({ title: "Activity Completed", description: "The activity has been marked as complete." });
    setViewingActivity(null);
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    toast({ title: "Activity Deleted", description: "The activity has been removed." });
  };

 const handleAddNote = (note: {
  content: string;
  attachments?: { name: string; type: string; url: string }[];
  createdAt: string;
  createdById: string;
  createdByName: string;
}) => {
  if (!noteActivity) return;

  const newNote: ActivityNote = {
  id: `note-${Date.now()}`,
  activityId: noteActivity.id,
  content: note.content,
  attachments: note.attachments,
  createdAt: note.createdAt,
  createdBy: note.createdByName, // ✅ just use a single string field
};


  setActivities((prev) =>
    prev.map((a) =>
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

  toast({ title: "Note Added", description: "Your note has been saved." });
};


  /* ---------------- UI ---------------- */
  return (
    <div className="page-container space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.name}</h1>
        <p className="text-muted-foreground">Your activity and sales overview</p>
      </div>

      {/* KPI CARDS */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
  title="Activities"
  value={currentMonthActivities.length}
  lastValue={lastMonthActivities.length}
  bottomLabel="Last month"
  subLabel="This month"
  icon={<Activity className="h-5 w-5 text-emerald-600" />}
  iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
/>

<KpiCard
  title="Pending Activities"
  value={currentMonthPendingActivities.length}
  lastValue={myActivities.filter(a => !a.completedAt && new Date(a.scheduledAt) < now).length}
  bottomLabel="Overdue"
  subLabel="This month"
  icon={<Clock className="h-5 w-5 text-orange-600" />}
  iconBg="bg-gradient-to-br from-orange-500/20 to-orange-500/5"
/>

<KpiCard
  title="Target"
  value={formatCurrency(currentMonthTarget)}
  lastValue={formatCurrency(lastMonthTarget)}
  bottomLabel="Last month"
  subLabel="This month"
  icon={<Target className="h-5 w-5 text-purple-600" />}
  iconBg="bg-gradient-to-br from-purple-500/20 to-purple-500/5"
/>

<KpiCard
  title="Achieved"
  value={formatCurrency(currentMonthSalesTotal)}
  lastValue={formatCurrency(lastMonthSalesTotal)}
  bottomLabel="Last month"
  subLabel="This month"
  icon={<TrendingUp className="h-5 w-5 text-green-600" />}
  iconBg="bg-gradient-to-br from-green-500/20 to-green-500/5"
/>
</div>
      {/* ACTIVITIES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Activities</h2>
            <p className="text-sm text-muted-foreground">Track and manage your client activities</p>
          </div>

        </div>

        {/* FILTERS */}
        {/* FILTERS */}
<div className="flex items-center justify-between">
  {/* Status Toggle – LEFT */}
  <div className="flex gap-2">
    {["All", "Pending", "Completed", "Overdue"].map((status) => (
      <Button
        key={status}
        variant={activityStatusFilter === status ? "default" : "outline"}
        size="sm"
        onClick={() =>
          setActivityStatusFilter(status as typeof activityStatusFilter)
        }
      >
        {status}
      </Button>
    ))}
  </div>

  {/* RIGHT: Filter + New Activity */}
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      className="gap-2"
      onClick={() => setIsFilterDrawerOpen(true)}
    >
      <Filter className="h-4 w-4" />
      Filters
      {(activityTypeFilter.length > 0 ||
        clientFilter !== "all" ||
        dateRangeFilter.from ||
        dateRangeFilter.to) && (
        <Badge
          variant="secondary"
          className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
        >
          !
        </Badge>
      )}
    </Button>

    <Button onClick={() => setIsActivityModalOpen(true)} className="gap-2">
      <Plus className="h-4 w-4" />
      New Activity
    </Button>
  </div>



        </div>
<FilterDrawer<string>
  open={isFilterDrawerOpen}
  onClose={() => setIsFilterDrawerOpen(false)}
  title="Filter Activities"
  filters={[
    {
  type: "multi-select",
  label: "Activity Type",
  value: activityTypeFilter,
  onChange: (v) => setActivityTypeFilter(v as ActivityTypeEnum[]),
  options: [
    { label: "Physical Meeting", value: "physical_meeting" },
    { label: "Virtual Meeting", value: "virtual_meeting" },
    { label: "Call", value: "call" },
    { label: "Email", value: "email" },
    { label: "Task", value: "task" },
    { label: "Follow-up", value: "follow_up" },
  ],
},

    {
      type: "search-select",
      label: "Client",
      value: clientFilter,
      onChange: setClientFilter,
      options: [
        { label: "All Clients", value: "all" },
        ...allMyClients.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      ],
    },
    {
      type: "date-range",
      label: "Date Range",
      value: dateRangeFilter,
      onChange: setDateRangeFilter,
    },
  ]}
  onReset={() => {
  setActivityTypeFilter([]);
  setClientFilter("all");
  setDateRangeFilter({});
}}

  onApply={() => setIsFilterDrawerOpen(false)}
/>

        {/* Activity List */}
       <ActivityList
            activities={paginatedActivities}
            clients={allMyClients}
            onEdit={(updatedActivity) => {
              setActivities(prev =>
                prev.map(a => (a.id === updatedActivity.id ? updatedActivity : a))
              );
            }}
            onComplete={handleCompleteActivity}
            onAddActivity={() => setIsActivityModalOpen(true)}
            onViewActivity={setViewingActivity}
            onAddNote={handleAddNoteFromList} // <-- updated
            showClientInfo
        />

<AppPagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>


{/* 
          {filteredActivities.length > 0 && (
  <div className="flex items-center justify-between pt-4">
    <p className="text-sm text-muted-foreground">
      Page {currentPage} of {totalPages}
    </p>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => p - 1)}
      >
        Previous
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => p + 1)}
      >
        Next
      </Button>
    </div>
  </div>
)} */}


      </div>

      {/* MODALS */}
      <ActivityModal
        open={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setPreselectedClientId(undefined);
        }}
        onSave={handleCreateActivity}
        clients={allMyClients}
        preselectedClientId={preselectedClientId}
      />

      <ActivityDetailsSheet
  open={!!viewingActivity}
  onClose={() => setViewingActivity(null)}
  activity={viewingActivity}
  client={viewingActivity ? clients.find(c => c.id === viewingActivity.clientId) : null}
  onComplete={(id, outcome) => handleCompleteActivity(id, outcome)}
  onAddNote={() => {
    if (viewingActivity) {
      setNoteActivity(viewingActivity); // set current activity
      setNoteModalOpen(true); // ✅ actually open the modal
    }
  }}
/>


      <ActivityNotesModal
        open={!!noteActivity}
        onClose={() => setNoteActivity(null)}
        activityId={noteActivity?.id || ""}
        onSave={handleAddNote}
        currentUserName={currentUser?.name || "User"}
        currentUserId={currentUser?.id || "user-1"}
      />
    </div>
  );
}
