import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ActivityModal } from "@/components/activities/ActivityModal";
import { ActivityDetailsSheet } from "@/components/activities/ActivityDetailsSheet";
import { ActivityNotesModal } from "@/components/activities/ActivityNotesModal";
import { ActivityList } from "@/components/activities/ActivityList";
import { FilterDrawer } from "@/components/filters/ActivityFilterDrawer";
import { AppPagination } from "@/components/common/AppPagination";
import { X, Filter, Plus, Activity, Clock, Target, TrendingUp, UsersRound, Users, CheckCircle } from "lucide-react";
import { TakaIcon } from '@/components/ui/taka-icon';
import { Badge } from "@/components/ui/badge";
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

export default function AdminDashboard() {
  const { currentUser } = useAuth();

  const [clients] = useState<Client[]>(initialClients);
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [kams] = useState(initialKAMs);
  const [sales] = useState(initialSales);
  const [targets] = useState(initialTargets);

  // Teams, activities, targets, sales metrics
const uniqueTeams = [...new Set(kams.map(k => k.division))].length;
const avgActivities = kams.length > 0 ? Math.round(activities.length / kams.length) : 0;

// Current & Last Month
const now = new Date();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

const isSameMonth = (dateStr: string, m: number, y: number) => {
  const d = new Date(dateStr);
  return d.getMonth() === m && d.getFullYear() === y;
};

const currentMonthActivities = activities.filter(a => isSameMonth(a.scheduledAt, currentMonth, currentYear));
const lastMonthActivities = activities.filter(a => isSameMonth(a.scheduledAt, lastMonth, lastMonthYear));

// Sales & Targets
const currentMonthSales = sales.filter(s => isSameMonth(s.closingDate, currentMonth, currentYear));
const lastMonthSales = sales.filter(s => isSameMonth(s.closingDate, lastMonth, lastMonthYear));

const currentMonthSalesTotal = currentMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);
const lastMonthSalesTotal = lastMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);

const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;
const lastMonthName = `${monthNames[lastMonth]} ${lastMonthYear}`;

const myCurrentTarget = targets.find(t => t.kamId && t.month === currentMonthName);
const myLastTarget = targets.find(t => t.kamId && t.month === lastMonthName);

const currentMonthTarget = myCurrentTarget?.revenueTarget || 0;
const lastMonthTarget = myLastTarget?.revenueTarget || 0;


  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<ActivityType | null>(null);
  const [noteActivity, setNoteActivity] = useState<ActivityType | null>(null);
  const [preselectedClientId, setPreselectedClientId] = useState<string>();
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  const handleAddNoteFromList = (activity: ActivityType) => setNoteActivity(activity);

  //* ---------------- PAGINATION ---------------- */
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [activityStatusFilter, setActivityStatusFilter] = useState<"All" | "Completed" | "Pending" | "Overdue">("All");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeEnum[]>([]);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: string; to?: string }>({});

  // All activities (Admin sees everything)
  const allActivities = useMemo(() => activities, [activities]);

  // All clients (Admin sees all)
  const allClients = useMemo(() => clients, [clients]);

  // Reset pagination on filter change
  useEffect(() => setCurrentPage(1), [activityStatusFilter, activityTypeFilter, clientFilter, dateRangeFilter]);

 

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter(a => {
      const scheduled = new Date(a.scheduledAt);
      const isCompleted = !!a.completedAt;
      const isPast = scheduled < now;

      if (activityStatusFilter === "Completed" && !isCompleted) return false;
      if (activityStatusFilter === "Pending" && (isCompleted || isPast)) return false; // future pending
      if (activityStatusFilter === "Overdue" && (isCompleted || !isPast)) return false; // past & not completed

      if (activityTypeFilter.length > 0 && !activityTypeFilter.includes(a.type)) return false;
      if (clientFilter !== "all" && a.clientId !== clientFilter) return false;

      if (dateRangeFilter.from && scheduled < new Date(dateRangeFilter.from)) return false;
      if (dateRangeFilter.to && scheduled > new Date(new Date(dateRangeFilter.to).setHours(23,59,59,999))) return false;

      return true;
    });
  }, [allActivities, activityStatusFilter, activityTypeFilter, clientFilter, dateRangeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredActivities.slice(start, start + PAGE_SIZE);
  }, [filteredActivities, currentPage]);

  // Handlers
  const handleCreateActivity = (activityData: Omit<ActivityType, "id">) => {
    const newActivity: ActivityType = { ...activityData, id: `activity-${Date.now()}` };
    setActivities(prev => [...prev, newActivity]);
    toast({ title: "Activity Created", description: "New activity has been scheduled." });
  };

  const handleCompleteActivity = (activityId: string, outcome: string) => {
    setActivities(prev => prev.map(a => a.id === activityId ? { ...a, completedAt: new Date().toISOString(), outcome } : a));
    toast({ title: "Activity Completed" });
    setViewingActivity(null);
  };

  const handleAddNote = (note: Omit<ActivityNote, "id" | "activityId">) => {
    if (!noteActivity) return;
    const newNote: ActivityNote = { ...note, id: `note-${Date.now()}`, activityId: noteActivity.id };
    setActivities(prev =>
      prev.map(a => a.id === noteActivity.id ? { ...a, notes: [...(a.notes || []), newNote] } : a)
    );
    if (viewingActivity?.id === noteActivity.id) {
      setViewingActivity({ ...viewingActivity, notes: [...(viewingActivity.notes || []), newNote] });
    }
    toast({ title: "Note Added" });
  };

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.name}</h1>
        <p className="text-muted-foreground">Admin dashboard overview</p>
      </div>

{/* KPI CARDS - Row 1 */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <KpiCard
    title="Total Divisions"
    icon={<UsersRound className="h-5 w-5 text-indigo-600" />}
    iconBg="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5"
    value={[...new Set(kams.map(k => k.division))].length}
  />

  <KpiCard
    title="Total Clients"
    icon={<Users className="h-5 w-5 text-blue-600" />}
    iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"
    value={clients.length}
  />

  <KpiCard
    title="Total Teams"
    icon={<UsersRound className="h-5 w-5 text-cyan-600" />}
    iconBg="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
    value={uniqueTeams}
  />

  <KpiCard
    title="Total KAM"
    icon={<Users className="h-5 w-5 text-emerald-600" />}
    iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
    value={kams.length}
  />
</div>

{/* KPI CARDS - Row 2 */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
  <KpiCard
    title="Avg Activities / KAM"
    icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
    iconBg="bg-gradient-to-br from-orange-500/20 to-orange-500/5"
    value={avgActivities}
    lastValue={kams.length > 0 ? Math.round(lastMonthActivities.length / kams.length) : 0}
    bottomLabel="Last month"
     subLabel="This month"
  />
  <KpiCard
    title="Target"
    icon={<Target className="h-5 w-5 text-amber-600" />}
    iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
    value={formatCurrency(currentMonthTarget)}
    lastValue={formatCurrency(lastMonthTarget)}
    bottomLabel="Last month"
    subLabel="This month"
  />

  <KpiCard
    title="Achieved"
    icon={<TakaIcon className="h-5 w-5 text-emerald-600" />}
    iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
    value={formatCurrency(currentMonthSalesTotal)}
    lastValue={formatCurrency(lastMonthSalesTotal)}
    bottomLabel="Last month"
    subLabel="This month"
  />

  <KpiCard
    title="Achievement Rate"
    icon={<CheckCircle className="h-5 w-5 text-purple-600" />}
    iconBg="bg-gradient-to-br from-purple-500/20 to-purple-500/5"
    value={currentMonthTarget > 0 ? `${Math.round((currentMonthSalesTotal / currentMonthTarget) * 100)}%` : "0%"}
    lastValue={lastMonthTarget > 0 ? `${Math.round((lastMonthSalesTotal / lastMonthTarget) * 100)}%` : "0%"}
    bottomLabel="Last month"
     subLabel="This month"
  />
</div>


      {/* Filters and New Activity */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {["All", "Pending", "Completed", "Overdue"].map(status => (
            <Button
              key={status}
              variant={activityStatusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setActivityStatusFilter(status as typeof activityStatusFilter)}
            >
              {status}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setIsFilterDrawerOpen(true)}>
            <Filter className="h-4 w-4" /> Filters
            {(activityTypeFilter.length > 0 || clientFilter !== "all" || dateRangeFilter.from || dateRangeFilter.to) && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
            )}
          </Button>

          <Button onClick={() => setIsActivityModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Activity
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
            onChange: v => setActivityTypeFilter(v as ActivityTypeEnum[]),
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
            options: [{ label: "All Clients", value: "all" }, ...allClients.map(c => ({ label: c.name, value: c.id }))],
          },
          {
            type: "date-range",
            label: "Date Range",
            value: dateRangeFilter,
            onChange: setDateRangeFilter,
          },
        ]}
        onReset={() => { setActivityTypeFilter([]); setClientFilter("all"); setDateRangeFilter({}); }}
        onApply={() => setIsFilterDrawerOpen(false)}
      />





      {/* Activity List */}
      <ActivityList
        activities={paginatedActivities}
        clients={allClients}
        showClientInfo
        onEdit={updatedActivity => setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a))}
        onComplete={handleCompleteActivity}
        onAddActivity={() => setIsActivityModalOpen(true)}
        onViewActivity={setViewingActivity}
        onAddNote={handleAddNoteFromList}
      />

      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Modals */}
      <ActivityModal
        open={isActivityModalOpen}
        onClose={() => { setIsActivityModalOpen(false); setPreselectedClientId(undefined); }}
        onSave={handleCreateActivity}
        clients={allClients}
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