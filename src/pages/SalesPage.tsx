import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Filter, Plus, DollarSign, TrendingUp, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

import {
  initialKAMs,
  initialClients,
  initialSales,
  businessEntities,
  formatCurrency,
  systemUsers,
  type Sale,
  type Client,
  type KAM,
} from "@/data/mockData";

import { SaleModal } from "@/components/sales/SaleModal";
import { SaleList } from "@/components/sales/SaleList";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function SalesPage() {
  const { currentUser } = useAuth();

  // States
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [kams] = useState<KAM[]>(initialKAMs);
  const [clients] = useState<Client[]>(initialClients);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // Filters
  const [supervisorFilter, setSupervisorFilter] = useState<string>("all");
  const [kamFilter, setKamFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [businessFilter, setBusinessFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<{ from?: string; to?: string }>({});

  /* ---------------- ROLE BASED FILTERING ---------------- */
  const isAdminOrSupervisor =
    currentUser?.role === "supervisor" ||
    currentUser?.role === "boss" ||
    currentUser?.role === "super_admin";

  const isManagement = currentUser?.role === "boss" || currentUser?.role === "super_admin";

  const myKam = kams.find((k) => k.userId === currentUser?.id);

  // Get supervisors from systemUsers
  const supervisors = systemUsers.filter(u => u.role === 'supervisor');

  // Get KAMs under a supervisor
  const getKamsUnderSupervisor = (supervisorName: string) => {
    return kams.filter(k => k.reportingTo === supervisorName);
  };

  // Filtered KAMs based on supervisor filter
  const filteredKams = useMemo(() => {
    if (supervisorFilter === 'all') return kams;
    const supervisor = supervisors.find(s => s.id === supervisorFilter);
    if (!supervisor) return kams;
    return getKamsUnderSupervisor(supervisor.name);
  }, [kams, supervisorFilter, supervisors]);

  const visibleSales = useMemo(() => {
    let filtered = sales;

    // KAM only sees their own sales
    if (!isAdminOrSupervisor) {
      const myKamId = myKam?.id;
      filtered = filtered.filter((s) => s.kamId === myKamId);
    }

    // Filter by supervisor - get KAMs under this supervisor
    if (supervisorFilter !== 'all') {
      const supervisor = supervisors.find(s => s.id === supervisorFilter);
      if (supervisor) {
        const supervisorKams = getKamsUnderSupervisor(supervisor.name);
        const supervisorKamIds = supervisorKams.map(k => k.id);
        filtered = filtered.filter((s) => supervisorKamIds.includes(s.kamId));
      }
    }

    // Apply other filters
    filtered = filtered.filter((s) => {
      if (kamFilter !== "all" && s.kamId !== kamFilter) return false;
      if (clientFilter !== "all" && s.clientId !== clientFilter) return false;
      if (businessFilter !== "all" && s.businessEntityId !== businessFilter) return false;

      const saleDate = new Date(s.closingDate);
      if (dateRangeFilter.from && saleDate < new Date(dateRangeFilter.from)) return false;
      if (dateRangeFilter.to && saleDate > new Date(dateRangeFilter.to)) return false;

      return true;
    });

    return filtered;
  }, [sales, isAdminOrSupervisor, myKam, supervisorFilter, kamFilter, clientFilter, businessFilter, dateRangeFilter, supervisors]);

  /* ---------------- METRICS ---------------- */
  const metrics = useMemo(() => {
    const totalSales = visibleSales.reduce((sum, s) => sum + s.salesAmount, 0);
    const totalDeals = visibleSales.length;
  
    return { totalSales, totalDeals };
  }, [visibleSales]);

  /* ---------------- CHART DATA ---------------- */
  const monthlyChartData = useMemo(() => {
    const monthly: Record<string, number> = {};

    visibleSales.forEach((sale) => {
      const month = new Date(sale.closingDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthly[month] = (monthly[month] || 0) + sale.salesAmount;
    });

    return Object.entries(monthly)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [visibleSales]);

  const entityChartData = useMemo(() => {
    const byEntity: Record<string, number> = {};

    visibleSales.forEach((sale) => {
      byEntity[sale.businessEntityName] = (byEntity[sale.businessEntityName] || 0) + sale.salesAmount;
    });

    return Object.entries(byEntity).map(([name, value]) => ({ name, value }));
  }, [visibleSales]);

  /* ---------------- HANDLERS ---------------- */
  const handleCreateSale = (saleData: Omit<Sale, "id">) => {
    const newSale: Sale = { ...saleData, id: `sale-${Date.now()}` };
    setSales((prev) => [...prev, newSale]);
    toast({ title: "Sale Recorded", description: "New sale has been recorded successfully." });
  };

  const hasFilters =
    supervisorFilter !== "all" ||
    kamFilter !== "all" ||
    clientFilter !== "all" ||
    businessFilter !== "all" ||
    dateRangeFilter.from ||
    dateRangeFilter.to;

  const clearFilters = () => {
    setSupervisorFilter("all");
    setKamFilter("all");
    setClientFilter("all");
    setBusinessFilter("all");
    setDateRangeFilter({});
  };

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Achievements
          </h1>
          <p className="text-muted-foreground">
            {isAdminOrSupervisor ? "View sales performance across all KAMs" : "Track your sales performance"}
          </p>
        </div>
        <Button onClick={() => setIsSaleModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Record Achievement
        </Button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-xl font-bold">{formatCurrency(metrics.totalSales)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deals</p>
                <p className="text-xl font-bold">{metrics.totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} labelClassName="font-medium" />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sales by Business Entity</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {entityChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {entityChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No sales data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FILTERS */}
      <div className="flex items-center justify-between">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {hasFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-72 p-4" align="start">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Supervisor filter for management */}
              {isManagement && (
                <div className="space-y-2">
                  <Label>Supervisor</Label>
                  <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Supervisors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Supervisors</SelectItem>
                      {supervisors.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* KAM filter only for supervisor/admin */}
              {isAdminOrSupervisor && (
                <div className="space-y-2">
                  <Label>KAM</Label>
                  <Select value={kamFilter} onValueChange={setKamFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All KAMs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All KAMs</SelectItem>
                      {filteredKams.map((k) => (
                        <SelectItem key={k.id} value={k.id}>
                          {k.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Business Entity */}
              <div className="space-y-2">
                <Label>Business Entity</Label>
                <Select value={businessFilter} onValueChange={setBusinessFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {businessEntities.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
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
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateRangeFilter.from || ""}
                  onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, from: e.target.value })}
                />
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={dateRangeFilter.to || ""}
                  onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, to: e.target.value })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* SALES LIST */}
      <SaleList sales={visibleSales} clients={clients} kams={kams} />

      {/* SALE MODAL */}
      <SaleModal
        open={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSave={handleCreateSale}
        clients={clients}
        kams={kams}
        currentUser={currentUser}
      />
    </div>
  );
}
