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
  // console.log('Current User in TargetsPage:', currentUser);

  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Modal state
  // const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetMonthName, setTargetMonthName] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear().toString());

  const isManagement = ['management', 'super_admin'].includes(currentUser?.role);

  const teamKams = useMemo(() => {
    return kams.filter(
      (k) =>
        currentUser?.role === 'management' ||
        currentUser?.role === 'super_admin' ||
        k.reportingTo === currentUser?.name
    );
  }, [kams, currentUser]);

  const filteredTargets = useMemo(() => {
    return targets.filter(
      (t) =>
        (divisionFilter === 'all' || t.division === divisionFilter) &&
        (filterKam === 'all' || t.kamId === filterKam) &&
        t.month === `${filterMonthName} ${filterYear}`
    );
  }, [targets, divisionFilter, filterKam, filterMonthName, filterYear]);

  const summaryStats = useMemo(() => {
    const totalTarget = filteredTargets.reduce((s, t) => s + t.revenueTarget, 0);
    const totalAchieved = filteredTargets.reduce((s, t) => s + t.revenueAchieved, 0);
    const progress = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;
    return { totalTarget, totalAchieved, progress };
  }, [filteredTargets]);

  useEffect(() => {
    SupervisorService.getAll().then(setSupervisors);
    KAMService.getAll().then(setKams);
  }, []);

  const handleSetTarget = async () => {
    if (!selectedDivisionId || !selectedSupervisor || !selectedKam || !targetAmount) {
      toast.error('Please fill all fields!');
      return;
    }

    const monthIndex = MONTHS_ARRAY.indexOf(targetMonthName) + 1;
    const targetMonth = `${targetYear}-${String(monthIndex).padStart(2, '0')}-01`;

    let posted_by = 2;
    if (currentUser.role === 'super_admin') posted_by = 0;
    else if (currentUser.role === 'management') posted_by = 1;

    const payload = {
      target_month: targetMonth,
      division: selectedDivisionName, // ✅ NAME save হবে
      division_id: Number(selectedDivisionId), // (optional কিন্তু ভালো)
      supervisor_id: Number(selectedSupervisor),
      kam_id: Number(selectedKam),
      amount: Number(targetAmount),
      posted_by: Number(currentUser?.id),
    };

    setLoading(true);
    const toastId = toast.loading('Saving target...');
    try {
      const response = await SalesTargetAPI.create(payload);
      setTargets((prev) => [...prev, response]);
      setIsTargetModalOpen(false);
      toast.success('Target set successfully! 🎯', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Failed to set target!', { id: toastId });
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
            Set and track revenue goals for {currentMonthLabel}
          </p>
        </div>
        <Button onClick={() => setIsTargetModalOpen(true)} disabled={loading}>
          <Crosshair className="h-4 w-4 mr-2" /> Set Target
        </Button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Crosshair className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Revenue Target <span className="text-xs text-blue-600"> (This Month)</span>
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
                  Total Achieved <span className="text-xs text-blue-600"> (This Month)</span>
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

      {/* FILTER */}
      <div className="flex justify-end items-center gap-2">
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
            <X className="h-4 w-4 mr-2" /> Reset
          </Button>
        )}
        <KAMFilterDrawer
          trigger={
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" /> Filter
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

      {/* TABLE */}
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

      {/* MODAL */}
      <SetTargetModal
        open={isTargetModalOpen}
        onOpenChange={setIsTargetModalOpen}
        supervisors={supervisors.map((s) => ({ id: String(s.id), name: s.name }))}
        kams={kams.map((k) => ({ id: String(k.id), name: k.name }))}
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
