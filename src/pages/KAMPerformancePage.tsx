
// "use client";

// import React, { useState, useEffect, useMemo } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { BarChart3, TrendingUp, X } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { formatCurrency } from '@/data/mockData';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
// import { KamPerformanceApi } from "@/api/kamPerformanceApi";

// const MONTHS_ARRAY = [
//   "January", "February", "March", "April", "May", "June",
//   "July", "August", "September", "October", "November", "December"
// ];

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// // Custom X-axis label component for diagonal text
// const CustomXAxisTick = (props: any) => {
//   const { x, y, payload } = props;
//   return (
//     <g transform={`translate(${x},${y})`}>
//       <foreignObject x={-30} y={0} width={80} height={60}>
//         <div
//           style={{
//             fontSize: '11px',
//             transform: 'rotate(-45deg)',
//             transformOrigin: '0 0',
//             whiteSpace: 'nowrap',
//             overflow: 'hidden',
//             textOverflow: 'ellipsis',
//             color: '#666',
//           }}
//         >
//           {payload.value}
//         </div>
//       </foreignObject>
//     </g>
//   );
// };

// export default function KAMPerformancePage() {
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [kamLoading, setKamLoading] = useState<boolean>(true);
//   const [selectedKamId, setSelectedKamId] = useState<string | null>(null);

//   // Get last month as default
//   const getLastMonthDefaults = () => {
//     const now = new Date();
//     const monthName = MONTHS_ARRAY[now.getMonth()];
//     const year = now.getFullYear().toString();
//     return { monthName, year };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();

//   const [divisionFilter, setDivisionFilter] = useState<string>('all');
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [dateRangeType, setDateRangeType] = useState<'monthly' | 'yearly'>('monthly');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

//   const [startMonth, setStartMonth] = useState(defaultMonth);
//   const [endMonth, setEndMonth] = useState(defaultMonth);
//   const [startYear, setStartYear] = useState(defaultYear);
//   const [endYear, setEndYear] = useState(defaultYear);

//   const hasFilters = divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setKamFilter('all');
//     setClientTypeFilter('All Client');
//     setSelectedKamId(null);
//     setDateRangeType('monthly');
//     setViewMode('monthly');
//     setStartMonth(defaultMonth);
//     setEndMonth(defaultMonth);
//     setStartYear(defaultYear);
//     setEndYear(defaultYear);
//   };

//   // Fetch KAMs from backend
//   useEffect(() => {
//     const fetchKams = async () => {
//       setKamLoading(true);
//       try {
//         const response = await KamPerformanceApi.getKams();
//         const data = response.data?.data || response.data || [];
//         setKams(data);
//       } catch (err) {
//         console.error('Error fetching KAMs:', err);
//         setKams([]);
//       }
//       setKamLoading(false);
//     };

//     fetchKams();
//   }, []);

//   // Fetch data from API
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const startDate = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
//         const endDate = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;

//         const response = await KamPerformanceApi.getKamUsersRevenue({
//           start_date: startDate,
//           end_date: endDate,
//           client_type: clientTypeFilter,
//           search: kamFilter !== 'all' ? kamFilter : undefined,
//           view_mode: viewMode,
//           per_page: 1000,
//         });

//         const data = response.data || response || [];
//         setKamPerformance(data);
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [startMonth, endMonth, startYear, endYear, kamFilter, clientTypeFilter, viewMode]);

//   // Generate periods for table
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'monthly') {
//       let sYear = parseInt(startYear);
//       let eYear = parseInt(endYear);
//       let sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       let eMonth = MONTHS_ARRAY.indexOf(endMonth);

//       let year = sYear;
//       let month = sMonth;

//       while (year < eYear || (year === eYear && month <= eMonth)) {
//         periods.push({
//           month,
//           year,
//           label: `${MONTHS_ARRAY[month]} ${year}`,
//         });

//         month++;
//         if (month > 11) {
//           month = 0;
//           year++;
//         }
//       }
//     } else {
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       for (let y = sYear; y <= eYear; y++) {
//         periods.push({ year: y, label: `${y}` });
//       }
//     }

//     return periods;
//   }, [viewMode, startMonth, endMonth, startYear, endYear]);

//   // Prepare trend data for chart
//   const trendData = useMemo(() => {
//     return tablePeriods.map((period) => {
//       let totalVoucher = 0;
//       let totalSelf = 0;
//       let totalTransferred = 0;

//       kamPerformance.forEach((k) => {
//         let periodKey: string;
        
//         if (viewMode === 'monthly') {
//           periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
//         } else {
//           periodKey = `${k.voucher_year}`;
//         }

//         const match = periodKey === period.label;
//         if (match) {
//           totalVoucher += Number(k.total_voucher_amount || 0);
//           totalSelf += Number(k.self_client_voucher_amount || 0);
//           totalTransferred += Number(k.transferred_client_voucher_amount || 0);
//         }
//       });

//       return {
//         name: period.label,
//         totalVoucher,
//         totalSelf,
//         totalTransferred,
//       };
//     });
//   }, [kamPerformance, tablePeriods, viewMode]);

//   // Get top performers
//   const topPerformers = useMemo(() => {
//     const kamMap: any = {};

//     kamPerformance.forEach((row) => {
//       if (!kamMap[row.current_supervisor]) {
//         kamMap[row.current_supervisor] = 0;
//       }
//       kamMap[row.current_supervisor] += Number(row.total_voucher_amount || 0);
//     });

//     return Object.entries(kamMap)
//       .map(([name, total]: any) => ({ name, total }))
//       .sort((a, b) => b.total - a.total);
//   }, [kamPerformance]);

//   // Generate label for top performers
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === "monthly") {
//       if (startMonth === endMonth && startYear === endYear) {
//         return `${startMonth} ${startYear}`;
//       }
//       return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
//     } else {
//       if (startYear === endYear) {
//         return `${startYear}`;
//       }
//       return `${startYear} – ${endYear}`;
//     }
//   }, [viewMode, startMonth, endMonth, startYear, endYear]);

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed breakdown of client voucher performance
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {hasFilters && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearFilters}
//               className="text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <X className="h-4 w-4 mr-2" /> Reset
//             </Button>
//           )}

//           <KAMFilterDrawer
//             division={divisionFilter}
//             setDivision={setDivisionFilter}
//             kam={kamFilter}
//             setKam={setKamFilter}
//             clientType={clientTypeFilter}
//             setClientType={setClientTypeFilter}
//             kams={kams}
//             dateRange={dateRangeType}
//             setDateRange={setDateRangeType}
//             viewMode={viewMode}
//             setViewMode={setViewMode}
//             startMonth={startMonth}
//             setStartMonth={setStartMonth}
//             endMonth={endMonth}
//             setEndMonth={setEndMonth}
//             startYear={startYear}
//             setStartYear={setStartYear}
//             endYear={endYear}
//             setEndYear={setEndYear}
//             onFilterChange={() => setSelectedKamId(null)}
//           />
//         </div>
//       </div>

//       {/* TABLE */}
//       <KAMPerformanceTable
//         sales={kamPerformance}
//         dateRangeType={viewMode}
//         startMonth={startMonth}
//         endMonth={endMonth}
//         startYear={startYear}
//         endYear={endYear}
//         tablePeriods={tablePeriods}
//         loading={loading}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[480px]">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2">
//               <TrendingUp className="h-4 w-4 text-blue-500" /> Total Revenue Flow
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="pt-6 flex-1">
//             {trendData.length === 0 ? (
//               <div className="h-full flex items-center justify-center text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart 
//                   data={trendData}
//                   margin={{ bottom: trendData.length > 6 ? 60 : 20, left: 0, right: 0, top: 0 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis 
//                     dataKey="name" 
//                     axisLine={false} 
//                     tickLine={false}
//                     tick={trendData.length > 6 ? <CustomXAxisTick /> : undefined}
//                     angle={trendData.length > 6 ? -45 : 0}
//                     height={trendData.length > 6 ? 80 : 30}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend verticalAlign="top" align="right" />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Voucher"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Voucher"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Voucher"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>

//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[480px] overflow-hidden">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-primary" />
//                 <span>Top Performers</span>
//               </div>
//               <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//                 {topPerformerRangeLabel}
//               </span>
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//             {topPerformers.length === 0 ? (
//               <div className="flex items-center justify-center h-full text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {topPerformers.map((kam, idx) => (
//                   <div
//                     key={kam.name}
//                     className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                       selectedKamId === kam.name
//                         ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                         : 'hover:bg-muted/50 border-transparent'
//                     }`}
//                     onClick={() =>
//                       setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
//                     }
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                           idx === 0
//                             ? 'bg-yellow-100 text-yellow-700'
//                             : 'bg-slate-100 text-slate-500'
//                         }`}
//                       >
//                         {idx + 1}
//                       </div>

//                       <div className="truncate">
//                         <p className="text-sm font-semibold text-slate-800 truncate">
//                           {kam.name}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">
//                         {formatCurrency(kam.total)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }








"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
import { formatCurrency } from '@/data/mockData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { KamPerformanceApi } from "@/api/kamPerformanceApi";

const MONTHS_ARRAY = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface KAM {
  kam_id: string | number;
  kam_name: string;
}

// Custom X-axis label component for diagonal text
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="#666"
        fontSize="11px"
        style={{
          transform: 'rotate(-45deg)',
          transformOrigin: '0 0',
          display: 'inline-block',
        }}
      >
        {payload.value}
      </text>
    </g>
  );
};

export default function KAMPerformancePage() {
  const [kamPerformance, setKamPerformance] = useState<any[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [kamLoading, setKamLoading] = useState<boolean>(true);
  const [selectedKamId, setSelectedKamId] = useState<string | null>(null);

  // Get last month as default
  const getLastMonthDefaults = () => {
    const now = new Date();
    const monthName = MONTHS_ARRAY[now.getMonth()];
    const year = now.getFullYear().toString();
    return { monthName, year };
  };

  const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();

  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
  const [dateRangeType, setDateRangeType] = useState<'monthly' | 'yearly'>('monthly');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const [startMonth, setStartMonth] = useState(defaultMonth);
  const [endMonth, setEndMonth] = useState(defaultMonth);
  const [startYear, setStartYear] = useState(defaultYear);
  const [endYear, setEndYear] = useState(defaultYear);

  const hasFilters = divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

  const clearFilters = () => {
    setDivisionFilter('all');
    setKamFilter('all');
    setClientTypeFilter('All Client');
    setSelectedKamId(null);
    setDateRangeType('monthly');
    setViewMode('monthly');
    setStartMonth(defaultMonth);
    setEndMonth(defaultMonth);
    setStartYear(defaultYear);
    setEndYear(defaultYear);
  };

  // Fetch KAMs from backend
  useEffect(() => {
    const fetchKams = async () => {
      setKamLoading(true);
      try {
        const response = await KamPerformanceApi.getKams();
        const data = response.data?.data || response.data || [];
        setKams(data);
      } catch (err) {
        console.error('Error fetching KAMs:', err);
        setKams([]);
      }
      setKamLoading(false);
    };

    fetchKams();
  }, []);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const startDate = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
        const endDate = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;

        const response = await KamPerformanceApi.getKamUsersRevenue({
          start_date: startDate,
          end_date: endDate,
          client_type: clientTypeFilter,
          search: kamFilter !== 'all' ? kamFilter : undefined,
          view_mode: viewMode,
          per_page: 1000,
        });

        const data = response.data || response || [];
        setKamPerformance(data);
      } catch (err) {
        console.error('Error fetching KAM performance:', err);
        setKamPerformance([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [startMonth, endMonth, startYear, endYear, kamFilter, clientTypeFilter, viewMode]);

  // Generate periods for table
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];

    if (viewMode === 'monthly') {
      let sYear = parseInt(startYear);
      let eYear = parseInt(endYear);
      let sMonth = MONTHS_ARRAY.indexOf(startMonth);
      let eMonth = MONTHS_ARRAY.indexOf(endMonth);

      let year = sYear;
      let month = sMonth;

      while (year < eYear || (year === eYear && month <= eMonth)) {
        periods.push({
          month,
          year,
          label: `${MONTHS_ARRAY[month]} ${year}`,
        });

        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    } else {
      const sYear = parseInt(startYear);
      const eYear = parseInt(endYear);
      for (let y = sYear; y <= eYear; y++) {
        periods.push({ year: y, label: `${y}` });
      }
    }

    return periods;
  }, [viewMode, startMonth, endMonth, startYear, endYear]);

  // Prepare trend data for chart
  const trendData = useMemo(() => {
    return tablePeriods.map((period) => {
      let totalVoucher = 0;
      let totalSelf = 0;
      let totalTransferred = 0;

      kamPerformance.forEach((k) => {
        let periodKey: string;
        
        if (viewMode === 'monthly') {
          periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
        } else {
          periodKey = `${k.voucher_year}`;
        }

        const match = periodKey === period.label;
        if (match) {
          totalVoucher += Number(k.total_voucher_amount || 0);
          totalSelf += Number(k.self_client_voucher_amount || 0);
          totalTransferred += Number(k.transferred_client_voucher_amount || 0);
        }
      });

      return {
        name: period.label,
        totalVoucher,
        totalSelf,
        totalTransferred,
      };
    });
  }, [kamPerformance, tablePeriods, viewMode]);

  // Get top performers
  const topPerformers = useMemo(() => {
    const kamMap: any = {};

    kamPerformance.forEach((row) => {
      if (!kamMap[row.current_supervisor]) {
        kamMap[row.current_supervisor] = 0;
      }
      kamMap[row.current_supervisor] += Number(row.total_voucher_amount || 0);
    });

    return Object.entries(kamMap)
      .map(([name, total]: any) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [kamPerformance]);

  // Generate label for top performers
  const topPerformerRangeLabel = useMemo(() => {
    if (viewMode === "monthly") {
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
    } else {
      if (startYear === endYear) {
        return `${startYear}`;
      }
      return `${startYear} – ${endYear}`;
    }
  }, [viewMode, startMonth, endMonth, startYear, endYear]);

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of client invoice performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}

          <KAMFilterDrawer
            division={divisionFilter}
            setDivision={setDivisionFilter}
            kam={kamFilter}
            setKam={setKamFilter}
            clientType={clientTypeFilter}
            setClientType={setClientTypeFilter}
            kams={kams}
            dateRange={dateRangeType}
            setDateRange={setDateRangeType}
            viewMode={viewMode}
            setViewMode={setViewMode}
            startMonth={startMonth}
            setStartMonth={setStartMonth}
            endMonth={endMonth}
            setEndMonth={setEndMonth}
            startYear={startYear}
            setStartYear={setStartYear}
            endYear={endYear}
            setEndYear={setEndYear}
            onFilterChange={() => setSelectedKamId(null)}
          />
        </div>
      </div>

      {/* TABLE */}
      <KAMPerformanceTable
        sales={kamPerformance}
        dateRangeType={viewMode}
        startMonth={startMonth}
        endMonth={endMonth}
        startYear={startYear}
        endYear={endYear}
        tablePeriods={tablePeriods}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LINE CHART */}
        <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
          <CardHeader className="border-b bg-muted/5 shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" /> Total Revenue Flow
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-6 flex-1">
            {trendData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={trendData}
                  margin={{ bottom: 60, left: 0, right: 0, top: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false}
                    tick={<CustomXAxisTick />}
                    angle={-45}
                    height={100}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend 
                    verticalAlign="top" 
                    align="right"
                    wrapperStyle={{ paddingBottom: '20px' }}
                  />

                  <Line
                    type="monotone"
                    dataKey="totalVoucher"
                    name="Total Invoice"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalSelf"
                    name="Self Invoice"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalTransferred"
                    name="Transferred Invoice"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* TOP PERFORMERS */}
        <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
          <CardHeader className="border-b bg-muted/5 shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Top Performers</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                {topPerformerRangeLabel}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
            {topPerformers.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {topPerformers.map((kam, idx) => (
                  <div
                    key={kam.name}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedKamId === kam.name
                        ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
                        : 'hover:bg-muted/50 border-transparent'
                    }`}
                    onClick={() =>
                      setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                          idx === 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {kam.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-primary">
                        {formatCurrency(kam.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}