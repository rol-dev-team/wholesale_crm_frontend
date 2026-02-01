<<<<<<< HEAD
// // KAMFilterDrawer.tsx
=======




// // components/filters/KAMFilterDrawer.tsx
>>>>>>> origin/SamirMod
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

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
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth: string;
//   setStartMonth: (val: string) => void;
//   endMonth: string;
//   setEndMonth: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Quarter fields (add in parent also)
//   quarter?: number;
//   setQuarter?: (val: number) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
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
//   quarter = 1,
//   setQuarter,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [kamsLoading, setKamsLoading] = useState(false);

//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarter state (like SetTargetModal)
//   const [tempQuarter, setTempQuarter] = useState<number>(quarter);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//   }, [isOpen]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   const selectedQuarterDate = new Date(Number(tempQuarterYear), (tempQuarter - 1) * 3);

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);
//     setStartMonth(tempStartMonth);
//     setEndMonth(tempEndMonth);
//     setStartYear(tempStartYear);
//     setEndYear(tempEndYear);

//     if (setQuarter) setQuarter(tempQuarter);
//     if (setQuarterYear) setQuarterYear(tempQuarterYear);

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarter(1);
//     setTempQuarterYear(defaultYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: filterType,
//         setter: setFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'division', label: 'Division' },
//         ],
//       });
//     }

//     if (filterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//       });
//     }

//     if (filterType === 'division') {
//       filters.push({
//         type: 'search-select',
//         label: 'Division',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: [
//           { label: 'All Divisions', value: 'all' },
//           ...divisions.map((d) => ({ label: d, value: d })),
//         ],
//       });
//     }

//     return filters;
//   }, [filterType, tempKam, tempDivision, kams]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect key={idx} label={filter.label} value={filter.value} searchable onValueChange={filter.setter}>
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect key={idx} label={filter.label} value={filter.value} onValueChange={filter.setter}>
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarter) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ Monthly Picker */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ Yearly Picker */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect label="From Year" value={tempStartYear} onValueChange={setTempStartYear}>
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ Quarter Picker (LIKE SetTargetModal) */}
//             {tempViewMode === 'quarterly' && (
//               <DatePicker
//                 selected={selectedQuarterDate}
//                 onChange={(d: Date | null) => {
//                   if (!d) return;
//                   const q = Math.floor(d.getMonth() / 3) + 1;
//                   setTempQuarter(q);
//                   setTempQuarterYear(d.getFullYear().toString());
//                 }}
//                 showQuarterYearPicker
//                 dateFormat="yyyy, QQQ"
//                 customInput={<FloatingDatePickerInput label="Quarter & Year" />}
//               />
//             )}

//             {/* Reset */}
//             <Button variant="ghost" className="w-full text-destructive flex gap-2 py-4" onClick={handleReset}>
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }






// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

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
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth?: string;
//   setStartMonth?: (val: string) => void;
//   endMonth?: string;
//   setEndMonth?: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Quarter fields
//   quarter?: number;
//   setQuarter?: (val: number) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
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
//   quarter = 1,
//   setQuarter,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return {
//       quarter: q,
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [kamsLoading, setKamsLoading] = useState(false);

//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   // ✅ Monthly states
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarterly states
//   const [tempQuarter, setTempQuarter] = useState<number>(quarter || defaultQuarter);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//   }, [isOpen]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   const selectedQuarterDate = new Date(Number(tempQuarterYear), (tempQuarter - 1) * 3);

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);

//     // ✅ Apply based on view mode
//     if (tempViewMode === 'monthly') {
//       if (setStartMonth) setStartMonth(tempStartMonth);
//       if (setEndMonth) setEndMonth(tempEndMonth);
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     } else if (tempViewMode === 'quarterly') {
//       // ✅ For quarterly, we don't set month/year individually
//       if (setQuarter) setQuarter(tempQuarter);
//       if (setQuarterYear) setQuarterYear(tempQuarterYear);
//     } else {
//       // yearly
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     }

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarter(defaultQuarter);
//     setTempQuarterYear(defaultQuarterYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: filterType,
//         setter: setFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'division', label: 'Division' },
//         ],
//       });
//     }

//     if (filterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//       });
//     }

//     if (filterType === 'division') {
//       filters.push({
//         type: 'search-select',
//         label: 'Division',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: [
//           { label: 'All Divisions', value: 'all' },
//           ...divisions.map((d) => ({ label: d, value: d })),
//         ],
//       });
//     }

//     return filters;
//   }, [filterType, tempKam, tempDivision, kams]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     searchable 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ MONTHLY PICKER */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ YEARLY PICKER */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect 
//                   label="From Year" 
//                   value={tempStartYear} 
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect 
//                   label="To Year" 
//                   value={tempEndYear} 
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ QUARTERLY PICKER - Single Quarter Selection */}
//             {tempViewMode === 'quarterly' && (
//               <DatePicker
//                 selected={selectedQuarterDate}
//                 onChange={(d: Date | null) => {
//                   if (!d) return;
//                   const q = Math.floor(d.getMonth() / 3) + 1;
//                   setTempQuarter(q);
//                   setTempQuarterYear(d.getFullYear().toString());
//                 }}
//                 showQuarterYearPicker
//                 dateFormat="yyyy, QQQ"
//                 customInput={<FloatingDatePickerInput label="Select Quarter & Year" />}
//               />
//             )}

//             {/* Reset */}
//             <Button 
//               variant="ghost" 
//               className="w-full text-destructive flex gap-2 py-4" 
//               onClick={handleReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }



// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

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
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth?: string;
//   setStartMonth?: (val: string) => void;
//   endMonth?: string;
//   setEndMonth?: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Updated: Support multiple quarters
//   quarters?: number[]; // Array of selected quarters [1, 2, 3, 4]
//   setQuarters?: (val: number[]) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
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
//   quarters = [1],
//   setQuarters,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return {
//       quarter: q,
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [kamsLoading, setKamsLoading] = useState(false);

//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   // ✅ Monthly states
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarterly states - Support multiple quarters
//   const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//   }, [isOpen]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   // ✅ Toggle quarter selection
//   const toggleQuarter = (q: number) => {
//     setTempQuarters((prev) => {
//       if (prev.includes(q)) {
//         // Remove if already selected
//         return prev.filter((quarter) => quarter !== q);
//       } else {
//         // Add and sort
//         return [...prev, q].sort((a, b) => a - b);
//       }
//     });
//   };

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);

//     // ✅ Apply based on view mode
//     if (tempViewMode === 'monthly') {
//       if (setStartMonth) setStartMonth(tempStartMonth);
//       if (setEndMonth) setEndMonth(tempEndMonth);
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     } else if (tempViewMode === 'quarterly') {
//       // ✅ For quarterly, set multiple quarters and year
//       if (setQuarters) setQuarters(tempQuarters);
//       if (setQuarterYear) setQuarterYear(tempQuarterYear);
//     } else {
//       // yearly
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     }

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarters([defaultQuarter]);
//     setTempQuarterYear(defaultQuarterYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: filterType,
//         setter: setFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'division', label: 'Division' },
//         ],
//       });
//     }

//     if (filterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//       });
//     }

//     if (filterType === 'division') {
//       filters.push({
//         type: 'search-select',
//         label: 'Division',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: [
//           { label: 'All Divisions', value: 'all' },
//           ...divisions.map((d) => ({ label: d, value: d })),
//         ],
//       });
//     }

//     return filters;
//   }, [filterType, tempKam, tempDivision, kams]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     searchable 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ MONTHLY PICKER */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ YEARLY PICKER */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect 
//                   label="From Year" 
//                   value={tempStartYear} 
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect 
//                   label="To Year" 
//                   value={tempEndYear} 
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ QUARTERLY PICKER - MULTIPLE SELECTION */}
//             {tempViewMode === 'quarterly' && (
//               <div className="space-y-4">
//                 {/* Year Picker */}
//                 <FloatingSelect 
//                   label="Year" 
//                   value={tempQuarterYear} 
//                   onValueChange={setTempQuarterYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Quarter Buttons - Multiple Selection */}
//                 <div className="space-y-2">
//                   <Label className="text-xs font-bold uppercase text-muted-foreground">
//                     Select Quarters
//                   </Label>
//                   <div className="grid grid-cols-4 gap-2">
//                     {[1, 2, 3, 4].map((q) => (
//                       <Button
//                         key={q}
//                         onClick={() => toggleQuarter(q)}
//                         variant={tempQuarters.includes(q) ? 'default' : 'outline'}
//                         className={`w-full font-semibold ${
//                           tempQuarters.includes(q)
//                             ? 'bg-blue-600 text-white hover:bg-blue-700'
//                             : 'border-slate-300 text-slate-700 hover:bg-slate-50'
//                         }`}
//                       >
//                         <div className="flex items-center justify-center gap-1">
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}
//                           Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected: {tempQuarters.length > 0 ? tempQuarters.map(q => `Q${q}`).join(', ') : 'None'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Reset */}
//             <Button 
//               variant="ghost" 
//               className="w-full text-destructive flex gap-2 py-4" 
//               onClick={handleReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }






// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import { PrismAPI } from '@/api/prismAPI';



// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// interface Branch {
//   id: string | number;
//   branch_name: string;
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
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth?: string;
//   setStartMonth?: (val: string) => void;
//   endMonth?: string;
//   setEndMonth?: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Updated: Support multiple quarters
//   quarters?: number[]; // Array of selected quarters [1, 2, 3, 4]
//   setQuarters?: (val: number[]) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
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
//   quarters = [1],
//   setQuarters,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return {
//       quarter: q,
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [kamsLoading, setKamsLoading] = useState(false);
  
//   // ✅ Branch states
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [branchesLoading, setBranchesLoading] = useState(false);

//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   // ✅ Monthly states
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarterly states - Support multiple quarters
//   const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS & BRANCHES */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//     if (isOpen && branches.length === 0) loadBranches(); // ✅ Load branches when drawer opens
//   }, [isOpen]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   // ✅ Load branches from API
//   const loadBranches = async () => {
//     setBranchesLoading(true);
//     try {
//       const res = await PrismAPI.getBranchList();
//       if (res.data?.status && res.data?.data) {
//         setBranches(res.data.data);
//       }
//     } catch (err) {
//       console.error('Error loading branches:', err);
//     }
//     setBranchesLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   // ✅ Toggle quarter selection
//   const toggleQuarter = (q: number) => {
//     setTempQuarters((prev) => {
//       if (prev.includes(q)) {
//         // Remove if already selected
//         return prev.filter((quarter) => quarter !== q);
//       } else {
//         // Add and sort
//         return [...prev, q].sort((a, b) => a - b);
//       }
//     });
//   };

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);

//     // ✅ Apply based on view mode
//     if (tempViewMode === 'monthly') {
//       if (setStartMonth) setStartMonth(tempStartMonth);
//       if (setEndMonth) setEndMonth(tempEndMonth);
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     } else if (tempViewMode === 'quarterly') {
//       // ✅ For quarterly, set multiple quarters and year
//       if (setQuarters) setQuarters(tempQuarters);
//       if (setQuarterYear) setQuarterYear(tempQuarterYear);
//     } else {
//       // yearly
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     }

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarters([defaultQuarter]);
//     setTempQuarterYear(defaultQuarterYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: filterType,
//         setter: setFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'division', label: 'Division' },
//         ],
//       });
//     }

//     if (filterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//       });
//     }

//     // ✅ Updated: Use branches from API instead of mock data
//     if (filterType === 'division') {
//       filters.push({
//         type: 'search-select',
//         label: 'Division',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: [
//           { label: 'All Divisions', value: 'all' },
//           ...branches.map((b) => ({ 
//             label: b.branch_name, 
//             value: String(b.id) 
//           })),
//         ],
//         loading: branchesLoading, // ✅ Pass loading state
//       });
//     }

//     return filters;
//   }, [filterType, tempKam, tempDivision, kams, branches, branchesLoading]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     searchable 
//                     onValueChange={filter.setter}
//                     disabled={filter.loading} // ✅ Disable while loading
//                   >
//                     {filter.loading ? (
//                       <SelectItem value="loading" disabled>
//                         Loading...
//                       </SelectItem>
//                     ) : (
//                       filter.options.map((o: any) => (
//                         <SelectItem key={o.value} value={o.value}>
//                           {o.label}
//                         </SelectItem>
//                       ))
//                     )}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ MONTHLY PICKER */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ YEARLY PICKER */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect 
//                   label="From Year" 
//                   value={tempStartYear} 
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect 
//                   label="To Year" 
//                   value={tempEndYear} 
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ QUARTERLY PICKER - MULTIPLE SELECTION */}
//             {tempViewMode === 'quarterly' && (
//               <div className="space-y-4">
//                 {/* Year Picker */}
//                 <FloatingSelect 
//                   label="Year" 
//                   value={tempQuarterYear} 
//                   onValueChange={setTempQuarterYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Quarter Buttons - Multiple Selection */}
//                 <div className="space-y-2">
//                   <Label className="text-xs font-bold uppercase text-muted-foreground">
//                     Select Quarters
//                   </Label>
//                   <div className="grid grid-cols-4 gap-2">
//                     {[1, 2, 3, 4].map((q) => (
//                       <Button
//                         key={q}
//                         onClick={() => toggleQuarter(q)}
//                         variant={tempQuarters.includes(q) ? 'default' : 'outline'}
//                         className={`w-full font-semibold ${
//                           tempQuarters.includes(q)
//                             ? 'bg-blue-600 text-white hover:bg-blue-700'
//                             : 'border-slate-300 text-slate-700 hover:bg-slate-50'
//                         }`}
//                       >
//                         <div className="flex items-center justify-center gap-1">
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}
//                           Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected: {tempQuarters.length > 0 ? tempQuarters.map(q => `Q${q}`).join(', ') : 'None'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Reset */}
//             <Button 
//               variant="ghost" 
//               className="w-full text-destructive flex gap-2 py-4" 
//               onClick={handleReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }



// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import { PrismAPI } from '@/api/prismAPI';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// interface Branch {
//   id: string | number;
//   branch_name: string;
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
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth?: string;
//   setStartMonth?: (val: string) => void;
//   endMonth?: string;
//   setEndMonth?: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Updated: Support multiple quarters
//   quarters?: number[]; // Array of selected quarters [1, 2, 3, 4]
//   setQuarters?: (val: number[]) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
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
//   quarters = [1],
//   setQuarters,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return {
//       quarter: q,
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'division'>('kam');
//   const [kamsLoading, setKamsLoading] = useState(false);
  
//   // ✅ Branch states
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [branchesLoading, setBranchesLoading] = useState(false);

//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   // ✅ Monthly states
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarterly states - Support multiple quarters
//   const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS & BRANCHES */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//     if (isOpen && branches.length === 0) loadBranches(); // ✅ Load branches when drawer opens
//   }, [isOpen]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   // ✅ Load branches from API
//   const loadBranches = async () => {
//     setBranchesLoading(true);
//     try {
//       const res = await PrismAPI.getBranchList();
//       console.log('Branch API Response:', res); // Debug log
      
//       // Handle nested data structure: res.data.data
//       if (res?.data?.status && res?.data?.data) {
//         console.log('Branches loaded:', res.data.data); // Debug log
//         setBranches(res.data.data);
//       } else if (res?.data) {
//         // Fallback if response is direct
//         console.log('Direct data:', res.data); // Debug log
//         setBranches(res.data);
//       }
//     } catch (err) {
//       console.error('Error loading branches:', err);
//     }
//     setBranchesLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   // ✅ Toggle quarter selection
//   const toggleQuarter = (q: number) => {
//     setTempQuarters((prev) => {
//       if (prev.includes(q)) {
//         // Remove if already selected
//         return prev.filter((quarter) => quarter !== q);
//       } else {
//         // Add and sort
//         return [...prev, q].sort((a, b) => a - b);
//       }
//     });
//   };

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);

//     // ✅ Apply based on view mode
//     if (tempViewMode === 'monthly') {
//       if (setStartMonth) setStartMonth(tempStartMonth);
//       if (setEndMonth) setEndMonth(tempEndMonth);
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     } else if (tempViewMode === 'quarterly') {
//       // ✅ For quarterly, set multiple quarters and year
//       if (setQuarters) setQuarters(tempQuarters);
//       if (setQuarterYear) setQuarterYear(tempQuarterYear);
//     } else {
//       // yearly
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     }

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setFilterType('kam');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarters([defaultQuarter]);
//     setTempQuarterYear(defaultQuarterYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: filterType,
//         setter: setFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'branch', label: 'Branch' },
//         ],
//       });
//     }

//     if (filterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//       });
//     }




//     // ✅ Updated: Use branches from API instead of mock data
//     if (filterType === 'branch') {
//       console.log('Building division filter, branches:', branches); // Debug log
      
//       const branchOptions = [
//         { label: 'All Branches', value: 'all' },
//         ...branches.map((b) => ({ 
//           label: b.branch_name, 
//           value: String(b.id) 
//         })),
//       ];
      
//       console.log('Branch options:', branchOptions); // Debug log
      
//       filters.push({
//         type: 'search-select',
//         label: 'Branch',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: branchOptions,
//         loading: branchesLoading, // ✅ Pass loading state
//       });
//     }


//         // ✅ CLIENT CATEGORY (NEW 🔥)
// if (userRole !== 'kam') {
//   filters.push({
//     type: 'select',
//     label: 'Client Category',
//     value: tempClientType,
//     setter: setTempClientType,
//     options: [
//       { value: 'All Client', label: 'All Client' },
//       { value: 'Self Client', label: 'Self Client' },
//       { value: 'Transferred Client', label: 'Transferred Client' },
//     ],
//   });
// }

//     return filters;
//   }, [filterType, tempKam, tempDivision, kams, branches, branchesLoading, isKamRole, showKamSelector]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     searchable 
//                     onValueChange={filter.setter}
//                     disabled={filter.loading} // ✅ Disable while loading
//                   >
//                     {filter.loading ? (
//                       <SelectItem value="loading" disabled>
//                         Loading...
//                       </SelectItem>
//                     ) : (
//                       filter.options.map((o: any) => (
//                         <SelectItem key={o.value} value={o.value}>
//                           {o.label}
//                         </SelectItem>
//                       ))
//                     )}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ MONTHLY PICKER */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ YEARLY PICKER */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect 
//                   label="From Year" 
//                   value={tempStartYear} 
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect 
//                   label="To Year" 
//                   value={tempEndYear} 
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ QUARTERLY PICKER - MULTIPLE SELECTION */}
//             {tempViewMode === 'quarterly' && (
//               <div className="space-y-4">
//                 {/* Year Picker */}
//                 <FloatingSelect 
//                   label="Year" 
//                   value={tempQuarterYear} 
//                   onValueChange={setTempQuarterYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Quarter Buttons - Multiple Selection */}
//                 <div className="space-y-2">
//                   <Label className="text-xs font-bold uppercase text-muted-foreground">
//                     Select Quarters
//                   </Label>
//                   <div className="grid grid-cols-4 gap-2">
//                     {[1, 2, 3, 4].map((q) => (
//                       <Button
//                         key={q}
//                         onClick={() => toggleQuarter(q)}
//                         variant={tempQuarters.includes(q) ? 'default' : 'outline'}
//                         className={`w-full font-semibold ${
//                           tempQuarters.includes(q)
//                             ? 'bg-blue-600 text-white hover:bg-blue-700'
//                             : 'border-slate-300 text-slate-700 hover:bg-slate-50'
//                         }`}
//                       >
//                         <div className="flex items-center justify-center gap-1">
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}
//                           Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected: {tempQuarters.length > 0 ? tempQuarters.map(q => `Q${q}`).join(', ') : 'None'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Reset */}
//             <Button 
//               variant="ghost" 
//               className="w-full text-destructive flex gap-2 py-4" 
//               onClick={handleReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }



// // components/filters/KAMFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { divisions } from '@/data/mockData';
// import { KamPerformanceApi } from '@/api/kamPerformanceApi';
// import { PrismAPI } from '@/api/prismAPI';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// interface Branch {
//   id: string | number;
//   branch_name: string;
// }

// interface KAMFilterDrawerProps {
//   // ✅ ADD filterType props
//   filterType?: 'kam' | 'branch';
//   setFilterType?: (val: 'kam' | 'branch') => void;

//   division: string;
//   setDivision: (val: string) => void;
//   kam: string;
//   setKam: (val: string) => void;
//   clientType: string;
//   setClientType: (val: string) => void;
//   kams: KAM[];
//   setKams: (val: KAM[]) => void;
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   startMonth?: string;
//   setStartMonth?: (val: string) => void;
//   endMonth?: string;
//   setEndMonth?: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;

//   // ✅ Updated: Support multiple quarters
//   quarters?: number[];
//   setQuarters?: (val: number[]) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
// }

// export function KAMFilterDrawer({
//   filterType: externalFilterType, // ✅ ADD THIS
//   setFilterType: setExternalFilterType, // ✅ ADD THIS
//   division,
//   setDivision,
//   kam,
//   setKam,
//   clientType,
//   setClientType,
//   kams,
//   setKams,
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
//   quarters = [1],
//   setQuarters,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
//   userRole = 'super_admin',
// }: KAMFilterDrawerProps) {

//   const MONTHS_LIST = [
//     'January','February','March','April','May','June',
//     'July','August','September','October','November','December',
//   ];

//   const getCurrentMonthDefaults = () => {
//     const now = new Date();
//     return {
//       monthName: MONTHS_LIST[now.getMonth()],
//       year: now.getFullYear().toString(),
//     };
//   };

//   const getCurrentQuarterDefaults = () => {
//     const now = new Date();
//     const q = Math.floor(now.getMonth() / 3) + 1;
//     return {
//       quarter: q,
//       year: now.getFullYear().toString(),
//     };
//   };

//   const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
//   const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

//   /* ------------------------------------------------------------------ */
//   /* STATES */
//   /* ------------------------------------------------------------------ */

//   const [isOpen, setIsOpen] = useState(false);
  
//   // ✅ UPDATED: Use external filterType if provided, otherwise internal
//   const [internalFilterType, setInternalFilterType] = useState<'kam' | 'branch'>('kam');
//   const currentFilterType = externalFilterType ?? internalFilterType;
//   const setCurrentFilterType = setExternalFilterType ?? setInternalFilterType;

//   const [kamsLoading, setKamsLoading] = useState(false);
  
//   // ✅ Branch states
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [branchesLoading, setBranchesLoading] = useState(false);

//   const [tempFilterType, setTempFilterType] = useState<'kam' | 'branch'>(currentFilterType); // ✅ ADD THIS
//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
//   const [tempViewMode, setTempViewMode] = useState(viewMode);

//   // ✅ Monthly states
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

//   // ✅ Quarterly states - Support multiple quarters
//   const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
//   const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

//   const isKamRole = userRole === 'kam';
//   const showKamSelector = !isKamRole;

//   /* ------------------------------------------------------------------ */
//   /* LOAD KAMS & BRANCHES */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//     if (isOpen && branches.length === 0) loadBranches();
//   }, [isOpen]);

//   // ✅ Sync temp states when drawer opens
//   useEffect(() => {
//     if (isOpen) {
//       setTempFilterType(currentFilterType);
//       setTempDivision(division);
//       setTempKam(kam);
//       setTempClientType(clientType);
//       setTempViewMode(viewMode);
//       setTempStartMonth(startMonth || defaultMonth);
//       setTempEndMonth(endMonth || defaultMonth);
//       setTempStartYear(startYear);
//       setTempEndYear(endYear);
//       setTempQuarters(quarters);
//       setTempQuarterYear(quarterYear || defaultQuarterYear);
//     }
//   }, [isOpen, currentFilterType, division, kam, clientType, viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getFilterKamList();
//       if (res.success && res.data) setKams(res.data);
//     } catch (err) {
//       console.error('Error loading KAMs:', err);
//     }
//     setKamsLoading(false);
//   };

//   // ✅ Load branches from API
//   const loadBranches = async () => {
//     setBranchesLoading(true);
//     try {
//       const res = await PrismAPI.getBranchList();
//       console.log('Branch API Response:', res);
      
//       if (res?.data?.status && res?.data?.data) {
//         console.log('Branches loaded:', res.data.data);
//         setBranches(res.data.data);
//       } else if (res?.data) {
//         console.log('Direct data:', res.data);
//         setBranches(res.data);
//       }
//     } catch (err) {
//       console.error('Error loading branches:', err);
//     }
//     setBranchesLoading(false);
//   };

//   /* ------------------------------------------------------------------ */
//   /* DATE HELPERS */
//   /* ------------------------------------------------------------------ */

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS_LIST.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   // ✅ Toggle quarter selection
//   const toggleQuarter = (q: number) => {
//     setTempQuarters((prev) => {
//       if (prev.includes(q)) {
//         return prev.filter((quarter) => quarter !== q);
//       } else {
//         return [...prev, q].sort((a, b) => a - b);
//       }
//     });
//   };

//   /* ------------------------------------------------------------------ */
//   /* APPLY & RESET */
//   /* ------------------------------------------------------------------ */

//   const handleApply = () => {
//     // ✅ Apply filterType
//     setCurrentFilterType(tempFilterType);
    
//     setDivision(tempDivision);
//     setKam(tempKam);
//     setClientType(tempClientType);
//     setViewMode(tempViewMode);

//     // ✅ Apply based on view mode
//     if (tempViewMode === 'monthly') {
//       if (setStartMonth) setStartMonth(tempStartMonth);
//       if (setEndMonth) setEndMonth(tempEndMonth);
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     } else if (tempViewMode === 'quarterly') {
//       if (setQuarters) setQuarters(tempQuarters);
//       if (setQuarterYear) setQuarterYear(tempQuarterYear);
//     } else {
//       setStartYear(tempStartYear);
//       setEndYear(tempEndYear);
//     }

//     onFilterChange();
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempFilterType('kam'); // ✅ Reset filterType
//     setTempDivision('all');
//     setTempKam('all');
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarters([defaultQuarter]);
//     setTempQuarterYear(defaultQuarterYear);
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: tempFilterType, // ✅ UPDATED: Use tempFilterType
//         setter: setTempFilterType, // ✅ UPDATED: Use setTempFilterType
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'branch', label: 'Branch' },
//         ],
//       });
//     }

//     if (tempFilterType === 'kam' && showKamSelector) {
//       filters.push({
//         type: 'search-select',
//         label: 'KAM',
//         value: tempKam,
//         setter: setTempKam,
//         options: [
//           { label: 'All', value: 'all' },
//           ...kams.map((k) => ({
//             label: k.kam_name,
//             value: String(k.kam_id),
//           })),
//         ],
//         loading: kamsLoading,
//       });
//     }

//     if (tempFilterType === 'branch') {
//       console.log('Building division filter, branches:', branches);
      
//       const branchOptions = [
//         { label: 'All Branches', value: 'all' },
//         ...branches.map((b) => ({ 
//           label: b.branch_name, 
//           value: String(b.id) 
//         })),
//       ];
      
//       console.log('Branch options:', branchOptions);
      
//       filters.push({
//         type: 'search-select',
//         label: 'Branch',
//         value: tempDivision,
//         setter: setTempDivision,
//         options: branchOptions,
//         loading: branchesLoading,
//       });
//     }

//     // ✅ CLIENT CATEGORY
//     if (userRole !== 'kam') {
//       filters.push({
//         type: 'select',
//         label: 'Client Category',
//         value: tempClientType,
//         setter: setTempClientType,
//         options: [
//           { value: 'All Client', label: 'All Client' },
//           { value: 'Self Client', label: 'Self Client' },
//           { value: 'Transferred Client', label: 'Transferred Client' },
//         ],
//       });
//     }

//     return filters;
//   }, [tempFilterType, tempKam, tempDivision, tempClientType, kams, branches, branchesLoading, kamsLoading, isKamRole, showKamSelector, userRole]);

//   /* ------------------------------------------------------------------ */
//   /* RENDER */
//   /* ------------------------------------------------------------------ */

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>Filters</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">

//             {/* Dynamic Filters */}
//             {filterConfigs.map((filter, idx) => {
//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingSearchSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     searchable 
//                     onValueChange={filter.setter}
//                     disabled={filter.loading}
//                   >
//                     {filter.loading ? (
//                       <SelectItem value="loading" disabled>
//                         Loading...
//                       </SelectItem>
//                     ) : (
//                       filter.options.map((o: any) => (
//                         <SelectItem key={o.value} value={o.value}>
//                           {o.label}
//                         </SelectItem>
//                       ))
//                     )}
//                   </FloatingSearchSelect>
//                 );
//               }

//               if (filter.type === 'select') {
//                 return (
//                   <FloatingSelect 
//                     key={idx} 
//                     label={filter.label} 
//                     value={filter.value} 
//                     onValueChange={filter.setter}
//                   >
//                     {filter.options.map((o: any) => (
//                       <SelectItem key={o.value} value={o.value}>
//                         {o.label}
//                       </SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 );
//               }

//               return null;
//             })}

//             {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">
//                 View Mode
//               </Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   <TabsTrigger value="yearly">Yearly</TabsTrigger>
//                   <TabsTrigger value="quarterly">Quarter</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* ✅ MONTHLY PICKER */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempStartYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="From Month" />}
//                 />
//                 <DatePicker
//                   selected={getPickerDate(tempEndMonth, tempEndYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempEndMonth(MONTHS_LIST[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* ✅ YEARLY PICKER */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect 
//                   label="From Year" 
//                   value={tempStartYear} 
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect 
//                   label="To Year" 
//                   value={tempEndYear} 
//                   onValueChange={setTempEndYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* ✅ QUARTERLY PICKER - MULTIPLE SELECTION */}
//             {tempViewMode === 'quarterly' && (
//               <div className="space-y-4">
//                 {/* Year Picker */}
//                 <FloatingSelect 
//                   label="Year" 
//                   value={tempQuarterYear} 
//                   onValueChange={setTempQuarterYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={y} value={y}>{y}</SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 {/* Quarter Buttons - Multiple Selection */}
//                 <div className="space-y-2">
//                   <Label className="text-xs font-bold uppercase text-muted-foreground">
//                     Select Quarters
//                   </Label>
//                   <div className="grid grid-cols-4 gap-2">
//                     {[1, 2, 3, 4].map((q) => (
//                       <Button
//                         key={q}
//                         onClick={() => toggleQuarter(q)}
//                         variant={tempQuarters.includes(q) ? 'default' : 'outline'}
//                         className={`w-full font-semibold ${
//                           tempQuarters.includes(q)
//                             ? 'bg-blue-600 text-white hover:bg-blue-700'
//                             : 'border-slate-300 text-slate-700 hover:bg-slate-50'
//                         }`}
//                       >
//                         <div className="flex items-center justify-center gap-1">
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}
//                           Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected: {tempQuarters.length > 0 ? tempQuarters.map(q => `Q${q}`).join(', ') : 'None'}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Reset */}
//             <Button 
//               variant="ghost" 
//               className="w-full text-destructive flex gap-2 py-4" 
//               onClick={handleReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         <DrawerFooter>
//           <Button onClick={handleApply} className="w-full">
//             Apply Filters
//           </Button>
//         </DrawerFooter>
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
import { X, RotateCcw, Calendar as CalendarIcon, Filter, Check } from 'lucide-react';
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
import { PrismAPI } from '@/api/prismAPI';

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface KAM {
  kam_id: string | number;
  kam_name: string;
}

interface Branch {
  id: string | number;
  branch_name: string;
}

interface KAMFilterDrawerProps {
  // ✅ ADD filterType props
  filterType?: 'kam' | 'branch';
  setFilterType?: (val: 'kam' | 'branch') => void;

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
  startMonth?: string;
  setStartMonth?: (val: string) => void;
  endMonth?: string;
  setEndMonth?: (val: string) => void;
  startYear: string;
  setStartYear: (val: string) => void;
  endYear: string;
  setEndYear: (val: string) => void;

  // ✅ Updated: Support multiple quarters
  quarters?: number[];
  setQuarters?: (val: number[]) => void;
  quarterYear?: string;
  setQuarterYear?: (val: string) => void;

  onFilterChange: () => void;
  userRole?: string;
}

export function KAMFilterDrawer({
  filterType: externalFilterType, // ✅ ADD THIS
  setFilterType: setExternalFilterType, // ✅ ADD THIS
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
  quarters = [1],
  setQuarters,
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

  const getCurrentQuarterDefaults = () => {
    const now = new Date();
    const q = Math.floor(now.getMonth() / 3) + 1;
    return {
      quarter: q,
      year: now.getFullYear().toString(),
    };
  };

  const { monthName: defaultMonth, year: defaultYear } = getCurrentMonthDefaults();
  const { quarter: defaultQuarter, year: defaultQuarterYear } = getCurrentQuarterDefaults();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - i).toString());

  /* ------------------------------------------------------------------ */
  /* STATES */
  /* ------------------------------------------------------------------ */

  const [isOpen, setIsOpen] = useState(false);
  
  // ✅ UPDATED: Use external filterType if provided, otherwise internal
  const [internalFilterType, setInternalFilterType] = useState<'kam' | 'branch'>('kam');
  const currentFilterType = externalFilterType ?? internalFilterType;
  const setCurrentFilterType = setExternalFilterType ?? setInternalFilterType;

  const [kamsLoading, setKamsLoading] = useState(false);
  
  // ✅ Branch states
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [tempFilterType, setTempFilterType] = useState<'kam' | 'branch'>(currentFilterType); // ✅ ADD THIS
  const [tempDivision, setTempDivision] = useState(division || 'all');
  const [tempKam, setTempKam] = useState(kam || 'all');
  const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
  const [tempViewMode, setTempViewMode] = useState(viewMode);

  // ✅ Monthly states
  const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
  const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

  // ✅ Quarterly states - Support multiple quarters
  const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
  const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

  const isKamRole = userRole === 'kam';
  const showKamSelector = !isKamRole;

  /* ------------------------------------------------------------------ */
  /* LOAD KAMS & BRANCHES */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (isOpen && kams.length === 0) loadKams();
    if (isOpen && branches.length === 0) loadBranches();
  }, [isOpen]);

  // ✅ Sync temp states when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTempFilterType(currentFilterType);
      setTempDivision(division);
      setTempKam(kam);
      setTempClientType(clientType);
      setTempViewMode(viewMode);
      setTempStartMonth(startMonth || defaultMonth);
      setTempEndMonth(endMonth || defaultMonth);
      setTempStartYear(startYear);
      setTempEndYear(endYear);
      setTempQuarters(quarters);
      setTempQuarterYear(quarterYear || defaultQuarterYear);
    }
  }, [isOpen, currentFilterType, division, kam, clientType, viewMode, startMonth, endMonth, startYear, endYear, quarters, quarterYear]);

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

  // ✅ Load branches from API
  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await PrismAPI.getBranchList();
      console.log('Branch API Response:', res);
      
      if (res?.data?.status && res?.data?.data) {
        console.log('Branches loaded:', res.data.data);
        setBranches(res.data.data);
      } else if (res?.data) {
        console.log('Direct data:', res.data);
        setBranches(res.data);
      }
    } catch (err) {
      console.error('Error loading branches:', err);
    }
    setBranchesLoading(false);
  };

  /* ------------------------------------------------------------------ */
  /* DATE HELPERS */
  /* ------------------------------------------------------------------ */

  const getPickerDate = (m: string, y: string) => {
    const idx = MONTHS_LIST.indexOf(m);
    return new Date(parseInt(y), idx >= 0 ? idx : 0);
  };

  // ✅ Toggle quarter selection
  const toggleQuarter = (q: number) => {
    setTempQuarters((prev) => {
      if (prev.includes(q)) {
        return prev.filter((quarter) => quarter !== q);
      } else {
        return [...prev, q].sort((a, b) => a - b);
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /* APPLY & RESET */
  /* ------------------------------------------------------------------ */

  const handleApply = () => {
    // ✅ Apply filterType
    setCurrentFilterType(tempFilterType);
    
    setDivision(tempDivision);
    setKam(tempKam);
    setClientType(tempClientType);
    setViewMode(tempViewMode);

    // ✅ Apply based on view mode
    if (tempViewMode === 'monthly') {
      if (setStartMonth) setStartMonth(tempStartMonth);
      if (setEndMonth) setEndMonth(tempEndMonth);
      setStartYear(tempStartYear);
      setEndYear(tempEndYear);
    } else if (tempViewMode === 'quarterly') {
      if (setQuarters) setQuarters(tempQuarters);
      if (setQuarterYear) setQuarterYear(tempQuarterYear);
    } else {
      setStartYear(tempStartYear);
      setEndYear(tempEndYear);
    }

    onFilterChange();
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempFilterType('kam'); // ✅ Reset filterType
    setTempDivision('all');
    setTempKam('all');
    setTempClientType('All Client');
    setTempViewMode('monthly');
    setTempStartMonth(defaultMonth);
    setTempEndMonth(defaultMonth);
    setTempStartYear(defaultYear);
    setTempEndYear(defaultYear);
    setTempQuarters([defaultQuarter]);
    setTempQuarterYear(defaultQuarterYear);
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
        value: tempFilterType, // ✅ UPDATED: Use tempFilterType
        setter: setTempFilterType, // ✅ UPDATED: Use setTempFilterType
        options: [
          { value: 'kam', label: 'KAM' },
          { value: 'branch', label: 'Branch' },
        ],
      });
    }

    if (tempFilterType === 'kam' && showKamSelector) {
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
        loading: kamsLoading,
      });
    }

    if (tempFilterType === 'branch') {
      console.log('Building division filter, branches:', branches);
      
      const branchOptions = [
        { label: 'All Branches', value: 'all' },
        ...branches.map((b) => ({ 
          label: b.branch_name, 
          value: String(b.id) 
        })),
      ];
      
      console.log('Branch options:', branchOptions);
      
      filters.push({
        type: 'search-select',
        label: 'Branch',
        value: tempDivision,
        setter: setTempDivision,
        options: branchOptions,
        loading: branchesLoading,
      });
    }

    // ✅ CLIENT CATEGORY
    if (userRole !== 'kam') {
      filters.push({
        type: 'select',
        label: 'Client Category',
        value: tempClientType,
        setter: setTempClientType,
        options: [
          { value: 'All Client', label: 'All Client' },
          { value: 'Self Client', label: 'Self Client' },
          { value: 'Transferred Client', label: 'Transferred Client' },
        ],
      });
    }

    return filters;
  }, [tempFilterType, tempKam, tempDivision, tempClientType, kams, branches, branchesLoading, kamsLoading, isKamRole, showKamSelector, userRole]);

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
                  <FloatingSearchSelect 
                    key={idx} 
                    label={filter.label} 
                    value={filter.value} 
                    searchable 
                    onValueChange={filter.setter}
                    disabled={filter.loading}
                  >
                    {filter.loading ? (
                      <SelectItem value="loading" disabled>
                        Loading...
                      </SelectItem>
                    ) : (
                      filter.options.map((o: any) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))
                    )}
                  </FloatingSearchSelect>
                );
              }

              if (filter.type === 'select') {
                return (
                  <FloatingSelect 
                    key={idx} 
                    label={filter.label} 
                    value={filter.value} 
                    onValueChange={filter.setter}
                  >
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

            {/* ✅ View Mode (Monthly / Yearly / Quarterly) */}
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

            {/* ✅ MONTHLY PICKER */}
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

            {/* ✅ YEARLY PICKER */}
            {tempViewMode === 'yearly' && (
              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect 
                  label="From Year" 
                  value={tempStartYear} 
                  onValueChange={setTempStartYear}
                >
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect 
                  label="To Year" 
                  value={tempEndYear} 
                  onValueChange={setTempEndYear}
                >
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </FloatingSelect>
              </div>
            )}

            {/* ✅ QUARTERLY PICKER - MULTIPLE SELECTION */}
            {tempViewMode === 'quarterly' && (
              <div className="space-y-4">
                {/* Year Picker */}
                <FloatingSelect 
                  label="Year" 
                  value={tempQuarterYear} 
                  onValueChange={setTempQuarterYear}
                >
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </FloatingSelect>

                {/* Quarter Buttons - Multiple Selection */}
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
                        className={`w-full font-semibold ${
                          tempQuarters.includes(q)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1">
                          {tempQuarters.includes(q) && <Check className="h-4 w-4" />}
                          Q{q}
                        </div>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected: {tempQuarters.length > 0 ? tempQuarters.map(q => `Q${q}`).join(', ') : 'None'}
                  </p>
                </div>
              </div>
            )}

            {/* Reset */}
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
