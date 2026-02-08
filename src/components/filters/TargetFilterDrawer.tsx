// components/filters/TargetFilterDrawer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
  DrawerDescription,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RotateCcw, Filter, Check } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PrismAPI } from '@/api/prismAPI';

// ================= TYPES =================
interface Branch {
  id: string | number;
  branch_name: string;
}

interface KAM {
  kam_id?: string | number;
  kam_name?: string;
  employee_id?: string | number;
  full_name?: string;
  value?: string;
  label?: string;
}

interface Supervisor {
  supervisor_id: string | number;
  supervisor: string;
}

interface TargetFilterDrawerProps {
  isSupervisor: boolean;
  supervisor_ids?: string | number;
  isManagement: boolean;
  division: string;
  setDivision: (val: string) => void;
  kam: string;
  setKam: (val: string) => void;
  supervisor: string;
  setSupervisor: (val: string) => void;
  kams: KAM[];
  setKams: (val: KAM[]) => void;
  supervisors: Supervisor[];
  setSupervisors: (val: Supervisor[]) => void;
  viewMode: 'monthly' | 'yearly' | 'quarterly';
  setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
  startMonth: string;
  setStartMonth: (val: string) => void;
  endMonth: string;
  setEndMonth: (val: string) => void;
  startYear: string;
  setStartYear: (val: string) => void;
  endYear: string;
  setEndYear: (val: string) => void;
  quarters: number[];
  setQuarters: (val: number[]) => void;
  quarterYear: string;
  setQuarterYear: (val: string) => void;
  onFilterChange: (payload?: any) => void;
}

// ================= COMPONENT =================
export function TargetFilterDrawer({
  isSupervisor,
  supervisor_ids,
  division,
  setDivision,
  kam,
  setKam,
  supervisor,
  setSupervisor,
  kams,
  setKams,
  viewMode,
  setViewMode,
  startMonth,
  setStartMonth,
  endMonth,
  setEndMonth,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
  quarters,
  setQuarters,
  quarterYear,
  setQuarterYear,
  onFilterChange,
}: TargetFilterDrawerProps) {
  const MONTHS = [
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

  const currentYear = new Date().getFullYear().toString();
  const years = Array.from({ length: 8 }, (_, i) => (new Date().getFullYear() - i).toString());

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'kam' | 'supervisor' | 'division'>('kam');

  const [branches, setBranches] = useState<Branch[]>([]);
  const [supervisorList, setSupervisorList] = useState<Supervisor[]>([]);
  const [localKams, setLocalKams] = useState<KAM[]>([]);

  // TEMP STATES
  const [tempDivision, setTempDivision] = useState(division);
  const [tempKam, setTempKam] = useState(kam);
  const [tempSupervisor, setTempSupervisor] = useState(supervisor);
  const [tempViewMode, setTempViewMode] = useState(viewMode);
  const [tempStartMonth, setTempStartMonth] = useState(startMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear);
  const [tempEndYear, setTempEndYear] = useState(endYear);
  const [tempQuarters, setTempQuarters] = useState<number[]>(
    quarters.length ? quarters : [Math.floor(new Date().getMonth() / 3) + 1]
  );
  const [tempQuarterYear, setTempQuarterYear] = useState(quarterYear || currentYear);

  // ================= API FUNCTIONS =================

  const loadBranches = async () => {
    try {
      const res = await PrismAPI.getBranchList();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setBranches(data);
    } catch (err) {
      console.error('❌ Branch fetch error', err);
      setBranches([]);
    }
  };

  const loadFetchSupervisors = async () => {
    try {
      const res = await PrismAPI.getSupervisors();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setSupervisorList(data);
    } catch (err) {
      console.error('❌ Supervisor fetch error', err);
      setSupervisorList([]);
    }
  };

  // ✅ MAIN FIX: load all or supervisor-wise KAMs
  const loadFetchKams = async (supervisorId?: string) => {
    try {
      let res;

      if (supervisorId && supervisorId !== 'all') {
        res = await PrismAPI.getSupervisorWiseKAMList(supervisorId);
      } else {
        res = await PrismAPI.getKams();
      }

      const kamData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setLocalKams(kamData);
      setKams(kamData); // optional parent update
    } catch (err) {
      console.error('❌ KAM fetch error', err);
      setLocalKams([]);
    }
  };

  // ================= DRAWER OPEN LOGIC =================
  useEffect(() => {
    if (!isOpen) return;

    if (isSupervisor) {
      // Supervisor login
      setTempSupervisor(String(supervisor_ids || ''));
      setFilterType('supervisor');
      loadFetchKams(String(supervisor_ids));
    } else {
      // Admin / Management login
      setTempDivision(division);
      setTempKam(kam);
      setTempSupervisor(supervisor);
      setTempViewMode(viewMode);
      setTempStartMonth(startMonth);
      setTempEndMonth(endMonth);
      setTempStartYear(startYear);
      setTempEndYear(endYear);
      setTempQuarters(quarters);
      setTempQuarterYear(quarterYear || currentYear);

      if (supervisor !== 'all') setFilterType('supervisor');
      else if (division !== 'all') setFilterType('division');
      else setFilterType('kam');

      loadBranches();
      loadFetchSupervisors();
      loadFetchKams(); // ✅ load ALL KAMs by default
    }
  }, [isOpen]);

  // ================= HELPERS =================

  const getPickerDate = (m: string, y: string) => {
    const idx = MONTHS.indexOf(m);
    return new Date(parseInt(y), idx >= 0 ? idx : 0);
  };

  const toggleQuarter = (q: number) => {
    setTempQuarters((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q].sort()
    );
  };

  const buildPayload = () => {
    const payload = {
      filter_type: filterType || '',
      kam_id: filterType === 'kam' ? tempKam : '',
      supervisor_id: filterType === 'supervisor' ? tempSupervisor : '',
      division: filterType === 'division' ? tempDivision : '',
      from_month: '',
      to_month: '',
      quaterly_year: '',
      quater: [] as string[],
    };

    if (tempViewMode === 'monthly') {
      payload.from_month = `${tempStartYear}-${String(MONTHS.indexOf(tempStartMonth) + 1).padStart(2, '0')}-01`;
      payload.to_month = `${tempEndYear}-${String(MONTHS.indexOf(tempEndMonth) + 1).padStart(2, '0')}-28`;
    }

    if (tempViewMode === 'quarterly') {
      payload.quaterly_year = tempQuarterYear;
      payload.quater = tempQuarters.map((q) => `q${q}`);
    }

    return payload;
  };

  const handleApply = () => {
    const payload = buildPayload();
    onFilterChange(payload);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempDivision('all');
    setTempKam('all');
    setTempSupervisor('all');
    setTempViewMode('monthly');
    setTempStartMonth(MONTHS[new Date().getMonth()]);
    setTempEndMonth(MONTHS[new Date().getMonth()]);
    setTempStartYear(currentYear);
    setTempEndYear(currentYear);
    setTempQuarters([Math.floor(new Date().getMonth() / 3) + 1]);
    setTempQuarterYear(currentYear);

    loadFetchKams(); // ✅ reset to ALL KAMs
    onFilterChange();
  };

  // ================= RENDER =================

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Filter className="h-4 w-4 mr-1" /> Filters
      </Button>

      <DrawerContent className="w-full sm:w-[420px]">
        <DrawerHeader className="flex items-center justify-between">
          <div>
            <DrawerTitle>Target Filters</DrawerTitle>
            <DrawerDescription className="sr-only">
              Filter targets by KAM, Supervisor, Division, and time period
            </DrawerDescription>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 py-2">
            {!isSupervisor && (
              <FloatingSelect label="Filter Type" value={filterType} onValueChange={setFilterType}>
                <SelectItem value="kam">KAM</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="division">Division</SelectItem>
              </FloatingSelect>
            )}

            {/* KAM FILTER */}
            {(filterType === 'kam' || isSupervisor) && (
              <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
                <SelectItem value="all">All</SelectItem>
                {localKams.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No KAM found
                  </SelectItem>
                ) : (
                  localKams.map((k) => (
                    <SelectItem
                      key={k.kam_id || k.employee_id}
                      value={String(k.kam_id || k.employee_id)}
                    >
                      {k.kam_name || k.full_name}
                    </SelectItem>
                  ))
                )}
              </FloatingSelect>
            )}

            {/* SUPERVISOR FILTER */}
            {filterType === 'supervisor' && !isSupervisor && (
              <>
                <FloatingSelect
                  label="Supervisor"
                  value={tempSupervisor}
                  onValueChange={(val) => {
                    setTempSupervisor(val);
                    setTempKam('all');

                    if (val === 'all') {
                      loadFetchKams(); // ✅ ALL KAMs
                    } else {
                      loadFetchKams(val); // ✅ supervisor-wise KAMs
                    }
                  }}
                >
                  <SelectItem value="all">All</SelectItem>
                  {supervisorList.map((s) => (
                    <SelectItem key={s.supervisor_id} value={String(s.supervisor_id)}>
                      {s.supervisor}
                    </SelectItem>
                  ))}
                </FloatingSelect>

                <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
                  <SelectItem value="all">All</SelectItem>
                  {localKams.map((k) => (
                    <SelectItem
                      key={k.kam_id || k.employee_id}
                      value={String(k.kam_id || k.employee_id)}
                    >
                      {k.kam_name || k.full_name}
                    </SelectItem>
                  ))}
                </FloatingSelect>
              </>
            )}

            {/* DIVISION FILTER */}
            {filterType === 'division' && !isSupervisor && (
              <FloatingSelect label="Division" value={tempDivision} onValueChange={setTempDivision}>
                <SelectItem value="all">All</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.branch_name}
                  </SelectItem>
                ))}
              </FloatingSelect>
            )}

            {/* VIEW MODE */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
              <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* MONTHLY */}
            {tempViewMode === 'monthly' && (
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  selected={getPickerDate(tempStartMonth, tempStartYear)}
                  onChange={(d) => {
                    if (!d) return;
                    setTempStartMonth(MONTHS[d.getMonth()]);
                    setTempStartYear(d.getFullYear().toString());
                  }}
                  showMonthYearPicker
                  dateFormat="MMMM yyyy"
                  customInput={<FloatingDatePickerInput label="From Month" />}
                />
                <DatePicker
                  selected={getPickerDate(tempEndMonth, tempEndYear)}
                  onChange={(d) => {
                    if (!d) return;
                    setTempEndMonth(MONTHS[d.getMonth()]);
                    setTempEndYear(d.getFullYear().toString());
                  }}
                  showMonthYearPicker
                  dateFormat="MMMM yyyy"
                  customInput={<FloatingDatePickerInput label="To Month" />}
                />
              </div>
            )}

            {/* QUARTERLY */}
            {tempViewMode === 'quarterly' && (
              <div className="space-y-4">
                <FloatingSelect
                  label="Year"
                  value={tempQuarterYear}
                  onValueChange={setTempQuarterYear}
                >
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </FloatingSelect>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase text-muted-foreground">
                    Select Quarters
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((q) => (
                      <Button
                        key={q}
                        onClick={() => toggleQuarter(q)}
                        variant={tempQuarters.includes(q) ? 'default' : 'outline'}
                        className="w-full flex items-center justify-center gap-1"
                      >
                        {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              className="w-full text-destructive flex gap-2 py-4"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" /> Clear All Filters
            </Button>
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
