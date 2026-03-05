'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RotateCcw, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { SelectItem } from '@/components/ui/select';

import { KamPerformanceApi } from '@/api/kamPerformanceApi';
import { PrismAPI } from '@/api/prismAPI';
import { isSupervisor, isSuperAdmin, isManagement } from '@/utility/utility';

/* ------------------------------------------------------------------ */
/* TYPES                                                                 */
/* ------------------------------------------------------------------ */

interface KAM {
  kam_id: string | number;
  kam_name: string;
}

interface Branch {
  id: string | number;
  branch_name: string;
}

interface Supervisor {
  supervisor_id: string | number;
  supervisor: string;
}

export interface ProposalFilters {
  filterType: 'kam' | 'branch' | 'supervisor';
  kam: string;
  division: string;
  supervisor: string;
}

interface ProposalFilterDrawerProps {
  filters: ProposalFilters;
  onApply: (filters: ProposalFilters) => void;
  onClear: () => void;
}

/* ------------------------------------------------------------------ */
/* DEFAULT FILTERS (exported so parent can use as initial state)        */
/* ------------------------------------------------------------------ */

export const DEFAULT_PROPOSAL_FILTERS: ProposalFilters = {
  filterType: 'kam',
  kam: 'all',
  division: 'all',
  supervisor: 'all',
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                            */
/* ------------------------------------------------------------------ */

export function ProposalFilterDrawer({
  filters,
  onApply,
  onClear,
}: ProposalFilterDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // ── Remote data ──────────────────────────────────────────────────
  const [kams, setKams] = useState<KAM[]>([]);
  const [kamsLoading, setKamsLoading] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);

  const [supervisorKams, setSupervisorKams] = useState<KAM[]>([]);
  const [supervisorKamsLoading, setSupervisorKamsLoading] = useState(false);

  // ── Temp (in-drawer) state ────────────────────────────────────────
  const [tempFilterType, setTempFilterType] = useState<ProposalFilters['filterType']>(
    filters.filterType
  );
  const [tempKam, setTempKam] = useState(filters.kam);
  const [tempDivision, setTempDivision] = useState(filters.division);
  const [tempSupervisor, setTempSupervisor] = useState(filters.supervisor);

  // ── Role flags ────────────────────────────────────────────────────
  const showTypeSelector = !isSupervisor(); // supervisors only see KAM option

  /* ── Sync temp state when drawer opens ─────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTempFilterType(filters.filterType);
      setTempKam(filters.kam);
      setTempDivision(filters.division);
      setTempSupervisor(filters.supervisor);
    }
  }, [isOpen, filters]);

  /* ── Load remote data on open ───────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    if (kams.length === 0) loadKams();
    if (branches.length === 0) loadBranches();
    if (supervisors.length === 0) loadSupervisors();
  }, [isOpen]);

  /* ── Load supervisor's KAMs when supervisor changes ────────────── */
  useEffect(() => {
    if (tempFilterType === 'supervisor' && tempSupervisor && tempSupervisor !== 'all') {
      loadSupervisorKams(tempSupervisor);
    } else {
      setSupervisorKams([]);
      setTempKam('all');
    }
  }, [tempFilterType, tempSupervisor]);

  /* ── Reset KAM when filter type changes ────────────────────────── */
  useEffect(() => {
    setTempKam('all');
    setTempDivision('all');
    setTempSupervisor('all');
  }, [tempFilterType]);

  /* ── Data loaders ───────────────────────────────────────────────── */
  const loadKams = async () => {
    setKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getKams();
      // API returns { status: true, data: [...] }
      if (res?.data?.status && res?.data?.data) setKams(res.data.data);
      else if (res?.status && res?.data)        setKams(res.data);
      else if (Array.isArray(res?.data))        setKams(res.data);
      else if (res?.success && res?.data)       setKams(res.data); // fallback
    } catch (err) {
      console.error('Error loading KAMs:', err);
    }
    setKamsLoading(false);
  };

  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await PrismAPI.getBranchList();
      if (res?.data?.status && res?.data?.data) setBranches(res.data.data);
      else if (res?.data) setBranches(res.data);
    } catch (err) {
      console.error('Error loading branches:', err);
    }
    setBranchesLoading(false);
  };

  const loadSupervisors = async () => {
    setSupervisorsLoading(true);
    try {
      const res = await PrismAPI.getSupervisors();
      if (res?.data?.status && res?.data?.data) setSupervisors(res.data.data);
      else if (res?.data) setSupervisors(res.data);
    } catch (err) {
      console.error('Error loading supervisors:', err);
    }
    setSupervisorsLoading(false);
  };

  const loadSupervisorKams = async (supervisorId: string) => {
    setSupervisorKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getSupervisorWiseKAMList(supervisorId);
      if (res?.data?.status && res?.data?.data) setSupervisorKams(res.data.data);
      else if (res?.data) setSupervisorKams(res.data);
    } catch (err) {
      console.error('Error loading supervisor KAMs:', err);
      setSupervisorKams([]);
    }
    setSupervisorKamsLoading(false);
  };

  /* ── Apply ──────────────────────────────────────────────────────── */
  const handleApply = () => {
    let finalKam = tempKam;

    // When "All KAMs" under a supervisor → send all their KAM IDs
    if (tempFilterType === 'supervisor' && tempSupervisor !== 'all' && tempKam === 'all') {
      const ids = supervisorKams.map((k) => String(k.kam_id));
      finalKam = ids.length > 0 ? ids.join(',') : 'all';
    }

    onApply({
      filterType: tempFilterType,
      kam: finalKam,
      division: tempDivision,
      supervisor: tempSupervisor,
    });

    setIsOpen(false);
  };

  /* ── Reset ──────────────────────────────────────────────────────── */
  const handleReset = () => {
    setTempFilterType('kam');
    setTempKam('all');
    setTempDivision('all');
    setTempSupervisor('all');
    setSupervisorKams([]);
  };

  const handleClear = () => {
    handleReset();
    onClear();
    setIsOpen(false);
  };

  /* ── Active filter count (for badge) ───────────────────────────── */
  const activeCount = [
    filters.kam !== 'all',
    filters.division !== 'all',
    filters.supervisor !== 'all',
  ].filter(Boolean).length;

  /* ── Filter rows config ─────────────────────────────────────────── */
  const filterConfigs = useMemo(() => {
    const rows: any[] = [];

    // Filter type selector (hidden for supervisors)
    if (showTypeSelector) {
      rows.push({
        type: 'select',
        label: 'Filter By',
        value: tempFilterType,
        setter: setTempFilterType,
        options: [
          { value: 'kam', label: 'KAM' },
        //   { value: 'branch', label: 'Branch' },
          { value: 'supervisor', label: 'Supervisor' },
        ],
      });
    }

    // KAM picker
    if (tempFilterType === 'kam') {
      rows.push({
        type: 'search-select',
        label: 'KAM',
        value: tempKam,
        setter: setTempKam,
        loading: kamsLoading,
        options: [
          { label: 'All KAMs', value: 'all' },
          ...kams.map((k) => ({ label: k.kam_name, value: String(k.kam_id) })),
        ],
      });
    }

    // Branch picker
    if (tempFilterType === 'branch') {
      rows.push({
        type: 'search-select',
        label: 'Branch',
        value: tempDivision,
        setter: setTempDivision,
        loading: branchesLoading,
        options: [
          { label: 'All Branches', value: 'all' },
          ...branches.map((b) => ({ label: b.branch_name, value: String(b.id) })),
        ],
      });
    }

    // Supervisor picker + optional KAM sub-filter
    if (tempFilterType === 'supervisor') {
      rows.push({
        type: 'search-select',
        label: 'Supervisor',
        value: tempSupervisor,
        setter: setTempSupervisor,
        loading: supervisorsLoading,
        options: [
          { label: 'All Supervisors', value: 'all' },
          ...supervisors.map((s) => ({ label: s.supervisor, value: String(s.supervisor_id) })),
        ],
      });

      if (tempSupervisor && tempSupervisor !== 'all') {
        rows.push({
          type: 'search-select',
          label: 'KAM',
          value: tempKam,
          setter: setTempKam,
          loading: supervisorKamsLoading,
          options: [
            { label: 'All KAMs', value: 'all' },
            ...supervisorKams.map((k) => ({ label: k.kam_name, value: String(k.kam_id) })),
          ],
        });
      }
    }

    return rows;
  }, [
    tempFilterType,
    tempKam,
    tempDivision,
    tempSupervisor,
    kams,
    branches,
    supervisors,
    supervisorKams,
    kamsLoading,
    branchesLoading,
    supervisorsLoading,
    supervisorKamsLoading,
    showTypeSelector,
  ]);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger button */}
      <Button variant="outline" className="gap-2 relative" onClick={() => setIsOpen(true)}>
        <Filter className="h-4 w-4" />
        <span>Filters</span>
        {activeCount > 0 && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {activeCount}
          </Badge>
        )}
      </Button>

      <DrawerContent className="w-full sm:w-[380px]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 py-2">

            {/* Dynamic filter rows */}
            {filterConfigs.map((f, idx) => {
              if (f.type === 'search-select') {
                return (
                  <React.Fragment key={idx}>
                    {/* Mobile: plain select */}
                    <div className="block sm:hidden">
                      <FloatingSelect
                        label={f.label}
                        value={f.value}
                        onValueChange={f.setter}
                      >
                        {f.loading ? (
                          <SelectItem value="loading" disabled textValue="Loading...">
                            Loading...
                          </SelectItem>
                        ) : (
                          f.options.map((o: any) => (
                            <SelectItem key={o.value} value={o.value} textValue={o.label}>
                              {o.label}
                            </SelectItem>
                          ))
                        )}
                      </FloatingSelect>
                    </div>

                    {/* Desktop: searchable select */}
                    <div className="hidden sm:block">
                      <FloatingSearchSelect
                        label={f.label}
                        value={f.value}
                        searchable
                        onValueChange={f.setter}
                        disabled={f.loading}
                      >
                        {f.loading ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          f.options.map((o: any) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))
                        )}
                      </FloatingSearchSelect>
                    </div>
                  </React.Fragment>
                );
              }

              if (f.type === 'select') {
                return (
                  <FloatingSelect
                    key={idx}
                    label={f.label}
                    value={f.value}
                    onValueChange={f.setter}
                  >
                    {f.options.map((o: any) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </FloatingSelect>
                );
              }

              return null;
            })}

            {/* Clear button */}
            {(tempKam !== 'all' || tempDivision !== 'all' || tempSupervisor !== 'all') && (
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={handleClear}
              >
                <RotateCcw className="h-4 w-4" />
                Clear All Filters
              </Button>
            )}
          </div>
        </ScrollArea>

        <DrawerFooter>
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}