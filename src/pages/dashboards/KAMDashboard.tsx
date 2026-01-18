import { useState, useMemo } from "react";
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

  // Filters
  const [activityStatusFilter, setActivityStatusFilter] = useState<"all" | "completed" | "incomplete">("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeEnum | "all">("all");
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

  /* ---------------- FILTERED ACTIVITIES ---------------- */
  const filteredActivities = useMemo(() => {
    return myActivities.filter((a) => {
      if (activityStatusFilter === "completed" && !a.completedAt) return false;
      if (activityStatusFilter === "incomplete" && a.completedAt) return false;

      if (activityTypeFilter !== "all" && a.type !== activityTypeFilter) return false;

      if (clientFilter !== "all" && a.clientId !== clientFilter) return false;

      const scheduled = new Date(a.scheduledAt);
      if (dateRangeFilter.from && scheduled < new Date(dateRangeFilter.from)) return false;
      if (dateRangeFilter.to && scheduled > new Date(new Date(dateRangeFilter.to).setHours(23,59,59,999))) return false;

      return true;
    });
  }, [myActivities, activityStatusFilter, activityTypeFilter, clientFilter, dateRangeFilter]);

  /* ---------------- DATE HELPERS ---------------- */
  const now = new Date();
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

  const handleAddNote = (note: Omit<ActivityNote, "id" | "activityId">) => {
    if (!noteActivity) return;
    
    const newNote: ActivityNote = {
      ...note,
      id: `note-${Date.now()}`,
      activityId: noteActivity.id,
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
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm text-muted-foreground">Activities</p>
                    <span className="text-xs text-blue-400 font-semibold">This month</span>
                  </div>
                  <p className="text-2xl font-bold">{currentMonthActivities.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {lastMonthActivities.length}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Activities</p>
                  <p className="text-2xl font-bold">{currentMonthPendingActivities.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground text-red-800">
              Overdue: {myActivities.filter(a => !a.completedAt && new Date(a.scheduledAt) < now).length}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <span className="text-xs text-blue-400 font-semibold">This month</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(currentMonthTarget)}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonthTarget)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm text-muted-foreground">Achieved</p>
                    <span className="text-xs text-blue-400 font-semibold">This month</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(currentMonthSalesTotal)}</p>
                </div>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonthSalesTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ACTIVITIES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Activities</h2>
            <p className="text-sm text-muted-foreground">Track and manage your client activities</p>
          </div>

          <Button onClick={() => setIsActivityModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Activity
          </Button>
        </div>

        {/* FILTERS */}
        <div className="flex items-center justify-between">
          {/* Status Toggle */}
          <div className="flex gap-2">
            {["all", "completed", "incomplete"].map((status) => (
              <Button
                key={status}
                variant={activityStatusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setActivityStatusFilter(status as typeof activityStatusFilter)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Other Filters in Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {(activityTypeFilter !== "all" || clientFilter !== "all" || dateRangeFilter.from || dateRangeFilter.to) && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {(activityTypeFilter !== "all" || clientFilter !== "all" || dateRangeFilter.from || dateRangeFilter.to) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActivityTypeFilter("all");
                        setClientFilter("all");
                        setDateRangeFilter({});
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Select value={activityTypeFilter} onValueChange={(v) => setActivityTypeFilter(v as ActivityTypeEnum | "all")}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="physical_meeting">Physical Meeting</SelectItem>
                      <SelectItem value="virtual_meeting">Virtual Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Client */}
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {allMyClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input type="date" value={dateRangeFilter.from || ""} onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, from: e.target.value })} />
                  <Label>Date To</Label>
                  <Input type="date" value={dateRangeFilter.to || ""} onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, to: e.target.value })} />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Activity List */}
        <ActivityList
          activities={filteredActivities}
          clients={allMyClients}
          onEdit={(a) => {
            setViewingActivity(null);
            // For editing, we could open a modal here
          }}
          onDelete={handleDeleteActivity}
          onComplete={handleCompleteActivity}
          onAddActivity={() => setIsActivityModalOpen(true)}
          onViewActivity={setViewingActivity}
          onAddNote={setNoteActivity}
          showClientInfo
        />
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
        client={viewingActivity ? allMyClients.find((c) => c.id === viewingActivity.clientId) || null : null}
        onComplete={handleCompleteActivity}
        onAddNote={() => {
          if (viewingActivity) {
            setNoteActivity(viewingActivity);
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
