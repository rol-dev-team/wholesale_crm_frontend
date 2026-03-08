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
import { ClientAPI } from '@/api/clientApi';
import { isSupervisor, isKAM } from '@/utility/utility';

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
interface Client {
  id: string | number;
  full_name: string;
}

export interface ProposalFilters {
  filterType: 'kam' | 'branch' | 'supervisor';
  kam: string;
  division: string;
  supervisor: string;
  client: string;
  status: 'all' | 'approved' | 'rejected'; // ← NEW
}

interface ProposalFilterDrawerProps {
  filters: ProposalFilters;
  onApply: (filters: ProposalFilters) => void;
  onClear: () => void;
}

export const DEFAULT_PROPOSAL_FILTERS: ProposalFilters = {
  filterType: 'kam',
  kam: 'all',
  division: 'all',
  supervisor: 'all',
  client: 'all',
  status: 'all', // ← NEW
};

/* ------------------------------------------------------------------ */
/* COMPONENT                                                            */
/* ------------------------------------------------------------------ */

export function ProposalFilterDrawer({ filters, onApply, onClear }: ProposalFilterDrawerProps) {
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
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // ── Temp state ────────────────────────────────────────────────────
  const [tempFilterType, setTempFilterType] = useState<ProposalFilters['filterType']>(
    filters.filterType
  );
  const [tempKam, setTempKam] = useState(filters.kam);
  const [tempDivision, setTempDivision] = useState(filters.division);
  const [tempSupervisor, setTempSupervisor] = useState(filters.supervisor);
  const [tempClient, setTempClient] = useState(filters.client);
  const [tempStatus, setTempStatus] = useState<ProposalFilters['status']>(filters.status); // ← NEW

  // ── Role flags ────────────────────────────────────────────────────
  const userIsKam = isKAM();
  const showTypeSelector = !isSupervisor() && !userIsKam;

  /* ── Sync on open ───────────────────────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      setTempFilterType(filters.filterType);
      setTempKam(filters.kam);
      setTempDivision(filters.division);
      setTempSupervisor(filters.supervisor);
      setTempClient(filters.client);
      setTempStatus(filters.status);
    }
  }, [isOpen, filters]);

  /* ── Load on open ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!isOpen) return;
    if (userIsKam) {
      loadClientsByKam('self');
      return;
    }
    if (kams.length === 0) loadKams();
    if (branches.length === 0) loadBranches();
    if (supervisors.length === 0) loadSupervisors();
  }, [isOpen]);

  /* ── Supervisor KAMs ────────────────────────────────────────────── */
  useEffect(() => {
    if (tempFilterType === 'supervisor' && tempSupervisor && tempSupervisor !== 'all') {
      loadSupervisorKams(tempSupervisor);
    } else {
      setSupervisorKams([]);
      setTempKam('all');
    }
  }, [tempFilterType, tempSupervisor]);

  /* ── Reset on filter type change ────────────────────────────────── */
  useEffect(() => {
    setTempKam('all');
    setTempDivision('all');
    setTempSupervisor('all');
    setTempClient('all');
    setClients([]);
  }, [tempFilterType]);

  /* ── Load clients on KAM select ─────────────────────────────────── */
  useEffect(() => {
    if (userIsKam) return;
    const isSingleKam = tempKam && tempKam !== 'all' && !tempKam.includes(',');
    if (isSingleKam) {
      loadClientsByKam(tempKam);
    } else {
      setClients([]);
      setTempClient('all');
    }
  }, [tempKam]);

  /* ── Loaders ─────────────────────────────────────────────────────── */
  const loadKams = async () => {
    setKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getKams();
      if (res?.data?.status && res?.data?.data) setKams(res.data.data);
      else if (res?.status && res?.data) setKams(res.data);
      else if (Array.isArray(res?.data)) setKams(res.data);
    } catch (err) {
      console.error(err);
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
      console.error(err);
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
      console.error(err);
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
      setSupervisorKams([]);
    }
    setSupervisorKamsLoading(false);
  };

  const loadClientsByKam = async (kamId: string) => {
    setClientsLoading(true);
    setTempClient('all');
    try {
      const res = await ClientAPI.getKamWiseClient(kamId);

      console.log('Client API response:', res); // ← check this in browser console

      const data = res?.data?.data ?? res?.data ?? [];
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setClients([]);
    }
    setClientsLoading(false);
  };

  /* ── Apply ──────────────────────────────────────────────────────── */
  const handleApply = () => {
    let finalKam = tempKam;
    if (tempFilterType === 'supervisor' && tempSupervisor !== 'all' && tempKam === 'all') {
      const ids = supervisorKams.map((k) => String(k.kam_id));
      finalKam = ids.length > 0 ? ids.join(',') : 'all';
    }
    onApply({
      filterType: tempFilterType,
      kam: finalKam,
      division: tempDivision,
      supervisor: tempSupervisor,
      client: tempClient,
      status: tempStatus, // ← NEW
    });
    setIsOpen(false);
  };

  /* ── Reset / Clear ──────────────────────────────────────────────── */
  const handleReset = () => {
    setTempFilterType('kam');
    setTempKam('all');
    setTempDivision('all');
    setTempSupervisor('all');
    setTempClient('all');
    setTempStatus('all'); // ← NEW
    setSupervisorKams([]);
    setClients([]);
  };

  const handleClear = () => {
    handleReset();
    onClear();
    setIsOpen(false);
  };

  /* ── Badge count ────────────────────────────────────────────────── */
  const activeCount = [
    filters.kam !== 'all',
    filters.division !== 'all',
    filters.supervisor !== 'all',
    filters.client !== 'all',
    filters.status !== 'all', // ← NEW
  ].filter(Boolean).length;

  const showClientPicker = userIsKam
    ? clients.length > 0 || clientsLoading
    : tempKam && tempKam !== 'all' && !tempKam.includes(',');

  /* ── Filter rows ────────────────────────────────────────────────── */
  const filterConfigs = useMemo(() => {
    const rows: any[] = [];

    // ── Status dropdown (always first) ── NEW
    rows.push({
      type: 'select',
      label: 'Status',
      value: tempStatus,
      setter: setTempStatus,
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
      ],
    });

    // ── Filter type selector ──────────────────────────────────────
    if (showTypeSelector) {
      rows.push({
        type: 'select',
        label: 'Filter By',
        value: tempFilterType,
        setter: setTempFilterType,
        options: [
          { value: 'kam', label: 'KAM' },
          // { value: 'supervisor', label: 'Supervisor'  },
        ],
      });
    }

    // ── KAM picker ───────────────────────────────────────────────
    if (!userIsKam && tempFilterType === 'kam') {
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

    // ── Branch picker ────────────────────────────────────────────
    if (!userIsKam && tempFilterType === 'branch') {
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

    // ── Supervisor + KAM sub-filter ──────────────────────────────
    if (!userIsKam && tempFilterType === 'supervisor') {
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

    // ── Client picker ────────────────────────────────────────────
    if (showClientPicker) {
      rows.push({
        type: 'search-select',
        label: 'Client',
        value: tempClient,
        setter: setTempClient,
        loading: clientsLoading,
        options: [
          { label: 'All Clients', value: 'all' },
          ...clients.map((c) => ({ label: c.full_name, value: String(c.id) })),
        ],
      });
    }

    return rows;
  }, [
    tempStatus,
    tempFilterType,
    tempKam,
    tempDivision,
    tempSupervisor,
    tempClient,
    kams,
    branches,
    supervisors,
    supervisorKams,
    clients,
    kamsLoading,
    branchesLoading,
    supervisorsLoading,
    supervisorKamsLoading,
    clientsLoading,
    showTypeSelector,
    showClientPicker,
    userIsKam,
  ]);

  const hasTempFilter =
    tempKam !== 'all' ||
    tempDivision !== 'all' ||
    tempSupervisor !== 'all' ||
    tempClient !== 'all' ||
    tempStatus !== 'all';

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
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
            {filterConfigs.map((f, idx) => {
              if (f.type === 'search-select') {
                return (
                  <React.Fragment key={idx}>
                    <div className="block sm:hidden">
                      <FloatingSelect label={f.label} value={f.value} onValueChange={f.setter}>
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

            {hasTempFilter && (
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
