import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  initialActivities,
  initialKAMs,
  initialClients,
  initialSales,
  formatCurrency,
  divisions,
  businessEntities,
} from '@/data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// Chart colors for each KAM
const KAM_COLORS = [
  'hsl(217, 91%, 60%)', // blue
  'hsl(142, 76%, 36%)', // green
  'hsl(38, 92%, 50%)',  // amber
  'hsl(280, 65%, 60%)', // purple
  'hsl(330, 80%, 60%)', // pink
];

export default function KAMPerformancePage() {
  const [clients] = useState(initialClients);
  const [activities] = useState(initialActivities);
  const [sales] = useState(initialSales);
  const [selectedKamId, setSelectedKamId] = useState<string | null>(null);
  
  // Filters
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');

  const hasFilters = divisionFilter !== 'all' || entityFilter !== 'all';

  const clearFilters = () => {
    setDivisionFilter('all');
    setEntityFilter('all');
  };

  // Filter KAMs based on division and business entity
  const filteredKams = useMemo(() => {
    return initialKAMs.filter(kam => {
      if (divisionFilter !== 'all' && kam.division !== divisionFilter) return false;
      if (entityFilter !== 'all' && !kam.businessEntities.includes(entityFilter)) return false;
      return true;
    });
  }, [divisionFilter, entityFilter]);

  /* ---------------- DATE HELPERS ---------------- */
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isSameMonth = (dateStr: string, m: number, y: number) => {
    const d = new Date(dateStr);
    return d.getMonth() === m && d.getFullYear() === y;
  };

  // Get last 6 months labels
  const last6Months = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      });
    }
    return months;
  }, [currentMonth, currentYear]);

  // KAMs to display in charts (either selected or all filtered)
  const displayKams = useMemo(() => {
    if (selectedKamId) {
      const selectedKam = filteredKams.find(k => k.id === selectedKamId);
      return selectedKam ? [selectedKam] : filteredKams;
    }
    return filteredKams;
  }, [filteredKams, selectedKamId]);

  /* ---------------- MONTHLY TREND DATA ---------------- */
  const monthlyTrendData = useMemo(() => {
    return last6Months.map(({ month, year, label }) => {
      const monthData: Record<string, string | number> = { month: label };
      
      displayKams.forEach((kam) => {
        const kamSales = sales.filter(s => 
          s.kamId === kam.id && isSameMonth(s.closingDate, month, year)
        );
        const total = kamSales.reduce((sum, s) => sum + s.salesAmount, 0);
        monthData[kam.name] = total;
      });
      
      return monthData;
    });
  }, [displayKams, sales, last6Months]);

  /* ---------------- ACTIVITY TREND DATA ---------------- */
  const activityTrendData = useMemo(() => {
    return last6Months.map(({ month, year, label }) => {
      const monthData: Record<string, string | number> = { month: label };
      
      displayKams.forEach((kam) => {
        const kamActivities = activities.filter(a => {
          const client = clients.find(c => c.id === a.clientId);
          return client && client.assignedKamId === kam.id && isSameMonth(a.scheduledAt, month, year);
        });
        monthData[kam.name] = kamActivities.length;
      });
      
      return monthData;
    });
  }, [displayKams, activities, clients, last6Months]);

  /* ---------------- MONTHLY COMPARISON BAR DATA ---------------- */
  const monthlyComparisonData = useMemo(() => {
    return displayKams.map((kam) => {
      const currentMonthSales = sales
        .filter(s => s.kamId === kam.id && isSameMonth(s.closingDate, currentMonth, currentYear))
        .reduce((sum, s) => sum + s.salesAmount, 0);
      
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const lastMonthSales = sales
        .filter(s => s.kamId === kam.id && isSameMonth(s.closingDate, lastMonthDate.getMonth(), lastMonthDate.getFullYear()))
        .reduce((sum, s) => sum + s.salesAmount, 0);
      
      return {
        name: kam.name.split(' ')[0], // First name only for chart
        fullName: kam.name,
        currentMonth: currentMonthSales,
        lastMonth: lastMonthSales,
        growth: lastMonthSales > 0 ? ((currentMonthSales - lastMonthSales) / lastMonthSales * 100).toFixed(1) : 0,
      };
    });
  }, [displayKams, sales, currentMonth, currentYear]);

  /* ---------------- SORTED KAM PERFORMANCE DATA ---------------- */
  const kamPerformanceData = useMemo(() => {
    return filteredKams.map((kam) => {
      const kamSales = sales.filter(s => s.kamId === kam.id);
      const kamCurrentMonthSales = kamSales.filter(s => isSameMonth(s.closingDate, currentMonth, currentYear));
      const totalSales = kamCurrentMonthSales.reduce((sum, s) => sum + s.salesAmount, 0);
      const kamActivities = activities.filter(a => {
        const client = clients.find(c => c.id === a.clientId);
        return client && client.assignedKamId === kam.id;
      });
      const activityCount = kamActivities.filter(a => isSameMonth(a.scheduledAt, currentMonth, currentYear)).length;

      return {
        ...kam,
        totalSales,
        dealCount: kamCurrentMonthSales.length,
        activityCount,
      };
    }).sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredKams, sales, activities, clients, currentMonth, currentYear]);

  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => formatCurrency(value);

  const selectedKam = selectedKamId ? filteredKams.find(k => k.id === selectedKamId) : null;

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">KAM Performance</h1>
          <p className="text-muted-foreground">Track and compare KAM performance rankings</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedKam && (
            <Badge variant="secondary" className="gap-2 py-1.5 px-3 text-sm">
              Showing: {selectedKam.name}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => setSelectedKamId(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {/* Filter Popover */}
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

                {/* Division Filter */}
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

                {/* Business Entity Filter */}
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
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KAM PERFORMANCE RANKINGS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            KAM Performance Rankings (Current Month)
            <span className="text-xs font-normal text-muted-foreground ml-2">Click a KAM to filter charts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {kamPerformanceData.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No KAMs found matching the selected filters</p>
          ) : (
            <div className="space-y-4">
              {kamPerformanceData.map((kam, index) => (
                <div 
                  key={kam.id} 
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedKamId === kam.id ? 'ring-2 ring-primary bg-muted/30' : ''
                  }`}
                  onClick={() => setSelectedKamId(selectedKamId === kam.id ? null : kam.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                      index === 1 ? 'bg-gray-400/20 text-gray-600' :
                      index === 2 ? 'bg-orange-500/20 text-orange-600' :
                      'bg-primary/10 text-primary'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{kam.name}</p>
                      <p className="text-sm text-muted-foreground">{kam.division}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(kam.totalSales)}</p>
                      <p className="text-xs text-muted-foreground">{kam.dealCount} deals</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{kam.activityCount}</p>
                      <p className="text-xs text-muted-foreground">activities</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TREND CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Revenue Trend (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis 
                    className="text-xs" 
                    tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatTooltipValue(value), '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  {displayKams.map((kam, index) => (
                    <Line
                      key={kam.id}
                      type="monotone"
                      dataKey={kam.name}
                      stroke={KAM_COLORS[index % KAM_COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Month-over-Month Comparison Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Current vs Last Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis 
                    className="text-xs" 
                    tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatTooltipValue(value), '']}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="lastMonth" name="Last Month" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentMonth" name="Current Month" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Activity Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {displayKams.map((kam, index) => (
                  <Line
                    key={kam.id}
                    type="monotone"
                    dataKey={kam.name}
                    stroke={KAM_COLORS[index % KAM_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
