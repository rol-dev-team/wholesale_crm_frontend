import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ActivityDetailsSheet } from '@/components/activities/ActivityDetailsSheet';
import { ActivityNotesModal } from '@/components/activities/ActivityNotesModal';
import { ActivityList } from '@/components/activities/ActivityList';
import { FilterDrawer } from '@/components/filters/ActivityFilterDrawer';
import { AppPagination } from '@/components/common/AppPagination';
import {
  X,
  Filter,
  Plus,
  Activity,
  Clock,
  Target,
  TrendingUp,
  UsersRound,
  Users,
  CheckCircle,
  Search,
  ListTodo,
} from 'lucide-react';
import { TakaIcon } from '@/components/ui/taka-icon';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/common/KpiCard';

import { useToast } from '@/hooks/use-toast';
import {
  Client,
  initialActivities,
  initialClients,
  type Activity,
  type ActivityType,
} from '@/data/mockData';

import { ActivityTypeAPI, TaskAPI } from '@/api';
import { PrismAPI } from '@/api';
import { getUserInfo } from '@/utility/utility';
import { DashboardAPI } from '@/api';
import { hasRole } from '@/utility/hasRole';
import { get } from 'http';

const ITEMS_PER_PAGE = 10;

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const user = getUserInfo();
  const { toast } = useToast();
  const [activityTypeOptions, setActivityTypeOptions] = useState<
    { value: number; label: string }[]
  >([]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [noteActivity, setNoteActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);

  const [activitySummary, setActivitySummary] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [clients] = useState<Client[]>(initialClients);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // ---------------- FILTER STATES ----------------
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [kamFilter, setKamFilter] = useState('all');

  // ---------------- ROLE CHECK ----------------
  const role = currentUser?.role;

  const isKAM = role === 'kam';
  const isSupervisor = role === 'supervisor';
  const isManagement = role === 'boss' || role === 'super_admin';

  // ---------------- OPTIONS ----------------
  const kams = [
    {
      id: 1,
      name: 'Ashik Rahman',
      division: 'Dhaka',
      reportingTo: 'Supervisor A',
    },
    {
      id: 2,
      name: 'Tanvir Hasan',
      division: 'Chattogram',
      reportingTo: 'Supervisor B',
    },
    {
      id: 3,
      name: 'Nusrat Jahan',
      division: 'Dhaka',
      reportingTo: 'Supervisor A',
    },
  ];

  const divisions = useMemo(() => Array.from(new Set(kams.map((k) => k.division))), [kams]);

  const supervisors = useMemo(
    () => Array.from(new Set(kams.map((k) => k.reportingTo).filter(Boolean))),
    [kams]
  );

  // Filters
  const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // state
  const [kamOptions, setKamOptions] = useState<{ value: number; label: string }[]>([]);
  const [clientOptions, setKamFilterOptions] = useState<{ value: number; label: string }[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<{ value: number; label: string }[]>(
    []
  );
  const [divisionOptions, setDivisionOptions] = useState<{ value: number; label: string }[]>([]);

  const lastPayloadRef = useRef<any>(null);

  const fetchTasks = async (payload) => {
    lastPayloadRef.current = payload;
    try {
      const res = await TaskAPI.getTasks(payload);

      setActivities(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
    } catch (error) {
      console.log('error', error);
      toast({
        title: 'Failed to load activities---',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchTasks({
      page: 1,
      per_page: ITEMS_PER_PAGE,
      kam_id: getUserInfo()?.default_kam_id,
      // search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  }, [statusFilter]);

  const fetchFilteredTasks = async (payload) => {
    try {
      const res = await TaskAPI.getTasks(payload);

      setActivities(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
    } catch (error) {
      toast({
        title: 'Failed to load activities',
        variant: 'destructive',
      });
    }
  };

  const fetchKams = async () => {
    try {
      const res = await PrismAPI.getKams();
      const options = (res.data || []).map((item: any) => ({
        value: item.kam_id,
        label: item.kam_name,
      }));
      setKamOptions(options);
    } catch (error) {
      toast({
        title: 'Failed to load activities',
        variant: 'destructive',
      });
    }
  };

  const fetchSummary = async (id) => {
    try {
      const res = await TaskAPI.getSummary(id);
      setActivitySummary(res.data);
    } catch {
      toast({
        title: 'Failed to load activities Summary',
        variant: 'destructive',
      });
    }
  };
  useEffect(() => {
    fetchKams();
    fetchSummary(user?.default_kam_id);
  }, []);

  useEffect(() => {
    const fetchActivityTypes = async () => {
      try {
        const res = await ActivityTypeAPI.getActivityTypes();

        const options = (res.data || []).map((item: any) => ({
          value: item.id,
          label: item.activity_type_name,
        }));
        setActivityTypeOptions(options);
      } catch (error) {
        toast({
          title: 'Failed to load activity types',
          variant: 'destructive',
        });
      }
    };

    fetchActivityTypes();
  }, []);

  // ---------------- FILTER CONFIG ----------------
  const filters = [
    // -------- DIVISION (STRING) --------
    {
      type: 'search-select' as const,
      label: 'Division',
      value: divisionFilter,
      onChange: setDivisionFilter,
      options: [
        { label: 'All', value: 'all' },
        ...divisions.map((d) => ({
          label: d,
          value: d, // ✅ string
        })),
      ],
    },

    // -------- SUPERVISOR (NUMBER) --------
    {
      type: 'search-select' as const,
      label: 'Supervisor',
      value: supervisorFilter,
      onChange: setSupervisorFilter,
      options: [
        { label: 'All', value: 'all' },
        ...supervisors.map((s, index) => ({
          label: s,
          value: index + 1, // ✅ number ID
        })),
      ],
    },

    // -------- KAM (NUMBER) --------
    {
      type: 'search-select' as const,
      label: 'KAM',
      value: kamFilter,
      onChange: setKamFilter,
      options: [
        { label: 'All', value: 'all' },
        ...kams.map((k) => ({
          label: k.name,
          value: k.id, // ✅ number
        })),
      ],
    },

    // -------- ACTIVITY TYPE (NUMBER[]) --------
    {
      type: 'multi-select' as const,
      label: 'Activity Type',
      value: typeFilters,
      onChange: setTypeFilters,
      options: activityTypeOptions.map((o) => ({
        label: o.label,
        value: o.value, // ✅ number
      })),
    },

    // -------- CLIENT (NUMBER) --------
    {
      type: 'search-select' as const,
      label: 'Client',
      value: clientFilter,
      onChange: setClientFilter,
      options: [
        { label: 'All', value: 'all' },
        ...clients.map((c) => ({
          label: c.name,
          value: c.id, // ✅ number
        })),
      ],
    },

    // -------- DATE RANGE --------
    {
      type: 'date-range' as const,
      label: 'Date Range',
      value: dateRange,
      onChange: setDateRange,
    },
  ];

  const handleAddNote = async (note: { content: string }) => {
    if (!noteActivity) return;

    const payload = {
      task_id: noteActivity.id,
      note: note.content,
    };

    try {
      await TaskAPI.addNote(payload);

      toast({ title: 'Note added successfully' });

      setNoteActivity(null);
      fetchTasks({
        ...lastPayloadRef.current,
        page: currentPage,
      });
    } catch (error) {
      toast({
        title: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateActivityStatus = async (payload) => {
    try {
      const res = await TaskAPI.updateStatus(payload);

      toast({
        title: res.data?.message || 'Task status updated successfully',
      });

      fetchTasks({
        ...lastPayloadRef.current,
        page: currentPage,
      });
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error || 'Failed to update task status';

      toast({
        title: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const [summary, setSummary] = useState([]);
  const [kpiSummary, setKpiSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAdminSummary = async () => {
    setLoading(true);
    try {
      const res = await DashboardAPI.getAdminSummary();
      setSummary(res.data);
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Failed to load dashboard summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminKpiSummary = async () => {
    setLoading(true);
    try {
      const res = await DashboardAPI.getAdminKpiSummary();
      setKpiSummary(res.data);
    } catch (error: any) {
      toast({
        title: error?.response?.data?.message || 'Failed to load dashboard summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSummary();
    fetchAdminKpiSummary();
  }, []);

  // console.log('dddddd', activities);
  // console.log('kamOptions', kamOptions);
  // console.log(getUserInfo()?.id);
  // console.log('userkam', user?.default_kam_id);

  // console.log('summary', summary);

  return (
    <div className="page-container space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.name}</h1>
        <p className="text-muted-foreground">Dashboard overview</p>
      </div>

      {/* KPI CARDS - Row 1 */}
      {getUserInfo()?.role !== 'kam' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            title="Total Branch"
            icon={<UsersRound className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-gradient-to-br from-indigo-500/20 to-indigo-500/5"
            value={summary?.total_branches || 0}
          />

          <KpiCard
            title="Total KAM"
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
            value={summary?.total_kams || 0}
          />

          <KpiCard
            title="Total Clients"
            icon={<Users className="h-5 w-5 text-blue-600" />}
            iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"
            value={summary?.total_clients || 0}
          />
        </div>
      )}

      {/* KPI CARDS - Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <KpiCard
          title="Avg Activities / KAM"
          icon={<TrendingUp className="h-5 w-5 text-orange-600" />}
          iconBg="bg-gradient-to-br from-orange-500/20 to-orange-500/5"
          value={kpiSummary?.avg_activities_this_month || 0}
          // lastValue={kpiSummary?.avg_activities_last_month || 0}
          // bottomLabel={kpiSummary?.last_month_label || '--'}
          subLabel={kpiSummary?.this_month_label || '--'}
        />
        <KpiCard
          title="Target"
          icon={<Target className="h-5 w-5 text-amber-600" />}
          iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
          value={kpiSummary?.target_this_month || 0}
          // lastValue={kpiSummary?.target_last_month || 0}
          // bottomLabel={kpiSummary?.last_month_label || '--'}
          subLabel={kpiSummary?.this_month_label || '--'}
        />

        <KpiCard
          title="Achieved"
          icon={<TakaIcon className="h-5 w-5 text-emerald-600" />}
          iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
          value={`${kpiSummary?.this_month_achieved ?? 0} (${kpiSummary?.this_month_achieved_percentage ?? 0}%)`}
          // lastValue={`${kpiSummary?.last_month_achieved ?? 0} (${kpiSummary?.last_month_achieved_percentage ?? 0}%)`}
          // bottomLabel={kpiSummary?.last_month_label || '--'}
          subLabel={kpiSummary?.this_month_label || '--'}
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Buttons */}
        <div className="flex gap-2 mb-2 lg:mb-0">
          {['all', 'upcoming', 'overdue', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Search + Filter + New Activity */}
        <div className="flex items-center gap-2 flex-1 lg:flex-none">
          {/* Search */}
          {/* <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div> */}

          {/* Filter */}
          <Button
            variant="outline"
            className="flex gap-2"
            onClick={() => setIsFilterDrawerOpen(true)}
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>

          {/* New Activity */}
          <Button onClick={() => setIsModalOpen(true)} className="flex gap-2">
            <Plus className="h-4 w-4" />
            New Activity
          </Button>
        </div>
      </div>

      {/* Active Type Filters */}
      {typeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {typeFilters.map((t) => (
            <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs">
              {activityTypeOptions.find((o) => o.value === t)?.label}
            </span>
          ))}
        </div>
      )}

      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Activities"
        filters={filters}
        onReset={() => {
          setDivisionFilter('all');
          setSupervisorFilter('all');
          setKamFilter('all');
          setTypeFilters([]);
          setClientFilter('all');
          setDateRange({});
        }}
        // onApply={() => setIsFilterDrawerOpen(false)}
        onApply={(modalFilter) => {
          const payload = {
            page: 1,
            per_page: ITEMS_PER_PAGE,

            // ✅ backend-supported params only
            kam_id: modalFilter?.kamId ? Number(modalFilter.kamId) : undefined,

            client_id: modalFilter?.clientId
              ? Number(modalFilter.clientId) // ⚠️ must be ID, not name
              : undefined,

            activity_type_id: modalFilter?.activityType
              ? Number(modalFilter.activityType)
              : undefined,

            from_date: modalFilter?.dateRange?.from || undefined,
            to_date: modalFilter?.dateRange?.to || undefined,
          };

          fetchFilteredTasks(payload);
          setIsFilterDrawerOpen(false);
        }}
      />

      {/* ACTIVITY LIST */}
      <ActivityList
        activities={activities}
        onEdit={(a) => {
          setEditingActivity(a);
          setIsModalOpen(true);
        }}
        onComplete={handleUpdateActivityStatus}
        onAddActivity={() => setIsModalOpen(true)}
        onViewActivity={(activity) => {
          setViewingActivity(activity);
        }}
        onAddNote={(activity) => {
          setNoteActivity(activity); // ✅ THIS opens modal
        }}
        showClientInfo
      />

      {/* PAGINATION */}

      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) =>
          fetchTasks({
            ...lastPayloadRef.current,
            page,
          })
        }
      />

      {/* MODAL */}
      {/* <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        editingActivity={editingActivity}
        onSave={async (payload) => {
          try {
            await TaskAPI.createTask(payload);
            toast({ title: 'Activity created successfully' });
            setIsModalOpen(false);
            fetchTasks();
          } catch (error: any) {
            toast({
              title: 'Failed to create activity',
              description: error?.response?.data?.message,
              variant: 'destructive',
            });
          }
        }}
        kams={kamOptions}
        clients={clients}
        activityTypes={activityTypeOptions}
        userId={getUserInfo()?.id}
      /> */}

      <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        editingActivity={editingActivity}
        onSave={async (payload) => {
          try {
            if (editingActivity) {
              // Update existing task
              await TaskAPI.updateTask(editingActivity.id, payload);
              toast({ title: 'Task updated successfully' });
            } else {
              // Create new task
              await TaskAPI.createTask(payload);
              toast({ title: 'Task created successfully' });
            }

            setIsModalOpen(false);
            setEditingActivity(null);
            fetchTasks({
              ...lastPayloadRef.current,
              page: currentPage,
            });
          } catch (error: any) {
            console.error('Save error:', error);
            toast({
              title: editingActivity ? 'Failed to update task' : 'Failed to create task',
              description: error?.response?.data?.message || 'Please try again',
              variant: 'destructive',
            });
          }
        }}
        kams={kamOptions}
        activityTypes={activityTypeOptions}
        userRole={currentUser?.role}
        userId={getUserInfo()?.id}
      />

      <ActivityDetailsSheet
        open={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
      />

      <ActivityNotesModal
        open={!!noteActivity}
        onClose={() => setNoteActivity(null)}
        onSave={handleAddNote}
      />
    </div>
  );
}
