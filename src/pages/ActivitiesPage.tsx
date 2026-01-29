// import { useState, useMemo, useEffect, useRef } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ActivityModal } from '@/components/activities/ActivityModal';
// import { ActivityNotesModal } from '@/components/activities/ActivityNotesModal';
// import { ActivityDetailsSheet } from '@/components/activities/ActivityDetailsSheet';
// import { FilterDrawer } from '@/components/filters/ActivityFilterDrawer';
// import { useAuth } from '@/contexts/AuthContext';
// import { Card, CardContent } from '@/components/ui/card';
// import { ActivityList } from '@/components/activities/ActivityList';
// import { KpiCard } from '@/components/common/KpiCard';
// import { Plus, Filter, Search, ListTodo, Clock } from 'lucide-react';
// import { useToast } from '@/hooks/use-toast';
// import {
//   Client,
//   initialActivities,
//   initialClients,
//   type Activity,
//   type ActivityType,
// } from '@/data/mockData';
// import { AppPagination } from '@/components/common/AppPagination';
// import { ActivityTypeAPI, TaskAPI } from '@/api';
// import { PrismAPI } from '@/api';
// import { getUserInfo } from '@/utility/utility';

// const ITEMS_PER_PAGE = 10;

// export default function ActivitiesPage() {
//   const { currentUser } = useAuth();
//   const user = getUserInfo();
//   const { toast } = useToast();
//   const [activityTypeOptions, setActivityTypeOptions] = useState<
//     { value: number; label: string }[]
//   >([]);

//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [noteActivity, setNoteActivity] = useState<Activity | null>(null);
//   const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);

//   const [activitySummary, setActivitySummary] = useState<any>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   const [clients] = useState<Client[]>(initialClients);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

//   // ---------------- FILTER STATES ----------------
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [supervisorFilter, setSupervisorFilter] = useState('all');
//   const [kamFilter, setKamFilter] = useState('all');

//   // ---------------- ROLE CHECK ----------------
//   const role = currentUser?.role;

//   const isKAM = role === 'kam';
//   const isSupervisor = role === 'supervisor';
//   const isManagement = role === 'boss' || role === 'super_admin';

//   // ---------------- OPTIONS ----------------
//   const kams = [
//     {
//       id: 1,
//       name: 'Ashik Rahman',
//       division: 'Dhaka',
//       reportingTo: 'Supervisor A',
//     },
//     {
//       id: 2,
//       name: 'Tanvir Hasan',
//       division: 'Chattogram',
//       reportingTo: 'Supervisor B',
//     },
//     {
//       id: 3,
//       name: 'Nusrat Jahan',
//       division: 'Dhaka',
//       reportingTo: 'Supervisor A',
//     },
//   ];

//   const divisions = useMemo(() => Array.from(new Set(kams.map((k) => k.division))), [kams]);

//   const supervisors = useMemo(
//     () => Array.from(new Set(kams.map((k) => k.reportingTo).filter(Boolean))),
//     [kams]
//   );

//   // Filters
//   const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
//   const [clientFilter, setClientFilter] = useState<string>('all');
//   const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
//   const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

//   // state
//   const [kamOptions, setKamOptions] = useState<{ value: number; label: string }[]>([]);
//   const [clientOptions, setKamFilterOptions] = useState<{ value: number; label: string }[]>([]);
//   const [supervisorOptions, setSupervisorOptions] = useState<{ value: number; label: string }[]>(
//     []
//   );
//   const [divisionOptions, setDivisionOptions] = useState<{ value: number; label: string }[]>([]);

//   const fetchTasks = async (page = 1) => {
//     try {
//       const res = await TaskAPI.getTasks({
//         page,
//         per_page: ITEMS_PER_PAGE,
//         kam_id: getUserInfo()?.default_kam_id || undefined,
//         search: searchQuery || undefined,
//         status: statusFilter !== 'all' ? statusFilter : undefined,
//       });

//       setActivities(res.data);
//       setCurrentPage(res.meta.current_page);
//       setTotalPages(res.meta.last_page);
//     } catch (error) {
//       console.log(error);
//       toast({
//         title: 'Failed to load activities',
//         variant: 'destructive',
//       });
//     }
//   };

//   useEffect(() => {
//     fetchTasks(1);
//   }, [searchQuery, statusFilter]);

//   const fetchKams = async () => {
//     try {
//       const res = await PrismAPI.getKams();
//       const options = (res.data || []).map((item: any) => ({
//         value: item.kam_id,
//         label: item.kam_name,
//       }));
//       setKamOptions(options);
//     } catch {
//       toast({
//         title: 'Failed to load activities',
//         variant: 'destructive',
//       });
//     }
//   };

//   const fetchClients = async (id) => {
//     try {
//       const res = await PrismAPI.getKamWiseClients(id);
//       setClientOptions(res.data ?? res.data);
//     } catch {
//       toast({
//         title: 'Failed to load activities',
//         variant: 'destructive',
//       });
//     }
//   };
//   const fetchSummary = async (id) => {
//     try {
//       const res = await TaskAPI.getSummary(id);
//       setActivitySummary(res.data);
//     } catch {
//       toast({
//         title: 'Failed to load activities Summary',
//         variant: 'destructive',
//       });
//     }
//   };
//   useEffect(() => {
//     fetchKams();
//     fetchSummary(user?.default_kam_id);
//   }, []);

//   useEffect(() => {
//     const fetchActivityTypes = async () => {
//       try {
//         const res = await ActivityTypeAPI.getActivityTypes();

//         const options = (res.data || []).map((item: any) => ({
//           value: item.id,
//           label: item.activity_type_name,
//         }));
//         setActivityTypeOptions(options);
//       } catch (error) {
//         toast({
//           title: 'Failed to load activity types',
//           variant: 'destructive',
//         });
//       }
//     };

//     fetchActivityTypes();
//   }, []);

//   // ---------------- FILTER CONFIG ----------------
//   const filters = [
//     // -------- DIVISION (STRING) --------
//     {
//       type: 'search-select' as const,
//       label: 'Division',
//       value: divisionFilter,
//       onChange: setDivisionFilter,
//       options: [
//         { label: 'All', value: 'all' },
//         ...divisions.map((d) => ({
//           label: d,
//           value: d, // ✅ string
//         })),
//       ],
//     },

//     // -------- SUPERVISOR (NUMBER) --------
//     {
//       type: 'search-select' as const,
//       label: 'Supervisor',
//       value: supervisorFilter,
//       onChange: setSupervisorFilter,
//       options: [
//         { label: 'All', value: 'all' },
//         ...supervisors.map((s, index) => ({
//           label: s,
//           value: index + 1, // ✅ number ID
//         })),
//       ],
//     },

//     // -------- KAM (NUMBER) --------
//     {
//       type: 'search-select' as const,
//       label: 'KAM',
//       value: kamFilter,
//       onChange: setKamFilter,
//       options: [
//         { label: 'All', value: 'all' },
//         ...kams.map((k) => ({
//           label: k.name,
//           value: k.id, // ✅ number
//         })),
//       ],
//     },

//     // -------- ACTIVITY TYPE (NUMBER[]) --------
//     {
//       type: 'multi-select' as const,
//       label: 'Activity Type',
//       value: typeFilters,
//       onChange: setTypeFilters,
//       options: activityTypeOptions.map((o) => ({
//         label: o.label,
//         value: o.value, // ✅ number
//       })),
//     },

//     // -------- CLIENT (NUMBER) --------
//     {
//       type: 'search-select' as const,
//       label: 'Client',
//       value: clientFilter,
//       onChange: setClientFilter,
//       options: [
//         { label: 'All', value: 'all' },
//         ...clients.map((c) => ({
//           label: c.name,
//           value: c.id, // ✅ number
//         })),
//       ],
//     },

//     // -------- DATE RANGE --------
//     {
//       type: 'date-range' as const,
//       label: 'Date Range',
//       value: dateRange,
//       onChange: setDateRange,
//     },
//   ];

//   const handleAddNote = async (note: { content: string }) => {
//     if (!noteActivity) return;

//     const payload = {
//       task_id: noteActivity.id,
//       note: note.content,
//     };

//     try {
//       await TaskAPI.addNote(payload);

//       toast({ title: 'Note added successfully' });

//       setNoteActivity(null);
//       fetchTasks(currentPage);
//     } catch (error) {
//       toast({
//         title: 'Failed to add note',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleUpdateActivityStatus = async (payload) => {
//     try {
//       const res = await TaskAPI.updateStatus(payload);

//       toast({
//         title: res.data?.message || 'Task status updated successfully',
//       });

//       fetchTasks(currentPage);
//     } catch (error) {
//       const errorMessage =
//         error?.response?.data?.message || error || 'Failed to update task status';

//       toast({
//         title: errorMessage,
//         variant: 'destructive',
//       });
//     }
//   };

//   // console.log('dddddd', activities);
//   // console.log('kamOptions', kamOptions);
//   // console.log(getUserInfo()?.id);
//   // console.log('userkam', user?.default_kam_id);
//   console.log('kamOptions in page', kamOptions);

//   return (
//     <div className="space-y-6 p-6 lg:p-8">
//       {/* HEADER */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">Tasks</h1>
//           <p className="text-muted-foreground">Manage meetings, calls, and tasks</p>
//         </div>
//       </div>

//       <div className="grid sm:grid-cols-2 gap-4">
//         <KpiCard
//           title="Upcoming Activities"
//           icon={<ListTodo className="h-5 w-5 text-amber-600" />}
//           iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
//           value={activitySummary?.upcoming}
//         />

//         <KpiCard
//           title="Overdue Activities"
//           icon={<Clock className="h-5 w-5 text-rose-600" />}
//           iconBg="bg-gradient-to-br from-rose-500/20 to-rose-500/5"
//           value={activitySummary?.overdue}
//         />
//       </div>

//       {/* STATUS + SEARCH + FILTERS */}
//       {/* STATUS + SEARCH + FILTERS + NEW ACTIVITY */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
//         {/* Status Buttons */}
//         <div className="flex gap-2 mb-2 lg:mb-0">
//           {['all', 'upcoming', 'overdue', 'completed', 'cancelled'].map((status) => (
//             <Button
//               key={status}
//               size="sm"
//               variant={statusFilter === status ? 'default' : 'outline'}
//               onClick={() => setStatusFilter(status)}
//             >
//               {status.charAt(0).toUpperCase() + status.slice(1)}
//             </Button>
//           ))}
//         </div>

//         {/* Search + Filter + New Activity */}
//         <div className="flex items-center gap-2 flex-1 lg:flex-none">
//           {/* Search */}
//           <div className="relative flex-1 lg:flex-none">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               className="pl-9"
//               placeholder="Search activities..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>

//           {/* Filter */}
//           <Button
//             variant="outline"
//             className="flex gap-2"
//             onClick={() => setIsFilterDrawerOpen(true)}
//           >
//             <Filter className="h-4 w-4" />
//             Filters
//           </Button>

//           {/* New Activity */}
//           <Button onClick={() => setIsModalOpen(true)} className="flex gap-2">
//             <Plus className="h-4 w-4" />
//             New Activity
//           </Button>
//         </div>
//       </div>

//       {/* Active Type Filters */}
//       {typeFilters.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {typeFilters.map((t) => (
//             <span key={t} className="rounded-md bg-muted px-2 py-1 text-xs">
//               {activityTypeOptions.find((o) => o.value === t)?.label}
//             </span>
//           ))}
//         </div>
//       )}

//       {/* Filter Drawer */}
//       {/* <FilterDrawer<string>
//         open={isFilterDrawerOpen}
//         onClose={() => setIsFilterDrawerOpen(false)}
//         title="Filter Activities"
//         filters={[
//           {
//             type: 'multi-select',
//             label: 'Activity Type',
//             value: typeFilters,
//             onChange: (v) => setTypeFilters(v as ActivityType[]),
//             options: activityTypeOptions,
//           },
//           {
//             type: 'search-select',
//             label: 'Client',
//             value: clientFilter,
//             onChange: setClientFilter,
//             options: [{ label: 'All Clients', value: 'all' }, ...clientOptions],
//           },
//           {
//             type: 'date-range',
//             label: 'Date Range',
//             value: dateRange,
//             onChange: setDateRange,
//           },
//         ]}
//         onReset={() => {
//           setTypeFilters([]);
//           setClientFilter('all');
//           setDateRange({});
//         }}
//         onApply={() => setIsFilterDrawerOpen(false)}
//       /> */}

//       {/* FILTER DRAWER */}
//       {/* <FilterDrawer
//         open={isFilterDrawerOpen}
//         onClose={() => setIsFilterDrawerOpen(false)}
//         title="Filter Activities"
//         filters={filters}
//         onReset={() => {
//           setDivisionFilter('all');
//           setSupervisorFilter('all');
//           setKamFilter('all');
//           setTypeFilters([]);
//           setClientFilter('all');
//           setDateRange({});
//         }}
//         onApply={() => setIsFilterDrawerOpen(false)}
//       /> */}

//       {/* ACTIVITY LIST */}
//       <ActivityList
//         activities={activities}
//         onEdit={(a) => {
//           setEditingActivity(a);
//           setIsModalOpen(true);
//         }}
//         onComplete={handleUpdateActivityStatus}
//         onAddActivity={() => setIsModalOpen(true)}
//         onViewActivity={(activity) => {
//           setViewingActivity(activity);
//         }}
//         onAddNote={(activity) => {
//           setNoteActivity(activity); // ✅ THIS opens modal
//         }}
//         showClientInfo
//       />

//       {/* PAGINATION */}

//       <AppPagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={(page) => fetchTasks(page)}
//       />

//       {/* MODAL */}
//       <ActivityModal
//         open={isModalOpen}
//         onClose={() => {
//           setIsModalOpen(false);
//           setEditingActivity(null);
//         }}
//         editingActivity={editingActivity}
//         onSave={async (payload) => {
//           try {
//             await TaskAPI.createTask(payload);
//             toast({ title: 'Activity created successfully' });
//             setIsModalOpen(false);
//             fetchTasks();
//           } catch (error: any) {
//             toast({
//               title: 'Failed to create activity',
//               description: error?.response?.data?.message,
//               variant: 'destructive',
//             });
//           }
//         }}
//         kams={kamOptions}
//         clients={clients}
//         activityTypes={activityTypeOptions}
//         userId={getUserInfo()?.id}
//       />

//       <ActivityDetailsSheet
//         open={!!viewingActivity}
//         onClose={() => setViewingActivity(null)}
//         activity={viewingActivity}
//       />

//       <ActivityNotesModal
//         open={!!noteActivity}
//         onClose={() => setNoteActivity(null)}
//         onSave={handleAddNote}
//       />
//     </div>
//   );
// }






import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ActivityModal } from '@/components/activities/ActivityModal';
import { ActivityNotesModal } from '@/components/activities/ActivityNotesModal';
import { ActivityDetailsSheet } from '@/components/activities/ActivityDetailsSheet';
import { FilterDrawer } from '@/components/filters/ActivityFilterDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ActivityList } from '@/components/activities/ActivityList';
import { KpiCard } from '@/components/common/KpiCard';
import { Plus, Filter, Search, ListTodo, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Client,
  initialClients,
  type Activity,
  type ActivityType,
} from '@/data/mockData';
import { AppPagination } from '@/components/common/AppPagination';
import { ActivityTypeAPI, TaskAPI } from '@/api';
import { PrismAPI } from '@/api';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

const ITEMS_PER_PAGE = 10;

export default function ActivitiesPage() {
  const { currentUser } = useAuth();
  const user = getUserInfo();
  const { toast } = useToast();
  
  // Activity Type Options
  const [activityTypeOptions, setActivityTypeOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [isLoadingActivityTypes, setIsLoadingActivityTypes] = useState(false);

  // KAM Options
  const [kamOptions, setKamOptions] = useState<{ value: number; label: string }[]>([]);
  const [isLoadingKams, setIsLoadingKams] = useState(false);

  // Activities data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [noteActivity, setNoteActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [activitySummary, setActivitySummary] = useState<any>([]);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [clients] = useState<Client[]>(initialClients);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // ---------------- FILTER STATES ----------------
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [kamFilter, setKamFilter] = useState('all');
  const [typeFilters, setTypeFilters] = useState<ActivityType[]>([]);
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Other options
  const [clientOptions, setKamFilterOptions] = useState<{ value: number; label: string }[]>([]);
  const [supervisorOptions, setSupervisorOptions] = useState<{ value: number; label: string }[]>([]);
  const [divisionOptions, setDivisionOptions] = useState<{ value: number; label: string }[]>([]);

  const lastPayloadRef = useRef<any>(null);

  // ---------------- ROLE CHECK ----------------
  const role = currentUser?.role;
<<<<<<< HEAD

  const supervisorIds = user?.supervisor_ids || [];
  const isAdmin = isSuperAdmin() || isManagement();
  const isSup = isSupervisor();
  const isKamUser = isKAM();
=======
  const isKAM = role === 'kam';
  const isSupervisor = role === 'supervisor';
  const isManagement = role === 'boss' || role === 'super_admin';
>>>>>>> d8002bc (activity edit)

  // ---------------- MOCK OPTIONS FOR FILTERS (temporary) ----------------
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

  // ---------------- API CALLS ----------------
  const fetchTasks = async (payload) => {
    lastPayloadRef.current = payload;
    try {
      const res = await TaskAPI.getTasks(payload);
      setActivities(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast({
        title: 'Failed to load activities',
        variant: 'destructive',
      });
    }
  };

  const fetchFilteredTasks = async (payload) => {
    try {
      const res = await TaskAPI.getTasks(payload);
      setActivities(res.data);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
    } catch (error) {
      console.error('Failed to load filtered tasks:', error);
      toast({
        title: 'Failed to load activities',
        variant: 'destructive',
      });
    }
  };

  const fetchKams = async () => {
    setIsLoadingKams(true);
    try {
      console.log('Fetching KAMs from API...');
      const res = await PrismAPI.getKams();
      console.log('KAMs API response:', res);
      
      if (res.data && Array.isArray(res.data)) {
        const options = res.data.map((item: any) => ({
          value: item.kam_id,
          label: item.kam_name,
        }));
        console.log('Processed KAM options:', options);
        setKamOptions(options);
      } else if (res.data && typeof res.data === 'object') {
        // Handle case where data might be an object instead of array
        const dataArray = Object.values(res.data);
        const options = dataArray.map((item: any) => ({
          value: item.kam_id || item.id,
          label: item.kam_name || item.name,
        }));
        console.log('Processed KAM options from object:', options);
        setKamOptions(options);
      } else {
        console.warn('Unexpected KAMs API response format:', res);
        toast({
          title: 'Invalid KAM data format',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load KAMs:', error);
      toast({
        title: 'Failed to load KAMs',
        description: error?.message || 'Please check your connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingKams(false);
    }
  };

<<<<<<< HEAD
=======
  const fetchActivityTypes = async () => {
    setIsLoadingActivityTypes(true);
    try {
      console.log('Fetching Activity Types from API...');
      const res = await ActivityTypeAPI.getActivityTypes();
      console.log('Activity Types API response:', res);

      if (res.data && Array.isArray(res.data)) {
        const options = res.data.map((item: any) => ({
          value: item.id,
          label: item.activity_type_name,
        }));
        console.log('Processed Activity Type options:', options);
        setActivityTypeOptions(options);
      } else if (res.data && typeof res.data === 'object') {
        // Handle case where data might be an object instead of array
        const dataArray = Object.values(res.data);
        const options = dataArray.map((item: any) => ({
          value: item.id,
          label: item.activity_type_name || item.name,
        }));
        console.log('Processed Activity Type options from object:', options);
        setActivityTypeOptions(options);
      } else {
        console.warn('Unexpected Activity Types API response format:', res);
        toast({
          title: 'Invalid Activity Type data format',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to load activity types:', error);
      toast({
        title: 'Failed to load activity types',
        description: error?.message || 'Please check your connection',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingActivityTypes(false);
    }
  };

>>>>>>> d8002bc (activity edit)
  const fetchSummary = async (id) => {
    try {
      const res = await TaskAPI.getSummary(id);
      setActivitySummary(res.data);
    } catch (error) {
      console.error('Failed to load activity summary:', error);
      toast({
        title: 'Failed to load activities Summary',
        variant: 'destructive',
      });
    }
  };

  // ---------------- USE EFFECTS ----------------
  useEffect(() => {
    fetchTasks({
      page: 1,
      per_page: ITEMS_PER_PAGE,
      kam_id: getUserInfo()?.default_kam_id,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    });
  }, [statusFilter]);

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      console.log('Loading initial data...');
      await Promise.all([
        fetchKams(),
        fetchActivityTypes(),
        fetchSummary(user?.default_kam_id)
      ]);
      console.log('Initial data loading completed');
      console.log('KAM options loaded:', kamOptions.length);
      console.log('Activity Type options loaded:', activityTypeOptions.length);
    };

    loadInitialData();
  }, []);

  // Debug effect to track data changes
  useEffect(() => {
    console.log('KAM options updated:', kamOptions);
  }, [kamOptions]);

  useEffect(() => {
    console.log('Activity Type options updated:', activityTypeOptions);
  }, [activityTypeOptions]);

  // ---------------- FILTER CONFIG ----------------
  const filters = [
    {
      type: 'search-select' as const,
      label: 'Division',
      value: divisionFilter,
      onChange: setDivisionFilter,
      options: [
        { label: 'All', value: 'all' },
        ...divisions.map((d) => ({
          label: d,
          value: d,
        })),
      ],
    },
    {
      type: 'search-select' as const,
      label: 'Supervisor',
      value: supervisorFilter,
      onChange: setSupervisorFilter,
      options: [
        { label: 'All', value: 'all' },
        ...supervisors.map((s, index) => ({
          label: s,
          value: index + 1,
        })),
      ],
    },
    {
      type: 'search-select' as const,
      label: 'KAM',
      value: kamFilter,
      onChange: setKamFilter,
      options: [
        { label: 'All', value: 'all' },
        ...kams.map((k) => ({
          label: k.name,
          value: k.id,
        })),
      ],
    },
    {
      type: 'multi-select' as const,
      label: 'Activity Type',
      value: typeFilters,
      onChange: setTypeFilters,
      options: activityTypeOptions.map((o) => ({
        label: o.label,
        value: o.value,
      })),
    },
    {
      type: 'search-select' as const,
      label: 'Client',
      value: clientFilter,
      onChange: setClientFilter,
      options: [
        { label: 'All', value: 'all' },
        ...clients.map((c) => ({
          label: c.name,
          value: c.id,
        })),
      ],
    },
    {
      type: 'date-range' as const,
      label: 'Date Range',
      value: dateRange,
      onChange: setDateRange,
    },
  ];

  // ---------------- HANDLERS ----------------
  const handleEditClick = (activity: Activity) => {
    console.log('Edit clicked:', {
      activity,
      kamOptionsCount: kamOptions.length,
      activityTypeOptionsCount: activityTypeOptions.length,
      kamOptions,
      activityTypeOptions
    });

    if (kamOptions.length === 0) {
      toast({
        title: 'KAM data not loaded',
        description: 'Please wait for KAM data to load or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    if (activityTypeOptions.length === 0) {
      toast({
        title: 'Activity Type data not loaded',
        description: 'Please wait for Activity Type data to load or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  const handleAddActivityClick = () => {
    console.log('Add activity clicked:', {
      kamOptionsCount: kamOptions.length,
      activityTypeOptionsCount: activityTypeOptions.length
    });

    if (kamOptions.length === 0) {
      toast({
        title: 'KAM data not loaded',
        description: 'Please wait for KAM data to load or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    if (activityTypeOptions.length === 0) {
      toast({
        title: 'Activity Type data not loaded',
        description: 'Please wait for Activity Type data to load or refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    setEditingActivity(null);
    setIsModalOpen(true);
  };

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
      console.error('Failed to add note:', error);
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
      const errorMessage = error?.response?.data?.message || error || 'Failed to update task status';
      console.error('Status update error:', error);
      toast({
        title: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage meetings, calls, and tasks</p>
        </div>
        {(isLoadingKams || isLoadingActivityTypes) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading data...
          </div>
        )}
      </div>

      {/* KPI CARDS */}
      <div className="grid sm:grid-cols-2 gap-4">
        <KpiCard
          title="Upcoming Activities"
          icon={<ListTodo className="h-5 w-5 text-amber-600" />}
          iconBg="bg-gradient-to-br from-amber-500/20 to-amber-500/5"
          value={activitySummary?.upcoming || 0}
        />

        <KpiCard
          title="Overdue Activities"
          icon={<Clock className="h-5 w-5 text-rose-600" />}
          iconBg="bg-gradient-to-br from-rose-500/20 to-rose-500/5"
          value={activitySummary?.overdue || 0}
        />
      </div>

      {/* STATUS + SEARCH + FILTERS + NEW ACTIVITY */}
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
          <Button 
            onClick={handleAddActivityClick} 
            className="flex gap-2"
            disabled={isLoadingKams || isLoadingActivityTypes}
          >
            <Plus className="h-4 w-4" />
            New Activity
            {(isLoadingKams || isLoadingActivityTypes) && (
              <span className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-white"></span>
            )}
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

      {/* FILTER DRAWER */}
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
        onApply={(modalFilter) => {
          const payload = {
            page: 1,
            per_page: ITEMS_PER_PAGE,
            kam_id: modalFilter?.kamId ? Number(modalFilter.kamId) : undefined,
            client_id: modalFilter?.clientId ? Number(modalFilter.clientId) : undefined,
            activity_type_id: modalFilter?.activityType ? Number(modalFilter.activityType) : undefined,
            from_date: modalFilter?.dateRange?.from || undefined,
            to_date: modalFilter?.dateRange?.to || undefined,
          };

          fetchFilteredTasks(payload);
          setIsFilterDrawerOpen(false);
        }}
      />

      {/* ACTIVITY LIST */}
      {activities.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-1">No Activities</h3>
            <p className="text-sm text-muted-foreground mb-4">No activities scheduled yet.</p>
            <Button 
              onClick={handleAddActivityClick} 
              size="sm" 
              className="gap-2"
              disabled={isLoadingKams || isLoadingActivityTypes}
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ActivityList
          activities={activities}
          onEdit={handleEditClick}
          onComplete={handleUpdateActivityStatus}
          onAddActivity={handleAddActivityClick}
          onViewActivity={(activity) => {
            setViewingActivity(activity);
          }}
          onAddNote={(activity) => {
            setNoteActivity(activity);
          }}
          showClientInfo
        />
      )}

      {/* PAGINATION */}
      {activities.length > 0 && (
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
      )}

<<<<<<< HEAD
      <AppPagination
        currentPage={currentPage}
        totalPages={totalPages}
        // onPageChange={(page) => fetchTasks(page)}

        onPageChange={(page) =>
          fetchTasks({
            ...lastPayloadRef.current,
            page,
          })
        }
      />

      {/* MODAL */}
      {/* <ActivityModal
=======
      {/* ACTIVITY MODAL */}
      <ActivityModal
>>>>>>> d8002bc (activity edit)
        open={isModalOpen}
        onClose={() => {
          console.log('Modal closing...');
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

      {/* ACTIVITY DETAILS SHEET */}
      <ActivityDetailsSheet
        open={!!viewingActivity}
        onClose={() => setViewingActivity(null)}
        activity={viewingActivity}
      />

      {/* ACTIVITY NOTES MODAL */}
      <ActivityNotesModal
        open={!!noteActivity}
        onClose={() => setNoteActivity(null)}
        onSave={handleAddNote}
      />
    </div>
  );
}