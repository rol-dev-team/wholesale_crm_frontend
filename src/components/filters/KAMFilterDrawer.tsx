// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Filter, X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
//   DrawerFooter,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { divisions } from '@/data/mockData';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { SelectItem } from '@/components/ui/select';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// interface KAMFilterDrawerProps {
//   division: string;
//   setDivision: (val: string) => void;
//   kam: string;
//   setKam: (val: string) => void;
//   clientType: string;
//   setClientType: (val: string) => void;
//   kams: KAM[];
//   setKams: (val: KAM[]) => void;
//   dateRange: 'monthly' | 'yearly';
//   setDateRange: (val: 'monthly' | 'yearly') => void;
//   viewMode: 'monthly' | 'yearly';
//   setViewMode: (val: 'monthly' | 'yearly') => void;
//   startMonth: string;
//   setStartMonth: (val: string) => void;
//   endMonth: string;
//   setEndMonth: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;
//   onFilterChange: () => void;
//   userRole?: string; // New prop for user role
// }

// export function KAMFilterDrawer({
//   division,
//   setDivision,
//   kam,
//   setKam,
//   clientType,
//   setClientType,
//   kams,
//   setKams,
//   dateRange,
//   setDateRange,
//   viewMode,
//   setViewMode,
//   startMonth,
//   setStartMonth,
//   endMonth,
//   setEndMonth,
//   startYear,
//   setStartYear,
//   endYear,
//   setEndYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {
//   const MONTHS_LIST = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December',
//   ];

//   // Get current month as default
//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     const monthName = MONTHS_LIST[now.getMonth()];
//     const year = now.getFullYear().toString();
//     return { monthName, year };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();

//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   // Buffer states
//   const [tempDivision, setTempDivision] = useState(division);
//   const [tempKam, setTempKam] = useState(kam);
//   const [tempClientType, setTempClientType] = useState<string>(clientType || 'All Client');
//   const [tempDateRange, setTempDateRange] = useState<'monthly' | 'yearly'>(dateRange);
//   const [tempViewMode, setTempViewMode] = useState<'monthly' | 'yearly'>(viewMode);
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [isOpen, setIsOpen] = useState(false);
//   const [kamsLoading, setKamsLoading] = useState(false);
//   const drawerCloseRef = useRef<HTMLButtonElement>(null);

//   // Load KAMs when drawer opens (for supervisor, only load their KAMs)
//   useEffect(() => {
//     if (isOpen && kams.length === 0) {
//       loadKams();
//     }
//   }, [isOpen]);

//   // Load KAMs from backend
//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       // For supervisor role, the backend will automatically filter KAMs
//       const response = await KamPerformanceApi.getFilterKamList();
      
//       if (response.success && response.data) {
//         setKams(response.data);
        
//         // If supervisor and no KAM is selected, auto-select the first one
//         if (userRole === 'supervisor' && !kam && response.data.length > 0) {
//           setTempKam(String(response.data[0].kam_id));
//         }
//       }
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   // Update buffer states when props change
//   useEffect(() => setTempDivision(division), [division]);
//   useEffect(() => setTempKam(kam), [kam]);
//   useEffect(() => setTempClientType(clientType), [clientType]);
//   useEffect(() => setTempDateRange(dateRange), [dateRange]);
//   useEffect(() => setTempViewMode(viewMode), [viewMode]);
//   useEffect(() => setTempStartMonth(startMonth), [startMonth]);
//   useEffect(() => setTempEndMonth(endMonth), [endMonth]);
//   useEffect(() => setTempStartYear(startYear), [startYear]);
//   useEffect(() => setTempEndYear(endYear), [endYear]);

//   // Helpers
//   const getPickerDate = (mName: string, yName: string) => {
//     const monthIndex = MONTHS_LIST.indexOf(mName);
//     return new Date(parseInt(yName), monthIndex >= 0 ? monthIndex : 0);
//   };

//   const handleDateChange = (date: Date | null, type: 'start' | 'end') => {
//     if (!date) return;
//     const mName = MONTHS_LIST[date.getMonth()];
//     const yName = date.getFullYear().toString();
//     if (type === 'start') {
//       setTempStartMonth(mName);
//       setTempStartYear(yName);
//     } else {
//       setTempEndMonth(mName);
//       setTempEndYear(yName);
//     }
//   };

//   const handleApplyFilters = () => {
//     // Apply all filter changes
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setDateRange(tempDateRange);
//     setViewMode(tempViewMode);
//     setStartMonth(tempStartMonth);
//     setEndMonth(tempEndMonth);
//     setStartYear(tempStartYear);
//     setEndYear(tempEndYear);

//     // Call callback
//     onFilterChange();

//     // Close drawer after a brief delay to ensure state updates
//     setTimeout(() => {
//       if (drawerCloseRef.current) {
//         drawerCloseRef.current.click();
//       }
//       setIsOpen(false);
//     }, 100);
//   };

//   const handleClearFilters = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempDateRange('monthly');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//   };

//   const displayValue = (val: string) => (val === 'all' ? '' : val);

//   // Logic to show clear button
//   const hasChanges = tempDivision !== 'all' || tempKam !== 'all' || tempClientType !== 'All Client';

//   // For KAM role, disable most filter options
//   const isKamRole = userRole === 'kam';

//   // Show KAM selector only for non-KAM roles
//   const showKamSelector = !isKamRole;

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <DrawerTrigger asChild>
//         <Button variant="outline" className="gap-2 shadow-sm">
//           <Filter className="h-4 w-4" /> Filters
//         </Button>
//       </DrawerTrigger>

//       <DrawerContent className="h-full max-w-sm ml-auto">
//         <div className="flex flex-col h-full">
//           <DrawerHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
//             <DrawerTitle className="text-xl font-semibold">Filter</DrawerTitle>
//             <DrawerClose asChild>
//               <Button variant="ghost" size="icon" className="h-9 w-9">
//                 <X className="h-5 w-5" />
//               </Button>
//             </DrawerClose>
//           </DrawerHeader>

//           <div className="flex-1 overflow-y-auto p-6 space-y-6">
//             {/* For KAM role, show limited filters */}
//             {isKamRole ? (
//               <>
//                 <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
//                   <p className="text-xs font-medium text-amber-800">
//                     As a KAM, you can only view your own data. Limited filters available.
//                   </p>
//                 </div>
//               </>
//             ) : (
//               <>
//                 {/* TYPE DROPDOWN - Only for non-KAM roles */}
//                 {userRole !== 'kam' && (
//                   <FloatingSelect
//                     label="Type"
//                     value={filterType}
//                     onValueChange={(val) => setFilterType(val as 'kam' | 'division')}
//                   >
//                     <SelectItem value="kam">KAM</SelectItem>
//                     <SelectItem value="division">Division</SelectItem>
//                   </FloatingSelect>
//                 )}

//                 {/* CONDITIONAL DROPDOWNS */}
//                 {filterType === 'kam' ? (
//                   <>
//                     {/* KAM Dropdown */}
//                     {/* <FloatingSelect
//                       label="All KAM"
//                       value={displayValue(tempKam)}
//                       onValueChange={setTempKam}
//                     >
//                       <SelectItem value="all">
//                         {kamsLoading ? 'Loading KAMs...' : 'All KAMs'}
//                       </SelectItem>
//                       {kams && kams.length > 0
//                         ? kams.map((k) => (
//                             <SelectItem key={k.kam_id} value={String(k.kam_id)}>
//                               {k.kam_name}
//                             </SelectItem>
//                           ))
//                         : null}
//                     </FloatingSelect> */}

//                     <FloatingSelect
//                       label="All KAM"
//                       value={tempKam ?? "all"}
//                       onValueChange={setTempKam}
//                     >
//                       <SelectItem value="all">All</SelectItem>

//                       {kamsLoading ? (
//                         <SelectItem value="loading" disabled>
//                           Loading KAMs...
//                         </SelectItem>
//                       ) : (
//                         kams?.map((k) => (
//                           <SelectItem key={k.kam_id} value={String(k.kam_id)}>
//                             {k.kam_name}
//                           </SelectItem>
//                         ))
//                       )}
//                     </FloatingSelect>


//                     {/* Client Category Dropdown - Only for KAM Type and supervisor role */}
//                     {userRole !== 'kam' && (
//                       <FloatingSelect
//                         label="Client Category"
//                         value={tempClientType}
//                         onValueChange={setTempClientType}
//                       >
//                         <SelectItem value="All Client">All Client</SelectItem>
//                         <SelectItem value="Self Client">Self Client</SelectItem>
//                         <SelectItem value="Transferred Client">
//                           Transferred Client
//                         </SelectItem>
//                       </FloatingSelect>
//                     )}
//                   </>
//                 ) : (
//                   <FloatingSelect
//                     label="Division"
//                     value={displayValue(tempDivision)}
//                     onValueChange={setTempDivision}
//                   >
//                     <SelectItem value="all">All Divisions</SelectItem>
//                     {divisions &&
//                       divisions.map((d) => (
//                         <SelectItem key={d} value={d}>
//                           {d}
//                         </SelectItem>
//                       ))}
//                   </FloatingSelect>
//                 )}
//               </>
//             )}

//             {/* VIEW MODE - Show for all roles */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs
//                 value={tempViewMode}
//                 onValueChange={(v) => setTempViewMode(v as 'monthly' | 'yearly')}
//                 className="w-full"
//               >
//                 <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60">
//                   <TabsTrigger value="monthly" className="text-xs">
//                     Monthly
//                   </TabsTrigger>
//                   <TabsTrigger value="yearly" className="text-xs">
//                     Yearly
//                   </TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* MONTH/YEAR PICKER */}
//             {tempViewMode === 'monthly' ? (
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <Label className="text-[10px] text-muted-foreground">From Month</Label>
//                   <DatePicker
//                     selected={getPickerDate(tempStartMonth, tempStartYear)}
//                     onChange={(date) => handleDateChange(date, 'start')}
//                     showMonthYearPicker
//                     dateFormat="MMMM yyyy"
//                     customInput={
//                       <Button
//                         variant="outline"
//                         className="w-full justify-start font-normal bg-muted/30 px-2 text-xs"
//                       >
//                         <CalendarIcon className="mr-1 h-3 w-3 opacity-50" /> {tempStartMonth}{' '}
//                         {tempStartYear}
//                       </Button>
//                     }
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-[10px] text-muted-foreground">To Month</Label>
//                   <DatePicker
//                     selected={getPickerDate(tempEndMonth, tempEndYear)}
//                     onChange={(date) => handleDateChange(date, 'end')}
//                     showMonthYearPicker
//                     dateFormat="MMMM yyyy"
//                     minDate={getPickerDate(tempStartMonth, tempStartYear)}
//                     customInput={
//                       <Button
//                         variant="outline"
//                         className="w-full justify-start font-normal bg-muted/30 px-2 text-xs"
//                       >
//                         <CalendarIcon className="mr-1 h-3 w-3 opacity-50" /> {tempEndMonth}{' '}
//                         {tempEndYear}
//                       </Button>
//                     }
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect
//                   label="From Year"
//                   value={tempStartYear}
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* Clear Button */}
//             {hasChanges && !isKamRole && (
//               <Button
//                 variant="ghost"
//                 className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
//                 onClick={handleClearFilters}
//               >
//                 <RotateCcw className="h-4 w-4" /> Clear All Filters
//               </Button>
//             )}
//           </div>

//           <DrawerFooter className="border-t p-6 space-y-3">
//             <Button
//               onClick={handleApplyFilters}
//               className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
//             >
//               Apply Filters
//             </Button>
//             <DrawerClose asChild>
//               <Button ref={drawerCloseRef} variant="outline" className="w-full py-6">
//                 Cancel
//               </Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }


// components/filters/KAMFilterDrawer.tsx
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
import { X, RotateCcw, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';

import { divisions } from '@/data/mockData';
import { KamPerformanceApi } from '@/api/kamPerformanceApi';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface KAM {
  kam_id: string | number;
  kam_name: string;
}

interface KAMFilterDrawerProps {
  division: string;
  setDivision: (val: string) => void;
  kam: string;
  setKam: (val: string) => void;
  clientType: string;
  setClientType: (val: string) => void;
  kams: KAM[];
  setKams: (val: KAM[]) => void;
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

  // ✅ Quarter fields (add in parent also)
  quarter?: number;
  setQuarter?: (val: number) => void;
  quarterYear?: string;
  setQuarterYear?: (val: string) => void;

  onFilterChange: () => void;
  userRole?: string;
}

export function KAMFilterDrawer({
  division,
  setDivision,
  kam,
  setKam,
  clientType,
  setClientType,
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
  quarter = 1,
  setQuarter,
  quarterYear,
  setQuarterYear,
  onFilterChange,
  userRole = 'super_admin',
}: KAMFilterDrawerProps) {

  const MONTHS_LIST = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const getCurrentMonthDefaults = () => {
    const now = new Date();
    return {
      monthName: MONTHS_LIST[now.getMonth()],
      year: now.getFullYear().toString(),
    };
  };

  const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  /* ------------------------------------------------------------------ */
  /* STATES */
  /* ------------------------------------------------------------------ */

  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
  const [kamsLoading, setKamsLoading] = useState(false);

  const [tempDivision, setTempDivision] = useState(division || 'all');
  const [tempKam, setTempKam] = useState(kam || 'all');
  const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
  const [tempViewMode, setTempViewMode] = useState(viewMode);

  const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
  const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

  // ✅ Quarter state (like SetTargetModal)
  const [tempQuarter, setTempQuarter] = useState<number>(quarter);
  const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultYear);

  const isKamRole = userRole === 'kam';
  const showKamSelector = !isKamRole;

  /* ------------------------------------------------------------------ */
  /* LOAD KAMS */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (isOpen && kams.length === 0) loadKams();
  }, [isOpen]);

  const loadKams = async () => {
    setKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getFilterKamList();
      if (res.success && res.data) setKams(res.data);
    } catch (err) {
      console.error('Error loading KAMs:', err);
    }
    setKamsLoading(false);
  };

  /* ------------------------------------------------------------------ */
  /* DATE HELPERS */
  /* ------------------------------------------------------------------ */

  const getPickerDate = (m: string, y: string) => {
    const idx = MONTHS_LIST.indexOf(m);
    return new Date(parseInt(y), idx >= 0 ? idx : 0);
  };

  const selectedQuarterDate = new Date(Number(tempQuarterYear), (tempQuarter - 1) * 3);

  /* ------------------------------------------------------------------ */
  /* APPLY & RESET */
  /* ------------------------------------------------------------------ */

  const handleApply = () => {
    setDivision(tempDivision);
    setKam(tempKam);
    setClientType(tempClientType);
    setViewMode(tempViewMode);
    setStartMonth(tempStartMonth);
    setEndMonth(tempEndMonth);
    setStartYear(tempStartYear);
    setEndYear(tempEndYear);

    if (setQuarter) setQuarter(tempQuarter);
    if (setQuarterYear) setQuarterYear(tempQuarterYear);

    onFilterChange();
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempDivision('all');
    setTempKam('all');
    setTempClientType('All Client');
    setTempViewMode('monthly');
    setFilterType('kam');
    setTempStartMonth(defaultMonth);
    setTempEndMonth(defaultMonth);
    setTempStartYear(defaultYear);
    setTempEndYear(defaultYear);
    setTempQuarter(1);
    setTempQuarterYear(defaultYear);
  };

  /* ------------------------------------------------------------------ */
  /* FILTER CONFIG */
  /* ------------------------------------------------------------------ */

  const filterConfigs = useMemo(() => {
    const filters: any[] = [];

    if (!isKamRole) {
      filters.push({
        type: 'select',
        label: 'Type',
        value: filterType,
        setter: setFilterType,
        options: [
          { value: 'kam', label: 'KAM' },
          { value: 'division', label: 'Division' },
        ],
      });
    }

    if (filterType === 'kam' && showKamSelector) {
      filters.push({
        type: 'search-select',
        label: 'KAM',
        value: tempKam,
        setter: setTempKam,
        options: [
          { label: 'All', value: 'all' },
          ...kams.map((k) => ({
            label: k.kam_name,
            value: String(k.kam_id),
          })),
        ],
      });
    }

    if (filterType === 'division') {
      filters.push({
        type: 'search-select',
        label: 'Division',
        value: tempDivision,
        setter: setTempDivision,
        options: [
          { label: 'All Divisions', value: 'all' },
          ...divisions.map((d) => ({ label: d, value: d })),
        ],
      });
    }

    return filters;
  }, [filterType, tempKam, tempDivision, kams]);

  /* ------------------------------------------------------------------ */
  /* RENDER */
  /* ------------------------------------------------------------------ */

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Filter className="h-4 w-4" /> Filters
      </Button>

      <DrawerContent className="w-full sm:w-[420px]">
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

            {/* Dynamic Filters */}
            {filterConfigs.map((filter, idx) => {
              if (filter.type === 'search-select') {
                return (
                  <FloatingSearchSelect key={idx} label={filter.label} value={filter.value} searchable onValueChange={filter.setter}>
                    {filter.options.map((o: any) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </FloatingSearchSelect>
                );
              }

              if (filter.type === 'select') {
                return (
                  <FloatingSelect key={idx} label={filter.label} value={filter.value} onValueChange={filter.setter}>
                    {filter.options.map((o: any) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </FloatingSelect>
                );
              }

              return null;
            })}

            {/* ✅ View Mode (Monthly / Yearly / Quarter) */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                View Mode
              </Label>
              <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarter</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* ✅ Monthly Picker */}
            {tempViewMode === 'monthly' && (
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  selected={getPickerDate(tempStartMonth, tempStartYear)}
                  onChange={(d) => {
                    if (!d) return;
                    setTempStartMonth(MONTHS_LIST[d.getMonth()]);
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
                    setTempEndMonth(MONTHS_LIST[d.getMonth()]);
                    setTempEndYear(d.getFullYear().toString());
                  }}
                  showMonthYearPicker
                  dateFormat="MMMM yyyy"
                  customInput={<FloatingDatePickerInput label="To Month" />}
                />
              </div>
            )}

            {/* ✅ Yearly Picker */}
            {tempViewMode === 'yearly' && (
              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect label="From Year" value={tempStartYear} onValueChange={setTempStartYear}>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
            )}

            {/* ✅ Quarter Picker (LIKE SetTargetModal) */}
            {tempViewMode === 'quarterly' && (
              <DatePicker
                selected={selectedQuarterDate}
                onChange={(d: Date | null) => {
                  if (!d) return;
                  const q = Math.floor(d.getMonth() / 3) + 1;
                  setTempQuarter(q);
                  setTempQuarterYear(d.getFullYear().toString());
                }}
                showQuarterYearPicker
                dateFormat="yyyy, QQQ"
                customInput={<FloatingDatePickerInput label="Quarter & Year" />}
              />
            )}

            {/* Reset */}
            <Button variant="ghost" className="w-full text-destructive flex gap-2 py-4" onClick={handleReset}>
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
