
// ActivitiesPage.tsx
"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityModal } from "@/components/activities/ActivityModal";
import { FilterDrawer } from "@/components/filters/ActivityFilterDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityList } from "@/components/activities/ActivityList";
import { KpiCard } from "@/components/common/KpiCard";
import { Plus, Filter, Search, ListTodo, Clock } from "lucide-react";
import { AppPagination } from "@/components/common/AppPagination";
import { useToast } from "@/hooks/use-toast";
import {
  Client,
  initialActivities,
  initialClients,
  initialKAMs,
  type Activity,
  type ActivityType,
} from "@/data/mockData";

const ITEMS_PER_PAGE = 10;

const activityTypeOptions = [
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
  const [kams] = useState(initialKAMs);

  // ---------------- MODALS ----------------
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // ---------------- FILTER STATES ----------------
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("all");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
  const [divisionFilter, setDivisionFilter] = useState("all");
  const [supervisorFilter, setSupervisorFilter] = useState("all");
  const [kamFilter, setKamFilter] = useState("all");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const clientOptions = clients.map((c) => ({ label: c.name, value: c.id }));

  // ---------------- ROLE CHECK ----------------
  const role = currentUser?.role;
  const isKAM = role === "kam";
  const isSupervisor = role === "supervisor";
  const isManagement = role === "management" || role === "super_admin";

  // ---------------- OPTIONS ----------------
  const divisions = useMemo(
    () => Array.from(new Set(kams.map((k) => k.division))),
    [kams]
  );

  const supervisors = useMemo(
    () =>
      Array.from(
        new Set(kams.map((k) => k.reportingTo).filter(Boolean))
      ),
    [kams]
  );

  // ---------------- FILTERED ACTIVITIES ----------------
  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const kam = kams.find((k) => k.id === a.kamId);
      const matchesSearch =
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClient = clientFilter === "all" || a.clientId === clientFilter;
      const matchesType = typeFilters.length === 0 || typeFilters.includes(a.type);
      const matchesDate =
        (!dateRange.from || new Date(a.scheduledAt) >= new Date(dateRange.from)) &&
        (!dateRange.to || new Date(a.scheduledAt) <= new Date(dateRange.to));

      const isOverdue = !a.completedAt && new Date(a.scheduledAt) < new Date();
      const isPending = !a.completedAt && !isOverdue;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "pending" && isPending) ||
        (statusFilter === "completed" && !!a.completedAt) ||
        (statusFilter === "overdue" && isOverdue);

      // Role-based filters
      if (isSupervisor) {
        if (divisionFilter !== "all" && kam?.division !== divisionFilter) return false;
        if (kamFilter !== "all") return false;
      }

      if (isManagement) {
        if (divisionFilter !== "all" && kam?.division !== divisionFilter) return false;
        if (supervisorFilter !== "all" && kam?.reportingTo !== supervisorFilter)
          return false;
        if (kamFilter !== "all") return false;
      }

      return matchesSearch && matchesClient && matchesType && matchesDate && matchesStatus;
    });
  }, [
    activities,
    searchQuery,
    typeFilters,
    clientFilter,
    dateRange,
    divisionFilter,
    supervisorFilter,
    kamFilter,
    statusFilter,
    role,
    kams,
  ]);

  // ---------------- PAGINATION ----------------
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  useEffect(() => setCurrentPage(1), [
    searchQuery,
    typeFilters,
    clientFilter,
    dateRange,
    divisionFilter,
    supervisorFilter,
    kamFilter,
    statusFilter,
  ]);

  // ---------------- KPI ----------------
  const pendingActivities = activities.filter((a) => !a.completedAt);
  const overdueActivities = pendingActivities.filter(
    (a) => new Date(a.scheduledAt) < new Date()
  );

  // ---------------- FILTER CONFIG ----------------
  const filters = [
    ...(isSupervisor || isManagement
      ? [
          {
            type: "single-select" as const,
            label: "Division",
            value: divisionFilter,
            onChange: setDivisionFilter,
            options: [
              { label: "All Divisions", value: "all" },
              ...divisions.map((d) => ({ label: d, value: d })),
            ],
          },
        ]
      : []),
    ...(isManagement
      ? [
          {
            type: "search-select" as const,
            label: "Supervisor",
            value: supervisorFilter,
            onChange: setSupervisorFilter,
            options: [
              { label: "All Supervisors", value: "all" },
              ...supervisors.map((s) => ({ label: s, value: s })),
            ],
          },
        ]
      : []),
    ...(isSupervisor || isManagement
      ? [
          {
            type: "search-select" as const,
            label: "KAM",
            value: kamFilter,
            onChange: setKamFilter,
            options: [
              { label: "All KAMs", value: "all" },
              ...kams.map((k) => ({ label: k.name, value: k.id })),
            ],
          },
        ]
      : []),
    {
      type: "multi-select" as const,
      label: "Activity Type",
      value: typeFilters,
      onChange: setTypeFilters,
      options: activityTypeOptions,
    },
    {
      type: "search-select" as const,
      label: "Client",
      value: clientFilter,
      onChange: setClientFilter,
      options: [{ label: "All Clients", value: "all" }, ...clientOptions],
    },
    {
      type: "date-range" as const,
      label: "Date Range",
      value: dateRange,
      onChange: setDateRange,
    },
  ];

  // ---------------- HANDLERS ----------------
  const handleCancelActivity = (activityId: string, reason: string) => {
    setActivities((prev) =>
      prev.map((a) =>
        a.id === activityId
          ? { ...a, cancelledAt: new Date().toISOString(), cancelReason: reason }
          : a
      )
    );
    toast({ title: "Activity Cancelled" });
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* KPI CARDS */}
      <div className="grid sm:grid-cols-2 gap-4">
        <KpiCard
          title="Pending Activities"
          icon={<ListTodo className="h-5 w-5 text-amber-600" />}
          value={pendingActivities.length}
        />
        <KpiCard
          title="Overdue Activities"
          icon={<Clock className="h-5 w-5 text-rose-600" />}
          value={overdueActivities.length}
        />
      </div>

      {/* STATUS + SEARCH + FILTER + NEW */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex gap-2 mb-2 lg:mb-0">
          {["all", "pending", "completed", "overdue"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status as typeof statusFilter)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 lg:flex-none">
          <div className="relative flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Button variant="outline" className="flex gap-2" onClick={() => setIsFilterDrawerOpen(true)}>
            <Filter className="h-4 w-4" /> Filters
          </Button>

          <Button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" /> New Activity
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

      {/* ACTIVITY LIST */}
      <ActivityList
        activities={paginatedActivities}
        clients={clients}
        showClientInfo
        onEdit={(a) => {
          setEditingActivity(a);
          setIsModalOpen(true);
        }}
        onComplete={(id, outcome) =>
          setActivities((prev) =>
            prev.map((a) =>
              a.id === id ? { ...a, completedAt: new Date().toISOString(), outcome } : a
            )
          )
        }
        onCancel={handleCancelActivity}
        onAddActivity={() => setIsModalOpen(true)}
      />

      {/* PAGINATION */}
      <AppPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

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

      {/* MODAL */}
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
              prev.map((a) => (a.id === editingActivity.id ? { ...data, id: a.id } : a))
            );
          } else {
            setActivities((prev) => [...prev, { ...data, id: `act-${Date.now()}` }]);
          }
          setIsModalOpen(false);
        }}
        clients={clients}
      />
    </div>
  );
}