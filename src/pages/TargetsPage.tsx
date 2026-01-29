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
  // console.log('Current User in TargetsPage:', currentUser);

  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState(false);
  const [kamPerformanceLoading, setKamPerformanceLoading] = useState(false);
  const [kamPerformance, setKamPerformance] = useState<any[]>([]);
  const [apiKams, setApiKams] = useState<any[]>([]);

  // Filters
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [clientTypeFilter, setClientTypeFilter] = useState('All Client');
  const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  const currentMonthLabel = `${startMonth} ${startYear}`;
  const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

  const clearFilters = () => {
    setDivisionFilter('all');
    setFilterKam('all');
    setStartMonth(MONTHS_ARRAY[new Date().getMonth()]);
    setEndMonth(MONTHS_ARRAY[new Date().getMonth()]);
    setStartYear(new Date().getFullYear().toString());
    setEndYear(new Date().getFullYear().toString());
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
  const [targetQuarter, setTargetQuarter] = useState<number | null>(null);

  const isManagement = ['boss', 'super_admin'].includes(currentUser?.role);

  const teamKams = useMemo(() => {
    return kams.filter(
      (k) =>
        currentUser?.role === 'boss' ||
        currentUser?.role === 'super_admin' ||
        k.reportingTo === currentUser?.name
    );
  }, [kams, currentUser]);

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

      // Check if target falls within the selected date range
      let isInDateRange = false;

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

      return (
        (divisionFilter === 'all' || t.division === divisionFilter) &&
        (filterKam === 'all' || t.kam_id === filterKam) &&
        isInDateRange
      );
    });
  }, [targets, divisionFilter, filterKam, startMonth, endMonth, startYear, endYear]);

  // Calculate summary stats from KAM Performance data
  const summaryStats = useMemo(() => {
    // Sum all achieved amounts from kamPerformance
    const totalAchieved = kamPerformance.reduce((sum, kam) => {
      return sum + Number(kam.total_voucher_amount || 0);
    }, 0);

    // Sum all target amounts from filteredTargets
    // The API returns 'amount' field for the target value
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

  // Fetch KAM Performance data
  useEffect(() => {
    const fetchKamPerformance = async () => {
      setKamPerformanceLoading(true);
      try {
        const startDateObj = new Date(`${startYear}-${(MONTHS_ARRAY.indexOf(startMonth) + 1).toString().padStart(2, '0')}-01`);
        const endDateObj = new Date(`${endYear}-${(MONTHS_ARRAY.indexOf(endMonth) + 1).toString().padStart(2, '0')}-28`);
        
        const startDate = startDateObj.toISOString().split('T')[0];
        const endDate = endDateObj.toISOString().split('T')[0];

        const response = await KamPerformanceApi.getKamUsersRevenue({
          start_date: startDate,
          end_date: endDate,
          client_type: clientTypeFilter !== 'All Client' ? clientTypeFilter : undefined,
          view_mode: 'monthly',
          search: filterKam !== 'all' ? filterKam : undefined,
          per_page: 1000,
        });

        const data = response.data || response || [];
        setKamPerformance(data);
      } catch (err) {
        console.error('Error fetching KAM performance:', err);
        setKamPerformance([]);
      }
      setKamPerformanceLoading(false);
    };

    fetchKamPerformance();
  }, [startMonth, endMonth, startYear, endYear, filterKam, clientTypeFilter]);

  // Generate tablePeriods for KAMPerformanceTable - supports multiple months
  const tablePeriods = useMemo(() => {
    const periods: any[] = [];
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

    return periods;
  }, [startMonth, endMonth, startYear, endYear]);

  const handleSetTarget = async () => {
    if (!selectedDivisionId || !selectedSupervisor || !selectedKam || !targetAmount) {
      toast.error('Please fill all fields!');
      return;
    }

    const monthIndex = MONTHS_ARRAY.indexOf(targetMonthName) + 1;
    const targetMonth = `${targetYear}-${String(monthIndex).padStart(2, '0')}-01`;

    let posted_by = 2;
    if (currentUser?.role === 'super_admin') posted_by = 0;
    else if (currentUser?.role === 'boss') posted_by = 1;

    const payload = {
      target_month: targetMonth,
      division: selectedDivisionName,
      division_id: Number(selectedDivisionId),
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

      {/* SUMMARY - ORIGINAL DESIGN */}
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
          <h2 className="text-lg font-semibold">KAM Performance</h2>
          <div className="flex justify-end items-center gap-2">
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive">
                <X className="h-4 w-4 mr-2" /> Reset Filters
              </Button>
            )}
            <KAMFilterDrawer
              division={divisionFilter}
              setDivision={setDivisionFilter}
              kam={filterKam}
              setKam={setFilterKam}
              clientType={clientTypeFilter}
              setClientType={setClientTypeFilter}
              kams={apiKams}
              dateRange="monthly"
              setDateRange={() => {}}
              viewMode="monthly"
              setViewMode={() => {}}
              startMonth={startMonth}
              setStartMonth={setStartMonth}
              endMonth={endMonth}
              setEndMonth={setEndMonth}
              startYear={startYear}
              setStartYear={setStartYear}
              endYear={endYear}
              setEndYear={setEndYear}
              onFilterChange={() => {}}
            />
          </div>
        </div>

        {/* KAM PERFORMANCE TABLE */}
        <KAMPerformanceTable
          sales={kamPerformance}
          dateRangeType="monthly"
          startMonth={startMonth}
          endMonth={endMonth}
          startYear={startYear}
          endYear={endYear}
          tablePeriods={tablePeriods}
          loading={kamPerformanceLoading}
        />
      </div>

      {/* MODAL */}
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
        targetMonthName={targetMonthName}
        setTargetMonthName={setTargetMonthName}
        targetQuarter={targetQuarter}           // <--- add this
        setTargetQuarter={setTargetQuarter}     // <--- add this
        targetYear={targetYear}
        setTargetYear={setTargetYear}
        isManagement={isManagement}
        onSave={handleSetTarget}
      />
    </div>
  );
}