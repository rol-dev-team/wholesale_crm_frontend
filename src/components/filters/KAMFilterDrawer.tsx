

// // KAMFilterDrawer.tsx
// "use client";

// import React, { useState, useEffect } from 'react';
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
//   DrawerClose
// } from "@/components/ui/drawer"; 
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { divisions } from '@/data/mockData';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { SelectItem } from '@/components/ui/select';

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
//   dateRange: 'monthly' | 'yearly';
//   setDateRange: (val: 'monthly' | 'yearly') => void;
//   startMonth: string; 
//   setStartMonth: (val: string) => void;
//   endMonth: string;
//   setEndMonth: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;
//   onFilterChange: () => void;
// }

// export function KAMFilterDrawer({
//   division,
//   setDivision,
//   kam,
//   setKam,
//   clientType,
//   setClientType,
//   kams,
//   dateRange,
//   setDateRange,
//   startMonth,
//   setStartMonth,
//   endMonth,
//   setEndMonth,
//   startYear,
//   setStartYear,
//   endYear,
//   setEndYear,
//   onFilterChange
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     "January","February","March","April","May","June",
//     "July","August","September","October","November","December"
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
//   const [tempClientType, setTempClientType] = useState<string>(clientType || "All Client");
//   const [tempDateRange, setTempDateRange] = useState<'monthly'|'yearly'>(dateRange);
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');

//   // Update buffer states when props change
//   useEffect(() => setTempDivision(division), [division]);
//   useEffect(() => setTempKam(kam), [kam]);
//   useEffect(() => setTempClientType(clientType), [clientType]);
//   useEffect(() => setTempDateRange(dateRange), [dateRange]);
//   useEffect(() => setTempStartMonth(startMonth), [startMonth]);
//   useEffect(() => setTempEndMonth(endMonth), [endMonth]);
//   useEffect(() => setTempStartYear(startYear), [startYear]);
//   useEffect(() => setTempEndYear(endYear), [endYear]);

//   // Helpers
//   const getPickerDate = (mName: string, yName: string) => {
//     const monthIndex = MONTHS_LIST.indexOf(mName);
//     return new Date(parseInt(yName), monthIndex >= 0 ? monthIndex : 0);
//   };

//   const handleDateChange = (date: Date | null, type: 'start'|'end') => {
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
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setDateRange(tempDateRange);
//     setStartMonth(tempStartMonth);
//     setEndMonth(tempEndMonth);
//     setStartYear(tempStartYear);
//     setEndYear(tempEndYear);
//     onFilterChange();
//   };

//   const handleClearFilters = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType("All Client");
//     setTempDateRange('monthly');
//     setFilterType('kam');
//   };

//   const displayValue = (val: string) => val === 'all' ? '' : val;

//   // Logic to show clear button
//   const hasChanges = tempDivision !== 'all' || tempKam !== 'all' || tempClientType !== "All Client";

//   return (
//     <Drawer direction="right">
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
//             {/* TYPE DROPDOWN */}
//             <FloatingSelect
//               label="Type"
//               value={filterType}
//               onValueChange={(val) => setFilterType(val as 'kam' | 'division')}
//             >
//               <SelectItem value="kam">KAM</SelectItem>
//               <SelectItem value="division">Division</SelectItem>
//             </FloatingSelect>

//             {/* CONDITIONAL DROPDOWNS */}
//             {filterType === 'kam' ? (
//               <>
//                 <FloatingSelect
//                   label="All KAM"
//                   value={displayValue(tempKam)}
//                   onValueChange={setTempKam}
//                 >
//                   <SelectItem value="all">All KAMs</SelectItem>
//                   {kams && kams.length > 0 ? (
//                     kams.map(k => (
//                       <SelectItem key={k.kam_id} value={String(k.kam_id)}>
//                         {k.kam_name}
//                       </SelectItem>
//                     ))
//                   ) : null}
//                 </FloatingSelect>

//                 {/* Client Category Dropdown - Only for KAM Type */}
//                 <FloatingSelect
//                   label="Client Category"
//                   value={tempClientType}
//                   onValueChange={setTempClientType}
//                 >
//                   <SelectItem value="All Client">All Client</SelectItem>
//                   <SelectItem value="Self Client">Self Client</SelectItem>
//                   <SelectItem value="Transferred Client">Transferred Client</SelectItem>
//                 </FloatingSelect>
//               </>
//             ) : (
//               <FloatingSelect
//                 label="Division"
//                 value={displayValue(tempDivision)}
//                 onValueChange={setTempDivision}
//               >
//                 <SelectItem value="all">All Divisions</SelectItem>
//                 {divisions && divisions.map(d => (
//                   <SelectItem key={d} value={d}>{d}</SelectItem>
//                 ))}
//               </FloatingSelect>
//             )}

//             {/* VIEW MODE */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs
//                 value={tempDateRange}
//                 onValueChange={v => setTempDateRange(v as 'monthly'|'yearly')}
//                 className="w-full"
//               >
//                 <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60">
//                   <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* MONTH/YEAR PICKER */}
//             {tempDateRange === 'monthly' ? (
//               <div className="grid grid-cols-2 gap-3">
//                 <div className="space-y-1">
//                   <Label className="text-[10px] text-muted-foreground">From Month</Label>
//                   <DatePicker
//                     selected={getPickerDate(tempStartMonth, tempStartYear)}
//                     onChange={date => handleDateChange(date, 'start')}
//                     showMonthYearPicker
//                     dateFormat="MMMM yyyy"
//                     customInput={
//                       <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
//                         <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempStartMonth} {tempStartYear}
//                       </Button>
//                     }
//                   />
//                 </div>
//                 <div className="space-y-1">
//                   <Label className="text-[10px] text-muted-foreground">To Month</Label>
//                   <DatePicker
//                     selected={getPickerDate(tempEndMonth, tempEndYear)}
//                     onChange={date => handleDateChange(date, 'end')}
//                     showMonthYearPicker
//                     dateFormat="MMMM yyyy"
//                     minDate={getPickerDate(tempStartMonth, tempStartYear)}
//                     customInput={
//                       <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
//                         <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempEndMonth} {tempEndYear}
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
//                   {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
//                 </FloatingSelect>
//                 <FloatingSelect
//                   label="To Year"
//                   value={tempEndYear}
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* Clear Button */}
//             {hasChanges && (
//               <Button 
//                 variant="ghost" 
//                 className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
//                 onClick={handleClearFilters}
//               >
//                 <RotateCcw className="h-4 w-4" /> Clear All Filters
//               </Button>
//             )}
//           </div>

//           <DrawerFooter className="border-t p-6">
//             <DrawerClose asChild>
//               <Button
//                 onClick={handleApplyFilters}
//                 className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
//               >
//                 Apply Filters
//               </Button>
//             </DrawerClose>
//           </DrawerFooter>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }





// KAMFilterDrawer.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer"; 
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { divisions } from '@/data/mockData';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { SelectItem } from '@/components/ui/select';

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
  dateRange: 'monthly' | 'yearly';
  setDateRange: (val: 'monthly' | 'yearly') => void;
  viewMode: 'monthly' | 'yearly';
  setViewMode: (val: 'monthly' | 'yearly') => void;
  startMonth: string; 
  setStartMonth: (val: string) => void;
  endMonth: string;
  setEndMonth: (val: string) => void;
  startYear: string;
  setStartYear: (val: string) => void;
  endYear: string;
  setEndYear: (val: string) => void;
  onFilterChange: () => void;
}

export function KAMFilterDrawer({
  division,
  setDivision,
  kam,
  setKam,
  clientType,
  setClientType,
  kams,
  dateRange,
  setDateRange,
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
  onFilterChange
}: KAMFilterDrawerProps) {

  const MONTHS_LIST = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Get current month as default
  const getCurrentMonthDefaults = () => {
    const now = new Date();
    const monthName = MONTHS_LIST[now.getMonth()];
    const year = now.getFullYear().toString();
    return { monthName, year };
  };

  const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  // Buffer states
  const [tempDivision, setTempDivision] = useState(division);
  const [tempKam, setTempKam] = useState(kam);
  const [tempClientType, setTempClientType] = useState<string>(clientType || "All Client");
  const [tempDateRange, setTempDateRange] = useState<'monthly'|'yearly'>(dateRange);
  const [tempViewMode, setTempViewMode] = useState<'monthly'|'yearly'>(viewMode);
  const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
  const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);
  const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
  const [isOpen, setIsOpen] = useState(false);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // Update buffer states when props change
  useEffect(() => setTempDivision(division), [division]);
  useEffect(() => setTempKam(kam), [kam]);
  useEffect(() => setTempClientType(clientType), [clientType]);
  useEffect(() => setTempDateRange(dateRange), [dateRange]);
  useEffect(() => setTempViewMode(viewMode), [viewMode]);
  useEffect(() => setTempStartMonth(startMonth), [startMonth]);
  useEffect(() => setTempEndMonth(endMonth), [endMonth]);
  useEffect(() => setTempStartYear(startYear), [startYear]);
  useEffect(() => setTempEndYear(endYear), [endYear]);

  // Helpers
  const getPickerDate = (mName: string, yName: string) => {
    const monthIndex = MONTHS_LIST.indexOf(mName);
    return new Date(parseInt(yName), monthIndex >= 0 ? monthIndex : 0);
  };

  const handleDateChange = (date: Date | null, type: 'start'|'end') => {
    if (!date) return;
    const mName = MONTHS_LIST[date.getMonth()];
    const yName = date.getFullYear().toString();
    if (type === 'start') { 
      setTempStartMonth(mName); 
      setTempStartYear(yName); 
    } else { 
      setTempEndMonth(mName); 
      setTempEndYear(yName); 
    }
  };

  const handleApplyFilters = () => {
    // Apply all filter changes
    setDivision(tempDivision);
    setKam(tempKam);
    setClientType(tempClientType);
    setDateRange(tempDateRange);
    setViewMode(tempViewMode);
    setStartMonth(tempStartMonth);
    setEndMonth(tempEndMonth);
    setStartYear(tempStartYear);
    setEndYear(tempEndYear);
    
    // Call callback
    onFilterChange();
    
    // Close drawer after a brief delay to ensure state updates
    setTimeout(() => {
      if (drawerCloseRef.current) {
        drawerCloseRef.current.click();
      }
      setIsOpen(false);
    }, 100);
  };

  const handleClearFilters = () => {
    setTempDivision('all');
    setTempKam('all');
    setTempClientType("All Client");
    setTempDateRange('monthly');
    setTempViewMode('monthly');
    setFilterType('kam');
    setTempStartMonth(defaultMonth);
    setTempEndMonth(defaultMonth);
    setTempStartYear(defaultYear);
    setTempEndYear(defaultYear);
  };

  const displayValue = (val: string) => val === 'all' ? '' : val;

  // Logic to show clear button
  const hasChanges = tempDivision !== 'all' || tempKam !== 'all' || tempClientType !== "All Client";

  return (
    <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2 shadow-sm">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-full max-w-sm ml-auto">
        <div className="flex flex-col h-full">
          <DrawerHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
            <DrawerTitle className="text-xl font-semibold">Filter</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* TYPE DROPDOWN */}
            <FloatingSelect
              label="Type"
              value={filterType}
              onValueChange={(val) => setFilterType(val as 'kam' | 'division')}
            >
              <SelectItem value="kam">KAM</SelectItem>
              <SelectItem value="division">Division</SelectItem>
            </FloatingSelect>

            {/* CONDITIONAL DROPDOWNS */}
            {filterType === 'kam' ? (
              <>
                <FloatingSelect
                  label="All KAM"
                  value={displayValue(tempKam)}
                  onValueChange={setTempKam}
                >
                  <SelectItem value="all">All KAMs</SelectItem>
                  {kams && kams.length > 0 ? (
                    kams.map(k => (
                      <SelectItem key={k.kam_id} value={String(k.kam_id)}>
                        {k.kam_name}
                      </SelectItem>
                    ))
                  ) : null}
                </FloatingSelect>

                {/* Client Category Dropdown - Only for KAM Type */}
                <FloatingSelect
                  label="Client Category"
                  value={tempClientType}
                  onValueChange={setTempClientType}
                >
                  <SelectItem value="All Client">All Client</SelectItem>
                  <SelectItem value="Self Client">Self Client</SelectItem>
                  <SelectItem value="Transferred Client">Transferred Client</SelectItem>
                </FloatingSelect>
              </>
            ) : (
              <FloatingSelect
                label="Division"
                value={displayValue(tempDivision)}
                onValueChange={setTempDivision}
              >
                <SelectItem value="all">All Divisions</SelectItem>
                {divisions && divisions.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </FloatingSelect>
            )}

            {/* VIEW MODE */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                View Mode
              </Label>
              <Tabs
                value={tempViewMode}
                onValueChange={v => setTempViewMode(v as 'monthly'|'yearly')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/60">
                  <TabsTrigger value="monthly" className="text-xs">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="text-xs">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* MONTH/YEAR PICKER */}
            {tempViewMode === 'monthly' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">From Month</Label>
                  <DatePicker
                    selected={getPickerDate(tempStartMonth, tempStartYear)}
                    onChange={date => handleDateChange(date, 'start')}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    customInput={
                      <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempStartMonth} {tempStartYear}
                      </Button>
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">To Month</Label>
                  <DatePicker
                    selected={getPickerDate(tempEndMonth, tempEndYear)}
                    onChange={date => handleDateChange(date, 'end')}
                    showMonthYearPicker
                    dateFormat="MMMM yyyy"
                    minDate={getPickerDate(tempStartMonth, tempStartYear)}
                    customInput={
                      <Button variant="outline" className="w-full justify-start font-normal bg-muted/30 px-2 text-xs">
                        <CalendarIcon className="mr-1 h-3 w-3 opacity-50"/> {tempEndMonth} {tempEndYear}
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  label="From Year"
                  value={tempStartYear}
                  onValueChange={setTempStartYear}
                >
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </FloatingSelect>
                <FloatingSelect
                  label="To Year"
                  value={tempEndYear}
                  onValueChange={setTempEndYear}
                >
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </FloatingSelect>
              </div>
            )}

            {/* Clear Button */}
            {hasChanges && (
              <Button 
                variant="ghost" 
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={handleClearFilters}
              >
                <RotateCcw className="h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </div>

          <DrawerFooter className="border-t p-6 space-y-3">
            <Button
              onClick={handleApplyFilters}
              className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20"
            >
              Apply Filters
            </Button>
            <DrawerClose asChild>
              <Button 
                ref={drawerCloseRef}
                variant="outline" 
                className="w-full py-6"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}