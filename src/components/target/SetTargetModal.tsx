// 'use client';

// import { useEffect, useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';
// import { cn } from '@/lib/utils';
// import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

// const user = getUserInfo();
// const supervisorIds = user?.supervisor_ids || [];
// const isAdmin = isSuperAdmin() || isManagement();
// const isSup = isSupervisor();
// const isKamUser = isKAM();

// const MONTHS = [
//   'January',
//   'February',
//   'March',
//   'April',
//   'May',
//   'June',
//   'July',
//   'August',
//   'September',
//   'October',
//   'November',
//   'December',
// ];

// interface Props {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;

//   selectedDivisionId: string;
//   setSelectedDivisionId: (v: string) => void;

//   selectedDivisionName: string;
//   setSelectedDivisionName: (v: string) => void;

//   selectedSupervisor: string;
//   setSelectedSupervisor: (v: string) => void;

//   selectedKam: string;
//   setSelectedKam: (v: string) => void;

//   targetAmount: string;
//   setTargetAmount: (v: string) => void;

//   isManagement: boolean;
//   onSave: (payload: any) => void;

//   editingTarget?: any | null;
// }

// export default function SetTargetModal(props: Props) {
//   const {
//     open,
//     onOpenChange,
//     selectedDivisionId,
//     setSelectedDivisionId,
//     setSelectedDivisionName,
//     selectedSupervisor,
//     setSelectedSupervisor,
//     selectedKam,
//     setSelectedKam,
//     targetAmount,
//     setTargetAmount,
//     isManagement,
//     onSave,
//   } = props;

//   const [targetType, setTargetType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
//   const [monthData, setMonthData] = useState<{ month: string; year: string } | null>(null);
//   const [quarterData, setQuarterData] = useState<{ quarter: number; year: string } | null>(null);
//   const [yearData, setYearData] = useState<string | null>(null);

//   const [branches, setBranches] = useState<any[]>([]);
//   const [supervisors, setSupervisors] = useState<any[]>([]);
//   const [kams, setKams] = useState<any[]>([]);

//   // ✅ NEW: Store KAM-wise supervisor data
//   const [kamWiseSupervisorData, setKamWiseSupervisorData] = useState<any>(null);

//   // ✅ Helper function to get target_month date based on target_type
//   const getTargetMonthDate = (): string | null => {
//     if (targetType === 'monthly' && monthData) {
//       const monthIndex = MONTHS.indexOf(monthData.month) + 1;
//       return `${monthData.year}-${String(monthIndex).padStart(2, '0')}-01`;
//     }

//     if (targetType === 'quarterly' && quarterData) {
//       // Q1 = January (01), Q2 = April (04), Q3 = July (07), Q4 = October (10)
//       const monthMap: { [key: number]: string } = {
//         1: '01', // Q1 -> January
//         2: '04', // Q2 -> April
//         3: '07', // Q3 -> July
//         4: '10', // Q4 -> October
//       };
//       const month = monthMap[quarterData.quarter];
//       return `${quarterData.year}-${month}-01`;
//     }

//     if (targetType === 'yearly' && yearData) {
//       return `${yearData}-01-01`;
//     }

//     return null;
//   };

//   // ✅ Reset form when modal opens
//   useEffect(() => {
//     if (!open) return;

//     if (props.editingTarget) {
//       const t = props.editingTarget;

//       setTargetType(t.target_type);
//       setTargetAmount(String(t.amount));
//       setSelectedKam(String(t.kam_id));
//       setSelectedSupervisor(String(t.supervisor_id));
//       setSelectedDivisionName(t.division);

//       const d = new Date(t.target_month);

//       if (t.target_type === 'monthly') {
//         setMonthData({
//           month: MONTHS[d.getMonth()],
//           year: d.getFullYear().toString(),
//         });
//       }

//       if (t.target_type === 'quarterly') {
//         setQuarterData({
//           quarter: Math.floor(d.getMonth() / 3) + 1,
//           year: d.getFullYear().toString(),
//         });
//       }

//       if (t.target_type === 'yearly') {
//         setYearData(d.getFullYear().toString());
//       }
//     } else {
//       // ✅ CREATE MODE RESET
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
//       setMonthData(null);
//       setQuarterData(null);
//       setYearData(null);
//       setTargetType('monthly');
//       setKamWiseSupervisorData(null);
//     }
//   }, [open, props.editingTarget]);

//   // ✅ Load ALL KAMs by default when modal opens
//   // useEffect(() => {
//   //   if (open) {

//   //     PrismAPI.getKams()
//   //       .then((res) => {
//   //         console.log('✅ All KAMs loaded - Full Response:', res);
//   //         console.log('✅ res.data:', res.data);

//   //         // Handle nested data structure
//   //         const kamsData = res.data?.data || res.data || [];
//   //         console.log('✅ KAMs array:', kamsData);

//   //         setKams(kamsData);
//   //       })
//   //       .catch((err) => {
//   //         console.error('❌ Error loading KAMs:', err);
//   //         setKams([]);
//   //       });
//   //   }
//   // }, [open]);

//   useEffect(() => {
//     if (!open) return;

//     let apiCall;

//     if (isKamUser) {
//       apiCall = PrismAPI.getKamById(user?.default_kam_id);
//     } else if (isAdmin || isManagement) {
//       apiCall = PrismAPI.getKams();
//     } else if (isSup) {
//       apiCall = PrismAPI.getSupervisorWiseKAMList([user?.default_kam_id]);
//     } else {
//       setKams([]);
//       return;
//     }

//     apiCall
//       .then((res) => {
//         console.log('✅ KAMs loaded:', res);

//         const kamsData = res.data?.data || res.data || [];
//         setKams(kamsData);
//       })
//       .catch((err) => {
//         console.error('❌ Error loading KAMs:', err);
//         setKams([]);
//       });
//   }, [open]);

//   // ✅ Load branches (kept for backward compatibility)
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getBranchList()
//         .then((res) => {
//           console.log('✅ Branches loaded:', res.data);
//           setBranches(res.data?.data || res.data || []);
//         })
//         .catch(() => setBranches([]));
//     }
//   }, [open]);

//   // ✅ NEW: When KAM is selected, fetch their supervisor and division info
//   useEffect(() => {
//     if (selectedKam) {
//       console.log('🔍 Fetching supervisor for KAM:', selectedKam);

//       PrismAPI.getKamWiseSupervisorList(selectedKam)
//         .then((res) => {
//           console.log('✅ KAM-wise supervisor data:', res.data);

//           const data = res.data?.data?.[0] || res.data?.[0];

//           if (data) {
//             setKamWiseSupervisorData(data);

//             // ✅ Auto-populate supervisor
//             if (data.kam_id) {
//               setSelectedSupervisor(data.kam_id.toString());
//             }

//             // ✅ Auto-populate division
//             if (data.employment_branch_id && data.branch_name) {
//               setSelectedDivisionId(data.employment_branch_id.toString());
//               setSelectedDivisionName(data.branch_name);
//             }
//           }
//         })
//         .catch((err) => {
//           console.error('❌ Error fetching KAM-wise supervisor:', err);
//           setKamWiseSupervisorData(null);
//         });
//     } else {
//       setKamWiseSupervisorData(null);
//     }
//   }, [selectedKam]);

//   // ✅ Load supervisors when division changes (original flow)
//   useEffect(() => {
//     if (selectedDivisionId && !kamWiseSupervisorData) {
//       PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
//         .then((res) => setSupervisors(res.data?.data || res.data || []))
//         .catch(() => setSupervisors([]));
//     } else if (!selectedDivisionId) {
//       setSupervisors([]);
//       setSelectedSupervisor('');
//     }
//   }, [selectedDivisionId, kamWiseSupervisorData]);

//   // ✅ Load KAMs when supervisor changes (original flow - only if no KAM selected yet)
//   useEffect(() => {
//     if (selectedSupervisor && !selectedKam) {
//       PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
//         .then((res) => setKams(res.data?.data || res.data || []))
//         .catch(() => setKams([]));
//     }
//   }, [selectedSupervisor, selectedKam]);

//   // ✅ Date picker values
//   const selectedMonthDate = monthData
//     ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month))
//     : null;

//   const selectedQuarterDate = quarterData
//     ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3)
//     : null;

//   const selectedYearDate = yearData ? new Date(Number(yearData), 0) : null;

//   // ✅ Save handler - NOW SENDS target_type
//   const handleSave = () => {
//     const targetMonth = getTargetMonthDate();

//     if (!targetMonth) {
//       console.error('❌ Invalid date selection');
//       return;
//     }

//     const payload = {
//       target_type: targetType, // ✅ SEND target_type
//       target_month: targetMonth, // ✅ SEND target_month
//       division:
//         selectedDivisionId && selectedDivisionId !== '__select__' ? `${selectedDivisionId}` : '',
//       supervisor_id:
//         selectedSupervisor && selectedSupervisor !== '__select__'
//           ? Number(selectedSupervisor)
//           : null,
//       kam_id: selectedKam && selectedKam !== '__select__' ? Number(selectedKam) : null,
//       amount: targetAmount ? Number(targetAmount) : 0,
//       posted_by: 0, // Will be set in parent component
//     };

//     console.log('✅ PAYLOAD TO SEND:', payload);
//     onSave(payload);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Set Revenue Target</DialogTitle>
//           <DialogDescription>
//             Select period type, month/quarter/year, KAM, and set revenue target. Division and
//             supervisor will be auto-populated.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* ✅ Period Type Toggle - Monthly / Quarterly / Yearly */}
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               onClick={() => {
//                 setTargetType('monthly');
//                 setMonthData(null);
//                 setQuarterData(null);
//                 setYearData(null);
//               }}
//               className={cn(
//                 'flex-1',
//                 targetType === 'monthly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Monthly
//             </Button>

//             <Button
//               size="sm"
//               onClick={() => {
//                 setTargetType('quarterly');
//                 setMonthData(null);
//                 setQuarterData(null);
//                 setYearData(null);
//               }}
//               className={cn(
//                 'flex-1',
//                 targetType === 'quarterly'
//                   ? 'bg-slate-200 text-black hover:bg-slate-200'
//                   : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Quarterly
//             </Button>
//           </div>

//           {/* ✅ Month Picker - for Monthly */}
//           {targetType === 'monthly' && (
//             <DatePicker
//               selected={selectedMonthDate || undefined}
//               onChange={(d: Date | null) => {
//                 if (!d) return;
//                 setMonthData({
//                   month: MONTHS[d.getMonth()],
//                   year: d.getFullYear().toString(),
//                 });
//               }}
//               showMonthYearPicker
//               dateFormat="MMMM yyyy"
//               customInput={<FloatingDatePickerInput label="Select Month & Year" />}
//             />
//           )}

//           {/* ✅ Quarter Picker - for Quarterly */}
//           {targetType === 'quarterly' && (
//             <DatePicker
//               selected={selectedQuarterDate || undefined}
//               onChange={(d: Date | null) => {
//                 if (!d) return;
//                 const q = Math.floor(d.getMonth() / 3) + 1;
//                 setQuarterData({
//                   quarter: q,
//                   year: d.getFullYear().toString(),
//                 });
//               }}
//               showQuarterYearPicker
//               dateFormat="yyyy, QQQ"
//               customInput={<FloatingDatePickerInput label="Select Quarter & Year" />}
//             />
//           )}

//           {/* ✅ KAM - NOW FIRST (loads all KAMs by default) */}
//           <FloatingSelect
//             label="KAM"
//             value={selectedKam || '__select__'}
//             onValueChange={(v) => {
//               if (v !== '__select__') setSelectedKam(v);
//               if (!v || v === '__select__') {
//                 setSelectedSupervisor('');
//                 setSelectedDivisionId('');
//                 setSelectedDivisionName('');
//               }
//             }}
//           >
//             <SelectItem value="__select__">Select KAM</SelectItem>
//             {kams.map((k) => {
//               const kamId = k.kam_id || k.id;
//               const kamName = k.kam_name || k.name || 'Unknown';
//               if (!kamId) return null;

//               return (
//                 <SelectItem key={kamId} value={kamId.toString()} textValue={kamName}>
//                   {kamName}
//                 </SelectItem>
//               );
//             })}
//           </FloatingSelect>

//           {/* <FloatingSearchSelect
//             label="KAM"
//             searchable
//             value={selectedKam || '__select__'}
//             onValueChange={(v) => {
//               if (v !== '__select__') {
//                 setSelectedKam(v);
//               }
//               // Clear dependent fields when KAM changes
//               if (!v || v === '__select__') {
//                 setSelectedSupervisor('');
//                 setSelectedDivisionId('');
//                 setSelectedDivisionName('');
//               }
//             }}
//           >
//             <SelectItem value="__select__">Select KAM</SelectItem>
//             {kams.map((k: any, index: number) => {
//               // Handle different possible field names
//               const kamId = k.employee_id || k.kam_id || k.id;
//               const kamName = k.full_name || k.kam_name || k.name || 'Unknown';

//               // Skip if no valid ID
//               if (!kamId) {
//                 console.warn('⚠️ KAM without ID:', k);
//                 return null;
//               }

//               return (
//                 <SelectItem key={kamId || index} value={kamId.toString()}>
//                   {kamName}
//                 </SelectItem>
//               );
//             })}
//           </FloatingSearchSelect> */}

//           {/* ✅ Supervisor - AUTO-POPULATED from KAM selection - SHOWS FOR ALL ROLES */}
//           <FloatingSelect
//             label="Supervisor"
//             value={selectedSupervisor || '__select__'}
//             onValueChange={(v) => {
//               if (v !== '__select__') {
//                 setSelectedSupervisor(v);
//               }
//             }}
//             disabled={true} // ✅ Disabled - auto-populated from KAM
//           >
//             <SelectItem value="__select__">Select Supervisor</SelectItem>
//             {kamWiseSupervisorData ? (
//               <SelectItem value={kamWiseSupervisorData.kam_id?.toString() || '__select__'}>
//                 {kamWiseSupervisorData.supervisor || 'N/A'}
//               </SelectItem>
//             ) : (
//               supervisors.map((s: any, index: number) => {
//                 const supId = s.supervisor_id || s.id;
//                 const supName = s.supervisor || s.full_name || s.name || 'Unknown';

//                 if (!supId) return null;

//                 return (
//                   <SelectItem key={supId || index} value={supId.toString()}>
//                     {supName}
//                   </SelectItem>
//                 );
//               })
//             )}
//           </FloatingSelect>

//           {/* ✅ Division - AUTO-POPULATED from KAM selection */}
//           <FloatingSelect
//             label="Division"
//             value={selectedDivisionId || '__select__'}
//             onValueChange={(v) => {
//               if (v !== '__select__') {
//                 const branch = branches.find((b) => b.id.toString() === v);
//                 setSelectedDivisionId(v);
//                 setSelectedDivisionName(branch?.branch_name || '');
//               }
//             }}
//             disabled={true} // ✅ Disabled - auto-populated from KAM
//           >
//             <SelectItem value="__select__">Select Branch</SelectItem>
//             {kamWiseSupervisorData ? (
//               <SelectItem
//                 value={kamWiseSupervisorData.employment_branch_id?.toString() || '__select__'}
//               >
//                 {kamWiseSupervisorData.branch_name || 'N/A'}
//               </SelectItem>
//             ) : (
//               branches.map((b: any, index: number) => {
//                 const branchId = b.id || b.branch_id;
//                 const branchName = b.branch_name || b.full_name || b.name || 'Unknown';

//                 if (!branchId) return null;

//                 return (
//                   <SelectItem key={branchId || index} value={branchId.toString()}>
//                     {branchName}
//                   </SelectItem>
//                 );
//               })
//             )}
//           </FloatingSelect>

//           {/* Target Amount */}
//           <FloatingInput
//             label="Target Amount (৳)"
//             type="number"
//             value={targetAmount}
//             onChange={(e) => setTargetAmount(e.target.value)}
//           />
//         </div>

//         <DialogFooter className='gap-2'>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save Target</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }





'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';
import { PrismAPI } from '@/api/prismAPI';
import { cn } from '@/lib/utils';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

const MONTHS = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December',
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  selectedDivisionId: string;
  setSelectedDivisionId: (v: string) => void;
  selectedDivisionName: string;
  setSelectedDivisionName: (v: string) => void;
  selectedSupervisor: string;
  setSelectedSupervisor: (v: string) => void;
  selectedKam: string;
  setSelectedKam: (v: string) => void;
  targetAmount: string;
  setTargetAmount: (v: string) => void;
  isManagement: boolean;
  onSave: (payload: any) => void;
  editingTarget?: any | null;
}

export default function SetTargetModal(props: Props) {
  const {
    open,
    onOpenChange,
    selectedDivisionId,
    setSelectedDivisionId,
    setSelectedDivisionName,
    selectedSupervisor,
    setSelectedSupervisor,
    selectedKam,
    setSelectedKam,
    targetAmount,
    setTargetAmount,
    onSave,
  } = props;

  const [targetType, setTargetType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [monthData, setMonthData]     = useState<{ month: string; year: string } | null>(null);
  const [quarterData, setQuarterData] = useState<{ quarter: number; year: string } | null>(null);
  const [yearData, setYearData]       = useState<string | null>(null);

  const [branches, setBranches]       = useState<any[]>([]);
  const [kams, setKams]               = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [kamWiseSupervisorData, setKamWiseSupervisorData] = useState<any>(null);

  // ── Move user/role checks INSIDE component so they're never stale ────────
  const user      = getUserInfo();
  const isAdmin   = isSuperAdmin() || isManagement();
  const isSup     = isSupervisor();
  const isKamUser = isKAM();

  // ── Target month date builder ─────────────────────────────────────────────
  const getTargetMonthDate = (): string | null => {
    if (targetType === 'monthly' && monthData) {
      const monthIndex = MONTHS.indexOf(monthData.month) + 1;
      return `${monthData.year}-${String(monthIndex).padStart(2, '0')}-01`;
    }
    if (targetType === 'quarterly' && quarterData) {
      const monthMap: Record<number, string> = { 1: '01', 2: '04', 3: '07', 4: '10' };
      return `${quarterData.year}-${monthMap[quarterData.quarter]}-01`;
    }
    if (targetType === 'yearly' && yearData) {
      return `${yearData}-01-01`;
    }
    return null;
  };

  // ── Reset / pre-fill form when modal opens ────────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (props.editingTarget) {
      const t = props.editingTarget;
      setTargetType(t.target_type);
      setTargetAmount(String(t.amount));
      setSelectedKam(String(t.kam_id));
      setSelectedSupervisor(String(t.supervisor_id));
      setSelectedDivisionName(t.division);

      const d = new Date(t.target_month);
      if (t.target_type === 'monthly')   setMonthData({ month: MONTHS[d.getMonth()], year: d.getFullYear().toString() });
      if (t.target_type === 'quarterly') setQuarterData({ quarter: Math.floor(d.getMonth() / 3) + 1, year: d.getFullYear().toString() });
      if (t.target_type === 'yearly')    setYearData(d.getFullYear().toString());
    } else {
      setSelectedDivisionId('');
      setSelectedDivisionName('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      setMonthData(null);
      setQuarterData(null);
      setYearData(null);
      setTargetType('monthly');
      setKamWiseSupervisorData(null);
    }
  }, [open, props.editingTarget]);

  // ── Load KAMs based on role ───────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    // fresh read inside effect — never stale
    const currentUser  = getUserInfo();
    const currentIsAdmin = isSuperAdmin() || isManagement();
    const currentIsSup   = isSupervisor();
    const currentIsKam   = isKAM();

    let apiCall: Promise<any> | null = null;

    if (currentIsKam) {
      if (!currentUser?.default_kam_id) {
        console.warn('KAM user but no default_kam_id:', currentUser);
        setKams([]);
        return;
      }
      apiCall = PrismAPI.getKamById(currentUser.default_kam_id);

    } else if (currentIsAdmin) {
      apiCall = PrismAPI.getKams();

    } else if (currentIsSup) {
      if (!currentUser?.default_kam_id) {
        console.warn('Supervisor but no default_kam_id:', currentUser);
        setKams([]);
        return;
      }
      // Pass as array — matches your API signature
      apiCall = PrismAPI.getSupervisorWiseKAMList([currentUser.default_kam_id]);

    } else {
      setKams([]);
      return;
    }

    apiCall
      .then((res) => {
        console.log('✅ KAMs loaded:', res);

        // Normalise all possible response shapes
        let data: any[] = [];
        if (Array.isArray(res.data))            data = res.data;           // direct array
        else if (Array.isArray(res.data?.data)) data = res.data.data;      // { data: [...] }
        else                                     data = [];

        console.log('✅ KAMs parsed:', data);
        setKams(data);
      })
      .catch((err) => {
        console.error('❌ Error loading KAMs:', err);
        setKams([]);
      });

  }, [open]); // ← only `open` needed — we re-read user inside the effect

  // ── Load branches ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    PrismAPI.getBranchList()
      .then((res) => setBranches(res.data?.data || res.data || []))
      .catch(() => setBranches([]));
  }, [open]);

  // ── When KAM selected → auto-fill supervisor + division ──────────────────
  useEffect(() => {
    if (!selectedKam) {
      setKamWiseSupervisorData(null);
      return;
    }

    PrismAPI.getKamWiseSupervisorList(selectedKam)
      .then((res) => {
        console.log('✅ KAM-wise supervisor:', res.data);
        const data = res.data?.data?.[0] || res.data?.[0];
        if (!data) return;

        setKamWiseSupervisorData(data);
        if (data.kam_id)             setSelectedSupervisor(data.kam_id.toString());
        if (data.employment_branch_id && data.branch_name) {
          setSelectedDivisionId(data.employment_branch_id.toString());
          setSelectedDivisionName(data.branch_name);
        }
      })
      .catch((err) => {
        console.error('❌ Error fetching KAM supervisor:', err);
        setKamWiseSupervisorData(null);
      });
  }, [selectedKam]);

  // ── Load supervisors when division changes (manual flow) ──────────────────
  useEffect(() => {
    if (selectedDivisionId && !kamWiseSupervisorData) {
      PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
        .then((res) => setSupervisors(res.data?.data || res.data || []))
        .catch(() => setSupervisors([]));
    } else if (!selectedDivisionId) {
      setSupervisors([]);
      setSelectedSupervisor('');
    }
  }, [selectedDivisionId, kamWiseSupervisorData]);

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    const targetMonth = getTargetMonthDate();
    if (!targetMonth) { console.error('❌ Invalid date'); return; }

    const payload = {
      target_type:   targetType,
      target_month:  targetMonth,
      division:      selectedDivisionId && selectedDivisionId !== '__select__' ? selectedDivisionId : '',
      supervisor_id: selectedSupervisor && selectedSupervisor !== '__select__' ? Number(selectedSupervisor) : null,
      kam_id:        selectedKam && selectedKam !== '__select__' ? Number(selectedKam) : null,
      amount:        targetAmount ? Number(targetAmount) : 0,
      posted_by:     0,
    };

    console.log('✅ Payload:', payload);
    onSave(payload);
  };

  // ── Date picker derived values ────────────────────────────────────────────
  const selectedMonthDate   = monthData   ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;
  const selectedQuarterDate = quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;
  const selectedYearDate    = yearData    ? new Date(Number(yearData), 0) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          <DialogDescription>
            Select period type, month/quarter/year, KAM, and set revenue target.
            Division and supervisor will be auto-populated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period Type Toggle */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline"
              onClick={() => { setTargetType('monthly'); setMonthData(null); setQuarterData(null); setYearData(null); }}
              className={cn('flex-1', targetType === 'monthly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white')}
            >Monthly</Button>

            <Button size="sm" variant="outline"
              onClick={() => { setTargetType('quarterly'); setMonthData(null); setQuarterData(null); setYearData(null); }}
              className={cn('flex-1', targetType === 'quarterly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white')}
            >Quarterly</Button>
          </div>

          {/* Month Picker */}
          {targetType === 'monthly' && (
            <DatePicker
              selected={selectedMonthDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                setMonthData({ month: MONTHS[d.getMonth()], year: d.getFullYear().toString() });
              }}
              showMonthYearPicker
              dateFormat="MMMM yyyy"
              customInput={<FloatingDatePickerInput label="Select Month & Year" />}
            />
          )}

          {/* Quarter Picker */}
          {targetType === 'quarterly' && (
            <DatePicker
              selected={selectedQuarterDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                setQuarterData({ quarter: Math.floor(d.getMonth() / 3) + 1, year: d.getFullYear().toString() });
              }}
              showQuarterYearPicker
              dateFormat="yyyy, QQQ"
              customInput={<FloatingDatePickerInput label="Select Quarter & Year" />}
            />
          )}

          {/* KAM Dropdown */}
          <FloatingSelect
            label="KAM"
            value={selectedKam || '__select__'}
            onValueChange={(v) => {
              if (v === '__select__') {
                setSelectedKam('');
                setSelectedSupervisor('');
                setSelectedDivisionId('');
                setSelectedDivisionName('');
              } else {
                setSelectedKam(v);
              }
            }}
          >
            <SelectItem value="__select__">Select KAM</SelectItem>
            {kams.map((k: any) => {
              // ✅ Handle ALL possible field name shapes from your APIs
              const kamId   = k.employee_id || k.kam_id || k.id;
              const kamName = k.full_name   || k.kam_name || k.name || 'Unknown';
              if (!kamId) return null;
              return (
                <SelectItem key={kamId} value={kamId.toString()}>
                  {kamName}
                </SelectItem>
              );
            })}
          </FloatingSelect>

          {/* Supervisor (auto-populated) */}
          <FloatingSelect
            label="Supervisor"
            value={selectedSupervisor || '__select__'}
            onValueChange={(v) => { if (v !== '__select__') setSelectedSupervisor(v); }}
            disabled={true}
          >
            <SelectItem value="__select__">Select Supervisor</SelectItem>
            {kamWiseSupervisorData ? (
              <SelectItem value={kamWiseSupervisorData.kam_id?.toString() || '__select__'}>
                {kamWiseSupervisorData.supervisor || 'N/A'}
              </SelectItem>
            ) : (
              supervisors.map((s: any) => {
                const supId   = s.supervisor_id || s.id;
                const supName = s.supervisor || s.full_name || s.name || 'Unknown';
                if (!supId) return null;
                return <SelectItem key={supId} value={supId.toString()}>{supName}</SelectItem>;
              })
            )}
          </FloatingSelect>

          {/* Division (auto-populated) */}
          <FloatingSelect
            label="Division"
            value={selectedDivisionId || '__select__'}
            onValueChange={(v) => {
              if (v !== '__select__') {
                const branch = branches.find((b) => b.id.toString() === v);
                setSelectedDivisionId(v);
                setSelectedDivisionName(branch?.branch_name || '');
              }
            }}
            disabled={true}
          >
            <SelectItem value="__select__">Select Branch</SelectItem>
            {kamWiseSupervisorData ? (
              <SelectItem value={kamWiseSupervisorData.employment_branch_id?.toString() || '__select__'}>
                {kamWiseSupervisorData.branch_name || 'N/A'}
              </SelectItem>
            ) : (
              branches.map((b: any) => {
                const branchId   = b.id || b.branch_id;
                const branchName = b.branch_name || b.name || 'Unknown';
                if (!branchId) return null;
                return <SelectItem key={branchId} value={branchId.toString()}>{branchName}</SelectItem>;
              })
            )}
          </FloatingSelect>

          {/* Target Amount */}
          <FloatingInput
            label="Target Amount (৳)"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save Target</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}