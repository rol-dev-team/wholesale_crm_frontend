
// src/pages/TargetsPage.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SetTargetModal from '@/components/target/SetTargetModal';
import {TargetsTable} from '@/components/target/TargetsTable';
import { Crosshair, X, Filter } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
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

  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState(false);
 
  
  // ✅ Filters - View Mode
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
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
  const [quarters, setQuarters] = useState<number[]>([1,2,3,4]); // show all by default
  const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);
  const [editingTarget, setEditingTarget] = useState<any | null>(null);


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
  const hasFilters = divisionFilter !== 'all' || filterKam !== 'all';

  const clearFilters = () => {

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

const summaryStats = useMemo(() => {
  const totalTarget = filteredTargets.reduce((sum, target) => {
    return sum + Number(target.amount || 0);
  }, 0);

  return {
    totalTarget,
    totalAchieved: 0, // ⛔ performance intentionally not available here
    progress: 0,
  };
}, [filteredTargets]);

const fetchTargets = async () => {
  setLoading(true);
  try {
    const response = await SalesTargetAPI.getAll();
    const data = response.data || response || [];
    setTargets(data);
  } catch (err) {
    console.error('Error fetching targets:', err);
    setTargets([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    SupervisorService.getAll().then(setSupervisors);
    KAMService.getAll().then(setKams);
     fetchTargets(); 
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

const finalPayload = {
  ...payload,
  target_type: payload.target_type,
  target_month: payload.target_month,
  posted_by: currentUser?.id || 0,
  division: selectedDivisionName || payload.division,
  supervisor_id: payload.supervisor_id,
  kam_id: payload.kam_id,
  amount: Number(payload.amount),
};


    console.log('✅ FINAL PAYLOAD TO SEND:', finalPayload);

    setLoading(true);
  const toastId = toast.loading(editingTarget ? 'Updating target...' : 'Saving target...');
  try {
    let response;
    if (editingTarget) {
      // ✅ UPDATE existing target
      response = await SalesTargetAPI.update(editingTarget.id, finalPayload);

      // ✅ Update target in local state
      setTargets((prev) =>
        prev.map((t) => (t.id === editingTarget.id ? response.data : t))
      );
    } else {
      // ✅ CREATE new target
      response = await SalesTargetAPI.create(finalPayload);
      setTargets((prev) => [...prev, response.data]);
    }
    await fetchTargets();
    setIsTargetModalOpen(false);

    // Reset modal fields
    setSelectedDivisionId('');
    setSelectedDivisionName('');
    setSelectedSupervisor('');
    setSelectedKam('');
    setTargetAmount('');
    setEditingTarget(null);

    toast.success(editingTarget ? 'Target updated successfully! 🎯' : 'Target set successfully! 🎯', {
      id: toastId,
    });
  } catch (err: any) {
    console.error('Error:', err);
    const errorMsg = err.response?.data?.message || (editingTarget ? 'Failed to update target!' : 'Failed to set target!');
    toast.error(errorMsg, { id: toastId });
  } finally {
    setLoading(false);
  }
};

  //   setLoading(true);
  //   const toastId = toast.loading('Saving target...');
  //   try {
  //     const response = await SalesTargetAPI.create(finalPayload);
  //     setTargets((prev) => [...prev, response.data]);
  //     setIsTargetModalOpen(false);
      
  //     // Reset modal fields
  //     setSelectedDivisionId('');
  //     setSelectedDivisionName('');
  //     setSelectedSupervisor('');
  //     setSelectedKam('');
  //     setTargetAmount('');
      
  //     toast.success('Target set successfully! 🎯', { id: toastId });
  //   } catch (err: any) {
  //     console.error('Error:', err);
  //     const errorMsg = err.response?.data?.message || 'Failed to set target!';
  //     toast.error(errorMsg, { id: toastId });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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



<div className="flex items-center gap-2 mb-2">
  <Button
    size="sm"
    variant={viewMode === 'monthly' ? 'default' : 'outline'}
    onClick={() => setViewMode('monthly')}
  >
    Monthly
  </Button>

  <Button
    size="sm"
    variant={viewMode === 'quarterly' ? 'default' : 'outline'}
    onClick={() => setViewMode('quarterly')}
  >
    Quarterly
  </Button>
</div>


{/* TARGETS TABLE */}
<div className="space-y-4">
  <h2 className="text-lg font-semibold">Target Details</h2>

  <div className="relative border rounded-xl overflow-hidden">
    <div className="max-h-[65vh] overflow-auto">
      <TargetsTable
        targets={filteredTargets}
        onEdit={(t) => {
          setEditingTarget(t);
          setIsTargetModalOpen(true);
        }}
      />
    </div>
  </div>
</div>



      {/* ✅ SET TARGET MODAL */}
      <SetTargetModal
        open={isTargetModalOpen}
        editingTarget={editingTarget} 
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