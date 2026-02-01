

// 'use client';

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
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
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
//       <text
//         x={0}
//         y={0}
//         dy={4}
//         textAnchor="end"
//         fill="#666"
//         fontSize="11px"
//         style={{
//           transform: 'rotate(-45deg)',
//           transformOrigin: '0 0',
//           display: 'inline-block',
//         }}
//       >
//         {payload.value}
//       </text>
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

//   const hasFilters =
//     divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

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
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//       let year = sYear; // ✅ let
//       let month = sMonth; // ✅ let

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



//     // Get top performers
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
  
// const topPerformersbyPercentage = useMemo(() => {
//   const kamMap: any = {};

//   kamPerformance.forEach((row) => {
//     const kamName = row.current_supervisor;
    
//     if (!kamMap[kamName]) {
//       kamMap[kamName] = {
//         name: kamName,
//         totalAchieved: 0,
//         totalTarget: 0,
//       };
//     }
    
//     kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
//     kamMap[kamName].totalTarget += Number(row.target_amount || 0);
//   });

//   return Object.values(kamMap)
//     .map((kam: any) => ({
//       name: kam.name,
//       rangeAchievedSum: kam.totalAchieved,
//       rangeTargetSum: kam.totalTarget,
//       percentage: kam.totalTarget > 0 
//         ? (kam.totalAchieved / kam.totalTarget) * 100 
//         : 0,
//     }))
//     .sort((a, b) => b.percentage - a.percentage)
//     // .slice(0, 6);
// }, [kamPerformance]);

//   // Generate label for top performers
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === 'monthly') {
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
//             Detailed breakdown of client invoice performance
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


//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* LINE CHART */}
        

//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
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
//                     onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
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
//                         <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>


//        {/* TOP PERFORMERS by Achieve Percentage*/}
// <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
//   <CardHeader className="border-b bg-muted/5 shrink-0">
//     <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//       <div className="flex items-center gap-2">
//         <BarChart3 className="h-4 w-4 text-primary" />
//         <span>Top Achievers</span>
//       </div>
//       <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//         {topPerformerRangeLabel}
//       </span>
//     </CardTitle>
//   </CardHeader>

//   <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//     {topPerformersbyPercentage.length === 0 ? (
//       <div className="flex items-center justify-center h-full text-muted-foreground">
//         No data available
//       </div>
//     ) : (
//       <div className="space-y-3">
//         {topPerformersbyPercentage.map((kam, idx) => {
//           const achievePercentage = kam.rangeTargetSum > 0 
//             ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1) 
//             : '0.0';
          
//           return (
//             <div
//               key={kam.name}
//               className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                 selectedKamId === kam.name
//                   ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                   : 'hover:bg-muted/50 border-transparent'
//               }`}
//               onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
//             >
//               <div className="flex items-center gap-3">
//                 <div
//                   className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                     idx === 0
//                       ? 'bg-yellow-100 text-yellow-700'
//                       : 'bg-slate-100 text-slate-500'
//                   }`}
//                 >
//                   {idx + 1}
//                 </div>

//                 <div className="truncate">
//                   <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-3 shrink-0 ml-2">
//                 <div className="text-right">
//                   <p className="text-[10px] text-muted-foreground uppercase">Target</p>
//                   <p className="text-xs font-medium text-slate-600">{formatCurrency(kam.rangeTargetSum)}</p>
//                 </div>
                
//                 <div className="text-right">
//                   <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
//                   <p className={`text-xs font-bold ${
//                     kam.rangeAchievedSum >= kam.rangeTargetSum
//                       ? 'text-emerald-700'
//                       : 'text-destructive'
//                   }`}>
//                     {formatCurrency(kam.rangeAchievedSum)}
//                   </p>
//                 </div>
                
//                 <div className="text-right min-w-[50px]">
//                   <p className="text-[10px] text-muted-foreground uppercase">%</p>
//                   <p className={`text-xs font-bold ${
//                     parseFloat(achievePercentage) >= 100 
//                       ? 'text-emerald-700' 
//                       : parseFloat(achievePercentage) >= 75 
//                       ? 'text-amber-600' 
//                       : 'text-destructive'
//                   }`}>
//                     {achievePercentage}%
//                   </p>
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     )}
//   </CardContent>
// </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
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
//                 <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={<CustomXAxisTick />}
//                     angle={-45}
//                     height={100}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend
//                     verticalAlign="top"
//                     align="right"
//                     wrapperStyle={{ paddingBottom: '20px' }}
//                   />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Invoice"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 5 }}
//                     activeDot={{ r: 7 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Invoice"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Invoice"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>

        
//       </div>
//     </div>
//   );
// }







// // app/kam-performance/page.tsx
// 'use client';

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
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
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
//       <text
//         x={0}
//         y={0}
//         dy={4}
//         textAnchor="end"
//         fill="#666"
//         fontSize="11px"
//         style={{
//           transform: 'rotate(-45deg)',
//           transformOrigin: '0 0',
//           display: 'inline-block',
//         }}
//       >
//         {payload.value}
//       </text>
//     </g>
//   );
// };

// export default function KAMPerformancePage() {
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [kamLoading, setKamLoading] = useState<boolean>(true);
//   const [selectedKamId, setSelectedKamId] = useState<string | null>(null);
//   const [userRole, setUserRole] = useState<string>('super_admin');
//   const [totals, setTotals] = useState<any>(null);

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

//   const hasFilters =
//     divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

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

//   // Fetch KAMs from backend with role-based filtering
//   useEffect(() => {
//     const fetchKams = async () => {
//       setKamLoading(true);
//       try {
//         const response = await KamPerformanceApi.getKams();
//         const data = response.data?.data || response.data || [];
//         setKams(data);
//         setUserRole(response.data?.user_role || 'super_admin');

//         // For KAM role, auto-select their KAM
//         if (response.data?.user_role === 'kam' && data.length > 0) {
//           setKamFilter(String(data[0].kam_id));
//         }
//       } catch (err) {
//         console.error('Error fetching KAMs:', err);
//         setKams([]);
//       }
//       setKamLoading(false);
//     };

//     fetchKams();
//   }, []);

//   // Fetch data from API with role-based filtering
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
//         setUserRole(response.user_role || userRole);

//         // Store totals from response
//         if (response.totals) {
//           setTotals(response.totals);
//         }
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
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       const eMonth = MONTHS_ARRAY.indexOf(endMonth);

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

//   const topPerformersbyPercentage = useMemo(() => {
//     const kamMap: any = {};

//     kamPerformance.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           name: kamName,
//           totalAchieved: 0,
//           totalTarget: 0,
//         };
//       }

//       kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].totalTarget += Number(row.target_amount || 0);
//     });

//     return Object.values(kamMap)
//       .map((kam: any) => ({
//         name: kam.name,
//         rangeAchievedSum: kam.totalAchieved,
//         rangeTargetSum: kam.totalTarget,
//         percentage: kam.totalTarget > 0 ? (kam.totalAchieved / kam.totalTarget) * 100 : 0,
//       }))
//       .sort((a, b) => b.percentage - a.percentage);
//   }, [kamPerformance]);

//   // Generate label for top performers
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === 'monthly') {
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

//   // Render different UI based on user role
//   const isKamRole = userRole === 'kam';
//   const isSupervisorRole = userRole === 'supervisor';

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed breakdown of client invoice performance
//             {isKamRole && ' - Your personal data'}
//             {isSupervisorRole && ' - Your team data'}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {hasFilters && !isKamRole && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearFilters}
//               className="text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <X className="h-4 w-4 mr-2" /> Reset
//             </Button>
//           )}

//           {!isKamRole && (
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={kamFilter}
//               setKam={setKamFilter}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={kams}
//               setKams={setKams}
//               dateRange={dateRangeType}
//               setDateRange={setDateRangeType}
//               viewMode={viewMode}
//               setViewMode={setViewMode}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               onFilterChange={() => setSelectedKamId(null)}
//               userRole={userRole}
//             />
//           )}
//         </div>
//       </div>

//       {/* Show info badge for KAM role */}
//       {isKamRole && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-blue-900">
//             You are viewing your personal performance data only. Most filters are disabled for security.
//           </p>
//         </div>
//       )}

//       {/* Show info badge for supervisor role */}
//       {isSupervisorRole && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-green-900">
//             You are viewing data for the KAMs under your supervision.
//           </p>
//         </div>
//       )}

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

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
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
//                     onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                           idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                         }`}
//                       >
//                         {idx + 1}
//                       </div>

//                       <div className="truncate">
//                         <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* TOP PERFORMERS by Achieve Percentage */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-primary" />
//                 <span>Top Achievers</span>
//               </div>
//               <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//                 {topPerformerRangeLabel}
//               </span>
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//             {topPerformersbyPercentage.length === 0 ? (
//               <div className="flex items-center justify-center h-full text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {topPerformersbyPercentage.map((kam, idx) => {
//                   const achievePercentage =
//                     kam.rangeTargetSum > 0
//                       ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1)
//                       : '0.0';

//                   return (
//                     <div
//                       key={kam.name}
//                       className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                         selectedKamId === kam.name
//                           ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                           : 'hover:bg-muted/50 border-transparent'
//                       }`}
//                       onClick={() =>
//                         setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                             idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                           }`}
//                         >
//                           {idx + 1}
//                         </div>

//                         <div className="truncate">
//                           <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 shrink-0 ml-2">
//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Target</p>
//                           <p className="text-xs font-medium text-slate-600">
//                             {formatCurrency(kam.rangeTargetSum)}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               kam.rangeAchievedSum >= kam.rangeTargetSum
//                                 ? 'text-emerald-700'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {formatCurrency(kam.rangeAchievedSum)}
//                           </p>
//                         </div>

//                         <div className="text-right min-w-[50px]">
//                           <p className="text-[10px] text-muted-foreground uppercase">%</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               parseFloat(achievePercentage) >= 100
//                                 ? 'text-emerald-700'
//                                 : parseFloat(achievePercentage) >= 75
//                                 ? 'text-amber-600'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {achievePercentage}%
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
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
//                 <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={<CustomXAxisTick />}
//                     angle={-45}
//                     height={100}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend
//                     verticalAlign="top"
//                     align="right"
//                     wrapperStyle={{ paddingBottom: '20px' }}
//                   />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Invoice"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 5 }}
//                     activeDot={{ r: 7 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Invoice"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Invoice"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }







// // app/kam-performance/page.tsx
// 'use client';

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
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
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
//       <text
//         x={0}
//         y={0}
//         dy={4}
//         textAnchor="end"
//         fill="#666"
//         fontSize="11px"
//         style={{
//           transform: 'rotate(-45deg)',
//           transformOrigin: '0 0',
//           display: 'inline-block',
//         }}
//       >
//         {payload.value}
//       </text>
//     </g>
//   );
// };

// export default function KAMPerformancePage() {
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [kamLoading, setKamLoading] = useState<boolean>(true);
//   const [selectedKamId, setSelectedKamId] = useState<string | null>(null);
//   const [userRole, setUserRole] = useState<string>('super_admin');
//   const [totals, setTotals] = useState<any>(null);

//   // Get last month as default
//   const getLastMonthDefaults = () => {
//     const now = new Date();
//     const monthName = MONTHS_ARRAY[now.getMonth()];
//     const year = now.getFullYear().toString();
//     return { monthName, year };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return { quarter: q, year: now.getFullYear().toString() };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();

//   const [divisionFilter, setDivisionFilter] = useState<string>('all');
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [dateRangeType, setDateRangeType] = useState<'monthly' | 'yearly'>('monthly');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

//   // ✅ Monthly states
//   const [startMonth, setStartMonth] = useState(defaultMonth);
//   const [endMonth, setEndMonth] = useState(defaultMonth);
//   const [startYear, setStartYear] = useState(defaultYear);
//   const [endYear, setEndYear] = useState(defaultYear);

//   // ✅ Quarterly states
//   const [quarter, setQuarter] = useState<number>(defaultQuarter);
//   const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

//   const hasFilters =
//     divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setKamFilter('all');
//     setClientTypeFilter('All Client');
//     setSelectedKamId(null);
//     setViewMode('monthly');
//     setStartMonth(defaultMonth);
//     setEndMonth(defaultMonth);
//     setStartYear(defaultYear);
//     setEndYear(defaultYear);
//     setQuarter(defaultQuarter);
//     setQuarterYear(defaultQuarterYear);
//   };

//   // Fetch KAMs from backend with role-based filtering
//   useEffect(() => {
//     const fetchKams = async () => {
//       setKamLoading(true);
//       try {
//         const response = await KamPerformanceApi.getKams();
//         const data = response.data?.data || response.data || [];
//         setKams(data);
//         setUserRole(response.data?.user_role || 'super_admin');

//         // For KAM role, auto-select their KAM
//         if (response.data?.user_role === 'kam' && data.length > 0) {
//           setKamFilter(String(data[0].kam_id));
//         }
//       } catch (err) {
//         console.error('Error fetching KAMs:', err);
//         setKams([]);
//       }
//       setKamLoading(false);
//     };

//     fetchKams();
//   }, []);

//   // ✅ Fetch data from API with proper view mode handling
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         let params: any = {
//           client_type: clientTypeFilter,
//           search: kamFilter !== 'all' ? kamFilter : undefined,
//           view_mode: viewMode,
//           per_page: 1000,
//         };

//         // ✅ Set date range based on view mode
//         if (viewMode === 'quarterly') {
//           params.quarter = quarter;
//           params.quarter_year = quarterYear;
          
//           // Also calculate actual dates for API
//           const startMonth = (quarter - 1) * 3 + 1;
//           const endMonth = quarter * 3;
//           params.start_date = `${quarterYear}-${String(startMonth).padStart(2, '0')}-01`;
//           params.end_date = `${quarterYear}-${String(endMonth).padStart(2, '0')}-31`;

//         } else if (viewMode === 'yearly') {
//           params.start_date = `${startYear}-01-01`;
//           params.end_date = `${endYear}-12-31`;

//         } else {
//           // Monthly
//           params.start_date = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
//           params.end_date = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;
//         }

//         const response = await KamPerformanceApi.getKamUsersRevenue(params);

//         const data = response.data || response || [];
//         setKamPerformance(data);
//         setUserRole(response.user_role || userRole);

//         // Store totals from response
//         if (response.totals) {
//           setTotals(response.totals);
//         }
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [startMonth, endMonth, startYear, endYear, quarter, quarterYear, kamFilter, clientTypeFilter, viewMode]);

//   // ✅ Generate periods for table - handles all view modes
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'quarterly') {
//       // ✅ For quarterly view: single quarter period
//       periods.push({
//         quarter: quarter,
//         year: quarterYear,
//         label: `Q${quarter} ${quarterYear}`,
//       });

//     } else if (viewMode === 'yearly') {
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       for (let y = sYear; y <= eYear; y++) {
//         periods.push({ year: y, label: `${y}` });
//       }

//     } else {
//       // Monthly
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       const eMonth = MONTHS_ARRAY.indexOf(endMonth);

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
//     }

//     return periods;
//   }, [viewMode, startMonth, endMonth, startYear, endYear, quarter, quarterYear]);

//   // ✅ Prepare trend data for chart
//   const trendData = useMemo(() => {
//     return tablePeriods.map((period) => {
//       let totalVoucher = 0;
//       let totalSelf = 0;
//       let totalTransferred = 0;

//       kamPerformance.forEach((k) => {
//         let periodKey: string;

//         if (viewMode === 'quarterly') {
//           // ✅ For quarterly: match by quarter
//           periodKey = `Q${k.voucher_quarter} ${k.voucher_year}`;
//         } else if (viewMode === 'yearly') {
//           periodKey = `${k.voucher_year}`;
//         } else {
//           // Monthly
//           periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
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

//   const topPerformersbyPercentage = useMemo(() => {
//     const kamMap: any = {};

//     kamPerformance.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           name: kamName,
//           totalAchieved: 0,
//           totalTarget: 0,
//         };
//       }

//       kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].totalTarget += Number(row.target_amount || 0);
//     });

//     return Object.values(kamMap)
//       .map((kam: any) => ({
//         name: kam.name,
//         rangeAchievedSum: kam.totalAchieved,
//         rangeTargetSum: kam.totalTarget,
//         percentage: kam.totalTarget > 0 ? (kam.totalAchieved / kam.totalTarget) * 100 : 0,
//       }))
//       .sort((a, b) => b.percentage - a.percentage);
//   }, [kamPerformance]);

//   // ✅ Generate label for top performers based on view mode
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === 'quarterly') {
//       return `Q${quarter} ${quarterYear}`;
//     } else if (viewMode === 'yearly') {
//       if (startYear === endYear) {
//         return `${startYear}`;
//       }
//       return `${startYear} – ${endYear}`;
//     } else {
//       // Monthly
//       if (startMonth === endMonth && startYear === endYear) {
//         return `${startMonth} ${startYear}`;
//       }
//       return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
//     }
//   }, [viewMode, quarter, quarterYear, startMonth, endMonth, startYear, endYear]);

//   // Render different UI based on user role
//   const isKamRole = userRole === 'kam';
//   const isSupervisorRole = userRole === 'supervisor';

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed breakdown of client invoice performance
//             {isKamRole && ' - Your personal data'}
//             {isSupervisorRole && ' - Your team data'}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {hasFilters && !isKamRole && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearFilters}
//               className="text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <X className="h-4 w-4 mr-2" /> Reset
//             </Button>
//           )}

//           {!isKamRole && (
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={kamFilter}
//               setKam={setKamFilter}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={kams}
//               setKams={setKams}
//               viewMode={viewMode}
//               setViewMode={setViewMode}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               quarter={quarter}
//               setQuarter={setQuarter}
//               quarterYear={quarterYear}
//               setQuarterYear={setQuarterYear}
//               onFilterChange={() => setSelectedKamId(null)}
//               userRole={userRole}
//             />
//           )}
//         </div>
//       </div>

//       {/* Show info badge for KAM role */}
//       {isKamRole && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-blue-900">
//             You are viewing your personal performance data only. Most filters are disabled for security.
//           </p>
//         </div>
//       )}

//       {/* Show info badge for supervisor role */}
//       {isSupervisorRole && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-green-900">
//             You are viewing data for the KAMs under your supervision.
//           </p>
//         </div>
//       )}

//       {/* TABLE */}
//       <KAMPerformanceTable
//         sales={kamPerformance}
//         dateRangeType={viewMode}
//         startMonth={startMonth}
//         endMonth={endMonth}
//         startYear={startYear}
//         endYear={endYear}
//         quarter={quarter}
//         quarterYear={quarterYear}
//         tablePeriods={tablePeriods}
//         loading={loading}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
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
//                     onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                           idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                         }`}
//                       >
//                         {idx + 1}
//                       </div>

//                       <div className="truncate">
//                         <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* TOP PERFORMERS by Achieve Percentage */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-primary" />
//                 <span>Top Achievers</span>
//               </div>
//               <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//                 {topPerformerRangeLabel}
//               </span>
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//             {topPerformersbyPercentage.length === 0 ? (
//               <div className="flex items-center justify-center h-full text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {topPerformersbyPercentage.map((kam, idx) => {
//                   const achievePercentage =
//                     kam.rangeTargetSum > 0
//                       ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1)
//                       : '0.0';

//                   return (
//                     <div
//                       key={kam.name}
//                       className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                         selectedKamId === kam.name
//                           ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                           : 'hover:bg-muted/50 border-transparent'
//                       }`}
//                       onClick={() =>
//                         setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                             idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                           }`}
//                         >
//                           {idx + 1}
//                         </div>

//                         <div className="truncate">
//                           <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 shrink-0 ml-2">
//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Target</p>
//                           <p className="text-xs font-medium text-slate-600">
//                             {formatCurrency(kam.rangeTargetSum)}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               kam.rangeAchievedSum >= kam.rangeTargetSum
//                                 ? 'text-emerald-700'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {formatCurrency(kam.rangeAchievedSum)}
//                           </p>
//                         </div>

//                         <div className="text-right min-w-[50px]">
//                           <p className="text-[10px] text-muted-foreground uppercase">%</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               parseFloat(achievePercentage) >= 100
//                                 ? 'text-emerald-700'
//                                 : parseFloat(achievePercentage) >= 75
//                                 ? 'text-amber-600'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {achievePercentage}%
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
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
//                 <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={<CustomXAxisTick />}
//                     angle={-45}
//                     height={100}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend
//                     verticalAlign="top"
//                     align="right"
//                     wrapperStyle={{ paddingBottom: '20px' }}
//                   />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Invoice"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 5 }}
//                     activeDot={{ r: 7 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Invoice"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Invoice"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }





// // app/kam-performance/page.tsx
// 'use client';

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
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
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
//       <text
//         x={0}
//         y={0}
//         dy={4}
//         textAnchor="end"
//         fill="#666"
//         fontSize="11px"
//         style={{
//           transform: 'rotate(-45deg)',
//           transformOrigin: '0 0',
//           display: 'inline-block',
//         }}
//       >
//         {payload.value}
//       </text>
//     </g>
//   );
// };

// export default function KAMPerformancePage() {
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [kamLoading, setKamLoading] = useState<boolean>(true);
//   const [selectedKamId, setSelectedKamId] = useState<string | null>(null);
//   const [userRole, setUserRole] = useState<string>('super_admin');
//   const [totals, setTotals] = useState<any>(null);

//   // Get last month as default
//   const getLastMonthDefaults = () => {
//     const now = new Date();
//     const monthName = MONTHS_ARRAY[now.getMonth()];
//     const year = now.getFullYear().toString();
//     return { monthName, year };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return { quarter: q, year: now.getFullYear().toString() };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();

//   const [divisionFilter, setDivisionFilter] = useState<string>('all');
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

//   // ✅ Monthly states
//   const [startMonth, setStartMonth] = useState(defaultMonth);
//   const [endMonth, setEndMonth] = useState(defaultMonth);
//   const [startYear, setStartYear] = useState(defaultYear);
//   const [endYear, setEndYear] = useState(defaultYear);

//   // ✅ UPDATED: Quarterly states - MULTIPLE QUARTERS
//   const [quarters, setQuarters] = useState<number[]>([defaultQuarter]);
//   const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

//   const hasFilters =
//     divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setKamFilter('all');
//     setClientTypeFilter('All Client');
//     setSelectedKamId(null);
//     setViewMode('monthly');
//     setStartMonth(defaultMonth);
//     setEndMonth(defaultMonth);
//     setStartYear(defaultYear);
//     setEndYear(defaultYear);
//     setQuarters([defaultQuarter]);
//     setQuarterYear(defaultQuarterYear);
//   };

//   // Fetch KAMs from backend with role-based filtering
//   useEffect(() => {
//     const fetchKams = async () => {
//       setKamLoading(true);
//       try {
//         const response = await KamPerformanceApi.getKams();
//         const data = response.data?.data || response.data || [];
//         setKams(data);
//         setUserRole(response.data?.user_role || 'super_admin');

//         // For KAM role, auto-select their KAM
//         if (response.data?.user_role === 'kam' && data.length > 0) {
//           setKamFilter(String(data[0].kam_id));
//         }
//       } catch (err) {
//         console.error('Error fetching KAMs:', err);
//         setKams([]);
//       }
//       setKamLoading(false);
//     };

//     fetchKams();
//   }, []);

//   // ✅ Fetch data from API with proper view mode handling
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         let params: any = {
//           client_type: clientTypeFilter,
//           search: kamFilter !== 'all' ? kamFilter : undefined,
//           view_mode: viewMode,
//           per_page: 1000,
//         };

//         // ✅ Set date range based on view mode
//         if (viewMode === 'quarterly') {
//           // ✅ UPDATED: Send multiple quarters
//           params.quarters = quarters.join(',');  // Convert [3, 4] to "3,4"
//           params.quarter_year = quarterYear;
          
//           // Calculate actual dates for first and last quarter
//           const firstQuarter = quarters[0];
//           const lastQuarter = quarters[quarters.length - 1];
          
//           const startMonth = (firstQuarter - 1) * 3 + 1;
//           const endMonth = lastQuarter * 3;
          
//           params.start_date = `${quarterYear}-${String(startMonth).padStart(2, '0')}-01`;
//           params.end_date = `${quarterYear}-${String(endMonth).padStart(2, '0')}-31`;

//         } else if (viewMode === 'yearly') {
//           params.start_date = `${startYear}-01-01`;
//           params.end_date = `${endYear}-12-31`;

//         } else {
//           // Monthly
//           params.start_date = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
//           params.end_date = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;
//         }

//         const response = await KamPerformanceApi.getKamUsersRevenue(params);

//         const data = response.data || response || [];
//         setKamPerformance(data);
//         setUserRole(response.user_role || userRole);

//         // Store totals from response
//         if (response.totals) {
//           setTotals(response.totals);
//         }
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [startMonth, endMonth, startYear, endYear, quarters, quarterYear, kamFilter, clientTypeFilter, viewMode]);

//   // ✅ UPDATED: Generate periods for table - handles all view modes including MULTIPLE quarters
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'quarterly') {
//       // ✅ UPDATED: Generate period for EACH selected quarter
//       quarters.forEach((q) => {
//         periods.push({
//           quarter: q,
//           year: quarterYear,
//           label: `Q${q} ${quarterYear}`,
//         });
//       });

//     } else if (viewMode === 'yearly') {
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       for (let y = sYear; y <= eYear; y++) {
//         periods.push({ year: y, label: `${y}` });
//       }

//     } else {
//       // Monthly
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       const eMonth = MONTHS_ARRAY.indexOf(endMonth);

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
//     }

//     return periods;
//   }, [viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

//   // ✅ Prepare trend data for chart
//   const trendData = useMemo(() => {
//     return tablePeriods.map((period) => {
//       let totalVoucher = 0;
//       let totalSelf = 0;
//       let totalTransferred = 0;

//       kamPerformance.forEach((k) => {
//         let periodKey: string;

//         if (viewMode === 'quarterly') {
//           // ✅ For quarterly: match by quarter
//           periodKey = `Q${k.voucher_quarter} ${k.voucher_year}`;
//         } else if (viewMode === 'yearly') {
//           periodKey = `${k.voucher_year}`;
//         } else {
//           // Monthly
//           periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
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

//   const topPerformersbyPercentage = useMemo(() => {
//     const kamMap: any = {};

//     kamPerformance.forEach((row) => {
//       const kamName = row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           name: kamName,
//           totalAchieved: 0,
//           totalTarget: 0,
//         };
//       }

//       kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].totalTarget += Number(row.target_amount || 0);
//     });

//     return Object.values(kamMap)
//       .map((kam: any) => ({
//         name: kam.name,
//         rangeAchievedSum: kam.totalAchieved,
//         rangeTargetSum: kam.totalTarget,
//         percentage: kam.totalTarget > 0 ? (kam.totalAchieved / kam.totalTarget) * 100 : 0,
//       }))
//       .sort((a, b) => b.percentage - a.percentage);
//   }, [kamPerformance]);

//   // ✅ UPDATED: Generate label for top performers based on view mode
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === 'quarterly') {
//       // ✅ Show all selected quarters
//       if (quarters.length === 1) {
//         return `Q${quarters[0]} ${quarterYear}`;
//       } else {
//         return `Q${quarters.join(', Q')} ${quarterYear}`;
//       }
//     } else if (viewMode === 'yearly') {
//       if (startYear === endYear) {
//         return `${startYear}`;
//       }
//       return `${startYear} – ${endYear}`;
//     } else {
//       // Monthly
//       if (startMonth === endMonth && startYear === endYear) {
//         return `${startMonth} ${startYear}`;
//       }
//       return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
//     }
//   }, [viewMode, quarters, quarterYear, startMonth, endMonth, startYear, endYear]);

//   // Render different UI based on user role
//   const isKamRole = userRole === 'kam';
//   const isSupervisorRole = userRole === 'supervisor';

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">KAM Performance</h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed breakdown of client invoice performance
//             {isKamRole && ' - Your personal data'}
//             {isSupervisorRole && ' - Your team data'}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {hasFilters && !isKamRole && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearFilters}
//               className="text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <X className="h-4 w-4 mr-2" /> Reset
//             </Button>
//           )}

//           {!isKamRole && (
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={kamFilter}
//               setKam={setKamFilter}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={kams}
//               setKams={setKams}
//               viewMode={viewMode}
//               setViewMode={setViewMode}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               quarters={quarters}              // ✅ UPDATED: Pass quarters array
//               setQuarters={setQuarters}        // ✅ UPDATED: Pass setQuarters
//               quarterYear={quarterYear}
//               setQuarterYear={setQuarterYear}
//               onFilterChange={() => setSelectedKamId(null)}
//               userRole={userRole}
//             />
//           )}
//         </div>
//       </div>

//       {/* Show info badge for KAM role */}
//       {isKamRole && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-blue-900">
//             You are viewing your personal performance data only. Most filters are disabled for security.
//           </p>
//         </div>
//       )}

//       {/* Show info badge for supervisor role */}
//       {isSupervisorRole && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-green-900">
//             You are viewing data for the KAMs under your supervision.
//           </p>
//         </div>
//       )}

//       {/* TABLE */}
//       <KAMPerformanceTable
//         sales={kamPerformance}
//         dateRangeType={viewMode}
//         startMonth={startMonth}
//         endMonth={endMonth}
//         startYear={startYear}
//         endYear={endYear}
//         quarters={quarters}                  // ✅ UPDATED: Pass quarters array
//         quarterYear={quarterYear}
//         tablePeriods={tablePeriods}
//         loading={loading}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
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
//                     onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                           idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                         }`}
//                       >
//                         {idx + 1}
//                       </div>

//                       <div className="truncate">
//                         <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* TOP PERFORMERS by Achieve Percentage */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-primary" />
//                 <span>Top Achievers</span>
//               </div>
//               <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//                 {topPerformerRangeLabel}
//               </span>
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//             {topPerformersbyPercentage.length === 0 ? (
//               <div className="flex items-center justify-center h-full text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {topPerformersbyPercentage.map((kam, idx) => {
//                   const achievePercentage =
//                     kam.rangeTargetSum > 0
//                       ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1)
//                       : '0.0';

//                   return (
//                     <div
//                       key={kam.name}
//                       className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                         selectedKamId === kam.name
//                           ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                           : 'hover:bg-muted/50 border-transparent'
//                       }`}
//                       onClick={() =>
//                         setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                             idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                           }`}
//                         >
//                           {idx + 1}
//                         </div>

//                         <div className="truncate">
//                           <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 shrink-0 ml-2">
//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Target</p>
//                           <p className="text-xs font-medium text-slate-600">
//                             {formatCurrency(kam.rangeTargetSum)}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               kam.rangeAchievedSum >= kam.rangeTargetSum
//                                 ? 'text-emerald-700'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {formatCurrency(kam.rangeAchievedSum)}
//                           </p>
//                         </div>

//                         <div className="text-right min-w-[50px]">
//                           <p className="text-[10px] text-muted-foreground uppercase">%</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               parseFloat(achievePercentage) >= 100
//                                 ? 'text-emerald-700'
//                                 : parseFloat(achievePercentage) >= 75
//                                 ? 'text-amber-600'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {achievePercentage}%
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
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
//                 <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={<CustomXAxisTick />}
//                     angle={-45}
//                     height={100}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend
//                     verticalAlign="top"
//                     align="right"
//                     wrapperStyle={{ paddingBottom: '20px' }}
//                   />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Invoice"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 5 }}
//                     activeDot={{ r: 7 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Invoice"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Invoice"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }






// // app/kam-performance/page.tsx
// 'use client';

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
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// const MONTHS_ARRAY = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
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
//       <text
//         x={0}
//         y={0}
//         dy={4}
//         textAnchor="end"
//         fill="#666"
//         fontSize="11px"
//         style={{
//           transform: 'rotate(-45deg)',
//           transformOrigin: '0 0',
//           display: 'inline-block',
//         }}
//       >
//         {payload.value}
//       </text>
//     </g>
//   );
// };

// export default function KAMPerformancePage() {
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [kamLoading, setKamLoading] = useState<boolean>(true);
//   const [selectedKamId, setSelectedKamId] = useState<string | null>(null);
//   const [userRole, setUserRole] = useState<string>('super_admin');
//   const [totals, setTotals] = useState<any>(null);

//   // Get last month as default
//   const getLastMonthDefaults = () => {
//     const now = new Date();
//     const monthName = MONTHS_ARRAY[now.getMonth()];
//     const year = now.getFullYear().toString();
//     return { monthName, year };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return { quarter: q, year: now.getFullYear().toString() };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();

//   // ✅ ADD filterType state
//   const [filterType, setFilterType] = useState<'kam' | 'branch'>('kam');
//   const [divisionFilter, setDivisionFilter] = useState<string>('all');
//   const [kamFilter, setKamFilter] = useState<string>('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

//   // ✅ Monthly states
//   const [startMonth, setStartMonth] = useState(defaultMonth);
//   const [endMonth, setEndMonth] = useState(defaultMonth);
//   const [startYear, setStartYear] = useState(defaultYear);
//   const [endYear, setEndYear] = useState(defaultYear);

//   // ✅ UPDATED: Quarterly states - MULTIPLE QUARTERS
//   const [quarters, setQuarters] = useState<number[]>([defaultQuarter]);
//   const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

//   const hasFilters =
//     divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client' || filterType !== 'kam';

//   const clearFilters = () => {
//     setFilterType('kam'); // ✅ Reset filterType
//     setDivisionFilter('all');
//     setKamFilter('all');
//     setClientTypeFilter('All Client');
//     setSelectedKamId(null);
//     setViewMode('monthly');
//     setStartMonth(defaultMonth);
//     setEndMonth(defaultMonth);
//     setStartYear(defaultYear);
//     setEndYear(defaultYear);
//     setQuarters([defaultQuarter]);
//     setQuarterYear(defaultQuarterYear);
//   };

//   // Fetch KAMs from backend with role-based filtering
//   useEffect(() => {
//     const fetchKams = async () => {
//       setKamLoading(true);
//       try {
//         const response = await KamPerformanceApi.getKams();
//         const data = response.data?.data || response.data || [];
//         setKams(data);
//         setUserRole(response.data?.user_role || 'super_admin');

//         // For KAM role, auto-select their KAM
//         if (response.data?.user_role === 'kam' && data.length > 0) {
//           setKamFilter(String(data[0].kam_id));
//         }
//       } catch (err) {
//         console.error('Error fetching KAMs:', err);
//         setKams([]);
//       }
//       setKamLoading(false);
//     };

//     fetchKams();
//   }, []);

//   // ✅ Fetch data from API with proper view mode handling
//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         let params: any = {
//           filter_type: filterType, // ✅ ADD THIS - Send filter_type to backend
//           client_type: clientTypeFilter,
//           search: kamFilter !== 'all' ? kamFilter : undefined,
//           view_mode: viewMode,
//           per_page: 1000,
//         };

//         // ✅ ADD division parameter when filterType is 'branch'
//         if (filterType === 'branch' && divisionFilter !== 'all') {
//           params.division = divisionFilter;
//         }

//         // ✅ Set date range based on view mode
//         if (viewMode === 'quarterly') {
//           // ✅ UPDATED: Send multiple quarters
//           params.quarters = quarters.join(',');  // Convert [3, 4] to "3,4"
//           params.quarter_year = quarterYear;
          
//           // Calculate actual dates for first and last quarter
//           const firstQuarter = quarters[0];
//           const lastQuarter = quarters[quarters.length - 1];
          
//           const startMonth = (firstQuarter - 1) * 3 + 1;
//           const endMonth = lastQuarter * 3;
          
//           params.start_date = `${quarterYear}-${String(startMonth).padStart(2, '0')}-01`;
//           params.end_date = `${quarterYear}-${String(endMonth).padStart(2, '0')}-31`;

//         } else if (viewMode === 'yearly') {
//           params.start_date = `${startYear}-01-01`;
//           params.end_date = `${endYear}-12-31`;

//         } else {
//           // Monthly
//           params.start_date = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
//           params.end_date = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;
//         }

//         const response = await KamPerformanceApi.getKamUsersRevenue(params);

//         const data = response.data || response || [];
//         setKamPerformance(data);
//         setUserRole(response.user_role || userRole);

//         // Store totals from response
//         if (response.totals) {
//           setTotals(response.totals);
//         }
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setLoading(false);
//     };

//     fetchData();
//   }, [startMonth, endMonth, startYear, endYear, quarters, quarterYear, kamFilter, clientTypeFilter, viewMode, filterType, divisionFilter]); // ✅ Add filterType and divisionFilter to dependencies

//   // ✅ UPDATED: Generate periods for table - handles all view modes including MULTIPLE quarters
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'quarterly') {
//       // ✅ UPDATED: Generate period for EACH selected quarter
//       quarters.forEach((q) => {
//         periods.push({
//           quarter: q,
//           year: quarterYear,
//           label: `Q${q} ${quarterYear}`,
//         });
//       });

//     } else if (viewMode === 'yearly') {
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       for (let y = sYear; y <= eYear; y++) {
//         periods.push({ year: y, label: `${y}` });
//       }

//     } else {
//       // Monthly
//       const sYear = parseInt(startYear);
//       const eYear = parseInt(endYear);
//       const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//       const eMonth = MONTHS_ARRAY.indexOf(endMonth);

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
//     }

//     return periods;
//   }, [viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

//   // ✅ Prepare trend data for chart
//   const trendData = useMemo(() => {
//     return tablePeriods.map((period) => {
//       let totalVoucher = 0;
//       let totalSelf = 0;
//       let totalTransferred = 0;

//       kamPerformance.forEach((k) => {
//         let periodKey: string;

//         if (viewMode === 'quarterly') {
//           // ✅ For quarterly: match by quarter
//           periodKey = `Q${k.voucher_quarter} ${k.voucher_year}`;
//         } else if (viewMode === 'yearly') {
//           periodKey = `${k.voucher_year}`;
//         } else {
//           // Monthly
//           periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
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
//       // ✅ Use branch_name when filterType is 'branch', otherwise use current_supervisor
//       const key = filterType === 'branch' ? row.branch_name : row.current_supervisor;
      
//       if (!kamMap[key]) {
//         kamMap[key] = 0;
//       }
//       kamMap[key] += Number(row.total_voucher_amount || 0);
//     });

//     return Object.entries(kamMap)
//       .map(([name, total]: any) => ({ name, total }))
//       .sort((a, b) => b.total - a.total);
//   }, [kamPerformance, filterType]);

//   const topPerformersbyPercentage = useMemo(() => {
//     const kamMap: any = {};

//     kamPerformance.forEach((row) => {
//       // ✅ Use branch_name when filterType is 'branch', otherwise use current_supervisor
//       const kamName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

//       if (!kamMap[kamName]) {
//         kamMap[kamName] = {
//           name: kamName,
//           totalAchieved: 0,
//           totalTarget: 0,
//         };
//       }

//       kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
//       kamMap[kamName].totalTarget += Number(row.target_amount || 0);
//     });

//     return Object.values(kamMap)
//       .map((kam: any) => ({
//         name: kam.name,
//         rangeAchievedSum: kam.totalAchieved,
//         rangeTargetSum: kam.totalTarget,
//         percentage: kam.totalTarget > 0 ? (kam.totalAchieved / kam.totalTarget) * 100 : 0,
//       }))
//       .sort((a, b) => b.percentage - a.percentage);
//   }, [kamPerformance, filterType]);

//   // ✅ UPDATED: Generate label for top performers based on view mode
//   const topPerformerRangeLabel = useMemo(() => {
//     if (viewMode === 'quarterly') {
//       // ✅ Show all selected quarters
//       if (quarters.length === 1) {
//         return `Q${quarters[0]} ${quarterYear}`;
//       } else {
//         return `Q${quarters.join(', Q')} ${quarterYear}`;
//       }
//     } else if (viewMode === 'yearly') {
//       if (startYear === endYear) {
//         return `${startYear}`;
//       }
//       return `${startYear} – ${endYear}`;
//     } else {
//       // Monthly
//       if (startMonth === endMonth && startYear === endYear) {
//         return `${startMonth} ${startYear}`;
//       }
//       return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
//     }
//   }, [viewMode, quarters, quarterYear, startMonth, endMonth, startYear, endYear]);

//   // Render different UI based on user role
//   const isKamRole = userRole === 'kam';
//   const isSupervisorRole = userRole === 'supervisor';

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">
//             {filterType === 'branch' ? 'Branch Performance' : 'KAM Performance'}
//           </h1>
//           <p className="text-sm text-muted-foreground">
//             Detailed breakdown of client invoice performance
//             {isKamRole && ' - Your personal data'}
//             {isSupervisorRole && ' - Your team data'}
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {hasFilters && !isKamRole && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearFilters}
//               className="text-destructive hover:text-destructive hover:bg-destructive/10"
//             >
//               <X className="h-4 w-4 mr-2" /> Reset
//             </Button>
//           )}

//           {!isKamRole && (
//             <KAMFilterDrawer
//               filterType={filterType}              // ✅ ADD THIS
//               setFilterType={setFilterType}        // ✅ ADD THIS
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={kamFilter}
//               setKam={setKamFilter}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={kams}
//               setKams={setKams}
//               viewMode={viewMode}
//               setViewMode={setViewMode}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               quarters={quarters}
//               setQuarters={setQuarters}
//               quarterYear={quarterYear}
//               setQuarterYear={setQuarterYear}
//               onFilterChange={() => setSelectedKamId(null)}
//               userRole={userRole}
//             />
//           )}
//         </div>
//       </div>

//       {/* Show info badge for KAM role */}
//       {isKamRole && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-blue-900">
//             You are viewing your personal performance data only. Most filters are disabled for security.
//           </p>
//         </div>
//       )}

//       {/* Show info badge for supervisor role */}
//       {isSupervisorRole && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//           <p className="text-sm font-medium text-green-900">
//             You are viewing data for the KAMs under your supervision.
//           </p>
//         </div>
//       )}

//       {/* TABLE */}
//       <KAMPerformanceTable
//         sales={kamPerformance}
//         dateRangeType={viewMode}
//         startMonth={startMonth}
//         endMonth={endMonth}
//         startYear={startYear}
//         endYear={endYear}
//         quarters={quarters}
//         quarterYear={quarterYear}
//         tablePeriods={tablePeriods}
//         loading={loading}
//       />

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* TOP PERFORMERS */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
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
//                     onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <div
//                         className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                           idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                         }`}
//                       >
//                         {idx + 1}
//                       </div>

//                       <div className="truncate">
//                         <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                       </div>
//                     </div>

//                     <div className="text-right shrink-0 ml-2">
//                       <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* TOP PERFORMERS by Achieve Percentage */}
//         <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
//           <CardHeader className="border-b bg-muted/5 shrink-0">
//             <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-primary" />
//                 <span>Top Achievers</span>
//               </div>
//               <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
//                 {topPerformerRangeLabel}
//               </span>
//             </CardTitle>
//           </CardHeader>

//           <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
//             {topPerformersbyPercentage.length === 0 ? (
//               <div className="flex items-center justify-center h-full text-muted-foreground">
//                 No data available
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {topPerformersbyPercentage.map((kam, idx) => {
//                   const achievePercentage =
//                     kam.rangeTargetSum > 0
//                       ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1)
//                       : '0.0';

//                   return (
//                     <div
//                       key={kam.name}
//                       className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
//                         selectedKamId === kam.name
//                           ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/20'
//                           : 'hover:bg-muted/50 border-transparent'
//                       }`}
//                       onClick={() =>
//                         setSelectedKamId(selectedKamId === kam.name ? null : kam.name)
//                       }
//                     >
//                       <div className="flex items-center gap-3">
//                         <div
//                           className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
//                             idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
//                           }`}
//                         >
//                           {idx + 1}
//                         </div>

//                         <div className="truncate">
//                           <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 shrink-0 ml-2">
//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Target</p>
//                           <p className="text-xs font-medium text-slate-600">
//                             {formatCurrency(kam.rangeTargetSum)}
//                           </p>
//                         </div>

//                         <div className="text-right">
//                           <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               kam.rangeAchievedSum >= kam.rangeTargetSum
//                                 ? 'text-emerald-700'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {formatCurrency(kam.rangeAchievedSum)}
//                           </p>
//                         </div>

//                         <div className="text-right min-w-[50px]">
//                           <p className="text-[10px] text-muted-foreground uppercase">%</p>
//                           <p
//                             className={`text-xs font-bold ${
//                               parseFloat(achievePercentage) >= 100
//                                 ? 'text-emerald-700'
//                                 : parseFloat(achievePercentage) >= 75
//                                 ? 'text-amber-600'
//                                 : 'text-destructive'
//                             }`}
//                           >
//                             {achievePercentage}%
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
//         {/* LINE CHART */}
//         <Card className="lg:col-span-2 shadow-sm border-muted/60 flex flex-col h-[520px]">
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
//                 <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     axisLine={false}
//                     tickLine={false}
//                     tick={<CustomXAxisTick />}
//                     angle={-45}
//                     height={100}
//                     interval={0}
//                   />
//                   <YAxis
//                     axisLine={false}
//                     tickLine={false}
//                     tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
//                   />
//                   <Tooltip formatter={(value: any) => formatCurrency(value)} />
//                   <Legend
//                     verticalAlign="top"
//                     align="right"
//                     wrapperStyle={{ paddingBottom: '20px' }}
//                   />

//                   <Line
//                     type="monotone"
//                     dataKey="totalVoucher"
//                     name="Total Invoice"
//                     stroke="#3b82f6"
//                     strokeWidth={3}
//                     dot={{ r: 5 }}
//                     activeDot={{ r: 7 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalSelf"
//                     name="Self Invoice"
//                     stroke="#10b981"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="totalTransferred"
//                     name="Transferred Invoice"
//                     stroke="#f97316"
//                     strokeWidth={2}
//                     dot={{ r: 4 }}
//                     activeDot={{ r: 6 }}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }




// app/kam-performance/page.tsx
'use client';

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
import { KamPerformanceApi } from '@/api/kamPerformanceApi';

const MONTHS_ARRAY = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
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
  const [userRole, setUserRole] = useState<string>('super_admin');
  const [totals, setTotals] = useState<any>(null);

  // Get last month as default
  const getLastMonthDefaults = () => {
    const now = new Date();
    const monthName = MONTHS_ARRAY[now.getMonth()];
    const year = now.getFullYear().toString();
    return { monthName, year };
  };

  const getCurrentQuarterDefaults = () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return { quarter: q, year: now.getFullYear().toString() };
  };

  const { monthName: defaultMonth, year: defaultYear } = getLastMonthDefaults();
  const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();

  // ✅ ADD filterType state
  const [filterType, setFilterType] = useState<'kam' | 'branch'>('kam');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [kamFilter, setKamFilter] = useState<string>('all');
  const [clientTypeFilter, setClientTypeFilter] = useState<string>('All Client');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

  // ✅ Monthly states
  const [startMonth, setStartMonth] = useState(defaultMonth);
  const [endMonth, setEndMonth] = useState(defaultMonth);
  const [startYear, setStartYear] = useState(defaultYear);
  const [endYear, setEndYear] = useState(defaultYear);

  // ✅ UPDATED: Quarterly states - MULTIPLE QUARTERS
  const [quarters, setQuarters] = useState<number[]>([defaultQuarter]);
  const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

  const hasFilters =
    divisionFilter !== 'all' || kamFilter !== 'all' || clientTypeFilter !== 'All Client' || filterType !== 'kam';

  const clearFilters = () => {
    setFilterType('kam'); // ✅ Reset filterType
    setDivisionFilter('all');
    setKamFilter('all');
    setClientTypeFilter('All Client');
    setSelectedKamId(null);
    setViewMode('monthly');
    setStartMonth(defaultMonth);
    setEndMonth(defaultMonth);
    setStartYear(defaultYear);
    setEndYear(defaultYear);
    setQuarters([defaultQuarter]);
    setQuarterYear(defaultQuarterYear);
  };

  // Fetch KAMs from backend with role-based filtering
  useEffect(() => {
    const fetchKams = async () => {
      setKamLoading(true);
      try {
        const response = await KamPerformanceApi.getKams();
        const data = response.data?.data || response.data || [];
        setKams(data);
        setUserRole(response.data?.user_role || 'super_admin');

        // For KAM role, auto-select their KAM
        if (response.data?.user_role === 'kam' && data.length > 0) {
          setKamFilter(String(data[0].kam_id));
        }
      } catch (err) {
        console.error('Error fetching KAMs:', err);
        setKams([]);
      }
      setKamLoading(false);
    };

    fetchKams();
  }, []);

  // ✅ Fetch data from API with proper view mode handling
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let params: any = {
          filter_type: filterType, // ✅ ADD THIS - Send filter_type to backend
          client_type: clientTypeFilter,
          search: kamFilter !== 'all' ? kamFilter : undefined,
          view_mode: viewMode,
          per_page: 1000,
        };

        // ✅ ADD division parameter when filterType is 'branch'
        if (filterType === 'branch' && divisionFilter !== 'all') {
          params.division = divisionFilter;
        }

        // ✅ Set date range based on view mode
        if (viewMode === 'quarterly') {
          // ✅ UPDATED: Send multiple quarters
          params.quarters = quarters.join(',');  // Convert [3, 4] to "3,4"
          params.quarter_year = quarterYear;
          
          // Calculate actual dates for first and last quarter
          const firstQuarter = quarters[0];
          const lastQuarter = quarters[quarters.length - 1];
          
          const startMonth = (firstQuarter - 1) * 3 + 1;
          const endMonth = lastQuarter * 3;
          
          params.start_date = `${quarterYear}-${String(startMonth).padStart(2, '0')}-01`;
          params.end_date = `${quarterYear}-${String(endMonth).padStart(2, '0')}-31`;

        } else if (viewMode === 'yearly') {
          params.start_date = `${startYear}-01-01`;
          params.end_date = `${endYear}-12-31`;

        } else {
          // Monthly
          params.start_date = `${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`;
          params.end_date = `${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-31`;
        }

        const response = await KamPerformanceApi.getKamUsersRevenue(params);

        const data = response.data || response || [];
        setKamPerformance(data);
        setUserRole(response.user_role || userRole);

        // Store totals from response
        if (response.totals) {
          setTotals(response.totals);
        }
      } catch (err) {
        console.error('Error fetching KAM performance:', err);
        setKamPerformance([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [startMonth, endMonth, startYear, endYear, quarters, quarterYear, kamFilter, clientTypeFilter, viewMode, filterType, divisionFilter]); // ✅ Add filterType and divisionFilter to dependencies

  // ✅ UPDATED: Generate periods for table - handles all view modes including MULTIPLE quarters
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];

    if (viewMode === 'quarterly') {
      // ✅ UPDATED: Generate period for EACH selected quarter
      quarters.forEach((q) => {
        periods.push({
          quarter: q,
          year: quarterYear,
          label: `Q${q} ${quarterYear}`,
        });
      });

    } else if (viewMode === 'yearly') {
      const sYear = parseInt(startYear);
      const eYear = parseInt(endYear);
      for (let y = sYear; y <= eYear; y++) {
        periods.push({ year: y, label: `${y}` });
      }

    } else {
      // Monthly
      const sYear = parseInt(startYear);
      const eYear = parseInt(endYear);
      const sMonth = MONTHS_ARRAY.indexOf(startMonth);
      const eMonth = MONTHS_ARRAY.indexOf(endMonth);

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
    }

    return periods;
  }, [viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

  // ✅ Prepare trend data for chart
  const trendData = useMemo(() => {
    return tablePeriods.map((period) => {
      let totalVoucher = 0;
      let totalSelf = 0;
      let totalTransferred = 0;

      kamPerformance.forEach((k) => {
        let periodKey: string;

        if (viewMode === 'quarterly') {
          // ✅ For quarterly: match by quarter
          periodKey = `Q${k.voucher_quarter} ${k.voucher_year}`;
        } else if (viewMode === 'yearly') {
          periodKey = `${k.voucher_year}`;
        } else {
          // Monthly
          periodKey = `${MONTHS_ARRAY[k.voucher_month_number - 1]} ${k.voucher_year}`;
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
      // ✅ Use branch_name when filterType is 'branch', otherwise use current_supervisor
      const key = filterType === 'branch' ? row.branch_name : row.current_supervisor;
      
      if (!kamMap[key]) {
        kamMap[key] = 0;
      }
      kamMap[key] += Number(row.total_voucher_amount || 0);
    });

    return Object.entries(kamMap)
      .map(([name, total]: any) => ({ name, total }))
      .sort((a, b) => b.total - a.total);
  }, [kamPerformance, filterType]);

  const topPerformersbyPercentage = useMemo(() => {
    const kamMap: any = {};

    kamPerformance.forEach((row) => {
      // ✅ Use branch_name when filterType is 'branch', otherwise use current_supervisor
      const kamName = filterType === 'branch' ? row.branch_name : row.current_supervisor;

      if (!kamMap[kamName]) {
        kamMap[kamName] = {
          name: kamName,
          totalAchieved: 0,
          totalTarget: 0,
        };
      }

      kamMap[kamName].totalAchieved += Number(row.total_voucher_amount || 0);
      kamMap[kamName].totalTarget += Number(row.target_amount || 0);
    });

    return Object.values(kamMap)
      .map((kam: any) => ({
        name: kam.name,
        rangeAchievedSum: kam.totalAchieved,
        rangeTargetSum: kam.totalTarget,
        percentage: kam.totalTarget > 0 ? (kam.totalAchieved / kam.totalTarget) * 100 : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [kamPerformance, filterType]);

  // ✅ UPDATED: Generate label for top performers based on view mode
  const topPerformerRangeLabel = useMemo(() => {
    if (viewMode === 'quarterly') {
      // ✅ Show all selected quarters
      if (quarters.length === 1) {
        return `Q${quarters[0]} ${quarterYear}`;
      } else {
        return `Q${quarters.join(', Q')} ${quarterYear}`;
      }
    } else if (viewMode === 'yearly') {
      if (startYear === endYear) {
        return `${startYear}`;
      }
      return `${startYear} – ${endYear}`;
    } else {
      // Monthly
      if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startYear}`;
      }
      return `${startMonth} ${startYear} – ${endMonth} ${endYear}`;
    }
  }, [viewMode, quarters, quarterYear, startMonth, endMonth, startYear, endYear]);

  // Render different UI based on user role
  const isKamRole = userRole === 'kam';
  const isSupervisorRole = userRole === 'supervisor';

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {filterType === 'branch' ? 'Branch Performance' : 'KAM Performance'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Detailed breakdown of client invoice performance
            {isKamRole && ' - Your personal data'}
            {isSupervisorRole && ' - Your team data'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasFilters && !isKamRole && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}

          {!isKamRole && (
            <KAMFilterDrawer
              filterType={filterType}              // ✅ ADD THIS
              setFilterType={setFilterType}        // ✅ ADD THIS
              division={divisionFilter}
              setDivision={setDivisionFilter}
              kam={kamFilter}
              setKam={setKamFilter}
              clientType={clientTypeFilter}
              setClientType={setClientTypeFilter}
              kams={kams}
              setKams={setKams}
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
              quarters={quarters}
              setQuarters={setQuarters}
              quarterYear={quarterYear}
              setQuarterYear={setQuarterYear}
              onFilterChange={() => setSelectedKamId(null)}
              userRole={userRole}
            />
          )}
        </div>
      </div>

      {/* Show info badge for KAM role */}
      {isKamRole && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">
            You are viewing your personal performance data only. Most filters are disabled for security.
          </p>
        </div>
      )}

      {/* Show info badge for supervisor role */}
      {isSupervisorRole && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900">
            You are viewing data for the KAMs under your supervision.
          </p>
        </div>
      )}

      {/* TABLE */}
      <KAMPerformanceTable
        sales={kamPerformance}
        dateRangeType={viewMode}
        startMonth={startMonth}
        endMonth={endMonth}
        startYear={startYear}
        endYear={endYear}
        quarters={quarters}
        quarterYear={quarterYear}
        tablePeriods={tablePeriods}
        loading={loading}
        filterType={filterType}  // ✅ Pass filterType to table
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onClick={() => setSelectedKamId(selectedKamId === kam.name ? null : kam.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold shrink-0 ${
                          idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="truncate">
                        <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-primary">{formatCurrency(kam.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TOP PERFORMERS by Achieve Percentage */}
        <Card className="lg:col-span-1 shadow-sm border-muted/60 flex flex-col h-[520px] overflow-hidden">
          <CardHeader className="border-b bg-muted/5 shrink-0">
            <CardTitle className="text-base font-medium flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Top Achievers</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted/40 px-2 py-1 rounded-md">
                {topPerformerRangeLabel}
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto pt-4 p-4 custom-scrollbar">
            {topPerformersbyPercentage.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="space-y-3">
                {topPerformersbyPercentage.map((kam, idx) => {
                  const achievePercentage =
                    kam.rangeTargetSum > 0
                      ? ((kam.rangeAchievedSum / kam.rangeTargetSum) * 100).toFixed(1)
                      : '0.0';

                  return (
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
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="truncate">
                          <p className="text-sm font-semibold text-slate-800 truncate">{kam.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase">Target</p>
                          <p className="text-xs font-medium text-slate-600">
                            {formatCurrency(kam.rangeTargetSum)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase">Achieve</p>
                          <p
                            className={`text-xs font-bold ${
                              kam.rangeAchievedSum >= kam.rangeTargetSum
                                ? 'text-emerald-700'
                                : 'text-destructive'
                            }`}
                          >
                            {formatCurrency(kam.rangeAchievedSum)}
                          </p>
                        </div>

                        <div className="text-right min-w-[50px]">
                          <p className="text-[10px] text-muted-foreground uppercase">%</p>
                          <p
                            className={`text-xs font-bold ${
                              parseFloat(achievePercentage) >= 100
                                ? 'text-emerald-700'
                                : parseFloat(achievePercentage) >= 75
                                ? 'text-amber-600'
                                : 'text-destructive'
                            }`}
                          >
                            {achievePercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                <LineChart data={trendData} margin={{ bottom: 60, left: 0, right: 0, top: 0 }}>
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
      </div>
    </div>
  );
}