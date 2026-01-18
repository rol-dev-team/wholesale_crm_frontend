import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ActivityDetailsSheet } from '@/components/activities/ActivityDetailsSheet';
import { ActivityNotesModal } from '@/components/activities/ActivityNotesModal';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Activity,
  BarChart3,
  Plus,
  Filter,
  X,
  Building2,
  UserCheck,
  UsersRound,
  TrendingUp,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { TakaIcon } from '@/components/ui/taka-icon';
import { format } from 'date-fns';
import {
  initialActivities,
  initialKAMs,
  initialClients,
  initialSales,
  formatCurrency,
  businessEntities,
  divisions,
  systemUsers,
  type Activity as ActivityType,
  type ActivityType as ActivityTypeEnum,
  type ActivityNote,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { ActivityTypeBadge } from '@/components/activities/ActivityTypeBadge';

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<ActivityType[]>(initialActivities);
  const [kams] = useState(initialKAMs);
  const [clients] = useState(initialClients);
  const [sales] = useState(initialSales);
  const [isCreateActivityOpen, setIsCreateActivityOpen] = useState(false);

  // Activity sheet and notes states
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activityForNotes, setActivityForNotes] = useState<ActivityType | null>(null);

  // Activity filters
  const [activityStatusFilter, setActivityStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityTypeEnum | 'all'>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: string; to?: string }>({});

  const hasFilters = activityTypeFilter !== 'all' || clientFilter !== 'all' || kamFilter !== 'all' || supervisorFilter !== 'all' || entityFilter !== 'all' || divisionFilter !== 'all' || dateRangeFilter.from || dateRangeFilter.to;

  const clearFilters = () => {
    setActivityTypeFilter('all');
    setClientFilter('all');
    setKamFilter('all');
    setSupervisorFilter('all');
    setEntityFilter('all');
    setDivisionFilter('all');
    setDateRangeFilter({});
  };

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

  /* ---------------- SUPERVISORS ---------------- */
  const supervisors = systemUsers.filter(u => u.role === 'supervisor');

  // Get KAMs under a supervisor
  const getKamsUnderSupervisor = (supervisorName: string) => {
    return kams.filter(k => k.reportingTo === supervisorName);
  };

  /* ---------------- METRICS ---------------- */
  const currentMonthActivities = activities.filter(a => isSameMonth(a.scheduledAt, currentMonth, currentYear));
  const lastMonthActivities = activities.filter(a => isSameMonth(a.scheduledAt, lastMonth, lastMonthYear));

  const currentMonthSales = sales.filter(s => isSameMonth(s.closingDate, currentMonth, currentYear));
  const lastMonthSales = sales.filter(s => isSameMonth(s.closingDate, lastMonth, lastMonthYear));
  const currentMonthSalesTotal = currentMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);
  const lastMonthSalesTotal = lastMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);

  // Count unique teams (using divisions as proxy)
  const uniqueTeams = [...new Set(kams.map(k => k.division))].length;

  // Average activities per KAM
  const avgActivities = kams.length > 0 ? Math.round(currentMonthActivities.length / kams.length) : 0;
  const lastAvgActivities = kams.length > 0 ? Math.round(lastMonthActivities.length / kams.length) : 0;

  /* ---------------- FILTERED ACTIVITIES ---------------- */
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      // Status filter
      if (activityStatusFilter === 'completed' && !a.completedAt) return false;
      if (activityStatusFilter === 'pending' && a.completedAt) return false;

      // Type filter
      if (activityTypeFilter !== 'all' && a.type !== activityTypeFilter) return false;

      // Client filter
      if (clientFilter !== 'all' && a.clientId !== clientFilter) return false;

      const client = clients.find(c => c.id === a.clientId);

      // Supervisor filter - get KAMs under this supervisor
      if (supervisorFilter !== 'all') {
        const supervisor = supervisors.find(s => s.id === supervisorFilter);
        if (supervisor) {
          const supervisorKams = getKamsUnderSupervisor(supervisor.name);
          const supervisorKamIds = supervisorKams.map(k => k.id);
          if (!client || !supervisorKamIds.includes(client.assignedKamId || '')) return false;
        }
      }

      // KAM filter
      if (kamFilter !== 'all') {
        if (!client || client.assignedKamId !== kamFilter) return false;
      }

      // Entity filter
      if (entityFilter !== 'all') {
        if (!client || !client.businessEntities.includes(entityFilter)) return false;
      }

      // Division filter
      if (divisionFilter !== 'all') {
        if (!client || client.division !== divisionFilter) return false;
      }

      // Date range filter
      const scheduled = new Date(a.scheduledAt);
      if (dateRangeFilter.from && scheduled < new Date(dateRangeFilter.from)) return false;
      if (dateRangeFilter.to && scheduled > new Date(new Date(dateRangeFilter.to).setHours(23, 59, 59, 999))) return false;

      return true;
    });
  }, [activities, activityStatusFilter, activityTypeFilter, clientFilter, kamFilter, supervisorFilter, entityFilter, divisionFilter, dateRangeFilter, clients, supervisors]);

  // Filtered KAMs based on supervisor filter
  const filteredKams = useMemo(() => {
    if (supervisorFilter === 'all') return kams;
    const supervisor = supervisors.find(s => s.id === supervisorFilter);
    if (!supervisor) return kams;
    return getKamsUnderSupervisor(supervisor.name);
  }, [kams, supervisorFilter, supervisors]);

  /* ---------------- HANDLERS ---------------- */
  const handleCreateActivity = (activityData: Omit<ActivityType, 'id'>) => {
    const newActivity: ActivityType = { ...activityData, id: `activity-${Date.now()}` };
    setActivities(prev => [...prev, newActivity]);
    toast({ title: 'Activity Created', description: 'New activity has been scheduled.' });
    setIsCreateActivityOpen(false);
  };

  const handleViewActivity = (activity: ActivityType) => {
    setSelectedActivity(activity);
    setIsDetailsSheetOpen(true);
  };

  const handleOpenNotes = (activity: ActivityType) => {
    setActivityForNotes(activity);
    setIsNotesModalOpen(true);
  };

  const handleAddNote = (activityId: string, note: Omit<ActivityNote, 'id' | 'activityId'>) => {
    setActivities(prev =>
      prev.map(a => {
        if (a.id === activityId) {
          const newNote: ActivityNote = {
            ...note,
            id: `note-${Date.now()}`,
            activityId,
          };
          return { ...a, notes: [...(a.notes || []), newNote] };
        }
        return a;
      })
    );
    toast({ title: 'Note Added', description: 'Your note has been added to the activity.' });
  };

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Management Dashboard</h1>
          <p className="text-muted-foreground">Organization-wide overview</p>
        </div>
        <Button onClick={() => setIsCreateActivityOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Activity
        </Button>
      </div>

      {/* KPI CARDS - Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Teams, KAMs, Supervisors - Combined */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5">
                  <UsersRound className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="text-sm text-muted-foreground">Team Structure</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold">{uniqueTeams}</p>
                  <p className="text-xs text-muted-foreground">Teams</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{kams.length}</p>
                  <p className="text-xs text-muted-foreground">KAMs</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{supervisors.length}</p>
                  <p className="text-xs text-muted-foreground">Supervisors</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Clients */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <TakaIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue (Current Month)</p>
                <p className="text-2xl font-bold">{formatCurrency(currentMonthSalesTotal)}</p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {formatCurrency(lastMonthSalesTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI CARDS - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Activities */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Activities (Current Month)</p>
                <p className="text-2xl font-bold">{currentMonthActivities.length}</p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {lastMonthActivities.length}
            </div>
          </CardContent>
        </Card>

        {/* Average Activities */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5">
                <TrendingUp className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Activities / KAM</p>
                <p className="text-2xl font-bold">{avgActivities}</p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Last month: {lastAvgActivities}
            </div>
          </CardContent>
        </Card>

        {/* Placeholder for future metric */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                <UserCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">
                  {currentMonthActivities.length > 0 
                    ? `${Math.round((currentMonthActivities.filter(a => a.completedAt).length / currentMonthActivities.length) * 100)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              {currentMonthActivities.filter(a => a.completedAt).length} of {currentMonthActivities.length} completed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ACTIVITIES SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">All Activities</h2>
            <p className="text-sm text-muted-foreground">Monitor activities across the organization</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex items-center justify-between">
          {/* Status Toggle */}
          <div className="flex gap-2">
            {['all', 'completed', 'pending'].map((status) => (
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

          {/* Other Filters in Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {hasFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">!</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  )}
                </div>

                {/* Supervisor Filter */}
                <div className="space-y-2">
                  <Label>Supervisor</Label>
                  <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Supervisors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Supervisors</SelectItem>
                      {supervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* KAM Filter */}
                <div className="space-y-2">
                  <Label>KAM</Label>
                  <Select value={kamFilter} onValueChange={setKamFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All KAMs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All KAMs</SelectItem>
                      {filteredKams.map((k) => (
                        <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity Type */}
                <div className="space-y-2">
                  <Label>Activity Type</Label>
                  <Select value={activityTypeFilter} onValueChange={(v) => setActivityTypeFilter(v as ActivityTypeEnum | 'all')}>
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

                {/* Business Entity */}
                <div className="space-y-2">
                  <Label>Business Entity</Label>
                  <Select value={entityFilter} onValueChange={setEntityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Entities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Entities</SelectItem>
                      {businessEntities.map((entity) => (
                        <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Division */}
                <div className="space-y-2">
                  <Label>Division</Label>
                  <Select value={divisionFilter} onValueChange={setDivisionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Divisions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Divisions</SelectItem>
                      {divisions.map((div) => (
                        <SelectItem key={div} value={div}>{div}</SelectItem>
                      ))}
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
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.from || ''}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, from: e.target.value }))}
                  />
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={dateRangeFilter.to || ''}
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ACTIVITIES TABLE */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>KAM</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No activities found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.slice(0, 10).map((activity) => {
                    const client = clients.find(c => c.id === activity.clientId);
                    const kam = kams.find(k => k.id === client?.assignedKamId);
                    return (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">{activity.title}</TableCell>
                        <TableCell>
                          <ActivityTypeBadge type={activity.type} />
                        </TableCell>
                        <TableCell>{client?.name || 'Unknown'}</TableCell>
                        <TableCell>{kam?.name || 'Unassigned'}</TableCell>
                        <TableCell>{format(new Date(activity.scheduledAt), 'MMM d, yyyy h:mm a')}</TableCell>
                        <TableCell>
                          <Badge variant={activity.completedAt ? 'default' : 'secondary'}>
                            {activity.completedAt ? 'Completed' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewActivity(activity)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenNotes(activity)}
                              title="Notes"
                            >
                              <MessageSquare className="h-4 w-4" />
                              {activity.notes && activity.notes.length > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                                  {activity.notes.length}
                                </span>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>


      {/* MODALS */}
      <ActivityModal
        open={isCreateActivityOpen}
        onClose={() => setIsCreateActivityOpen(false)}
        onSave={handleCreateActivity}
        clients={clients}
        kams={kams}
      />

      {selectedActivity && (
        <ActivityDetailsSheet
          activity={selectedActivity}
          client={clients.find(c => c.id === selectedActivity.clientId) || null}
          open={isDetailsSheetOpen}
          onClose={() => setIsDetailsSheetOpen(false)}
          onAddNote={() => {
            setActivityForNotes(selectedActivity);
            setIsNotesModalOpen(true);
          }}
        />
      )}

      {activityForNotes && currentUser && (
        <ActivityNotesModal
          activityId={activityForNotes.id}
          open={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          onSave={(note) => handleAddNote(activityForNotes.id, note)}
          currentUserName={currentUser.name}
          currentUserId={currentUser.id}
        />
      )}
    </div>
  );
}
