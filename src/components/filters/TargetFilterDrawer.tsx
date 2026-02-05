// // components/filters/TargetFilterDrawer.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
//   DrawerDescription,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw, Filter, Check } from 'lucide-react';
// import { Label } from '@/components/ui/label';
// import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { PrismAPI } from '@/api/prismAPI';

// // ✅ Fixed interfaces to match API response
// interface Branch {
//   id: string | number;
//   branch_name: string;
// }

// interface KAM {
//   kam_id: string | number;
//   kam_name: string;
// }

// interface Supervisor {
//   supervisor_id: string | number;
//   supervisor: string;
//   employment_branch_id?: string | number;
//   branch_name?: string;
// }

// interface TargetFilterDrawerProps {
//   division: string;
//   setDivision: (val: string) => void;
//   kam: string;
//   setKam: (val: string) => void;
//   supervisor: string;
//   setSupervisor: (val: string) => void;
//   kams: KAM[];
//   //   setKams: (val: KAM[]) => void;
//   supervisors: Supervisor[];
//   setSupervisors: (val: Supervisor[]) => void;
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   branches: Branch[]; // ✅ Add this
//   startMonth: string;
//   setStartMonth: (val: string) => void;
//   endMonth: string;
//   setEndMonth: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;
//   quarters: number[];
//   setQuarters: (val: number[]) => void;
//   quarterYear: string;
//   setQuarterYear: (val: string) => void;
//   onFilterChange: () => void;
// }

// export function TargetFilterDrawer({
//   division,
//   setDivision,
//   kam,
//   setKam,
//   supervisor,
//   setSupervisor,
//   kams,
//   //   setKams,
//   supervisors,
//   setSupervisors,
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
//   quarters,
//   setQuarters,
//   quarterYear,
//   setQuarterYear,
//   onFilterChange,
// }: TargetFilterDrawerProps) {
//   const MONTHS = [
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

//   const currentYear = new Date().getFullYear().toString();
//   const years = Array.from({ length: 8 }, (_, i) => (new Date().getFullYear() - i).toString());

//   const [isOpen, setIsOpen] = useState(false);
//   const [branchesLoading, setBranchesLoading] = useState(false);
//   const [filterType, setFilterType] = useState<'kam' | 'supervisor' | 'division'>('kam');

//   // ✅ Local state for KAMs to manage filtered list
//   const [localKams, setLocalKams] = useState<KAM[]>([]);
//   const [branches, setBranches] = useState<Branch[]>([]);
//   const [supervisorList, setSupervisorList] = useState<Supervisor[]>([]);
//   const [supervisorWiseKam, setSupervisorWiseKam] = useState<Supervisor[]>([]);

//   // Temp states
//   const [tempDivision, setTempDivision] = useState(division);
//   const [tempKam, setTempKam] = useState(kam);
//   const [tempSupervisor, setTempSupervisor] = useState(supervisor);
//   const [tempViewMode, setTempViewMode] = useState(viewMode);
//   const [tempStartMonth, setTempStartMonth] = useState(startMonth);
//   const [tempEndMonth, setTempEndMonth] = useState(endMonth);
//   const [tempStartYear, setTempStartYear] = useState(startYear);
//   const [tempEndYear, setTempEndYear] = useState(endYear);
//   const [tempQuarters, setTempQuarters] = useState<number[]>(
//     quarters.length ? quarters : [Math.floor(new Date().getMonth() / 3) + 1]
//   );
//   const [tempQuarterYear, setTempQuarterYear] = useState(quarterYear || currentYear);

//   useEffect(() => {
//     if (isOpen) {
//       setTempDivision(division);
//       setTempKam(kam);
//       setTempSupervisor(supervisor);
//       setTempViewMode(viewMode);
//       setTempStartMonth(startMonth);
//       setTempEndMonth(endMonth);
//       setTempStartYear(startYear);
//       setTempEndYear(endYear);
//       setTempQuarters(quarters);
//       setTempQuarterYear(quarterYear || currentYear);

//       // Determine initial filter type based on current filters
//       if (supervisor !== 'all') {
//         setFilterType('supervisor');
//       } else if (division !== 'all') {
//         setFilterType('division');
//       } else {
//         setFilterType('kam');
//       }

//       loadBranches();
//       loadFetchSupervisors();
//       loadFetchKams(); // Load all KAMs initially
//     }
//   }, [isOpen]);

//   // ✅ Update local KAMs when supervisor changes
//   useEffect(() => {
//     if (isOpen && tempSupervisor) {
//       loadFetchKams();
//     }
//   }, [tempSupervisor]);

//   const getPickerDate = (m: string, y: string) => {
//     const idx = MONTHS.indexOf(m);
//     return new Date(parseInt(y), idx >= 0 ? idx : 0);
//   };

//   const toggleQuarter = (q: number) => {
//     setTempQuarters((prev) =>
//       prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q].sort()
//     );
//   };

//   // ✅ Fixed API fetch for branches
//   const loadBranches = async () => {
//     setBranchesLoading(true);
//     try {
//       const res = await PrismAPI.getBranchList();
//       console.log('🔍 [Debug] Branches API Raw Response:', res); // পুরো রেসপন্স চেক

//       if (res?.data) {
//         // যদি ডাটা res.data.data তে থাকে তবে সেটা দিন
//         const dataToSet = Array.isArray(res.data) ? res.data : res.data.data;
//         console.log('🔍 [Debug] Branches Array to be set:', dataToSet);
//         setBranches(dataToSet || []);
//       }
//     } catch (err) {
//       console.error('❌ [Debug] Branch Fetch Error:', err);
//     } finally {
//       setBranchesLoading(false);
//     }
//   };

//   // ✅ Fixed API fetch for supervisors
//   //   const loadFetchSupervisors = async () => {
//   //     try {
//   //       const res = await PrismAPI.getSupervisors();
//   //       console.log('✅ Supervisors Response:', res);
//   //       if (res?.data?.status && res?.data) {
//   //         setSupervisors(res.data);
//   //       }
//   //     } catch (err) {
//   //       console.error('❌ Failed to load supervisors', err);
//   //     }
//   //   };

//   // ✅ Fixed API fetch for supervisors
//   // const loadFetchSupervisors = async () => {
//   // try {
//   //     const res = await PrismAPI.getSupervisors();
//   //     if (res?.data) {
//   //     // আপনার API রেসপন্স চেক করে সঠিক অ্যারেটি সেট করুন
//   //     const data = Array.isArray(res.data) ? res.data : res.data.data;
//   //     setSupervisorList(data || []);
//   //     }
//   //     } catch (err) {
//   //         console.error('❌ Failed to load supervisors', err);
//   //     }
//   // };
//   const loadFetchSupervisors = async () => {
//     try {
//       const res = await PrismAPI.getSupervisors();

//       // কনসোলে চেক করুন ডাটা ঠিক কোথায় আছে
//       console.log('Supervisor API Response:', res.data);

//       // ১. ডাটা যদি res.data.data তে থাকে তবে সেটি নিন
//       // ২. যদি ডাটা না থাকে তবে একটি খালি অ্যারে [] সেট করুন
//       const actualData = Array.isArray(res.data) ? res.data : res.data?.data || [];

//       setSupervisorList(actualData);
//     } catch (err) {
//       console.error('❌ Failed to load supervisors', err);
//       setSupervisorList([]); // এরর হলে খালি অ্যারে সেট করুন যাতে ম্যাপ ফাংশন ক্রাশ না করে
//     }
//   };

//   // ✅ Fixed API fetch for KAMs
//   const loadFetchKams = async () => {
//     try {
//       let res;
//       if (tempSupervisor && tempSupervisor !== 'all') {
//         res = await PrismAPI.getSupervisorWiseKAMList(tempSupervisor);
//         console.log('✅ Supervisor-wise KAMs Response:', res);
//       } else {
//         res = await PrismAPI.getKams();
//         console.log('✅ All KAMs Response:', res);
//       }

//       const kamData = res.data;
//       setLocalKams(kamData);
//       // setKams(kamData); // Update parent state
//     } catch (err) {
//       console.error('❌ Failed to load KAMs', err);
//     }
//   };

//   const loadSupervisorWiseKams = async (supervisorId: string) => {
//     try {
//       const res = await PrismAPI.getSupervisorWiseKAMList(supervisorId);

//       console.log('🔍 Response Data:', res.data);

//       // ✅ res.data সরাসরি Array
//       if (Array.isArray(res.data) && res.data.length > 0) {
//         const formattedKams = res.data.map((item: any) => ({
//           value: item.employee_id, // 3723, 4271, 4281
//           Label: item.full_name, // 'Md. Niyaz Morshed', etc.
//         }));

//         console.log('✅ Formatted KAMs:', formattedKams);
//         setLocalKams(formattedKams);
//       } else {
//         console.log('⚠️ কোনো KAM পাওয়া যায়নি');
//         setLocalKams([]);
//       }
//     } catch (err) {
//       console.error('❌ Failed to load supervisor-wise KAMs', err);
//       setLocalKams([]);
//     }
//   };
//   // ✅ Use localKams for filtering
//   const displayKams = tempSupervisor === 'all' ? kams : localKams;
//   //   const displayKams = tempSupervisor === 'all' ? kams : localKams;

//   const buildPayload = () => {
//     const payload = {
//       filter_type: filterType || '',

//       kam_id: filterType === 'kam' ? tempKam : '',
//       supervisor_id: filterType === 'supervisor' ? tempSupervisor : '',
//       division: filterType === 'division' ? tempDivision : '',

//       from_month: '',
//       to_month: '',
//       quaterly_year: '',
//       quater: [] as string[],
//     };

//     // ✅ Monthly
//     if (tempViewMode === 'monthly') {
//       payload.from_month = `${tempStartYear}-${String(MONTHS.indexOf(tempStartMonth) + 1).padStart(
//         2,
//         '0'
//       )}-01`;

//       payload.to_month = `${tempEndYear}-${String(MONTHS.indexOf(tempEndMonth) + 1).padStart(
//         2,
//         '0'
//       )}-28`;
//     }

//     // ✅ Quarterly (MULTIPLE quarters)
//     if (tempViewMode === 'quarterly') {
//       payload.quaterly_year = tempQuarterYear;

//       payload.quater = tempQuarters.map((q) => `q${q}`);
//     }

//     return payload;
//   };

//   // const handleApply = () => {
//   //   setDivision(tempDivision);
//   //   setKam(tempKam);
//   //   setSupervisor(tempSupervisor);
//   //   setViewMode(tempViewMode);

//   //   if (tempViewMode === 'monthly') {
//   //     setStartMonth(tempStartMonth);
//   //     setEndMonth(tempEndMonth);
//   //     setStartYear(tempStartYear);
//   //     setEndYear(tempEndYear);
//   //   }
//   //   if (tempViewMode === 'yearly') {
//   //     setStartYear(tempStartYear);
//   //     setEndYear(tempEndYear);
//   //   }
//   //   if (tempViewMode === 'quarterly') {
//   //     setQuarters(tempQuarters);
//   //     setQuarterYear(tempQuarterYear);
//   //   }
//   //   onFilterChange();
//   //   setIsOpen(false);
//   // };

//   const handleApply = () => {
//     const payload = buildPayload();

//     console.log('✅ FINAL PAYLOAD:', payload);

//     onFilterChange(payload);
//     setIsOpen(false);
//   };

//   const handleReset = () => {
//     setTempDivision('all');
//     setTempKam('all');
//     setTempSupervisor('all');
//     setTempViewMode('monthly');
//     setTempStartMonth(MONTHS[new Date().getMonth()]);
//     setTempEndMonth(MONTHS[new Date().getMonth()]);
//     setTempStartYear(currentYear);
//     setTempEndYear(currentYear);
//     setTempQuarters([Math.floor(new Date().getMonth() / 3) + 1]);
//     setTempQuarterYear(currentYear);

//     setDivision('all');
//     setKam('all');
//     setSupervisor('all');
//     setViewMode('monthly');
//     setStartMonth(MONTHS[new Date().getMonth()]);
//     setEndMonth(MONTHS[new Date().getMonth()]);
//     setStartYear(currentYear);
//     setEndYear(currentYear);
//     setQuarters([Math.floor(new Date().getMonth() / 3) + 1]);
//     setQuarterYear(currentYear);

//     // Reset local KAMs to show all
//     loadFetchKams();

//     onFilterChange();
//   };

//   //   console.log('displayKams KAMs:', localKams);
//   //   console.log('supervisorList Supervisors:', supervisorList);
//   //   console.log('Branch  Branches:', branches);
//   console.log('🔍 [Debug] Branches Array to be set:', supervisorList);
//   console.log('🔍 [Debug] Supervisor Wise KAM:', supervisorWiseKam);

//   console.log('🔍 [Debug] local kam KAMs:', localKams);

//   return (
//     <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
//       <Button variant="outline" onClick={() => setIsOpen(true)}>
//         <Filter className="h-4 w-4 mr-1" /> Filters
//       </Button>

//       <DrawerContent className="w-full sm:w-[420px]">
//         <DrawerHeader className="flex items-center justify-between">
//           <div>
//             <DrawerTitle>Target Filters</DrawerTitle>
//             <DrawerDescription className="sr-only">
//               Filter targets by KAM, Supervisor, Division, and time period
//             </DrawerDescription>
//           </div>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">
//             <FloatingSelect label="Filter Type" value={filterType} onValueChange={setFilterType}>
//               <SelectItem value="kam">KAM</SelectItem>
//               <SelectItem value="supervisor">Supervisor</SelectItem>
//               <SelectItem value="division">Division</SelectItem>
//             </FloatingSelect>

//             {filterType === 'kam' && (
//               <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
//                 <SelectItem value="all">All</SelectItem>
//                 {localKams.map((k) => (
//                   <SelectItem key={k.kam_id} value={String(k.kam_id)}>
//                     {k.kam_name}
//                   </SelectItem>
//                 ))}
//               </FloatingSelect>
//             )}

//             {filterType === 'supervisor' && (
//               <>
//                 <FloatingSelect
//                   label="Supervisor"
//                   value={tempSupervisor}
//                   onValueChange={(val) => {
//                     setTempSupervisor(val);
//                     setTempKam('all');
//                     if (val !== 'all') {
//                       loadSupervisorWiseKams(val);
//                     } else {
//                       setLocalKams([]); // ✅ Reset করুন
//                       loadFetchKams();
//                     }
//                   }}
//                 >
//                   <SelectItem value="all">All</SelectItem>
//                   {supervisorList?.map((s, index) => (
//                     // ✅ Unique key
//                     <SelectItem
//                       key={`supervisor-${s.supervisor_id}-${index}`}
//                       value={String(s.supervisor_id)}
//                     >
//                       {s.supervisor}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>

//                 <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
//                   <SelectItem value="all">All</SelectItem>
//                   {localKams.map((k) => (
//                     <SelectItem key={k.employee_id} value={String(k.employee_id)}>
//                       {k.full_name}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </>
//             )}

//             {filterType === 'division' && (
//               <FloatingSelect label="Division" value={tempDivision} onValueChange={setTempDivision}>
//                 <SelectItem value="all">All</SelectItem>
//                 {branches.map((b) => (
//                   <SelectItem key={b.id} value={String(b.id)}>
//                     {b.branch_name}
//                   </SelectItem>
//                 ))}
//               </FloatingSelect>
//             )}

//             {/* View Mode */}
//             <div className="space-y-2">
//               <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
//               <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
//                 <TabsList className="grid w-full grid-cols-2">
//                   <TabsTrigger value="monthly">Monthly</TabsTrigger>
//                   {/* <TabsTrigger value="yearly">Yearly</TabsTrigger> */}
//                   <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
//                 </TabsList>
//               </Tabs>
//             </div>

//             {/* Monthly */}
//             {tempViewMode === 'monthly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <DatePicker
//                   selected={getPickerDate(tempStartMonth, tempStartYear)}
//                   onChange={(d) => {
//                     if (!d) return;
//                     setTempStartMonth(MONTHS[d.getMonth()]);
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
//                     setTempEndMonth(MONTHS[d.getMonth()]);
//                     setTempEndYear(d.getFullYear().toString());
//                   }}
//                   showMonthYearPicker
//                   dateFormat="MMMM yyyy"
//                   customInput={<FloatingDatePickerInput label="To Month" />}
//                 />
//               </div>
//             )}

//             {/* Yearly */}
//             {tempViewMode === 'yearly' && (
//               <div className="grid grid-cols-2 gap-3">
//                 <FloatingSelect
//                   label="From Year"
//                   value={tempStartYear}
//                   onValueChange={setTempStartYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={`start-year-${y}`} value={y}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
//                   {years.map((y) => (
//                     <SelectItem key={`end-year-${y}`} value={y}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//               </div>
//             )}

//             {/* Quarterly */}
//             {tempViewMode === 'quarterly' && (
//               <div className="space-y-4">
//                 <FloatingSelect
//                   label="Year"
//                   value={tempQuarterYear}
//                   onValueChange={setTempQuarterYear}
//                 >
//                   {years.map((y) => (
//                     <SelectItem key={`quarter-year-${y}`} value={y}>
//                       {y}
//                     </SelectItem>
//                   ))}
//                 </FloatingSelect>
//                 <div className="space-y-2">
//                   <Label className="text-xs font-bold uppercase text-muted-foreground">
//                     Select Quarters
//                   </Label>
//                   <div className="grid grid-cols-4 gap-2">
//                     {[1, 2, 3, 4].map((q) => (
//                       <Button
//                         key={`quarter-${q}`}
//                         onClick={() => toggleQuarter(q)}
//                         variant={tempQuarters.includes(q) ? 'default' : 'outline'}
//                         className="w-full flex items-center justify-center gap-1"
//                       >
//                         {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
//                       </Button>
//                     ))}
//                   </div>
//                   <p className="text-xs text-muted-foreground mt-2">
//                     Selected:{' '}
//                     {tempQuarters.length ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
//                   </p>
//                 </div>
//               </div>
//             )}

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
import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PrismAPI } from '@/api/prismAPI';

// ✅ Fixed interfaces to match API response
interface Branch {
  id: string | number;
  branch_name: string;
}

interface KAM {
  kam_id: string | number;
  kam_name: string;
}

interface Supervisor {
  supervisor_id: string | number;
  supervisor: string;
  employment_branch_id?: string | number;
  branch_name?: string;
}

// interface TargetFilterDrawerProps {
//   division: string;
//   setDivision: (val: string) => void;
//   kam: string;
//   setKam: (val: string) => void;
//   supervisor: string;
//   setSupervisor: (val: string) => void;
//   kams: KAM[];
//   //   setKams: (val: KAM[]) => void;
//   supervisors: Supervisor[];
//   setSupervisors: (val: Supervisor[]) => void;
//   viewMode: 'monthly' | 'yearly' | 'quarterly';
//   setViewMode: (val: 'monthly' | 'yearly' | 'quarterly') => void;
//   branches: Branch[]; // ✅ Add this
//   startMonth: string;
//   setStartMonth: (val: string) => void;
//   endMonth: string;
//   setEndMonth: (val: string) => void;
//   startYear: string;
//   setStartYear: (val: string) => void;
//   endYear: string;
//   setEndYear: (val: string) => void;
//   quarters: number[];
//   setQuarters: (val: number[]) => void;
//   quarterYear: string;
//   setQuarterYear: (val: string) => void;
//   onFilterChange: () => void;
// }
// Add new props for supervisor role
interface TargetFilterDrawerProps {
  isSupervisor: boolean; // current user is supervisor
  supervisor_ids?: string | number; // supervisor id
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

export function TargetFilterDrawer({
  isSupervisor,
  supervisor_ids, // ✅ add this
  division,
  setDivision,
  kam,
  setKam,
  supervisor,
  setSupervisor,
  kams,
  //   setKams,
  supervisors,
  setSupervisors,
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
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [filterType, setFilterType] = useState<'kam' | 'supervisor' | 'division'>('kam');

  // ✅ Local state for KAMs to manage filtered list
  const [localKams, setLocalKams] = useState<KAM[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [supervisorList, setSupervisorList] = useState<Supervisor[]>([]);
  const [supervisorWiseKam, setSupervisorWiseKam] = useState<Supervisor[]>([]);

  // Temp states
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

  // useEffect(() => {
  //   if (isOpen) {
  //     setTempDivision(division);
  //     setTempKam(kam);
  //     setTempSupervisor(supervisor);
  //     setTempViewMode(viewMode);
  //     setTempStartMonth(startMonth);
  //     setTempEndMonth(endMonth);
  //     setTempStartYear(startYear);
  //     setTempEndYear(endYear);
  //     setTempQuarters(quarters);
  //     setTempQuarterYear(quarterYear || currentYear);

  //     // Determine initial filter type based on current filters
  //     if (supervisor !== 'all') {
  //       setFilterType('supervisor');
  //     } else if (division !== 'all') {
  //       setFilterType('division');
  //     } else {
  //       setFilterType('kam');
  //     }

  //     loadBranches();
  //     loadFetchSupervisors();
  //     loadFetchKams(); // Load all KAMs initially
  //   }
  // }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;

    if (isSupervisor) {
      setTempDivision(''); // division hide
      setTempSupervisor(supervisor_ids || ''); // preselect self
      setFilterType('supervisor'); // filter type is supervisor

      // ✅ Load only KAMs under this supervisor
      loadSupervisorWiseKams(supervisor_ids);
    } else {
      // Non-supervisor logic
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

      // Determine initial filter type
      if (supervisor !== 'all') {
        setFilterType('supervisor');
      } else if (division !== 'all') {
        setFilterType('division');
      } else {
        setFilterType('kam');
      }

      loadBranches();
      loadFetchSupervisors();
      loadFetchKams(); // load all KAMs
    }
  }, [isOpen]);

  // ✅ Update local KAMs when supervisor changes
  // useEffect(() => {
  //   if (isOpen && tempSupervisor) {
  //     loadFetchKams();
  //   }
  // }, [tempSupervisor]);

  // Only needed for admin/management who can change supervisor
  useEffect(() => {
    if (!isOpen) return;
    if (!isSupervisor && tempSupervisor) {
      loadFetchKams(tempSupervisor); // load KAMs under selected supervisor
    }
  }, [tempSupervisor]);

  const getPickerDate = (m: string, y: string) => {
    const idx = MONTHS.indexOf(m);
    return new Date(parseInt(y), idx >= 0 ? idx : 0);
  };

  const toggleQuarter = (q: number) => {
    setTempQuarters((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q].sort()
    );
  };

  // ✅ Fixed API fetch for branches
  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await PrismAPI.getBranchList();
      console.log('🔍 [Debug] Branches API Raw Response:', res); // পুরো রেসপন্স চেক

      if (res?.data) {
        // যদি ডাটা res.data.data তে থাকে তবে সেটা দিন
        const dataToSet = Array.isArray(res.data) ? res.data : res.data.data;
        console.log('🔍 [Debug] Branches Array to be set:', dataToSet);
        setBranches(dataToSet || []);
      }
    } catch (err) {
      console.error('❌ [Debug] Branch Fetch Error:', err);
    } finally {
      setBranchesLoading(false);
    }
  };

  // ✅ Fixed API fetch for supervisors
  //   const loadFetchSupervisors = async () => {
  //     try {
  //       const res = await PrismAPI.getSupervisors();
  //       console.log('✅ Supervisors Response:', res);
  //       if (res?.data?.status && res?.data) {
  //         setSupervisors(res.data);
  //       }
  //     } catch (err) {
  //       console.error('❌ Failed to load supervisors', err);
  //     }
  //   };

  // ✅ Fixed API fetch for supervisors
  // const loadFetchSupervisors = async () => {
  // try {
  //     const res = await PrismAPI.getSupervisors();
  //     if (res?.data) {
  //     // আপনার API রেসপন্স চেক করে সঠিক অ্যারেটি সেট করুন
  //     const data = Array.isArray(res.data) ? res.data : res.data.data;
  //     setSupervisorList(data || []);
  //     }
  //     } catch (err) {
  //         console.error('❌ Failed to load supervisors', err);
  //     }
  // };
  const loadFetchSupervisors = async () => {
    try {
      const res = await PrismAPI.getSupervisors();

      // কনসোলে চেক করুন ডাটা ঠিক কোথায় আছে
      console.log('Supervisor API Response:', res.data);

      // ১. ডাটা যদি res.data.data তে থাকে তবে সেটি নিন
      // ২. যদি ডাটা না থাকে তবে একটি খালি অ্যারে [] সেট করুন
      const actualData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setSupervisorList(actualData);
    } catch (err) {
      console.error('❌ Failed to load supervisors', err);
      setSupervisorList([]); // এরর হলে খালি অ্যারে সেট করুন যাতে ম্যাপ ফাংশন ক্রাশ না করে
    }
  };

  // ✅ Fixed API fetch for KAMs
  const loadFetchKams = async () => {
    try {
      let res;
      if (tempSupervisor && tempSupervisor !== 'all') {
        res = await PrismAPI.getSupervisorWiseKAMList(tempSupervisor);
        console.log('✅ Supervisor-wise KAMs Response:', res);
      } else {
        res = await PrismAPI.getKams();
        console.log('✅ All KAMs Response:', res);
      }

      const kamData = res.data;
      setLocalKams(kamData);
      // setKams(kamData); // Update parent state
    } catch (err) {
      console.error('❌ Failed to load KAMs', err);
    }
  };

  const loadSupervisorWiseKams = async (supervisor_ids: string) => {
    try {
      const res = await PrismAPI.getSupervisorWiseKAMList(supervisor_ids);

      console.log('🔍 Response Data:', res);
      console.log('Supervisor ID for API:', supervisor_ids);

      // ✅ res.data সরাসরি Array
      if (Array.isArray(res.data) && res.data.length > 0) {
        // const formattedKams = res.data.map((item: any) => ({
        //   value: item.employee_id, // 3723, 4271, 4281
        //   Label: item.full_name, // 'Md. Niyaz Morshed', etc.
        // }));
        const formattedKams = res.data.map((item: any) => ({
          value: String(item.employee_id),
          label: item.full_name, // Use lowercase 'label'
        }));
        setLocalKams(formattedKams);

        console.log('✅ Formatted KAMs:', formattedKams);
      } else {
        console.log('⚠️ কোনো KAM পাওয়া যায়নি');
        setLocalKams([]);
      }
    } catch (err) {
      console.error('❌ Failed to load supervisor-wise KAMs', err);
      setLocalKams([]);
    }
  };
  // ✅ Use localKams for filtering
  const displayKams = tempSupervisor === 'all' ? kams : localKams;
  //   const displayKams = tempSupervisor === 'all' ? kams : localKams;

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

    // ✅ Monthly
    if (tempViewMode === 'monthly') {
      payload.from_month = `${tempStartYear}-${String(MONTHS.indexOf(tempStartMonth) + 1).padStart(
        2,
        '0'
      )}-01`;

      payload.to_month = `${tempEndYear}-${String(MONTHS.indexOf(tempEndMonth) + 1).padStart(
        2,
        '0'
      )}-28`;
    }

    // ✅ Quarterly (MULTIPLE quarters)
    if (tempViewMode === 'quarterly') {
      payload.quaterly_year = tempQuarterYear;

      payload.quater = tempQuarters.map((q) => `q${q}`);
    }

    return payload;
  };

  // const handleApply = () => {
  //   setDivision(tempDivision);
  //   setKam(tempKam);
  //   setSupervisor(tempSupervisor);
  //   setViewMode(tempViewMode);

  //   if (tempViewMode === 'monthly') {
  //     setStartMonth(tempStartMonth);
  //     setEndMonth(tempEndMonth);
  //     setStartYear(tempStartYear);
  //     setEndYear(tempEndYear);
  //   }
  //   if (tempViewMode === 'yearly') {
  //     setStartYear(tempStartYear);
  //     setEndYear(tempEndYear);
  //   }
  //   if (tempViewMode === 'quarterly') {
  //     setQuarters(tempQuarters);
  //     setQuarterYear(tempQuarterYear);
  //   }
  //   onFilterChange();
  //   setIsOpen(false);
  // };

  const handleApply = () => {
    const payload = buildPayload();

    console.log('✅ FINAL PAYLOAD:', payload);

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

    setDivision('all');
    setKam('all');
    setSupervisor('all');
    setViewMode('monthly');
    setStartMonth(MONTHS[new Date().getMonth()]);
    setEndMonth(MONTHS[new Date().getMonth()]);
    setStartYear(currentYear);
    setEndYear(currentYear);
    setQuarters([Math.floor(new Date().getMonth() / 3) + 1]);
    setQuarterYear(currentYear);

    // Reset local KAMs to show all
    loadFetchKams();

    onFilterChange();
  };

  //   console.log('displayKams KAMs:', localKams);
  //   console.log('supervisorList Supervisors:', supervisorList);
  //   console.log('Branch  Branches:', branches);

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
            {/* Filter Type Dropdown (শুধুমাত্র non-supervisor এর জন্য) */}
            {!isSupervisor && (
              <FloatingSelect label="Filter Type" value={filterType} onValueChange={setFilterType}>
                <SelectItem value="kam">KAM</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
                <SelectItem value="division">Division</SelectItem>
              </FloatingSelect>
            )}

            {/* KAM Filter */}
            {(filterType === 'kam' || isSupervisor) && (
              <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
                <SelectItem value="all">All</SelectItem>
                {localKams.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No KAM found
                  </SelectItem>
                ) : (
                  localKams.map((k) => (
                    <SelectItem key={k.value || k.kam_id} value={String(k.value || k.kam_id)}>
                      {k.label || k.kam_name}
                    </SelectItem>
                  ))
                )}
              </FloatingSelect>
            )}

            {/* Supervisor Filter (শুধুমাত্র non-supervisor এবং filterType='supervisor' এর জন্য) */}
            {filterType === 'supervisor' && !isSupervisor && (
              <>
                <FloatingSelect
                  label="Supervisor"
                  value={tempSupervisor}
                  onValueChange={(val) => {
                    setTempSupervisor(val);
                    setTempKam('all'); // Supervisor পরিবর্তনের সাথে KAM reset

                    if (val !== 'all') {
                      loadSupervisorWiseKams(val); // Supervisor এর team লোড
                    } else {
                      setLocalKams([]);
                      loadFetchKams(); // সব KAM পুনরায় লোড
                    }
                  }}
                >
                  <SelectItem value="all">All</SelectItem>
                  {supervisorList?.map((s, index) => (
                    <SelectItem
                      key={`supervisor-${s.supervisor_id}-${index}`}
                      value={String(s.supervisor_id)}
                    >
                      {s.supervisor}
                    </SelectItem>
                  ))}
                </FloatingSelect>

                {/* KAM Dropdown for selected Supervisor */}
                <FloatingSelect label="KAM" value={tempKam} onValueChange={setTempKam}>
                  <SelectItem value="all">All</SelectItem>
                  {localKams.map((k) => (
                    <SelectItem
                      key={k.value || k.employee_id}
                      value={String(k.label || k.employee_id)}
                    >
                      {k.label || k.full_name || 'No Name Found'}
                    </SelectItem>
                  ))}
                </FloatingSelect>
              </>
            )}

            {/* Division Filter (শুধুমাত্র non-supervisor এবং filterType='division' এর জন্য) */}
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

            {/* View Mode Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-muted-foreground">View Mode</Label>
              <Tabs value={tempViewMode} onValueChange={(v) => setTempViewMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Monthly Picker */}
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

            {/* Yearly Picker */}
            {tempViewMode === 'yearly' && (
              <div className="grid grid-cols-2 gap-3">
                <FloatingSelect
                  label="From Year"
                  value={tempStartYear}
                  onValueChange={setTempStartYear}
                >
                  {years.map((y) => (
                    <SelectItem key={`start-year-${y}`} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </FloatingSelect>
                <FloatingSelect label="To Year" value={tempEndYear} onValueChange={setTempEndYear}>
                  {years.map((y) => (
                    <SelectItem key={`end-year-${y}`} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </FloatingSelect>
              </div>
            )}

            {/* Quarterly Picker */}
            {tempViewMode === 'quarterly' && (
              <div className="space-y-4">
                <FloatingSelect
                  label="Year"
                  value={tempQuarterYear}
                  onValueChange={setTempQuarterYear}
                >
                  {years.map((y) => (
                    <SelectItem key={`quarter-year-${y}`} value={y}>
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
                        key={`quarter-${q}`}
                        onClick={() => toggleQuarter(q)}
                        variant={tempQuarters.includes(q) ? 'default' : 'outline'}
                        className="w-full flex items-center justify-center gap-1"
                      >
                        {tempQuarters.includes(q) && <Check className="h-4 w-4" />}Q{q}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Selected:{' '}
                    {tempQuarters.length ? tempQuarters.map((q) => `Q${q}`).join(', ') : 'None'}
                  </p>
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
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
