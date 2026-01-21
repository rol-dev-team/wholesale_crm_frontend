import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ActivityDetailModal } from '@/components/activities/ActivityDetailModal';
import { ActivityList } from '@/components/activities/ActivityList';
import { FilterDrawer } from "@/components/filters/ActivityFilterDrawer";
import { AppPagination } from '@/components/common/AppPagination';
import { KpiCard } from '@/components/common/KpiCard';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ActivityDetailsSheet } from "@/components/activities/ActivityDetailsSheet";
import { ActivityNotesModal } from "@/components/activities/ActivityNotesModal";

import {
  Users,
  Activity,
  BarChart3,
  Plus,
  Filter,
  X,
  Target,
  CheckCircle,
  UsersRound,
  TrendingUp,
} from 'lucide-react';
import { TakaIcon } from '@/components/ui/taka-icon';
import {
  initialActivities,
  initialKAMs,
  initialClients,
  initialSales,
  initialTargets,
  formatCurrency,
  divisions,
  type ActivityNote,
  type Activity as ActivityType,
  type ActivityType as ActivityTypeEnum,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

export default function SupervisorDashboard() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [kams] = useState(initialKAMs);
  const [clients] = useState(initialClients);
  const [sales] = useState(initialSales);

  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<ActivityType | null>(null);
  const [noteActivity, setNoteActivity] = useState<ActivityType | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);


 const handleAddNoteFromList = (activity: ActivityType) => setNoteActivity(activity);


  //* ---------------- PAGINATION ---------------- */
  const PAGE_SIZE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  //* ---------------- FILTERS ---------------- */
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeEnum | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: string; to?: string }>({});

  const hasFilters = activityTypeFilter !== 'all' || clientFilter !== 'all' || kamFilter !== 'all' || divisionFilter !== 'all' || dateRangeFilter.from || dateRangeFilter.to;

  const clearFilters = () => {
    setActivityTypeFilter('all');
    setClientFilter('all');
    setKamFilter('all');
    setDivisionFilter('all');
    setDateRangeFilter({});
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activityStatusFilter,
    activityTypeFilter,
    clientFilter,
    kamFilter,
    divisionFilter,
    dateRangeFilter,
  ]);

  //* ---------------- DATE HELPERS ---------------- */
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const isSameMonth = (dateStr: string, m: number, y: number) => {
    const d = new Date(dateStr);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  //* ---------------- METRICS ---------------- */
  const teamKamIds = kams.map(k => k.id);

  // Team activities
  const teamActivities = activities.filter(a => {
    const client = clients.find(c => c.id === a.clientId);
    return client && teamKamIds.includes(client.assignedKamId || '');
  });

  const currentMonthActivities = teamActivities.filter(a => isSameMonth(a.scheduledAt, currentMonth, currentYear));
  const lastMonthActivities = teamActivities.filter(a => isSameMonth(a.scheduledAt, lastMonth, lastMonthYear));
  const completedActivities = currentMonthActivities.filter(a => a.completedAt);

  // Team sales
  const teamSales = sales.filter(s => teamKamIds.includes(s.kamId));
  const currentMonthSales = teamSales.filter(s => isSameMonth(s.closingDate, currentMonth, currentYear));
  const lastMonthSales = teamSales.filter(s => isSameMonth(s.closingDate, lastMonth, lastMonthYear));
  const currentMonthSalesTotal = currentMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);
  const lastMonthSalesTotal = lastMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);

  // Team Targets
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = `${monthNames[currentMonth]} ${currentYear}`;
  const lastMonthName = `${monthNames[lastMonth]} ${lastMonthYear}`;

  const teamTargetsCurrent = initialTargets.filter(t => teamKamIds.includes(t.kamId) && t.month === currentMonthName);
  const teamTargetsLast = initialTargets.filter(t => teamKamIds.includes(t.kamId) && t.month === lastMonthName);

  const totalTarget = teamTargetsCurrent.reduce((sum, t) => sum + t.revenueTarget, 0);
  const totalAchieved = currentMonthSalesTotal;
  const lastMonthTarget = teamTargetsLast.reduce((sum, t) => sum + t.revenueTarget, 0);
  const lastMonthAchieved = lastMonthSalesTotal;

  const avgActivities = kams.length > 0 ? Math.round(currentMonthActivities.length / kams.length) : 0;
  const lastAvgActivities = kams.length > 0 ? Math.round(lastMonthActivities.length / kams.length) : 0;
  const uniqueTeams = [...new Set(kams.map(k => k.division))].length;

  //* ---------------- FILTERED ACTIVITIES ---------------- */
  const filteredActivities = useMemo(() => {
    return teamActivities.filter(a => {
      // Status filter
      const scheduled = new Date(a.scheduledAt);
      const isCompleted = !!a.completedAt;
      const isPast = scheduled < now;

      if (activityStatusFilter === 'completed' && !isCompleted) return false;
      if (activityStatusFilter === 'pending' && (isCompleted || isPast)) return false;
      if (activityStatusFilter === 'overdue' && (isCompleted || !isPast)) return false;

      // Type filter
      if (activityTypeFilter !== 'all' && a.type !== activityTypeFilter) return false;

      // Client filter
      if (clientFilter !== 'all' && a.clientId !== clientFilter) return false;

      // KAM filter
      if (kamFilter !== 'all') {
        const client = clients.find(c => c.id === a.clientId);
        if (!client || client.assignedKamId !== kamFilter) return false;
      }

      // Division filter
      if (divisionFilter !== 'all') {
        const client = clients.find(c => c.id === a.clientId);
        if (!client || client.division !== divisionFilter) return false;
      }

      // Date range filter
      if (dateRangeFilter.from && scheduled < new Date(dateRangeFilter.from)) return false;
      if (dateRangeFilter.to && scheduled > new Date(new Date(dateRangeFilter.to).setHours(23, 59, 59, 999))) return false;

      return true;
    });
  }, [teamActivities, activityStatusFilter, activityTypeFilter, clientFilter, kamFilter, divisionFilter, dateRangeFilter, clients]);

  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredActivities.slice(start, end);
  }, [filteredActivities, currentPage]);

  //* ---------------- HANDLERS ---------------- */
  const handleCreateActivity = (activityData: Omit<ActivityType, 'id'>) => {
    const newActivity: ActivityType = { ...activityData, id: `activity-${Date.now()}` };
    setActivities(prev => [...prev, newActivity]);
    toast({ title: 'Activity Created', description: 'New activity has been scheduled.' });
    setIsCreateActivityOpen(false);
  };

  const handleCompleteActivity = (activityId: string, outcome: string) => {
    setActivities(prev =>
      prev.map(a =>
        a.id === activityId
          ? { ...a, completedAt: new Date().toISOString(), outcome }
          : a
      )
    );
    toast({ title: 'Activity Completed' });
  };

  const handleDeleteActivity = (activityId: string) => {
    setActivities(prev => prev.filter(a => a.id !== activityId));
    toast({ title: 'Activity Deleted', description: 'The activity has been removed.' });
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

  //* ---------------- UI ---------------- */
  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Supervisor Dashboard</h1>
          <p className="text-muted-foreground">Team performance overview</p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard title="Total Teams" value={uniqueTeams} subLabel="This month" icon={<UsersRound className="h-5 w-5 text-indigo-600" />} iconBg="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5"/>
        <KpiCard title="Total KAM" value={kams.length} subLabel="This month" icon={<Users className="h-5 w-5 text-blue-600" />} iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"/>
        <KpiCard title="Avg Activities / KAM" value={avgActivities} lastValue={lastAvgActivities} bottomLabel="Last month" subLabel="This month" icon={<TrendingUp className="h-5 w-5 text-cyan-600" />} iconBg="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <KpiCard title="Target" value={formatCurrency(totalTarget)} lastValue={formatCurrency(lastMonthTarget)} bottomLabel="Last month" subLabel="This month" icon={<Target className="h-5 w-5 text-amber-600" />} iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"/>
        <KpiCard title="Achieved" value={formatCurrency(totalAchieved)} lastValue={formatCurrency(lastMonthAchieved)} bottomLabel="Last month" subLabel="This month" icon={<TakaIcon className="h-5 w-5 text-emerald-600" />} iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"/>
        <KpiCard title="Achievement Rate" value={totalTarget > 0 ? `${Math.round((totalAchieved / totalTarget) * 100)}%` : '0%'} lastValue={lastMonthTarget > 0 ? `${Math.round((lastMonthSalesTotal / lastMonthTarget) * 100)}%` : "0%"} subLabel="This month" bottomLabel="Last month" icon={<CheckCircle className="h-5 w-5 text-orange-600" />} iconBg="bg-gradient-to-br from-orange-500/20 to-orange-500/5"/>
      </div>

      {/* ACTIVITIES SECTION */}
      <div className="space-y-4">
        {/* Filters + Status toggles */}
        <div className="flex items-center justify-between gap-2">
          {/* Status toggles */}
          <div className="flex gap-2">
            {['all','pending','completed','overdue'].map(status => (
              <Button
                key={status}
                variant={activityStatusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActivityStatusFilter(status as typeof activityStatusFilter)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Filter + New Activity */}
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setIsFilterDrawerOpen(true)}>
              <Filter className="h-4 w-4" />
              Filters
              {hasFilters && <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>}
            </Button>
            <Button onClick={() => setIsCreateActivityOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Activity
            </Button>
          </div>
        </div>

        <FilterDrawer
          open={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Filter Activities"
          filters={[
            {
              type: "single-select",
              label: "Activity Type",
              value: activityTypeFilter,
              onChange: (v) => setActivityTypeFilter(v as ActivityTypeEnum | "all"),
              options: [
                { label: "All Types", value: "all" },
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
              label: "KAM",
              value: kamFilter,
              onChange: setKamFilter,
              options: [
                { label: "All KAMs", value: "all" },
                ...kams.map((k) => ({ label: k.name, value: k.id })),
              ],
            },
            {
              type: "search-select",
              label: "Client",
              value: clientFilter,
              onChange: setClientFilter,
              options: [
                { label: "All Clients", value: "all" },
                ...clients.map((c) => ({ label: c.name, value: c.id })),
              ],
            },
            {
              type: "single-select",
              label: "Division",
              value: divisionFilter,
              onChange: setDivisionFilter,
              options: [
                { label: "All Divisions", value: "all" },
                ...divisions.map((d) => ({ label: d, value: d })),
              ],
            },
            {
              type: "date-range",
              label: "Date Range",
              value: dateRangeFilter,
              onChange: setDateRangeFilter,
            },
          ]}
          onReset={clearFilters}
          onApply={() => setIsFilterDrawerOpen(false)}
        />

        <ActivityList
  activities={paginatedActivities}
  clients={clients}
  onEdit={(updatedActivity) => {
    setActivities(prev => prev.map(a => a.id === updatedActivity.id ? updatedActivity : a));
    toast({ title: 'Activity Updated' });
  }}
  onComplete={handleCompleteActivity}
  onAddActivity={() => setIsCreateActivityOpen(true)}
  onViewActivity={setViewingActivity}  // <-- separate viewing modal
  onAddNote={setNoteActivity}           // <-- separate notes modal
  showClientInfo
/>


        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODALS */}
      <ActivityModal
  open={isCreateActivityOpen}
  onClose={() => setIsCreateActivityOpen(false)}
  onSave={handleCreateActivity}
  clients={clients}
  kams={kams}
  userRole={currentUser?.role}
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

{/* Add Note Modal */}
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
