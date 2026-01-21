// // TargetsPage.tsx
// import React, { useState, useMemo } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import SetTargetModal from '@/components/target/SetTargetModal';
// import { Crosshair, X } from 'lucide-react';
// import { initialKAMs, formatCurrency } from '@/data/mockData';
// import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
// import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';

// const MONTHS_ARRAY = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December'
// ];

// export default function TargetsPage() {
//   const { currentUser } = useAuth();

//   // ---------------- STATES ----------------
//   const [kams] = useState(initialKAMs);
//   const [targets, setTargets] = useState<any[]>([]); // your targets data
//   const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

//   // Filters
//   const [divisionFilter, setDivisionFilter] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [filterMonthName, setFilterMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

//   const currentMonthLabel = `${filterMonthName} ${filterYear}`;
//   const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

//   const clearFilters = () => {
//     setDivisionFilter('all');
//     setFilterKam('all');
//     setFilterMonthName(MONTHS_ARRAY[new Date().getMonth()]);
//     setFilterYear(new Date().getFullYear().toString());
//   };

//   // ---------------- MEMOIZED LOGIC ----------------
//   const teamKams = useMemo(() => {
//     return kams.filter(k =>
//       k.reportingTo === currentUser?.name ||
//       currentUser?.role === 'boss' ||
//       currentUser?.role === 'super_admin'
//     );
//   }, [kams, currentUser]);

//   const filteredKams = useMemo(() => {
//     return teamKams.filter(k => filterKam === 'all' || k.id === filterKam);
//   }, [teamKams, filterKam]);

//   const filteredTargets = useMemo(() => {
//     return targets.filter(t => {
//       const matchesDivision = divisionFilter === 'all' || t.division === divisionFilter;
//       const matchesKam = filterKam === 'all' || t.kamId === filterKam;
//       const matchesMonthYear = t.month === `${filterMonthName} ${filterYear}`;
//       return matchesDivision && matchesKam && matchesMonthYear;
//     });
//   }, [targets, divisionFilter, filterKam, filterMonthName, filterYear]);

//   // ---------------- SUMMARY STATS ----------------
//   const summaryStats = useMemo(() => {
//     const totalTarget = filteredTargets.reduce((sum, t) => sum + t.revenueTarget, 0);
//     const totalAchieved = filteredTargets.reduce((sum, t) => sum + t.revenueAchieved, 0);
//     const progress = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;
//     return { totalTarget, totalAchieved, progress };
//   }, [filteredTargets]);

//   // ---------------- MODAL STATE ----------------
//   const [selectedDivision, setSelectedDivision] = useState('');
//   const [selectedKam, setSelectedKam] = useState('');
//   const [targetAmount, setTargetAmount] = useState('');
//   const [targetMonthName, setTargetMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
//   const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());
//   const [isManagement, setIsManagement] = useState(false);

//   const handleSetTarget = () => {
//     if (!selectedDivision || !selectedKam || !targetAmount) return;

//     // Save target
//     const monthYear = `${targetMonthName} ${targetYear}`;
//     const existingIndex = targets.findIndex(
//       t => t.kamId === selectedKam && t.month === monthYear
//     );

//     const newTarget = {
//       kamId: selectedKam,
//       division: selectedDivision,
//       month: monthYear,
//       revenueTarget: Number(targetAmount),
//       revenueAchieved: 0,
//     };

//     let updatedTargets = [...targets];
//     if (existingIndex >= 0) {
//       updatedTargets[existingIndex] = newTarget;
//     } else {
//       updatedTargets.push(newTarget);
//     }
//     setTargets(updatedTargets);
//     setIsTargetModalOpen(false);

//     // Reset modal fields
//     setSelectedDivision('');
//     setSelectedKam('');
//     setTargetAmount('');
//     setTargetMonthName(MONTHS_ARRAY[new Date().getMonth()]);
//     setTargetYear(new Date().getFullYear().toString());
//   };

//   return (
//     <div className="page-container space-y-6">
//       {/* ---------------- HEADER ---------------- */}
//       <div className="flex items-center justify-between flex-wrap gap-4">
//         <div>
//           <h1 className="text-2xl font-bold tracking-tight">Targets Management</h1>
//           <p className="text-sm text-muted-foreground">
//             Set and track revenue goals for {currentMonthLabel}
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
//             division={divisionFilter} setDivision={setDivisionFilter}
//             kam={filterKam} setKam={setFilterKam} kams={teamKams}
//             dateRange="monthly" setDateRange={() => {}}
//             startMonth={filterMonthName} setStartMonth={setFilterMonthName}
//             endMonth={filterMonthName} setEndMonth={setFilterMonthName}
//             startYear={filterYear} setStartYear={setFilterYear}
//             endYear={filterYear} setEndYear={setFilterYear}
//             onFilterChange={() => {}}
//           />
//           <Button
//             onClick={() => setIsTargetModalOpen(true)}
//             className="gap-2 shadow-sm"
//           >
//             <Crosshair className="h-4 w-4" /> Set Target
//           </Button>
//         </div>
//       </div>

//       {/* ---------------- SUMMARY CARDS ---------------- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <Card className="overflow-hidden">
//           <CardContent className="p-0">
//             <div className="p-4 pb-3 flex items-center gap-3">
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
//                 <Crosshair className="h-5 w-5 text-blue-600" />
//               </div>
//               <div>
//                 <p className="text-sm text-muted-foreground">Total Revenue Target</p>
//                 <p className="text-2xl font-bold mt-1">{formatCurrency(summaryStats.totalTarget)}</p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Last Month Target: {summaryStats.progress}
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
//                 <p className="text-sm text-muted-foreground">Total Achieved</p>
//                 <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(summaryStats.totalAchieved)}</p>
//               </div>
//             </div>
//             <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
//               Last Month Achieved: {summaryStats.progress}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ---------------- PERFORMANCE TABLE ---------------- */}
//       <KAMPerformanceTable
//         sales={filteredTargets}
//         filteredKams={filteredKams}
//         dateRangeType="monthly"
//         startMonth={filterMonthName}
//         endMonth={filterMonthName}
//         startYear={filterYear}
//         endYear={filterYear}
//         divisionFilter={divisionFilter}
//       />

//       {/* ---------------- SET TARGET MODAL ---------------- */}
//       <SetTargetModal
//         open={isTargetModalOpen}
//         onOpenChange={setIsTargetModalOpen}
//         selectedDivision={selectedDivision}
//         setSelectedDivision={setSelectedDivision}
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
// TargetsPage.tsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SetTargetModal from '@/components/target/SetTargetModal';
import { Crosshair, X, Table as TableIcon } from 'lucide-react';
import { initialKAMs, formatCurrency } from '@/data/mockData';
import { KAMPerformanceTable } from '@/components/tables/KAMPerformanceTable';
import { KAMFilterDrawer } from '@/components/filters/KAMFilterDrawer';

const MONTHS_ARRAY = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function TargetsPage() {
  const { currentUser } = useAuth();

  // ---------------- STATES ----------------
  const [kams] = useState(initialKAMs);
  const [targets, setTargets] = useState<any[]>([]); // your targets data
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Filters
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [filterMonthName, setFilterMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  const currentMonthLabel = `${filterMonthName} ${filterYear}`;
  const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

  const clearFilters = () => {
    setDivisionFilter('all');
    setFilterKam('all');
    setFilterMonthName(MONTHS_ARRAY[new Date().getMonth()]);
    setFilterYear(new Date().getFullYear().toString());
  };

  // ---------------- MEMOIZED LOGIC ----------------
  const teamKams = useMemo(() => {
    return kams.filter(k =>
      k.reportingTo === currentUser?.name ||
      currentUser?.role === 'boss' ||
      currentUser?.role === 'super_admin'
    );
  }, [kams, currentUser]);

  const filteredKams = useMemo(() => {
    return teamKams.filter(k => filterKam === 'all' || k.id === filterKam);
  }, [teamKams, filterKam]);

  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      const matchesDivision = divisionFilter === 'all' || t.division === divisionFilter;
      const matchesKam = filterKam === 'all' || t.kamId === filterKam;
      const matchesMonthYear = t.month === `${filterMonthName} ${filterYear}`;
      return matchesDivision && matchesKam && matchesMonthYear;
    });
  }, [targets, divisionFilter, filterKam, filterMonthName, filterYear]);

  // ---------------- SUMMARY STATS ----------------
  const summaryStats = useMemo(() => {
    const totalTarget = filteredTargets.reduce((sum, t) => sum + t.revenueTarget, 0);
    const totalAchieved = filteredTargets.reduce((sum, t) => sum + t.revenueAchieved, 0);
    const progress = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;
    return { totalTarget, totalAchieved, progress };
  }, [filteredTargets]);

  // ---------------- MODAL STATE ----------------
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonthName, setTargetMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());
  const [isManagement, setIsManagement] = useState(false);

  const handleSetTarget = () => {
    if (!selectedDivision || !selectedKam || !targetAmount) return;

    const monthYear = `${targetMonthName} ${targetYear}`;
    const existingIndex = targets.findIndex(
      t => t.kamId === selectedKam && t.month === monthYear
    );

    const newTarget = {
      kamId: selectedKam,
      division: selectedDivision,
      month: monthYear,
      revenueTarget: Number(targetAmount),
      revenueAchieved: 0,
    };

    let updatedTargets = [...targets];
    if (existingIndex >= 0) {
      updatedTargets[existingIndex] = newTarget;
    } else {
      updatedTargets.push(newTarget);
    }
    setTargets(updatedTargets);
    setIsTargetModalOpen(false);

    setSelectedDivision('');
    setSelectedKam('');
    setTargetAmount('');
    setTargetMonthName(MONTHS_ARRAY[new Date().getMonth()]);
    setTargetYear(new Date().getFullYear().toString());
  };

  return (
    <div className="page-container space-y-6">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Targets Management</h1>
          <p className="text-sm text-muted-foreground">
            Set and track revenue goals for {currentMonthLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filters removed from here */}
          <Button
            onClick={() => setIsTargetModalOpen(true)}
            className="gap-2 shadow-sm"
          >
            <Crosshair className="h-4 w-4" /> Set Target
          </Button>
        </div>
      </div>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Crosshair className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue Target</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(summaryStats.totalTarget)}</p>
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
                <p className="text-sm text-muted-foreground">Total Achieved</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600">{formatCurrency(summaryStats.totalAchieved)}</p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              Success Rate: {summaryStats.progress}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------------- PERFORMANCE TABLE WITH INTEGRATED FILTERS ---------------- */}
      <div className="space-y-4">
        <div className="flex justify-end items-center gap-2">
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9"
                >
                  <X className="h-4 w-4 mr-2" /> Reset
                </Button>
              )}
              <KAMFilterDrawer
                division={divisionFilter} setDivision={setDivisionFilter}
                kam={filterKam} setKam={setFilterKam} kams={teamKams}
                dateRange="monthly" setDateRange={() => {}}
                startMonth={filterMonthName} setStartMonth={setFilterMonthName}
                endMonth={filterMonthName} setEndMonth={setFilterMonthName}
                startYear={filterYear} setStartYear={setFilterYear}
                endYear={filterYear} setEndYear={setFilterYear}
                onFilterChange={() => {}}
              />
        </div>

        <KAMPerformanceTable
          sales={filteredTargets}
          filteredKams={filteredKams}
          dateRangeType="monthly"
          startMonth={filterMonthName}
          endMonth={filterMonthName}
          startYear={filterYear}
          endYear={filterYear}
          divisionFilter={divisionFilter}
        />
      </div>

      {/* ---------------- SET TARGET MODAL ---------------- */}
      <SetTargetModal
        open={isTargetModalOpen}
        onOpenChange={setIsTargetModalOpen}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedKam={selectedKam}
        setSelectedKam={setSelectedKam}
        targetAmount={targetAmount}
        setTargetAmount={setTargetAmount}
        targetMonthName={targetMonthName}
        setTargetMonthName={setTargetMonthName}
        targetYear={targetYear}
        setTargetYear={setTargetYear}
        isManagement={isManagement}
        onSave={handleSetTarget}
      />
    </div>
  );
}