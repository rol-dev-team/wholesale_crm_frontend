// src/pages/TargetsPage.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import SetTargetModal from '@/components/target/SetTargetModal';
import { TargetsTable } from '@/components/target/TargetsTable';
import { Crosshair, X, Filter } from 'lucide-react';
import { formatCurrency } from '@/data/mockData';
import toast, { Toaster } from 'react-hot-toast';

import { SalesTargetAPI } from '@/api/salesTarget';
import { KAMService } from '@/services/kam';
import { SupervisorService } from '@/services/supervisor';
import { AppPagination } from '@/components/common/AppPagination';

import type { KAM } from '@/types/kam';
import type { Supervisor } from '@/types/supervisor';
import { useAuth } from '@/contexts/AuthContext';
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

export default function TargetsPage() {
  const { currentUser } = useAuth();

  const [targets, setTargets] = useState<any[]>([]);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Pagination state
  const lastPayloadRef = useRef<any>({});

  /* ---------------- DERIVED ---------------- */
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // ✅ Filters - View Mode
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly' | 'quarterly'>('monthly');

  // ✅ Monthly filters
  const [startMonth, setStartMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [endMonth, setEndMonth] = useState(MONTHS_ARRAY[new Date().getMonth()]);
  const [startYear, setStartYear] = useState(new Date().getFullYear().toString());
  const [endYear, setEndYear] = useState(new Date().getFullYear().toString());

  // ✅ Quarterly filters
  const getCurrentQuarterDefaults = () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return { quarter: q, year: now.getFullYear().toString() };
  };
  const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
  const [quarters, setQuarters] = useState<number[]>([1, 2, 3, 4]); // show all by default
  const [quarterYear, setQuarterYear] = useState<string>(defaultQuarterYear);
  const [editingTarget, setEditingTarget] = useState<any | null>(null);

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

  // Modal state
  const [selectedDivisionId, setSelectedDivisionId] = useState('');
  const [selectedDivisionName, setSelectedDivisionName] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [selectedKam, setSelectedKam] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  const isManagement = ['management', 'super_admin'].includes(currentUser?.role);

  const fetchTargets = async (payload: any = {}) => {
    setLoading(true);
    lastPayloadRef.current = payload;

    try {
      const res = await SalesTargetAPI.getAll(payload);
      setTargets(res.data || []);
      setCurrentPage(res.meta.current_page);
      setTotalPages(res.meta.last_page);
    } catch (err) {
      console.error(err);
      setTargets([]);
      toast.error('Failed to load targets');
    } finally {
      setLoading(false);
    }
  };

  const fetchKamRevenue = async () => {
    try {
      const res = await KamPerformanceApi.getKamUsersRevenue();

      console.log('✅ KAM REVENUE RESPONSE:', res.data);
    } catch (error) {
      console.error('❌ Failed to load KAM revenue', error);
    }
  };

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    SupervisorService.getAll().then(setSupervisors);
    KAMService.getAll().then(setKams);

    fetchTargets({
      page: 1,
      per_page: ITEMS_PER_PAGE,
      target_type: 'monthly',
    });

    fetchKamRevenue();
  }, []);

  const handleSetTarget = async (payload: any) => {
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
        response = await SalesTargetAPI.update(editingTarget.id, finalPayload);
        setTargets((prev) => prev.map((t) => (t.id === editingTarget.id ? response.data : t)));
      } else {
        response = await SalesTargetAPI.create(finalPayload);
        setTargets((prev) => [...prev, response.data]);
      }
      await fetchTargets({
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
        target_type: 'monthly',
      });
      setIsTargetModalOpen(false);

      setSelectedDivisionId('');
      setSelectedDivisionName('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      setEditingTarget(null);

      toast.success(
        editingTarget ? 'Target updated successfully! 🎯' : 'Target set successfully! 🎯',
        {
          id: toastId,
        }
      );
    } catch (err: any) {
      console.error('Error:', err);
      const errorMsg =
        err.response?.data?.message ||
        (editingTarget ? 'Failed to update target!' : 'Failed to set target!');
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

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Crosshair className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold mt-1">
                  {/* {formatCurrency(summaryStats.totalTarget)} */}
                  000
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              {/* Overall Progress: {summaryStats.progress}% */}000
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
                <p className="text-2xl font-bold mt-1 text-emerald-600">
                  {/* {formatCurrency(summaryStats.totalAchieved)} */}000
                </p>
              </div>
            </div>
            <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
              {/* Success Rate: {summaryStats.progress}% */}000
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <Button
          size="sm"
          variant={viewMode === 'monthly' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('monthly');
            fetchTargets({
              page: 1,
              per_page: ITEMS_PER_PAGE,
              target_type: 'monthly',
            });
          }}
        >
          Monthly
        </Button>

        <Button
          size="sm"
          variant={viewMode === 'quarterly' ? 'default' : 'outline'}
          onClick={() => {
            setViewMode('quarterly');
            fetchTargets({
              page: 1,
              per_page: ITEMS_PER_PAGE,
              target_type: 'quarterly',
            });
          }}
        >
          Quarterly
        </Button>
      </div>

      {/* TARGETS TABLE */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Target Details</h2>

        <TargetsTable
          targets={targets}
          onEdit={(t) => {
            setEditingTarget(t);
            setIsTargetModalOpen(true);
          }}
        />

        <AppPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) =>
            fetchTargets({
              ...lastPayloadRef.current,
              page,
            })
          }
        />
      </div>

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
