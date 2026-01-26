// ActivitiesPage.tsx
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { FilterDrawer } from '@/components/filters/ActivityFilterDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityList } from '@/components/activities/ActivityList';
import { KpiCard } from '@/components/common/KpiCard';
import { Plus, Filter, Search, ListTodo, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Client,
  initialActivities,
  initialClients,
  type Activity,
  type ActivityType,
} from '@/data/mockData';
import { AppPagination } from '@/components/common/AppPagination';
import { ActivityTypeAPI ,TaskAPI} from '@/api';

const ITEMS_PER_PAGE = 10;



export default function ActivitiesPage() {
  const { currentUser } = useAuth();
  const { toast } = useToast();
const [activityTypeOptions, setActivityTypeOptions] = useState<
  { value: number; label: string }[]
>([]);

  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [clients] = useState<Client[]>(initialClients);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // ---------------- FILTER STATES ----------------
const [divisionFilter, setDivisionFilter] = useState("all");
const [supervisorFilter, setSupervisorFilter] = useState("all");
const [kamFilter, setKamFilter] = useState("all");





// ---------------- ROLE CHECK ----------------
const role = currentUser?.role;

const isKAM = role === "kam";
const isSupervisor = role === "supervisor";
const isManagement = role === "boss" || role === "super_admin";

// ---------------- OPTIONS ----------------
 const kams = [
  {
    id: 1,
    name: "Ashik Rahman",
    division: "Dhaka",
    reportingTo: "Supervisor A",
  },
  {
    id: 2,
    name: "Tanvir Hasan",
    division: "Chattogram",
    reportingTo: "Supervisor B",
  },
  {
    id: 3,
    name: "Nusrat Jahan",
    division: "Dhaka",
    reportingTo: "Supervisor A",
  },
];



const divisions = useMemo(
() => Array.from(new Set(kams.map(k => k.division))),
[kams]
);

const supervisors = useMemo(
() => Array.from(new Set(kams.map(k => k.reportingTo).filter(Boolean))),
[kams]
);


  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>(
    'all'
  );
  const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.id }));

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  // Derived stats
  const pendingActivities = activities.filter((a) => !a.completedAt);
  const overdueActivities = pendingActivities.filter((a) => new Date(a.scheduledAt) < new Date());

  // Filtered activities
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClient = clientFilter === 'all' || activity.clientId === clientFilter;

      const matchesDate =
        (!dateRange.from || new Date(activity.scheduledAt) >= new Date(dateRange.from)) &&
        (!dateRange.to || new Date(activity.scheduledAt) <= new Date(dateRange.to));

      const matchesType = typeFilters.length === 0 || typeFilters.includes(activity.type);

      const isOverdue = !activity.completedAt && new Date(activity.scheduledAt) < new Date();
      const isPending = !activity.completedAt && !isOverdue;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && isPending) ||
        (statusFilter === 'completed' && !!activity.completedAt) ||
        (statusFilter === 'overdue' && isOverdue);

      return matchesSearch && matchesClient && matchesDate && matchesType && matchesStatus;
    });
  }, [activities, searchQuery, statusFilter, typeFilters, clientFilter, dateRange]);

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  useEffect(() => setCurrentPage(1), [searchQuery, statusFilter, typeFilters]);


const fetchTasks = async () => {
  try {
    const res = await TaskAPI.getTasks();
    // setActivities(res.data ?? res.data);
  } catch {
    toast({
      title: "Failed to load activities",
      variant: "destructive",
    });
  }
};

useEffect(() => {
  fetchTasks();
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
    type: "search-select" as const,
    label: "Division",
    value: divisionFilter,
    onChange: setDivisionFilter,
    options: [
      { label: "All", value: "all" },
      ...divisions.map((d) => ({
        label: d,
        value: d, // ✅ string
      })),
    ],
  },

  // -------- SUPERVISOR (NUMBER) --------
  {
    type: "search-select" as const,
    label: "Supervisor",
    value: supervisorFilter,
    onChange: setSupervisorFilter,
    options: [
      { label: "All", value: "all" },
      ...supervisors.map((s, index) => ({
        label: s,
        value: index + 1, // ✅ number ID
      })),
    ],
  },

  // -------- KAM (NUMBER) --------
  {
    type: "search-select" as const,
    label: "KAM",
    value: kamFilter,
    onChange: setKamFilter,
    options: [
      { label: "All", value: "all" },
      ...kams.map((k) => ({
        label: k.name,
        value: k.id, // ✅ number
      })),
    ],
  },

  // -------- ACTIVITY TYPE (NUMBER[]) --------
  {
    type: "multi-select" as const,
    label: "Activity Type",
    value: typeFilters,
    onChange: setTypeFilters,
    options: activityTypeOptions.map((o) => ({
      label: o.label,
      value: o.value, // ✅ number
    })),
  },

  // -------- CLIENT (NUMBER) --------
  {
    type: "search-select" as const,
    label: "Client",
    value: clientFilter,
    onChange: setClientFilter,
    options: [
      { label: "All", value: "all" },
      ...clients.map((c) => ({
        label: c.name,
        value: c.id, // ✅ number
      })),
    ],
  },

  // -------- DATE RANGE --------
  {
    type: "date-range" as const,
    label: "Date Range",
    value: dateRange,
    onChange: setDateRange,
  },
];


console.log('dddddd',activities);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Activities</h1>
          <p className="text-muted-foreground">Manage meetings, calls, and tasks</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <KpiCard
          title="Pending Activities"
          icon={<ListTodo className="h-5 w-5 text-amber-600" />}
          iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
          value={pendingActivities.length}
        />

        <KpiCard
          title="Overdue Activities"
          icon={<Clock className="h-5 w-5 text-rose-600" />}
          iconBg="bg-gradient-to-br from-rose-500/20 to-rose-500/5"
          value={overdueActivities.length}
        />
      </div>

      {/* STATUS + SEARCH + FILTERS */}
      {/* STATUS + SEARCH + FILTERS + NEW ACTIVITY */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Buttons */}
        <div className="flex gap-2 mb-2 lg:mb-0">
          {['all', 'upcoming', 'overdue', 'completed', 'cancelled'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        {/* Search + Filter + New Activity */}
        <div className="flex items-center gap-2 flex-1 lg:flex-none">
          {/* Search */}
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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

      {/* Filter Drawer */}
      {/* <FilterDrawer<string>
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Activities"
        filters={[
          {
            type: 'multi-select',
            label: 'Activity Type',
            value: typeFilters,
            onChange: (v) => setTypeFilters(v as ActivityType[]),
            options: activityTypeOptions,
          },
          {
            type: 'search-select',
            label: 'Client',
            value: clientFilter,
            onChange: setClientFilter,
            options: [{ label: 'All Clients', value: 'all' }, ...clientOptions],
          },
          {
            type: 'date-range',
            label: 'Date Range',
            value: dateRange,
            onChange: setDateRange,
          },
        ]}
        onReset={() => {
          setTypeFilters([]);
          setClientFilter('all');
          setDateRange({});
        }}
        onApply={() => setIsFilterDrawerOpen(false)}
      /> */}

      {/* FILTER DRAWER */}
      <FilterDrawer
        open={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filter Activities"
        filters={filters}
        onReset={() => {
          setDivisionFilter("all");
          setSupervisorFilter("all");
          setKamFilter("all");
          setTypeFilters([]);
          setClientFilter("all");
          setDateRange({});
        }}
        onApply={() => setIsFilterDrawerOpen(false)}
      />

      {/* ACTIVITY LIST */}
      <ActivityList
        activities={paginatedActivities}
        clients={clients}
        onEdit={(a) => {
          setEditingActivity(a);
          setIsModalOpen(true);
        }}
        onComplete={(id, outcome) => {
          setActivities((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, completedAt: new Date().toISOString(), outcome } : a
            )
          );
        }}
        onAddActivity={() => setIsModalOpen(true)}
        showClientInfo
      />

      {/* PAGINATION */}
      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* MODAL */}
      <ActivityModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingActivity(null);
        }}
        editingActivity={editingActivity}
        // onSave={(data) => {
        //   if (editingActivity) {
        //     setActivities((prev) =>
        //       prev.map((a) => (a.id === editingActivity.id ? { ...data, id: a.id } : a))
        //     );
        //   } else {
        //     setActivities((prev) => [...prev, { ...data, id: `act-${Date.now()}` }]);
        //   }
        //   setIsModalOpen(false);
        // }}
        onSave={async (payload) => {
    try {
      await TaskAPI.createTask(payload);
      toast({ title: "Activity created successfully" });
      setIsModalOpen(false);
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Failed to create activity",
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    }
  }}


        clients={clients}
        activityTypes={activityTypeOptions}
        userId={1}
      />
    </div>
  );
}
