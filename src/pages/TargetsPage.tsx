// TargetsPage.tsx
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SetTargetModal from '@/components/target/SetTargetModal';
import { Crosshair, X, Filter } from 'lucide-react';
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
  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  // Filters
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [filterMonthName, setFilterMonthName] = useState(
    MONTHS_ARRAY[new Date().getMonth()]
  );
  const [filterYear, setFilterYear] = useState(
    new Date().getFullYear().toString()
  );

  const currentMonthLabel = `${filterMonthName} ${filterYear}`;
  const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

  const clearFilters = () => {
    setDivisionFilter('all');
    setFilterKam('all');
    setFilterMonthName(MONTHS_ARRAY[new Date().getMonth()]);
    setFilterYear(new Date().getFullYear().toString());
  };

  // ---------------- MODAL STATE ----------------
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonthName, setTargetMonthName] = useState(
    MONTHS_ARRAY[new Date().getMonth()]
  );
  const [targetYear, setTargetYear] = useState(
    new Date().getFullYear().toString()
  );

  const isManagement =
    currentUser?.role === 'boss' || currentUser?.role === 'super_admin';

  // ---------------- MEMO ----------------
  const teamKams = useMemo(() => {
    return kams.filter(k =>
      currentUser?.role === 'boss' ||
      currentUser?.role === 'super_admin' ||
      k.reportingTo === currentUser?.name
    );
  }, [kams, currentUser]);

  const filteredTargets = useMemo(() => {
    return targets.filter(t =>
      (divisionFilter === 'all' || t.division === divisionFilter) &&
      (filterKam === 'all' || t.kamId === filterKam) &&
      t.month === `${filterMonthName} ${filterYear}`
    );
  }, [targets, divisionFilter, filterKam, filterMonthName, filterYear]);

  const summaryStats = useMemo(() => {
    const totalTarget = filteredTargets.reduce(
      (s, t) => s + t.revenueTarget,
      0
    );
    const totalAchieved = filteredTargets.reduce(
      (s, t) => s + t.revenueAchieved,
      0
    );
    const progress = totalTarget
      ? Math.round((totalAchieved / totalTarget) * 100)
      : 0;

    return { totalTarget, totalAchieved, progress };
  }, [filteredTargets]);

  // ---------------- HANDLER ----------------
  const handleSetTarget = () => {
    if (!selectedDivision || !selectedKam || !targetAmount) return;

    const month = `${targetMonthName} ${targetYear}`;

    const newTarget = {
      kamId: selectedKam,
      division: selectedDivision,
      month,
      revenueTarget: Number(targetAmount),
      revenueAchieved: 0,
    };

    setTargets(prev => [...prev, newTarget]);
    setIsTargetModalOpen(false);
  };

  // ---------------- UI ----------------
  return (
    <div className="page-container space-y-6">

      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Targets Management</h1>
          <p className="text-sm text-muted-foreground">
            Set and track revenue goals for {currentMonthLabel}
          </p>
        </div>

        <Button onClick={() => setIsTargetModalOpen(true)}>
          <Crosshair className="h-4 w-4 mr-2" />
          Set Target
        </Button>
      </div>

      {/* ---------------- SUMMARY ---------------- */}
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

      {/* ---------------- FILTER BAR (RIGHT SIDE) ---------------- */}
      <div className="flex justify-end items-center gap-2">
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Reset
          </Button>
        )}

        {/* Filter icon button */}
        <KAMFilterDrawer
          trigger={
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          }
          division={divisionFilter}
          setDivision={setDivisionFilter}
          kam={filterKam}
          setKam={setFilterKam}
          kams={teamKams}
          dateRange="monthly"
          setDateRange={() => {}}
          startMonth={filterMonthName}
          setStartMonth={setFilterMonthName}
          endMonth={filterMonthName}
          setEndMonth={setFilterMonthName}
          startYear={filterYear}
          setStartYear={setFilterYear}
          endYear={filterYear}
          setEndYear={setFilterYear}
          onFilterChange={() => {}}
        />
      </div>

      {/* ---------------- TABLE ---------------- */}
      <KAMPerformanceTable
        sales={filteredTargets}
        filteredKams={teamKams}
        dateRangeType="monthly"
        startMonth={filterMonthName}
        endMonth={filterMonthName}
        startYear={filterYear}
        endYear={filterYear}
        divisionFilter={divisionFilter}
      />

      {/* ---------------- MODAL ---------------- */}
      <SetTargetModal
        open={isTargetModalOpen}
        onOpenChange={setIsTargetModalOpen}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedSupervisor={selectedSupervisor}
        setSelectedSupervisor={setSelectedSupervisor}
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
