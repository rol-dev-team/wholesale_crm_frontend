

// // src/pages/TargetsPage.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X, Filter } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import toast, { Toaster } from 'react-hot-toast';

// import { SalesTargetAPI } from '@/api/salesTarget';
// import { KAMService } from '@/services/kam';
// import { SupervisorService } from '@/services/supervisor';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import type { KAM } from '@/types/kam';
// import type { Supervisor } from '@/types/supervisor';
// // Authenticated user context
// import { useAuth } from '@/contexts/AuthContext';

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

// export default function TargetsPage() {
//   const { currentUser } = useAuth();
//   // console.log('Current User in TargetsPage:', currentUser);

//   const [targets, setTargets] = useState<any[]>([]);
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [apiKams, setApiKams] = useState<any[]>([]);

//   // Filters
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
//   const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
//   const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

//   const currentMonthLabel = `${startMonth} ${startYear}`;
//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setStartYear(new Date().getFullYear().toString());
//     setEndYear(new Date().getFullYear().toString());
//   };

//   // Modal state
//   // const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedDivisionId, setSelectedDivisionId] = useState('');
//   const [selectedDivisionName, setSelectedDivisionName] = useState('');
//   const [selectedSupervisor, setSelectedSupervisor] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');
//   const [targetMonthName, setTargetMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());

//   const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

//   const teamKams = useMemo(() => {
//     return kams.filter(
//       (k) =>
//         currentUser?.role === 'boss' ||
//         currentUser?.role === 'super_admin' ||
//         k.reportingTo === currentUser?.name
//     );
//   }, [kams, currentUser]);

//   const filteredTargets = useMemo(() => {
//     return targets.filter((t) => {
//       // Safety check: ensure t.target_month exists
//       if (!t.target_month) {
//         return false;
//       }

//       // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
//       let tYear: number;
//       let tMonth: number;

//       try {
//         const dateParts = t.target_month.split('-');
//         tYear = parseInt(dateParts[0]);
//         tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
//       } catch {
//         return false;
//       }

//       // Check if target falls within the selected date range
//       let isInDateRange = false;

//       if (startYear === endYear) {
//         // Same year: check if month is between startMonth and endMonth
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
//           isInDateRange = true;
//         }
//       } else {
//         // Different years: check if target is between date range
//         const sYear = parseInt(startYear);
//         const eYear = parseInt(endYear);
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (
//           (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
//           (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
//         ) {
//           isInDateRange = true;
//         }
//       }

//       return (
//         (divisionFilter === 'all' || t.division === divisionFilter) &&
//         (filterKam === 'all' || t.kam_id === filterKam) &&
//         isInDateRange
//       );
//     });
//   }, [targets, divisionFilter, filterKam, startMonth, endMonth, startYear, endYear]);

//   // Calculate summary stats from KAM Performance data
//   const summaryStats = useMemo(() => {
//     // Sum all achieved amounts from kamPerformance
//     const totalAchieved = kamPerformance.reduce((sum, kam) => {
//       return sum + Number(kam.total_voucher_amount || 0);
//     }, 0);

//     // Sum all target amounts from filteredTargets
//     // The API returns 'amount' field for the target value
//     const totalTarget = filteredTargets.reduce((sum, target) => {
//       return sum + Number(target.amount || 0);
//     }, 0);

//     // Calculate progress percentage
//     const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

//     return { 
//       totalTarget, 
//       totalAchieved, 
//       progress,
//     };
//   }, [kamPerformance, filteredTargets]);

//   useEffect(() => {
//     SupervisorService.getAll().then(setSupervisors);
//     KAMService.getAll().then(setKams);
    
//     // Fetch KAMs for filter
//     KamPerformanceApi.getKams()
//       .then((response) => {
//         const data = response.data?.data || response.data || [];
//         setApiKams(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching KAMs:', err);
//         setApiKams([]);
//       });

//     // Fetch all targets from API
//     SalesTargetAPI.getAll()
//       .then((response) => {
//         const data = response.data || response || [];
//         setTargets(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching targets:', err);
//         setTargets([]);
//       });
//   }, []);

//   // Fetch KAM Performance data
//   useEffect(() => {
//     const fetchKamPerformance = async () => {
//       setKamPerformanceLoading(true);
//       try {
//         const startDateObj = new Date(`${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`);
//         const endDateObj = new Date(`${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-28`);
        
//         const startDate = startDateObj.toISOString().split('T')[0];
//         const endDate = endDateObj.toISOString().split('T')[0];

//         const response = await KamPerformanceApi.getKamUsersRevenue({
//           start_date: startDate,
//           end_date: endDate,
//           client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
//           view_mode: 'monthly',
//           search: filterKam !== 'all' ? filterKam : undefined,
//           per_page: 1000,
//         });

//         const data = response.data || response || [];
//         setKamPerformance(data);
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setKamPerformanceLoading(false);
//     };

//     fetchKamPerformance();
//   }, [startMonth, endMonth, startYear, endYear, filterKam, clientTypeFilter]);

//   // Generate tablePeriods for KAMPerformanceTable - supports multiple months
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];
//     const sYear = parseInt(startYear);
//     const eYear = parseInt(endYear);
//     const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//     const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//     let year = sYear;
//     let month = sMonth;

//     while (year < eYear || (year === eYear && month <= eMonth)) {
//       periods.push({
//         month,
//         year,
//         label: `${MONTHS_ARRAY[month]} ${year}`,
//       });

//       month++;
//       if (month > 11) {
//         month = 0;
//         year++;
//       }
//     }

//     return periods;
//   }, [startMonth, endMonth, startYear, endYear]);

//   const handleSetTarget = async () => {
//     if (!selectedDivisionId || !selectedSupervisor || !selectedKam || !targetAmount) {
//       toast.error('Please fill all fields!');
//       return;
//     }

//     const monthIndex = MONTHS_ARRAY.indexOf(targetMonthName) + 1;
//     const targetMonth = `${targetYear}-${String(monthIndex).padStart(2, '0')}-01`;

//     let posted_by = 2;
//     if (currentUser?.role === 'super_admin') posted_by = 0;
//     else if (currentUser?.role === 'boss') posted_by = 1;

//     const payload = {
//       target_month: targetMonth,
//       division: selectedDivisionName,
//       division_id: Number(selectedDivisionId),
//       supervisor_id: Number(selectedSupervisor),
//       kam_id: Number(selectedKam),
//       amount: Number(targetAmount),
//       posted_by: Number(currentUser?.id),
//     };

//     setLoading(true);
//     const toastId = toast.loading('Saving target...');
//     try {
//       const response = await SalesTargetAPI.create(payload);
//       setTargets((prev) => [...prev, response]);
//       setIsTargetModalOpen(false);
//       toast.success('Target set successfully! 🎯', { id: toastId });
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to set target!', { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container space-y-6">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentMonthLabel}
//           </p>
//         </div>
//         <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
//           <Crosshair className="h-4 w-4 mr-2" /> Set Target
//         </Button>
//       </div>

//       {/* SUMMARY - ORIGINAL DESIGN */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Target <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1">
//                   {formatCurrency(summaryStats.totalTarget)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Overall Progress: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
//                 <Crosshair className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Achieved <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">
//                   {formatCurrency(summaryStats.totalAchieved)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Success Rate: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KAM PERFORMANCE SECTION */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">KAM Performance</h2>
//           <div className="flex justify-end items-center gap-2">
//             {hasFilters && (
//               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
//                 <X className="h-4 w-4 mr-2" /> Reset Filters
//               </Button>
//             )}
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={filterKam}
//               setKam={setFilterKam}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={apiKams}
//               dateRange="monthly"
//               setDateRange={() => {}}
//               viewMode="monthly"
//               setViewMode={() => {}}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               onFilterChange={() => {}}
//             />
//           </div>
//         </div>

//         {/* KAM PERFORMANCE TABLE */}
//         <KAMPerformanceTable
//           sales={kamPerformance}
//           dateRangeType="monthly"
//           startMonth={startMonth}
//           endMonth={endMonth}
//           startYear={startYear}
//           endYear={endYear}
//           tablePeriods={tablePeriods}
//           loading={kamPerformanceLoading}
//         />
//       </div>

//       {/* MODAL */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivisionId={selectedDivisionId}
//         setSelectedDivisionId={setSelectedDivisionId}
//         selectedDivisionName={selectedDivisionName}
//         setSelectedDivisionName={setSelectedDivisionName}
//         selectedSupervisor={selectedSupervisor}
//         setSelectedSupervisor={setSelectedSupervisor}
//         selectedKam={selectedKam}
//         setSelectedKam={setSelectedKam}
//         targetAmount={targetAmount}
//         setTargetAmount={setTargetAmount}
//         targetMonthName={targetMonthName}
//         setTargetMonthName={setTargetMonthName}
//         targetYear={targetYear}
//         setTargetYear={setTargetYear}
//         isManagement={isManagement}
//         onSave={handleSetTarget}
//       />
//     </div>
//   );
// }




// // src/pages/TargetsPage.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X, Filter } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import toast, { Toaster } from 'react-hot-toast';

// import { SalesTargetAPI } from '@/api/salesTarget';
// import { KAMService } from '@/services/kam';
// import { SupervisorService } from '@/services/supervisor';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import type { KAM } from '@/types/kam';
// import type { Supervisor } from '@/types/supervisor';
// // Authenticated user context
// import { useAuth } from '@/contexts/AuthContext';

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

// export default function TargetsPage() {
//   const { currentUser } = useAuth();
//   // console.log('Current User in TargetsPage:', currentUser);

//   const [targets, setTargets] = useState<any[]>([]);
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [apiKams, setApiKams] = useState<any[]>([]);

//   // Filters
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
//   const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
//   const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

//   const currentMonthLabel = `${startMonth} ${startYear}`;
//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setStartYear(new Date().getFullYear().toString());
//     setEndYear(new Date().getFullYear().toString());
//   };

//   // Modal state
//   // const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedDivisionId, setSelectedDivisionId] = useState('');
//   const [selectedDivisionName, setSelectedDivisionName] = useState('');
//   const [selectedSupervisor, setSelectedSupervisor] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');
//   const [targetMonthName, setTargetMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());
//   const [targetQuarter, setTargetQuarter] = useState<number | null>(null);

//   const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

//   const teamKams = useMemo(() => {
//     return kams.filter(
//       (k) =>
//         currentUser?.role === 'boss' ||
//         currentUser?.role === 'super_admin' ||
//         k.reportingTo === currentUser?.name
//     );
//   }, [kams, currentUser]);

//   const filteredTargets = useMemo(() => {
//     return targets.filter((t) => {
//       // Safety check: ensure t.target_month exists
//       if (!t.target_month) {
//         return false;
//       }

//       // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
//       let tYear: number;
//       let tMonth: number;

//       try {
//         const dateParts = t.target_month.split('-');
//         tYear = parseInt(dateParts[0]);
//         tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
//       } catch {
//         return false;
//       }

//       // Check if target falls within the selected date range
//       let isInDateRange = false;

//       if (startYear === endYear) {
//         // Same year: check if month is between startMonth and endMonth
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
//           isInDateRange = true;
//         }
//       } else {
//         // Different years: check if target is between date range
//         const sYear = parseInt(startYear);
//         const eYear = parseInt(endYear);
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (
//           (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
//           (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
//         ) {
//           isInDateRange = true;
//         }
//       }

//       return (
//         (divisionFilter === 'all' || t.division === divisionFilter) &&
//         (filterKam === 'all' || t.kam_id === filterKam) &&
//         isInDateRange
//       );
//     });
//   }, [targets, divisionFilter, filterKam, startMonth, endMonth, startYear, endYear]);

//   // Calculate summary stats from KAM Performance data
//   const summaryStats = useMemo(() => {
//     // Sum all achieved amounts from kamPerformance
//     const totalAchieved = kamPerformance.reduce((sum, kam) => {
//       return sum + Number(kam.total_voucher_amount || 0);
//     }, 0);

//     // Sum all target amounts from filteredTargets
//     // The API returns 'amount' field for the target value
//     const totalTarget = filteredTargets.reduce((sum, target) => {
//       return sum + Number(target.amount || 0);
//     }, 0);

//     // Calculate progress percentage
//     const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

//     return { 
//       totalTarget, 
//       totalAchieved, 
//       progress,
//     };
//   }, [kamPerformance, filteredTargets]);

//   useEffect(() => {
//     SupervisorService.getAll().then(setSupervisors);
//     KAMService.getAll().then(setKams);
    
//     // Fetch KAMs for filter
//     KamPerformanceApi.getKams()
//       .then((response) => {
//         const data = response.data?.data || response.data || [];
//         setApiKams(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching KAMs:', err);
//         setApiKams([]);
//       });

//     // Fetch all targets from API
//     SalesTargetAPI.getAll()
//       .then((response) => {
//         const data = response.data || response || [];
//         setTargets(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching targets:', err);
//         setTargets([]);
//       });
//   }, []);

//   // Fetch KAM Performance data
//   useEffect(() => {
//     const fetchKamPerformance = async () => {
//       setKamPerformanceLoading(true);
//       try {
//         const startDateObj = new Date(`${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`);
//         const endDateObj = new Date(`${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-28`);
        
//         const startDate = startDateObj.toISOString().split('T')[0];
//         const endDate = endDateObj.toISOString().split('T')[0];

//         const response = await KamPerformanceApi.getKamUsersRevenue({
//           start_date: startDate,
//           end_date: endDate,
//           client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
//           view_mode: 'monthly',
//           search: filterKam !== 'all' ? filterKam : undefined,
//           per_page: 1000,
//         });

//         const data = response.data || response || [];
//         setKamPerformance(data);
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setKamPerformanceLoading(false);
//     };

//     fetchKamPerformance();
//   }, [startMonth, endMonth, startYear, endYear, filterKam, clientTypeFilter]);

//   // Generate tablePeriods for KAMPerformanceTable - supports multiple months
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];
//     const sYear = parseInt(startYear);
//     const eYear = parseInt(endYear);
//     const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//     const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//     let year = sYear;
//     let month = sMonth;

//     while (year < eYear || (year === eYear && month <= eMonth)) {
//       periods.push({
//         month,
//         year,
//         label: `${MONTHS_ARRAY[month]} ${year}`,
//       });

//       month++;
//       if (month > 11) {
//         month = 0;
//         year++;
//       }
//     }

//     return periods;
//   }, [startMonth, endMonth, startYear, endYear]);

//   const handleSetTarget = async () => {
//     if (!selectedDivisionId || !selectedSupervisor || !selectedKam || !targetAmount) {
//       toast.error('Please fill all fields!');
//       return;
//     }

//     const monthIndex = MONTHS_ARRAY.indexOf(targetMonthName) + 1;
//     const targetMonth = `${targetYear}-${String(monthIndex).padStart(2, '0')}-01`;

//     let posted_by = 2;
//     if (currentUser?.role === 'super_admin') posted_by = 0;
//     else if (currentUser?.role === 'boss') posted_by = 1;

//     const payload = {
//       target_month: targetMonth,
//       division: selectedDivisionName,
//       division_id: Number(selectedDivisionId),
//       supervisor_id: Number(selectedSupervisor),
//       kam_id: Number(selectedKam),
//       amount: Number(targetAmount),
//       posted_by: Number(currentUser?.id),
//     };

//     setLoading(true);
//     const toastId = toast.loading('Saving target...');
//     try {
//       const response = await SalesTargetAPI.create(payload);
//       setTargets((prev) => [...prev, response]);
//       setIsTargetModalOpen(false);
//       toast.success('Target set successfully! 🎯', { id: toastId });
//     } catch (err) {
//       console.error(err);
//       toast.error('Failed to set target!', { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container space-y-6">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentMonthLabel}
//           </p>
//         </div>
//         <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
//           <Crosshair className="h-4 w-4 mr-2" /> Set Target
//         </Button>
//       </div>

//       {/* SUMMARY - ORIGINAL DESIGN */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Target <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1">
//                   {formatCurrency(summaryStats.totalTarget)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Overall Progress: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
//                 <Crosshair className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Achieved <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">
//                   {formatCurrency(summaryStats.totalAchieved)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Success Rate: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KAM PERFORMANCE SECTION */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">KAM Performance</h2>
//           <div className="flex justify-end items-center gap-2">
//             {hasFilters && (
//               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
//                 <X className="h-4 w-4 mr-2" /> Reset Filters
//               </Button>
//             )}
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={filterKam}
//               setKam={setFilterKam}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={apiKams}
//               dateRange="monthly"
//               setDateRange={() => {}}
//               viewMode="monthly"
//               setViewMode={() => {}}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               onFilterChange={() => {}}
//             />
//           </div>
//         </div>

//         {/* KAM PERFORMANCE TABLE */}
//         <KAMPerformanceTable
//           sales={kamPerformance}
//           dateRangeType="monthly"
//           startMonth={startMonth}
//           endMonth={endMonth}
//           startYear={startYear}
//           endYear={endYear}
//           tablePeriods={tablePeriods}
//           loading={kamPerformanceLoading}
//         />
//       </div>

//       {/* MODAL */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivisionId={selectedDivisionId}
//         setSelectedDivisionId={setSelectedDivisionId}
//         selectedDivisionName={selectedDivisionName}
//         setSelectedDivisionName={setSelectedDivisionName}
//         selectedSupervisor={selectedSupervisor}
//         setSelectedSupervisor={setSelectedSupervisor}
//         selectedKam={selectedKam}
//         setSelectedKam={setSelectedKam}
//         targetAmount={targetAmount}
//         setTargetAmount={setTargetAmount}
//         targetMonthName={targetMonthName}
//         setTargetMonthName={setTargetMonthName}
//         targetQuarter={targetQuarter}           // <--- add this
//         setTargetQuarter={setTargetQuarter}     // <--- add this
//         targetYear={targetYear}
//         setTargetYear={setTargetYear}
//         isManagement={isManagement}
//         onSave={handleSetTarget}
//       />
//     </div>
//   );
// }






// // src/pages/TargetsPage.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X, Filter } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import toast, { Toaster } from 'react-hot-toast';

// import { SalesTargetAPI } from '@/api/salesTarget';
// import { KAMService } from '@/services/kam';
// import { SupervisorService } from '@/services/supervisor';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import type { KAM } from '@/types/kam';
// import type { Supervisor } from '@/types/supervisor';
// // Authenticated user context
// import { useAuth } from '@/contexts/AuthContext';

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

// export default function TargetsPage() {
//   const { currentUser } = useAuth();
//   // console.log('Current User in TargetsPage:', currentUser);

//   const [targets, setTargets] = useState<any[]>([]);
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [apiKams, setApiKams] = useState<any[]>([]);

//   // Filters
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
//   const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
//   const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

//   const currentMonthLabel = `${startMonth} ${startYear}`;
//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setStartYear(new Date().getFullYear().toString());
//     setEndYear(new Date().getFullYear().toString());
//   };

//   // Modal state
//   const [selectedDivisionId, setSelectedDivisionId] = useState('');
//   const [selectedDivisionName, setSelectedDivisionName] = useState('');
//   const [selectedSupervisor, setSelectedSupervisor] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');

//   const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

//   const teamKams = useMemo(() => {
//     return kams.filter(
//       (k) =>
//         currentUser?.role === 'boss' ||
//         currentUser?.role === 'super_admin' ||
//         k.reportingTo === currentUser?.name
//     );
//   }, [kams, currentUser]);

//   const filteredTargets = useMemo(() => {
//     return targets.filter((t) => {
//       // Safety check: ensure t.target_month exists
//       if (!t.target_month) {
//         return false;
//       }

//       // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
//       let tYear: number;
//       let tMonth: number;

//       try {
//         const dateParts = t.target_month.split('-');
//         tYear = parseInt(dateParts[0]);
//         tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
//       } catch {
//         return false;
//       }

//       // Check if target falls within the selected date range
//       let isInDateRange = false;

//       if (startYear === endYear) {
//         // Same year: check if month is between startMonth and endMonth
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
//           isInDateRange = true;
//         }
//       } else {
//         // Different years: check if target is between date range
//         const sYear = parseInt(startYear);
//         const eYear = parseInt(endYear);
//         const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//         const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//         if (
//           (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
//           (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
//         ) {
//           isInDateRange = true;
//         }
//       }

//       return (
//         (divisionFilter === 'all' || t.division === divisionFilter) &&
//         (filterKam === 'all' || t.kam_id === filterKam) &&
//         isInDateRange
//       );
//     });
//   }, [targets, divisionFilter, filterKam, startMonth, endMonth, startYear, endYear]);

//   // Calculate summary stats from KAM Performance data
//   const summaryStats = useMemo(() => {
//     // Sum all achieved amounts from kamPerformance
//     const totalAchieved = kamPerformance.reduce((sum, kam) => {
//       return sum + Number(kam.total_voucher_amount || 0);
//     }, 0);

//     // Sum all target amounts from filteredTargets
//     // The API returns 'amount' field for the target value
//     const totalTarget = filteredTargets.reduce((sum, target) => {
//       return sum + Number(target.amount || 0);
//     }, 0);

//     // Calculate progress percentage
//     const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

//     return { 
//       totalTarget, 
//       totalAchieved, 
//       progress,
//     };
//   }, [kamPerformance, filteredTargets]);

//   useEffect(() => {
//     SupervisorService.getAll().then(setSupervisors);
//     KAMService.getAll().then(setKams);
    
//     // Fetch KAMs for filter
//     KamPerformanceApi.getKams()
//       .then((response) => {
//         const data = response.data?.data || response.data || [];
//         setApiKams(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching KAMs:', err);
//         setApiKams([]);
//       });

//     // Fetch all targets from API
//     SalesTargetAPI.getAll()
//       .then((response) => {
//         const data = response.data || response || [];
//         setTargets(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching targets:', err);
//         setTargets([]);
//       });
//   }, []);

//   // Fetch KAM Performance data
//   useEffect(() => {
//     const fetchKamPerformance = async () => {
//       setKamPerformanceLoading(true);
//       try {
//         const startDateObj = new Date(`${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`);
//         const endDateObj = new Date(`${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-28`);
        
//         const startDate = startDateObj.toISOString().split('T')[0];
//         const endDate = endDateObj.toISOString().split('T')[0];

//         const response = await KamPerformanceApi.getKamUsersRevenue({
//           start_date: startDate,
//           end_date: endDate,
//           client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
//           view_mode: 'monthly',
//           search: filterKam !== 'all' ? filterKam : undefined,
//           per_page: 1000,
//         });

//         const data = response.data || response || [];
//         setKamPerformance(data);
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setKamPerformanceLoading(false);
//     };

//     fetchKamPerformance();
//   }, [startMonth, endMonth, startYear, endYear, filterKam, clientTypeFilter]);

//   // Generate tablePeriods for KAMPerformanceTable - supports multiple months
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];
//     const sYear = parseInt(startYear);
//     const eYear = parseInt(endYear);
//     const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//     const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//     let year = sYear;
//     let month = sMonth;

//     while (year < eYear || (year === eYear && month <= eMonth)) {
//       periods.push({
//         month,
//         year,
//         label: `${MONTHS_ARRAY[month]} ${year}`,
//       });

//       month++;
//       if (month > 11) {
//         month = 0;
//         year++;
//       }
//     }

//     return periods;
//   }, [startMonth, endMonth, startYear, endYear]);

//   // ✅ UPDATED: handleSetTarget now receives the full payload from modal
//   const handleSetTarget = async (payload: any) => {
//     // Validate required fields
//     if (!payload.kam_id || !payload.amount || !payload.target_month) {
//       toast.error('Please fill all required fields!');
//       return;
//     }

//     // ✅ Add posted_by to payload
//     const finalPayload = {
//       ...payload,
//       posted_by: currentUser?.id || 0,
//       division: selectedDivisionName || payload.division,
//     };

//     console.log('✅ FINAL PAYLOAD TO SEND:', finalPayload);

//     setLoading(true);
//     const toastId = toast.loading('Saving target...');
//     try {
//       const response = await SalesTargetAPI.create(finalPayload);
//       setTargets((prev) => [...prev, response.data]);
//       setIsTargetModalOpen(false);
      
//       // Reset modal fields
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
      
//       toast.success('Target set successfully! 🎯', { id: toastId });
//     } catch (err: any) {
//       console.error('Error:', err);
//       const errorMsg = err.response?.data?.message || 'Failed to set target!';
//       toast.error(errorMsg, { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container space-y-6">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentMonthLabel}
//           </p>
//         </div>
//         <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
//           <Crosshair className="h-4 w-4 mr-2" /> Set Target
//         </Button>
//       </div>

//       {/* SUMMARY - ORIGINAL DESIGN */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Target <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1">
//                   {formatCurrency(summaryStats.totalTarget)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Overall Progress: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
//                 <Crosshair className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Achieved <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">
//                   {formatCurrency(summaryStats.totalAchieved)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Success Rate: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KAM PERFORMANCE SECTION */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">KAM Performance</h2>
//           <div className="flex justify-end items-center gap-2">
//             {hasFilters && (
//               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
//                 <X className="h-4 w-4 mr-2" /> Reset Filters
//               </Button>
//             )}
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={filterKam}
//               setKam={setFilterKam}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={apiKams}
//               dateRange="monthly"
//               setDateRange={() => {}}
//               viewMode="monthly"
//               setViewMode={() => {}}
//               startMonth={startMonth}
//               setStartMonth={setStartMonth}
//               endMonth={endMonth}
//               setEndMonth={setEndMonth}
//               startYear={startYear}
//               setStartYear={setStartYear}
//               endYear={endYear}
//               setEndYear={setEndYear}
//               onFilterChange={() => {}}
//             />
//           </div>
//         </div>

//         {/* KAM PERFORMANCE TABLE */}
//         <KAMPerformanceTable
//           sales={kamPerformance}
//           dateRangeType="monthly"
//           startMonth={startMonth}
//           endMonth={endMonth}
//           startYear={startYear}
//           endYear={endYear}
//           tablePeriods={tablePeriods}
//           loading={kamPerformanceLoading}
//         />
//       </div>

//       {/* ✅ UPDATED MODAL - Now properly handles target_type */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivisionId={selectedDivisionId}
//         setSelectedDivisionId={setSelectedDivisionId}
//         selectedDivisionName={selectedDivisionName}
//         setSelectedDivisionName={setSelectedDivisionName}
//         selectedSupervisor={selectedSupervisor}
//         setSelectedSupervisor={setSelectedSupervisor}
//         selectedKam={selectedKam}
//         setSelectedKam={setSelectedKam}
//         targetAmount={targetAmount}
//         setTargetAmount={setTargetAmount}
//         isManagement={isManagement}
//         onSave={handleSetTarget}
//       />
//     </div>
//   );
// }








// // src/pages/TargetsPage.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X, Filter } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import toast, { Toaster } from 'react-hot-toast';

// import { SalesTargetAPI } from '@/api/salesTarget';
// import { KAMService } from '@/services/kam';
// import { SupervisorService } from '@/services/supervisor';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import type { KAM } from '@/types/kam';
// import type { Supervisor } from '@/types/supervisor';
// // Authenticated user context
// import { useAuth } from '@/contexts/AuthContext';

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

// export default function TargetsPage() {
//   const { currentUser } = useAuth();

//   const [targets, setTargets] = useState<any[]>([]);
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [apiKams, setApiKams] = useState<any[]>([]);

//   // ✅ Filters - View Mode
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

//   // ✅ Monthly filters
//   const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
//   const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

//   // ✅ Quarterly filters
//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return { quarter: q, year: now.getFullYear().toString() };
//   };
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const [quarter, setQuarter] = useState<number>(defaultQuarter);
//   const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

//   // ✅ Generate label based on view mode
//   const currentPeriodLabel = useMemo(() => {
//     if (viewMode === 'quarterly') {
//       return `Q${quarter} ${quarterYear}`;
//     } else if (viewMode === 'yearly') {
//       return `${startYear}`;
//     } else {
//       return `${startMonth} ${startYear}`;
//     }
//   }, [viewMode, quarter, quarterYear, startMonth, startYear]);

//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setStartYear(new Date().getFullYear().toString());
//     setEndYear(new Date().getFullYear().toString());
//     setQuarter(defaultQuarter);
//     setQuarterYear(defaultQuarterYear);
//     setViewMode('monthly');
//   };

//   // Modal state
//   const [selectedDivisionId, setSelectedDivisionId] = useState('');
//   const [selectedDivisionName, setSelectedDivisionName] = useState('');
//   const [selectedSupervisor, setSelectedSupervisor] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');

//   const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

//   const teamKams = useMemo(() => {
//     return kams.filter(
//       (k) =>
//         currentUser?.role === 'boss' ||
//         currentUser?.role === 'super_admin' ||
//         k.reportingTo === currentUser?.name
//     );
//   }, [kams, currentUser]);

//   // ✅ UPDATED: filteredTargets now filters by view mode AND target_type
//   const filteredTargets = useMemo(() => {
//     return targets.filter((t) => {
//       // Safety check: ensure t.target_month exists
//       if (!t.target_month) {
//         return false;
//       }

//       // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
//       let tYear: number;
//       let tMonth: number;

//       try {
//         const dateParts = t.target_month.split('-');
//         tYear = parseInt(dateParts[0]);
//         tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
//       } catch {
//         return false;
//       }

//       // ✅ FILTER BY VIEW MODE AND target_type
//       let isInDateRange = false;
//       let isMatchingTargetType = false;

//       if (viewMode === 'quarterly') {
//         // ✅ QUARTERLY: ONLY show quarterly target_type
//         isMatchingTargetType = t.target_type === 'quarterly';
        
//         // Check if target's quarter matches selected quarter
//         const targetQuarter = Math.ceil((tMonth + 1) / 3);
//         const selectedQuarter = quarter;
//         isInDateRange = tYear === parseInt(quarterYear) && targetQuarter === selectedQuarter;

//       } else if (viewMode === 'yearly') {
//         // ✅ YEARLY: Sum ALL target types
//         isMatchingTargetType = true; // Accept all types for yearly
        
//         // Check if year matches
//         const sYear = parseInt(startYear);
//         const eYear = parseInt(endYear);
//         isInDateRange = tYear >= sYear && tYear <= eYear;

//       } else {
//         // ✅ MONTHLY: ONLY show monthly target_type
//         isMatchingTargetType = t.target_type === 'monthly';
        
//         // Check if month is in range
//         if (startYear === endYear) {
//           // Same year: check if month is between startMonth and endMonth
//           const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//           const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//           if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
//             isInDateRange = true;
//           }
//         } else {
//           // Different years: check if target is between date range
//           const sYear = parseInt(startYear);
//           const eYear = parseInt(endYear);
//           const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//           const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//           if (
//             (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
//             (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
//           ) {
//             isInDateRange = true;
//           }
//         }
//       }

//       return (
//         (divisionFilter === 'all' || t.division === divisionFilter) &&
//         (filterKam === 'all' || t.kam_id === filterKam) &&
//         isInDateRange &&
//         isMatchingTargetType
//       );
//     });
//   }, [targets, divisionFilter, filterKam, viewMode, startMonth, endMonth, startYear, endYear, quarter, quarterYear]);

//   // ✅ UPDATED: summaryStats now uses kamPerformance filtered by view mode
//   const summaryStats = useMemo(() => {
//     // Sum all achieved amounts from kamPerformance
//     const totalAchieved = kamPerformance.reduce((sum, kam) => {
//       return sum + Number(kam.total_voucher_amount || 0);
//     }, 0);

//     // ✅ Sum target amounts from filteredTargets (which respects view mode)
//     const totalTarget = filteredTargets.reduce((sum, target) => {
//       return sum + Number(target.amount || 0);
//     }, 0);

//     // Calculate progress percentage
//     const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

//     return { 
//       totalTarget, 
//       totalAchieved, 
//       progress,
//     };
//   }, [kamPerformance, filteredTargets]);

//   useEffect(() => {
//     SupervisorService.getAll().then(setSupervisors);
//     KAMService.getAll().then(setKams);
    
//     // Fetch KAMs for filter
//     KamPerformanceApi.getKams()
//       .then((response) => {
//         const data = response.data?.data || response.data || [];
//         setApiKams(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching KAMs:', err);
//         setApiKams([]);
//       });

//     // Fetch all targets from API
//     SalesTargetAPI.getAll()
//       .then((response) => {
//         const data = response.data || response || [];
//         setTargets(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching targets:', err);
//         setTargets([]);
//       });
//   }, []);

//   // ✅ Fetch KAM Performance data with view mode support
//   useEffect(() => {
//     const fetchKamPerformance = async () => {
//       setKamPerformanceLoading(true);
//       try {
//         let params: any = {
//           client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
//           view_mode: viewMode,
//           search: filterKam !== 'all' ? filterKam : undefined,
//           per_page: 1000,
//         };

//         // ✅ Set date range based on view mode
//         if (viewMode === 'quarterly') {
//           params.quarter = quarter;
//           params.quarter_year = quarterYear;
          
//           // Calculate actual dates for API
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
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setKamPerformanceLoading(false);
//     };

//     fetchKamPerformance();
//   }, [startMonth, endMonth, startYear, endYear, quarter, quarterYear, filterKam, clientTypeFilter, viewMode]);

//   // ✅ Generate tablePeriods based on view mode
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'quarterly') {
//       // ✅ For quarterly view: single quarter
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

//   const handleSetTarget = async (payload: any) => {
//     // Validate required fields
//     if (!payload.kam_id || !payload.amount || !payload.target_month) {
//       toast.error('Please fill all required fields!');
//       return;
//     }

//     // ✅ Add posted_by to payload
//     const finalPayload = {
//       ...payload,
//       posted_by: currentUser?.id || 0,
//       division: selectedDivisionName || payload.division,
//     };

//     console.log('✅ FINAL PAYLOAD TO SEND:', finalPayload);

//     setLoading(true);
//     const toastId = toast.loading('Saving target...');
//     try {
//       const response = await SalesTargetAPI.create(finalPayload);
//       setTargets((prev) => [...prev, response.data]);
//       setIsTargetModalOpen(false);
      
//       // Reset modal fields
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
      
//       toast.success('Target set successfully! 🎯', { id: toastId });
//     } catch (err: any) {
//       console.error('Error:', err);
//       const errorMsg = err.response?.data?.message || 'Failed to set target!';
//       toast.error(errorMsg, { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container space-y-6">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentPeriodLabel}
//           </p>
//         </div>
//         <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
//           <Crosshair className="h-4 w-4 mr-2" /> Set Target
//         </Button>
//       </div>

//       {/* SUMMARY - FILTERS BY VIEW MODE */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Target <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1">
//                   {formatCurrency(summaryStats.totalTarget)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Overall Progress: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
//                 <Crosshair className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Achieved <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">
//                   {formatCurrency(summaryStats.totalAchieved)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Success Rate: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KAM PERFORMANCE SECTION */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">KAM Performance</h2>
//           <div className="flex justify-end items-center gap-2">
//             {hasFilters && (
//               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
//                 <X className="h-4 w-4 mr-2" /> Reset Filters
//               </Button>
//             )}
//             {/* ✅ Updated KAMFilterDrawer with all params */}
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={filterKam}
//               setKam={setFilterKam}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={apiKams}
//               setKams={setApiKams}
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
//               onFilterChange={() => {}}
//             />
//           </div>
//         </div>

//         {/* ✅ KAM PERFORMANCE TABLE with quarterly support */}
//         <KAMPerformanceTable
//           sales={kamPerformance}
//           dateRangeType={viewMode}
//           startMonth={startMonth}
//           endMonth={endMonth}
//           startYear={startYear}
//           endYear={endYear}
//           quarter={quarter}
//           quarterYear={quarterYear}
//           tablePeriods={tablePeriods}
//           loading={kamPerformanceLoading}
//         />
//       </div>

//       {/* ✅ SET TARGET MODAL */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivisionId={selectedDivisionId}
//         setSelectedDivisionId={setSelectedDivisionId}
//         selectedDivisionName={selectedDivisionName}
//         setSelectedDivisionName={setSelectedDivisionName}
//         selectedSupervisor={selectedSupervisor}
//         setSelectedSupervisor={setSelectedSupervisor}
//         selectedKam={selectedKam}
//         setSelectedKam={setSelectedKam}
//         targetAmount={targetAmount}
//         setTargetAmount={setTargetAmount}
//         isManagement={isManagement}
//         onSave={handleSetTarget}
//       />
//     </div>
//   );
// }





// // src/pages/TargetsPage.tsx
// import React, { useState, useMemo, useEffect } from 'react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X, Filter } from 'lucide-react';
// import { formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
// import toast, { Toaster } from 'react-hot-toast';

// import { SalesTargetAPI } from '@/api/salesTarget';
// import { KAMService } from '@/services/kam';
// import { SupervisorService } from '@/services/supervisor';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import type { KAM } from '@/types/kam';
// import type { Supervisor } from '@/types/supervisor';
// // Authenticated user context
// import { useAuth } from '@/contexts/AuthContext';

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

// export default function TargetsPage() {
//   const { currentUser } = useAuth();

//   const [targets, setTargets] = useState<any[]>([]);
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
//   const [kamPerformance, setKamPerformance] = useState<any[]>([]);
//   const [apiKams, setApiKams] = useState<any[]>([]);

//   // ✅ Filters - View Mode
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
//   const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

//   // ✅ Monthly filters
//   const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
//   const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

//   // ✅ UPDATED: Quarterly filters - SUPPORT MULTIPLE QUARTERS
//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return { quarter: q, year: now.getFullYear().toString() };
//   };
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const [quarters, setQuarters] = useState<number[]>([defaultQuarter]);  // ✅ NOW AN ARRAY!
//   const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

//   // ✅ UPDATED: Generate label based on view mode - shows all quarters
//   const currentPeriodLabel = useMemo(() => {
//     if (viewMode === 'quarterly') {
//       if (quarters.length === 1) {
//         return `Q${quarters[0]} ${quarterYear}`;
//       } else {
//         return `Q${quarters.join(', Q')} ${quarterYear}`;  // "Q3, Q4 2026"
//       }
//     } else if (viewMode === 'yearly') {
//       return `${startYear}`;
//     } else {
//       return `${startMonth} ${startYear}`;
//     }
//   }, [viewMode, quarters, quarterYear, startMonth, startYear]);

//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
//     setStartYear(new Date().getFullYear().toString());
//     setEndYear(new Date().getFullYear().toString());
//     setQuarters([defaultQuarter]);  // ✅ Reset to array with default
//     setQuarterYear(defaultQuarterYear);
//     setViewMode('monthly');
//   };

//   // Modal state
//   const [selectedDivisionId, setSelectedDivisionId] = useState('');
//   const [selectedDivisionName, setSelectedDivisionName] = useState('');
//   const [selectedSupervisor, setSelectedSupervisor] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');

//   const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

//   const teamKams = useMemo(() => {
//     return kams.filter(
//       (k) =>
//         currentUser?.role === 'boss' ||
//         currentUser?.role === 'super_admin' ||
//         k.reportingTo === currentUser?.name
//     );
//   }, [kams, currentUser]);

//   // ✅ UPDATED: filteredTargets now filters by view mode AND target_type - supports MULTIPLE quarters
//   const filteredTargets = useMemo(() => {
//     return targets.filter((t) => {
//       // Safety check: ensure t.target_month exists
//       if (!t.target_month) {
//         return false;
//       }

//       // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
//       let tYear: number;
//       let tMonth: number;

//       try {
//         const dateParts = t.target_month.split('-');
//         tYear = parseInt(dateParts[0]);
//         tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
//       } catch {
//         return false;
//       }

//       // ✅ FILTER BY VIEW MODE AND target_type
//       let isInDateRange = false;
//       let isMatchingTargetType = false;

//       if (viewMode === 'quarterly') {
//         // ✅ QUARTERLY: ONLY show quarterly target_type
//         isMatchingTargetType = t.target_type === 'quarterly';
        
//         // ✅ UPDATED: Check if target's quarter is in selected quarters array
//         const targetQuarter = Math.ceil((tMonth + 1) / 3);
//         isInDateRange = tYear === parseInt(quarterYear) && quarters.includes(targetQuarter);

//       } else if (viewMode === 'yearly') {
//         // ✅ YEARLY: Sum ALL target types
//         isMatchingTargetType = true; // Accept all types for yearly
        
//         // Check if year matches
//         const sYear = parseInt(startYear);
//         const eYear = parseInt(endYear);
//         isInDateRange = tYear >= sYear && tYear <= eYear;

//       } else {
//         // ✅ MONTHLY: ONLY show monthly target_type
//         isMatchingTargetType = t.target_type === 'monthly';
        
//         // Check if month is in range
//         if (startYear === endYear) {
//           // Same year: check if month is between startMonth and endMonth
//           const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//           const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//           if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
//             isInDateRange = true;
//           }
//         } else {
//           // Different years: check if target is between date range
//           const sYear = parseInt(startYear);
//           const eYear = parseInt(endYear);
//           const sMonth = MONTHS_ARRAY.indexOf(startMonth);
//           const eMonth = MONTHS_ARRAY.indexOf(endMonth);

//           if (
//             (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
//             (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
//           ) {
//             isInDateRange = true;
//           }
//         }
//       }

//       return (
//         (divisionFilter === 'all' || t.division === divisionFilter) &&
//         (filterKam === 'all' || t.kam_id === filterKam) &&
//         isInDateRange &&
//         isMatchingTargetType
//       );
//     });
//   }, [targets, divisionFilter, filterKam, viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

//   // ✅ UPDATED: summaryStats now uses kamPerformance filtered by view mode
//   const summaryStats = useMemo(() => {
//     // Sum all achieved amounts from kamPerformance
//     const totalAchieved = kamPerformance.reduce((sum, kam) => {
//       return sum + Number(kam.total_voucher_amount || 0);
//     }, 0);

//     // ✅ Sum target amounts from filteredTargets (which respects view mode)
//     const totalTarget = filteredTargets.reduce((sum, target) => {
//       return sum + Number(target.amount || 0);
//     }, 0);

//     // Calculate progress percentage
//     const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

//     return { 
//       totalTarget, 
//       totalAchieved, 
//       progress,
//     };
//   }, [kamPerformance, filteredTargets]);

//   useEffect(() => {
//     SupervisorService.getAll().then(setSupervisors);
//     KAMService.getAll().then(setKams);
    
//     // Fetch KAMs for filter
//     KamPerformanceApi.getKams()
//       .then((response) => {
//         const data = response.data?.data || response.data || [];
//         setApiKams(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching KAMs:', err);
//         setApiKams([]);
//       });

//     // Fetch all targets from API
//     SalesTargetAPI.getAll()
//       .then((response) => {
//         const data = response.data || response || [];
//         setTargets(data);
//       })
//       .catch((err) => {
//         console.error('Error fetching targets:', err);
//         setTargets([]);
//       });
//   }, []);

//   // ✅ UPDATED: Fetch KAM Performance data with view mode support - handles MULTIPLE quarters
//   useEffect(() => {
//     const fetchKamPerformance = async () => {
//       setKamPerformanceLoading(true);
//       try {
//         let params: any = {
//           client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
//           view_mode: viewMode,
//           search: filterKam !== 'all' ? filterKam : undefined,
//           per_page: 1000,
//         };

//         // ✅ UPDATED: Set date range based on view mode - supports MULTIPLE quarters
//         if (viewMode === 'quarterly') {
//           // ✅ Send multiple quarters as comma-separated string
//           params.quarters = quarters.join(',');  // [3, 4] → "3,4"
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
//       } catch (err) {
//         console.error('Error fetching KAM performance:', err);
//         setKamPerformance([]);
//       }
//       setKamPerformanceLoading(false);
//     };

//     fetchKamPerformance();
//   }, [startMonth, endMonth, startYear, endYear, quarters, quarterYear, filterKam, clientTypeFilter, viewMode]);

//   // ✅ UPDATED: Generate tablePeriods based on view mode - generates ONE column per quarter
//   const tablePeriods = useMemo(() => {
//     const periods: any[] = [];

//     if (viewMode === 'quarterly') {
//       // ✅ UPDATED: Generate ONE period for EACH selected quarter
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

//   const handleSetTarget = async (payload: any) => {
//     // Validate required fields
//     if (!payload.kam_id || !payload.amount || !payload.target_month) {
//       toast.error('Please fill all required fields!');
//       return;
//     }

//     // ✅ Add posted_by to payload
//     const finalPayload = {
//       ...payload,
//       posted_by: currentUser?.id || 0,
//       division: selectedDivisionName || payload.division,
//     };

//     console.log('✅ FINAL PAYLOAD TO SEND:', finalPayload);

//     setLoading(true);
//     const toastId = toast.loading('Saving target...');
//     try {
//       const response = await SalesTargetAPI.create(finalPayload);
//       setTargets((prev) => [...prev, response.data]);
//       setIsTargetModalOpen(false);
      
//       // Reset modal fields
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
      
//       toast.success('Target set successfully! 🎯', { id: toastId });
//     } catch (err: any) {
//       console.error('Error:', err);
//       const errorMsg = err.response?.data?.message || 'Failed to set target!';
//       toast.error(errorMsg, { id: toastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="page-container space-y-6">
//       <Toaster position="top-right" reverseOrder={false} />

//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-bold">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentPeriodLabel}
//           </p>
//         </div>
//         <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
//           <Crosshair className="h-4 w-4 mr-2" /> Set Target
//         </Button>
//       </div>

//       {/* SUMMARY - FILTERS BY VIEW MODE */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Target <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1">
//                   {formatCurrency(summaryStats.totalTarget)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Overall Progress: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
//                 <Crosshair className="h-5 w-5 text-emerald-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">
//                   Total Achieved <span className="text-xs text-blue-600"></span>
//                 </p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">
//                   {formatCurrency(summaryStats.totalAchieved)}
//                 </p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Success Rate: {summaryStats.progress}%
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* KAM PERFORMANCE SECTION */}
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">KAM Performance</h2>
//           <div className="flex justify-end items-center gap-2">
//             {hasFilters && (
//               <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
//                 <X className="h-4 w-4 mr-2" /> Reset Filters
//               </Button>
//             )}
//             {/* ✅ UPDATED: KAMFilterDrawer with quarters array */}
//             <KAMFilterDrawer
//               division={divisionFilter}
//               setDivision={setDivisionFilter}
//               kam={filterKam}
//               setKam={setFilterKam}
//               clientType={clientTypeFilter}
//               setClientType={setClientTypeFilter}
//               kams={apiKams}
//               setKams={setApiKams}
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
//               onFilterChange={() => {}}
//             />
//           </div>
//         </div>

//         {/* ✅ UPDATED: KAM PERFORMANCE TABLE with quarters array support */}
//         <KAMPerformanceTable
//           sales={kamPerformance}
//           dateRangeType={viewMode}
//           startMonth={startMonth}
//           endMonth={endMonth}
//           startYear={startYear}
//           endYear={endYear}
//           quarters={quarters}                 // ✅ UPDATED: Pass quarters array
//           quarterYear={quarterYear}
//           tablePeriods={tablePeriods}
//           loading={kamPerformanceLoading}
//         />
//       </div>

//       {/* ✅ SET TARGET MODAL */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivisionId={selectedDivisionId}
//         setSelectedDivisionId={setSelectedDivisionId}
//         selectedDivisionName={selectedDivisionName}
//         setSelectedDivisionName={setSelectedDivisionName}
//         selectedSupervisor={selectedSupervisor}
//         setSelectedSupervisor={setSelectedSupervisor}
//         selectedKam={selectedKam}
//         setSelectedKam={setSelectedKam}
//         targetAmount={targetAmount}
//         setTargetAmount={setTargetAmount}
//         isManagement={isManagement}
//         onSave={handleSetTarget}
//       />
//     </div>
//   );
// }



// src/pages/TargetsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SetTargetModal from '@/components/target/SetTargetModal';
import { Crosshair, X, Filter } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';
import toast, { Toaster } from 'react-hot-toast';

import { SalesTargetAPI } from '@/api/salesTarget';
import { KAMService } from '@/services/kam';
import { SupervisorService } from '@/services/supervisor';
import { KamPerformanceApi } from '@/api/kamPerformanceApi';
import type { KAM } from '@/types/kam';
import type { Supervisor } from '@/types/supervisor';
// Authenticated user context
import { useAuth } from '@/contexts/AuthContext';

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

export default function TargetsPage() {
  const { currentUser } = useAuth();

  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState(false);
  const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
  const [kamPerformance, setKamPerformance] = useState<any[]>([]);
  const [apiKams, setApiKams] = useState<any[]>([]);

  // ✅ ADD filterType state
  const [filterType, setFilterType] = useState<'kam' | 'branch'>('kam');
  
  // ✅ Filters - View Mode
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

  // ✅ Monthly filters
  const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  // ✅ UPDATED: Quarterly filters - SUPPORT MULTIPLE QUARTERS
  const getCurrentQuarterDefaults = () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return { quarter: q, year: now.getFullYear().toString() };
  };
  const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
  const [quarters, setQuarters] = useState<number[]>([defaultQuarter]);
  const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);

  // ✅ UPDATED: Generate label based on view mode - shows all quarters
  const currentPeriodLabel = useMemo(() => {
    if (viewMode === 'quarterly') {
      if (quarters.length === 1) {
        return `Q${quarters[0]} ${quarterYear}`;
      } else {
        return `Q${quarters.join(', Q')} ${quarterYear}`;
      }
    } else if (viewMode === 'yearly') {
      return `${startYear}`;
    } else {
      return `${startMonth} ${startYear}`;
    }
  }, [viewMode, quarters, quarterYear, startMonth, startYear]);

  // ✅ UPDATED: Include filterType in hasFilters check
  const hasFilters = divisionFilter !== 'all' || filterKam !== 'all' || filterType !== 'kam';

  const clearFilters = () => {
    setFilterType('kam'); // ✅ Reset filterType
    setDivisionFilter('all');
    setFilterKam('all');
    setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
    setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
    setStartYear(new Date().getFullYear().toString());
    setEndYear(new Date().getFullYear().toString());
    setQuarters([defaultQuarter]);
    setQuarterYear(defaultQuarterYear);
    setViewMode('monthly');
  };

  // Modal state
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

  const teamKams = useMemo(() => {
    return kams.filter(
      (k) =>
        currentUser?.role === 'boss' ||
        currentUser?.role === 'super_admin' ||
        k.reportingTo === currentUser?.name
    );
  }, [kams, currentUser]);

  // ✅ UPDATED: filteredTargets now filters by view mode AND target_type - supports MULTIPLE quarters
  const filteredTargets = useMemo(() => {
    return targets.filter((t) => {
      // Safety check: ensure t.target_month exists
      if (!t.target_month) {
        return false;
      }

      // Parse target_month (format: "YYYY-MM-DD" or "YYYY-MM-01")
      let tYear: number;
      let tMonth: number;

      try {
        const dateParts = t.target_month.split('-');
        tYear = parseInt(dateParts[0]);
        tMonth = parseInt(dateParts[1]) - 1; // Convert to 0-based index
      } catch {
        return false;
      }

      // ✅ FILTER BY VIEW MODE AND target_type
      let isInDateRange = false;
      let isMatchingTargetType = false;

      if (viewMode === 'quarterly') {
        // ✅ QUARTERLY: ONLY show quarterly target_type
        isMatchingTargetType = t.target_type === 'quarterly';
        
        // ✅ UPDATED: Check if target's quarter is in selected quarters array
        const targetQuarter = Math.ceil((tMonth + 1) / 3);
        isInDateRange = tYear === parseInt(quarterYear) && quarters.includes(targetQuarter);

      } else if (viewMode === 'yearly') {
        // ✅ YEARLY: Sum ALL target types
        isMatchingTargetType = true; // Accept all types for yearly
        
        // Check if year matches
        const sYear = parseInt(startYear);
        const eYear = parseInt(endYear);
        isInDateRange = tYear >= sYear && tYear <= eYear;

      } else {
        // ✅ MONTHLY: ONLY show monthly target_type
        isMatchingTargetType = t.target_type === 'monthly';
        
        // Check if month is in range
        if (startYear === endYear) {
          // Same year: check if month is between startMonth and endMonth
          const sMonth = MONTHS_ARRAY.indexOf(startMonth);
          const eMonth = MONTHS_ARRAY.indexOf(endMonth);

          if (tYear === parseInt(startYear) && tMonth >= sMonth && tMonth <= eMonth) {
            isInDateRange = true;
          }
        } else {
          // Different years: check if target is between date range
          const sYear = parseInt(startYear);
          const eYear = parseInt(endYear);
          const sMonth = MONTHS_ARRAY.indexOf(startMonth);
          const eMonth = MONTHS_ARRAY.indexOf(endMonth);

          if (
            (tYear > sYear || (tYear === sYear && tMonth >= sMonth)) &&
            (tYear < eYear || (tYear === eYear && tMonth <= eMonth))
          ) {
            isInDateRange = true;
          }
        }
      }

      return (
        (divisionFilter === 'all' || t.division === divisionFilter) &&
        (filterKam === 'all' || t.kam_id === filterKam) &&
        isInDateRange &&
        isMatchingTargetType
      );
    });
  }, [targets, divisionFilter, filterKam, viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

  // ✅ UPDATED: summaryStats now uses kamPerformance filtered by view mode
  const summaryStats = useMemo(() => {
    // Sum all achieved amounts from kamPerformance
    const totalAchieved = kamPerformance.reduce((sum, kam) => {
      return sum + Number(kam.total_voucher_amount || 0);
    }, 0);

    // ✅ Sum target amounts from filteredTargets (which respects view mode)
    const totalTarget = filteredTargets.reduce((sum, target) => {
      return sum + Number(target.amount || 0);
    }, 0);

    // Calculate progress percentage
    const progress = totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 100) : 0;

    return { 
      totalTarget, 
      totalAchieved, 
      progress,
    };
  }, [kamPerformance, filteredTargets]);

  useEffect(() => {
    SupervisorService.getAll().then(setSupervisors);
    KAMService.getAll().then(setKams);
    
    // Fetch KAMs for filter
    KamPerformanceApi.getKams()
      .then((response) => {
        const data = response.data?.data || response.data || [];
        setApiKams(data);
      })
      .catch((err) => {
        console.error('Error fetching KAMs:', err);
        setApiKams([]);
      });

    // Fetch all targets from API
    SalesTargetAPI.getAll()
      .then((response) => {
        const data = response.data || response || [];
        setTargets(data);
      })
      .catch((err) => {
        console.error('Error fetching targets:', err);
        setTargets([]);
      });
  }, []);

  // ✅ UPDATED: Fetch KAM Performance data with view mode support - handles MULTIPLE quarters
  useEffect(() => {
    const fetchKamPerformance = async () => {
      setKamPerformanceLoading(true);
      try {
        let params: any = {
          filter_type: filterType, // ✅ ADD filter_type parameter
          client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
          view_mode: viewMode,
          search: filterKam !== 'all' ? filterKam : undefined,
          per_page: 1000,
        };

        // ✅ ADD division parameter when filterType is 'branch'
        if (filterType === 'branch' && divisionFilter !== 'all') {
          params.division = divisionFilter;
        }

        // ✅ UPDATED: Set date range based on view mode - supports MULTIPLE quarters
        if (viewMode === 'quarterly') {
          // ✅ Send multiple quarters as comma-separated string
          params.quarters = quarters.join(',');
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
      } catch (err) {
        console.error('Error fetching KAM performance:', err);
        setKamPerformance([]);
      }
      setKamPerformanceLoading(false);
    };

    fetchKamPerformance();
  }, [startMonth, endMonth, startYear, endYear, quarters, quarterYear, filterKam, clientTypeFilter, viewMode, filterType, divisionFilter]); // ✅ Add filterType and divisionFilter to dependencies

  // ✅ UPDATED: Generate tablePeriods based on view mode - generates ONE column per quarter
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];

    if (viewMode === 'quarterly') {
      // ✅ UPDATED: Generate ONE period for EACH selected quarter
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

  const handleSetTarget = async (payload: any) => {
    // Validate required fields
    if (!payload.kam_id || !payload.amount || !payload.target_month) {
      toast.error('Please fill all required fields!');
      return;
    }

    // ✅ Add posted_by to payload
    const finalPayload = {
      ...payload,
      posted_by: currentUser?.id || 0,
      division: selectedDivisionName || payload.division,
    };

    console.log('✅ FINAL PAYLOAD TO SEND:', finalPayload);

    setLoading(true);
    const toastId = toast.loading('Saving target...');
    try {
      const response = await SalesTargetAPI.create(finalPayload);
      setTargets((prev) => [...prev, response.data]);
      setIsTargetModalOpen(false);
      
      // Reset modal fields
      setSelectedDivisionId('');
      setSelectedDivisionName('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      
      toast.success('Target set successfully! 🎯', { id: toastId });
    } catch (err: any) {
      console.error('Error:', err);
      const errorMsg = err.response?.data?.message || 'Failed to set target!';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      <Toaster position="top-right" reverseOrder={false} />

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Targets Management</h1>
          <p className="text-sm text-muted-foreground">
            Set and track revenue goals for {currentPeriodLabel}
          </p>
        </div>
        <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
          <Crosshair className="h-4 w-4 mr-2" /> Set Target
        </Button>
      </div>

      {/* SUMMARY - FILTERS BY VIEW MODE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Crosshair className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Target <span className="text-xs text-blue-600"></span>
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(summaryStats.totalTarget)}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Overall Progress: {summaryStats.progress}%
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
                <Crosshair className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Achieved <span className="text-xs text-blue-600"></span>
                </p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">
                  {formatCurrency(summaryStats.totalAchieved)}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Success Rate: {summaryStats.progress}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KAM PERFORMANCE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filterType === 'branch' ? 'Branch Performance' : 'KAM Performance'}
          </h2>
          <div className="flex justify-end items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                <X className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            )}
            {/* ✅ UPDATED: KAMFilterDrawer with filterType props */}
            <KAMFilterDrawer
              filterType={filterType}              // ✅ ADD THIS
              setFilterType={setFilterType}        // ✅ ADD THIS
              division={divisionFilter}
              setDivision={setDivisionFilter}
              kam={filterKam}
              setKam={setFilterKam}
              clientType={clientTypeFilter}
              setClientType={setClientTypeFilter}
              kams={apiKams}
              setKams={setApiKams}
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
              onFilterChange={() => {}}
            />
          </div>
        </div>

        {/* ✅ UPDATED: KAM PERFORMANCE TABLE with filterType prop */}
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
          loading={kamPerformanceLoading}
          filterType={filterType}  // ✅ ADD THIS
        />
      </div>

      {/* ✅ SET TARGET MODAL */}
      <SetTargetModal
        open={isTargetModalOpen}
        onOpenChange={setIsTargetModalOpen}
        selectedDivisionId={selectedDivisionId}
        setSelectedDivisionId={setSelectedDivisionId}
        selectedDivisionName={selectedDivisionName}
        setSelectedDivisionName={setSelectedDivisionName}
        selectedSupervisor={selectedSupervisor}
        setSelectedSupervisor={setSelectedSupervisor}
        selectedKam={selectedKam}
        setSelectedKam={setSelectedKam}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
        isManagement={isManagement}
        onSave={handleSetTarget}
      />
    </div>
  );
}