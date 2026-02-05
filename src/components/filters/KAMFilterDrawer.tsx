

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
//   }, [
//     isOpen,
//     currentFilterType,
//     division,
//     kam,
//     clientType,
//     viewMode,
//     startMonth,
//     endMonth,
//     startYear,
//     endYear,
//     quarters,
//     quarterYear,
//   ]);

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
//           value: String(b.id),
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
//   }, [
//     tempFilterType,
//     tempKam,
//     tempDivision,
//     tempClientType,
//     kams,
//     branches,
//     branchesLoading,
//     kamsLoading,
//     isKamRole,
//     showKamSelector,
//     userRole,
//   ]);

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
//               <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
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
//                     <SelectItem key={y} value={y}>
//                       {y}
//                     </SelectItem>
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
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected:{' '}
//                     {tempQuarters.length > 0 ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
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
//   }, [
//     isOpen,
//     currentFilterType,
//     division,
//     kam,
//     clientType,
//     viewMode,
//     startMonth,
//     endMonth,
//     startYear,
//     endYear,
//     quarters,
//     quarterYear,
//   ]);

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
//           { value: 'supervisor', label: 'Supervisor' },
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
//           value: String(b.id),
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
//   }, [
//     tempFilterType,
//     tempKam,
//     tempDivision,
//     tempClientType,
//     kams,
//     branches,
//     branchesLoading,
//     kamsLoading,
//     isKamRole,
//     showKamSelector,
//     userRole,
//   ]);

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
//               <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
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
//                     <SelectItem key={y} value={y}>
//                       {y}
//                     </SelectItem>
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
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected:{' '}
//                     {tempQuarters.length > 0 ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
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

// // ✅ NEW: Supervisor type
// interface Supervisor {
//   supervisor_id: string | number;
//   supervisor: string;
//   employment_branch_id?: string | number;
//   branch_name?: string;
// }

// interface KAMFilterDrawerProps {
//   // ✅ filterType props
//   filterType?: 'kam' | 'branch' | 'supervisor';
//   setFilterType?: (val: 'kam' | 'branch' | 'supervisor') => void;

//   division: string;
//   setDivision: (val: string) => void;
//   kam: string;
//   setKam: (val: string) => void;
//   // ✅ NEW: Supervisor state
//   supervisor?: string;
//   setSupervisor?: (val: string) => void;

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

//   // ✅ Support multiple quarters
//   quarters?: number[];
//   setQuarters?: (val: number[]) => void;
//   quarterYear?: string;
//   setQuarterYear?: (val: string) => void;

//   onFilterChange: () => void;
//   userRole?: string;
// }

// export function KAMFilterDrawer({
//   filterType: externalFilterType,
//   setFilterType: setExternalFilterType,
//   division,
//   setDivision,
//   kam,
//   setKam,
//   supervisor = 'all', // ✅ NEW
//   setSupervisor, // ✅ NEW
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
//   const [internalFilterType, setInternalFilterType] = useState<'kam' | 'branch' | 'supervisor'>('kam');
//   const currentFilterType = externalFilterType ?? internalFilterType;
//   const setCurrentFilterType = setExternalFilterType ?? setInternalFilterType;

//   const [kamsLoading, setKamsLoading] = useState(false);

//   // ✅ Branch states
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [branchesLoading, setBranchesLoading] = useState(false);

//   // ✅ NEW: Supervisor states
//   const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
//   const [supervisorsLoading, setSupervisorsLoading] = useState(false);

//   // ✅ KAM states for supervisor-wise loading
//   const [supervisorKams, setSupervisorKams] = useState<KAM[]>([]);
//   const [supervisorKamsLoading, setSupervisorKamsLoading] = useState(false);

//   const [tempFilterType, setTempFilterType] = useState<'kam' | 'branch' | 'supervisor'>(currentFilterType);
//   const [tempDivision, setTempDivision] = useState(division || 'all');
//   const [tempKam, setTempKam] = useState(kam || 'all');
//   const [tempSupervisor, setTempSupervisor] = useState(supervisor || 'all'); // ✅ NEW
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
//   /* LOAD KAMS, BRANCHES & SUPERVISORS */
//   /* ------------------------------------------------------------------ */

//   useEffect(() => {
//     if (isOpen && kams.length === 0) loadKams();
//     if (isOpen && branches.length === 0) loadBranches();
//     if (isOpen && supervisors.length === 0) loadSupervisors(); // ✅ NEW
//   }, [isOpen]);

//   // ✅ NEW: Load supervisor-wise KAMs when supervisor changes
//   useEffect(() => {
//     if (tempFilterType === 'supervisor' && tempSupervisor && tempSupervisor !== 'all') {
//       loadSupervisorKams(tempSupervisor);
//     } else {
//       setSupervisorKams([]);
//       setTempKam('all');
//     }
//   }, [tempFilterType, tempSupervisor]);

//   // ✅ Sync temp states when drawer opens
//   useEffect(() => {
//     if (isOpen) {
//       setTempFilterType(currentFilterType);
//       setTempDivision(division);
//       setTempKam(kam);
//       setTempSupervisor(supervisor); // ✅ NEW
//       setTempClientType(clientType);
//       setTempViewMode(viewMode);
//       setTempStartMonth(startMonth || defaultMonth);
//       setTempEndMonth(endMonth || defaultMonth);
//       setTempStartYear(startYear);
//       setTempEndYear(endYear);
//       setTempQuarters(quarters);
//       setTempQuarterYear(quarterYear || defaultQuarterYear);
//     }
//   }, [
//     isOpen,
//     currentFilterType,
//     division,
//     kam,
//     supervisor, // ✅ NEW
//     clientType,
//     viewMode,
//     startMonth,
//     endMonth,
//     startYear,
//     endYear,
//     quarters,
//     quarterYear,
//   ]);

//   const loadKams = async () => {
//     setKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getKams();
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

//   // ✅ NEW: Load supervisors from API
//   const loadSupervisors = async () => {
//     setSupervisorsLoading(true);
//     try {
//       const res = await PrismAPI.getSupervisors();
//       console.log('Supervisors API Response:', res);

//       if (res?.data?.status && res?.data?.data) {
//         console.log('Supervisors loaded:', res.data.data);
//         setSupervisors(res.data.data);
//       } else if (res?.data) {
//         console.log('Direct data:', res.data);
//         setSupervisors(res.data);
//       }
//     } catch (err) {
//       console.error('Error loading supervisors:', err);
//     }
//     setSupervisorsLoading(false);
//   };

//   // ✅ NEW: Load KAMs for specific supervisor
//   const loadSupervisorKams = async (supervisorId: string) => {
//     setSupervisorKamsLoading(true);
//     try {
//       const res = await KamPerformanceApi.getSupervisorWiseKAMList(supervisorId);
//       console.log('Supervisor KAMs API Response:', res);

//       if (res?.data?.status && res?.data?.data) {
//         console.log('Supervisor KAMs loaded:', res.data.data);
//         setSupervisorKams(res.data.data);
//       } else if (res?.data) {
//         console.log('Direct data:', res.data);
//         setSupervisorKams(res.data);
//       }
//     } catch (err) {
//       console.error('Error loading supervisor KAMs:', err);
//       setSupervisorKams([]);
//     }
//     setSupervisorKamsLoading(false);
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
//     if (setSupervisor) setSupervisor(tempSupervisor); // ✅ NEW
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
//     setTempFilterType('kam');
//     setTempDivision('all');
//     setTempKam('all');
//     setTempSupervisor('all'); // ✅ NEW
//     setTempClientType('All Client');
//     setTempViewMode('monthly');
//     setTempStartMonth(defaultMonth);
//     setTempEndMonth(defaultMonth);
//     setTempStartYear(defaultYear);
//     setTempEndYear(defaultYear);
//     setTempQuarters([defaultQuarter]);
//     setTempQuarterYear(defaultQuarterYear);
//     setSupervisorKams([]); // ✅ NEW
//   };

//   /* ------------------------------------------------------------------ */
//   /* FILTER CONFIG */
//   /* ------------------------------------------------------------------ */

//   const filterConfigs = useMemo(() => {
//     const filters: any[] = [];

//     // ✅ UPDATED: Support supervisor in filterType dropdown
//     if (!isKamRole) {
//       filters.push({
//         type: 'select',
//         label: 'Type',
//         value: tempFilterType,
//         setter: setTempFilterType,
//         options: [
//           { value: 'kam', label: 'KAM' },
//           { value: 'branch', label: 'Branch' },
//           { value: 'supervisor', label: 'Supervisor' }, // ✅ NEW
//         ],
//       });
//     }

//     // ✅ KAM Filter
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

//     // ✅ BRANCH Filter
//     if (tempFilterType === 'branch') {
//       console.log('Building division filter, branches:', branches);

//       const branchOptions = [
//         { label: 'All Branches', value: 'all' },
//         ...branches.map((b) => ({
//           label: b.branch_name,
//           value: String(b.id),
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

//     // ✅ NEW: SUPERVISOR Filter
//     if (tempFilterType === 'supervisor') {
//       console.log('Building supervisor filter, supervisors:', supervisors);

//       const supervisorOptions = [
//         { label: 'All Supervisors', value: 'all' },
//         ...supervisors.map((s) => ({
//           label: s.supervisor,
//           value: String(s.supervisor_id),
//         })),
//       ];

//       console.log('Supervisor options:', supervisorOptions);

//       filters.push({
//         type: 'search-select',
//         label: 'Supervisor',
//         value: tempSupervisor,
//         setter: setTempSupervisor,
//         options: supervisorOptions,
//         loading: supervisorsLoading,
//       });

//       // ✅ NEW: Show KAM filter when supervisor is selected
//       if (tempSupervisor && tempSupervisor !== 'all') {
//         filters.push({
//           type: 'search-select',
//           label: 'KAM',
//           value: tempKam,
//           setter: setTempKam,
//           options: [
//             { label: 'All KAMs', value: 'all' },
//             ...supervisorKams.map((k) => ({
//               label: k.kam_name,
//               value: String(k.kam_id),
//             })),
//           ],
//           loading: supervisorKamsLoading,
//         });
//       }
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
//   }, [
//     tempFilterType,
//     tempKam,
//     tempDivision,
//     tempSupervisor, // ✅ NEW
//     tempClientType,
//     kams,
//     branches,
//     supervisors, // ✅ NEW
//     supervisorKams, // ✅ NEW
//     branchesLoading,
//     kamsLoading,
//     supervisorsLoading, // ✅ NEW
//     supervisorKamsLoading, // ✅ NEW
//     isKamRole,
//     showKamSelector,
//     userRole,
//   ]);

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
//               <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
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
//                     <SelectItem key={y} value={y}>
//                       {y}
//                     </SelectItem>
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
//                           {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
//                         </div>
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected:{' '}
//                     {tempQuarters.length > 0 ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
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
  kam_type?: string;
}

interface Branch {
  id: string | number;
  branch_name: string;
}

interface Supervisor {
  supervisor_id: string | number;
  supervisor: string;
  employment_branch_id?: string | number;
  branch_name?: string;
}

interface KAMFilterDrawerProps {
  filterType?: 'kam' | 'branch' | 'supervisor';
  setFilterType?: (val: 'kam' | 'branch' | 'supervisor') => void;

  division: string;
  setDivision: (val: string) => void;
  kam: string;
  setKam: (val: string) => void;
  supervisor?: string;
  setSupervisor?: (val: string) => void;

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

  quarters?: number[];
  setQuarters?: (val: number[]) => void;
  quarterYear?: string;
  setQuarterYear?: (val: string) => void;

  onFilterChange: () => void;
  userRole?: string;
}

export function KAMFilterDrawer({
  filterType: externalFilterType,
  setFilterType: setExternalFilterType,
  division,
  setDivision,
  kam,
  setKam,
  supervisor = 'all',
  setSupervisor,
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

  const [internalFilterType, setInternalFilterType] = useState<'kam' | 'branch' | 'supervisor'>('kam');
  const currentFilterType = externalFilterType ?? internalFilterType;
  const setCurrentFilterType = setExternalFilterType ?? setInternalFilterType;

  const [kamsLoading, setKamsLoading] = useState(false);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);

  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [supervisorsLoading, setSupervisorsLoading] = useState(false);

  const [supervisorKams, setSupervisorKams] = useState<KAM[]>([]);
  const [supervisorKamsLoading, setSupervisorKamsLoading] = useState(false);

  const [tempFilterType, setTempFilterType] = useState<'kam' | 'branch' | 'supervisor'>(currentFilterType);
  const [tempDivision, setTempDivision] = useState(division || 'all');
  const [tempKam, setTempKam] = useState(kam || 'all');
  const [tempSupervisor, setTempSupervisor] = useState(supervisor || 'all');
  const [tempClientType, setTempClientType] = useState(clientType || 'All Client');
  const [tempViewMode, setTempViewMode] = useState(viewMode);

  const [tempStartMonth, setTempStartMonth] = useState(startMonth || defaultMonth);
  const [tempEndMonth, setTempEndMonth] = useState(endMonth || defaultMonth);
  const [tempStartYear, setTempStartYear] = useState(startYear || defaultYear);
  const [tempEndYear, setTempEndYear] = useState(endYear || defaultYear);

  const [tempQuarters, setTempQuarters] = useState<number[]>(quarters || [defaultQuarter]);
  const [tempQuarterYear, setTempQuarterYear] = useState<string>(quarterYear || defaultQuarterYear);

  const isKamRole = userRole === 'kam';
  const showKamSelector = !isKamRole;

  /* ------------------------------------------------------------------ */
  /* LOAD KAMS, BRANCHES & SUPERVISORS */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (isOpen && kams.length === 0) loadKams();
    if (isOpen && branches.length === 0) loadBranches();
    if (isOpen && supervisors.length === 0) loadSupervisors();
  }, [isOpen]);

  useEffect(() => {
    if (tempFilterType === 'supervisor' && tempSupervisor && tempSupervisor !== 'all') {
      loadSupervisorKams(tempSupervisor);
    } else {
      setSupervisorKams([]);
      setTempKam('all');
    }
  }, [tempFilterType, tempSupervisor]);

  useEffect(() => {
    if (isOpen) {
      setTempFilterType(currentFilterType);
      setTempDivision(division);
      setTempKam(kam);
      setTempSupervisor(supervisor);
      setTempClientType(clientType);
      setTempViewMode(viewMode);
      setTempStartMonth(startMonth || defaultMonth);
      setTempEndMonth(endMonth || defaultMonth);
      setTempStartYear(startYear);
      setTempEndYear(endYear);
      setTempQuarters(quarters);
      setTempQuarterYear(quarterYear || defaultQuarterYear);
    }
  }, [
    isOpen,
    currentFilterType,
    division,
    kam,
    supervisor,
    clientType,
    viewMode,
    startMonth,
    endMonth,
    startYear,
    endYear,
    quarters,
    quarterYear,
  ]);

  const loadKams = async () => {
    setKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getKams();
      if (res.success && res.data) setKams(res.data);
    } catch (err) {
      console.error('Error loading KAMs:', err);
    }
    setKamsLoading(false);
  };

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

  const loadSupervisors = async () => {
    setSupervisorsLoading(true);
    try {
      const res = await PrismAPI.getSupervisors();
      console.log('Supervisors API Response:', res);

      if (res?.data?.status && res?.data?.data) {
        console.log('Supervisors loaded:', res.data.data);
        setSupervisors(res.data.data);
      } else if (res?.data) {
        console.log('Direct data:', res.data);
        setSupervisors(res.data);
      }
    } catch (err) {
      console.error('Error loading supervisors:', err);
    }
    setSupervisorsLoading(false);
  };

  const loadSupervisorKams = async (supervisorId: string) => {
    setSupervisorKamsLoading(true);
    try {
      const res = await KamPerformanceApi.getSupervisorWiseKAMList(supervisorId);
      console.log('Supervisor KAMs API Response:', res);

      if (res?.data?.status && res?.data?.data) {
        console.log('Supervisor KAMs loaded:', res.data.data);
        setSupervisorKams(res.data.data);
      } else if (res?.data) {
        console.log('Direct data:', res.data);
        setSupervisorKams(res.data);
      }
    } catch (err) {
      console.error('Error loading supervisor KAMs:', err);
      setSupervisorKams([]);
    }
    setSupervisorKamsLoading(false);
  };

  /* ------------------------------------------------------------------ */
  /* DATE HELPERS */
  /* ------------------------------------------------------------------ */

  const getPickerDate = (m: string, y: string) => {
    const idx = MONTHS_LIST.indexOf(m);
    return new Date(parseInt(y), idx >= 0 ? idx : 0);
  };

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
    let finalKam = tempKam;
    
    // ✅ FIXED: When supervisor is selected and "All KAMs" is chosen,
    // send comma-separated list of ALL KAM IDs (including supervisor)
    if (tempFilterType === 'supervisor' && tempSupervisor !== 'all' && tempKam === 'all') {
      // ✅ Include ALL KAMs (including supervisor) in the list
      const kamIds = supervisorKams.map((k) => String(k.kam_id));
      
      // Join all KAM IDs with comma
      finalKam = kamIds.length > 0 ? kamIds.join(',') : 'all';
      
      console.log('✅ All KAMs selected for supervisor:', finalKam);
    }

    setCurrentFilterType(tempFilterType);
    setDivision(tempDivision);
    setKam(finalKam);
    if (setSupervisor) setSupervisor(tempSupervisor);
    setClientType(tempClientType);
    setViewMode(tempViewMode);

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
    setTempFilterType('kam');
    setTempDivision('all');
    setTempKam('all');
    setTempSupervisor('all');
    setTempClientType('All Client');
    setTempViewMode('monthly');
    setTempStartMonth(defaultMonth);
    setTempEndMonth(defaultMonth);
    setTempStartYear(defaultYear);
    setTempEndYear(defaultYear);
    setTempQuarters([defaultQuarter]);
    setTempQuarterYear(defaultQuarterYear);
    setSupervisorKams([]);
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
        value: tempFilterType,
        setter: setTempFilterType,
        options: [
          { value: 'kam', label: 'KAM' },
          { value: 'branch', label: 'Branch' },
          { value: 'supervisor', label: 'Supervisor' },
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
          value: String(b.id),
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

    // ✅ SUPERVISOR Filter
    if (tempFilterType === 'supervisor') {
      console.log('Building supervisor filter, supervisors:', supervisors);

      const supervisorOptions = [
        { label: 'All Supervisors', value: 'all' },
        ...supervisors.map((s) => ({
          label: s.supervisor,
          value: String(s.supervisor_id),
        })),
      ];

      console.log('Supervisor options:', supervisorOptions);

      filters.push({
        type: 'search-select',
        label: 'Supervisor',
        value: tempSupervisor,
        setter: setTempSupervisor,
        options: supervisorOptions,
        loading: supervisorsLoading,
      });

      // ✅ FIXED: Show ALL KAMs (including supervisor) in the dropdown
      if (tempSupervisor && tempSupervisor !== 'all') {
        filters.push({
          type: 'search-select',
          label: 'KAM',
          value: tempKam,
          setter: setTempKam,
          options: [
            { label: 'All KAMs', value: 'all' },
            ...supervisorKams.map((k) => ({
              label: k.kam_name,
              value: String(k.kam_id),
            })),
          ],
          loading: supervisorKamsLoading,
        });
      }
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
  }, [
    tempFilterType,
    tempKam,
    tempDivision,
    tempSupervisor,
    tempClientType,
    kams,
    branches,
    supervisors,
    supervisorKams,
    branchesLoading,
    kamsLoading,
    supervisorsLoading,
    supervisorKamsLoading,
    isKamRole,
    showKamSelector,
    userRole,
  ]);

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
              <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
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
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
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
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
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
                          {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
                        </div>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected:{' '}
                    {tempQuarters.length > 0 ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
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