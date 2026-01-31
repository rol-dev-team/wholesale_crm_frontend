// // src/components/modals/SetTargetModal.tsx
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
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';

// interface KAM {
//   id: string;
//   name: string;
//   division?: string;
//   supervisor?: string;
// }

// interface Props {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;

//   // selectedDivision: string;
//   // setSelectedDivision: (v: string) => void;

//   // --- new added ---
//   selectedDivisionId: string;
//   setSelectedDivisionId: (v: string) => void;

//   selectedDivisionName: string;
//   setSelectedDivisionName: (v: string) => void;
//   // --- new added ---

//   selectedSupervisor: string;
//   setSelectedSupervisor: (v: string) => void;

//   selectedKam: string;
//   setSelectedKam: (v: string) => void;

//   targetAmount: string;
//   setTargetAmount: (v: string) => void;

//   targetMonthName: string;
//   setTargetMonthName: (v: string) => void;

//   targetYear: string;
//   setTargetYear: (v: string) => void;

//   isManagement: boolean;
//   onSave: () => void;
// }

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

// export default function SetTargetModal(props: Props) {
//   const {
//     open,
//     onOpenChange,
//     // selectedDivision,
//     // setSelectedDivision,
//     selectedDivisionId,
//     setSelectedDivisionId,
//     selectedDivisionName,
//     setSelectedDivisionName,
//     selectedSupervisor,
//     setSelectedSupervisor,
//     selectedKam,
//     setSelectedKam,
//     targetAmount,
//     setTargetAmount,
//     targetMonthName,
//     setTargetMonthName,
//     targetYear,
//     setTargetYear,
//     isManagement,
//     onSave,
//   } = props;

//   // ----------------- API State -----------------
//   const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
//   const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
//   const [supervisors, setSupervisors] = useState<{ id: string; name: string }[]>([]);
//   const [kams, setKams] = useState<KAM[]>([]);

//   // ----------------- Reset form when modal opens -----------------
//   useEffect(() => {
//     if (open) {
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
//       setTargetMonthName('');
//       setTargetYear('');
//     }
//   }, [open]);

//   // ----------------- Load branches -----------------
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getBranchList()
//         .then((res) => setBranches(res.data || []))
//         .catch((err) => {
//           console.error(err);
//           setBranches([]);
//         });
//     }
//   }, [open]);

//   // ----------------- Load supervisors -----------------
//   useEffect(() => {
//     if (selectedDivisionId) {
//       PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
//         .then((res) => setSupervisors(res.data || []))
//         .catch((err) => {
//           console.error(err);
//           setSupervisors([]);
//         });
//     } else {
//       setSupervisors([]);
//       setSelectedSupervisor('');
//     }
//   }, [selectedDivisionId]);

//   // ----------------- Load KAMs -----------------
//   useEffect(() => {
//     if (selectedSupervisor) {
//       PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
//         .then((res) => setKams(res.data || []))
//         .catch((err) => {
//           console.error(err);
//           setKams([]);
//         });
//     } else if (!isManagement) {
//       setKams([]);
//     }
//   }, [selectedSupervisor, isManagement]);

//   // ----------------- Selected date for DatePicker -----------------
//   const selectedDate =
//     targetMonthName && targetYear
//       ? new Date(Number(targetYear), MONTHS.indexOf(targetMonthName))
//       : null;

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Set Revenue Target</DialogTitle>
//           <DialogDescription>
//             Select month, division, supervisor, KAM and set revenue target.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {/* Month & Year Picker */}
//           <DatePicker
//             selected={selectedDate || undefined}
//             onChange={(d: Date | null) => {
//               if (!d) return;
//               setTargetMonthName(MONTHS[d.getMonth()]);
//               setTargetYear(d.getFullYear().toString());
//             }}
//             showMonthYearPicker
//             dateFormat="MMMM yyyy"
//             customInput={<FloatingDatePickerInput label="Month & Year" />}
//           />

//           {/* Division Select */}
//           <FloatingSelect
//             label="Division"
//             value={selectedDivisionId || ''}
//             onValueChange={(v) => {
//               const branch = branches.find((b) => b.id.toString() === v);

//               setSelectedDivisionId(v);
//               setSelectedDivisionName(branch?.branch_name || '');
//               setSelectedSupervisor('');
//               setSelectedKam('');
//             }}
//           >
//             {(branches || []).map((b) => (
//               <SelectItem key={b.id} value={b.id.toString()}>
//                 {b.branch_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Supervisor Select (only for management) */}
//           {isManagement && (
//             <FloatingSelect
//               label="Supervisor"
//               value={selectedSupervisor || ''}
//               onValueChange={(v) => {
//                 setSelectedSupervisor(v);
//                 setSelectedKam('');
//               }}
//               disabled={!selectedDivisionId}
//             >
//               {(supervisors || []).map((s) => (
//                 <SelectItem key={s.supervisor_id} value={s.supervisor_id.toString()}>
//                   {s.supervisor}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>
//           )}

//           {/* KAM Select */}
//           <FloatingSelect
//             label="KAM"
//             value={selectedKam || ''}
//             onValueChange={(v) => setSelectedKam(Number(v))}
//             disabled={isManagement && !selectedSupervisor}
//           >
//             {(kams || []).map((k) => (
//               <SelectItem key={k.employee_id} value={k.employee_id}>
//                 {k.full_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Target Amount */}
//           <FloatingInput
//             label="Target Amount (৳)"
//             type="number"
//             value={targetAmount}
//             onChange={(e) => setTargetAmount(e.target.value)}
//           />
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={onSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }








// // src/components/target/SetTargetModal.tsx
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
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';
// import { cn } from '@/lib/utils';

// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
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

//   const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month');
//   const [monthData, setMonthData] = useState<{ month: string; year: string } | null>(null);
//   const [quarterData, setQuarterData] = useState<{ quarter: number; year: string } | null>(null);

//   const [branches, setBranches] = useState<any[]>([]);
//   const [supervisors, setSupervisors] = useState<any[]>([]);
//   const [kams, setKams] = useState<any[]>([]);

//   // ---------------- RESET FORM ----------------
//   useEffect(() => {
//     if (open) {
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
//       setMonthData(null);
//       setQuarterData(null);
//       setPeriodType('month');
//     }
//   }, [open]);

//   // ---------------- LOAD BRANCHES ----------------
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getBranchList()
//         .then((res) => setBranches(res.data || []))
//         .catch(() => setBranches([]));
//     }
//   }, [open]);

//   // ---------------- LOAD SUPERVISORS ----------------
//   useEffect(() => {
//     if (selectedDivisionId) {
//       PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
//         .then((res) => setSupervisors(res.data || []))
//         .catch(() => setSupervisors([]));
//     } else {
//       setSupervisors([]);
//       setSelectedSupervisor('');
//     }
//   }, [selectedDivisionId]);

//   // ---------------- LOAD KAMS ----------------
//   useEffect(() => {
//     if (selectedSupervisor) {
//       PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
//         .then((res) => setKams(res.data || []))
//         .catch(() => setKams([]));
//     } else {
//       setKams([]);
//     }
//   }, [selectedSupervisor]);

//   // ---------------- DATE PICKER VALUES ----------------
//   const selectedMonthDate =
//     monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

//   const selectedQuarterDate =
//     quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

//   // ---------------- SAVE HANDLER ----------------
//   const handleSave = () => {
//     let target_year = '';
//     let target_period: string | number = '';

//     if (periodType === 'month' && monthData) {
//       target_year = monthData.year;
//       target_period = monthData.month; // string
//     }

//     if (periodType === 'quarter' && quarterData) {
//       target_year = quarterData.year;
//       target_period = quarterData.quarter; // integer (1,2,3,4)
//     }

//     const payload = {
//       target_year,
//       target_period,
//       division_id: selectedDivisionId,
//       supervisor_id: selectedSupervisor,
//       kam_id: selectedKam,
//       target_amount: targetAmount,
//     };

//     console.log('✅ PAYLOAD:', payload);
//     onSave(payload);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Set Revenue Target</DialogTitle>
//           <DialogDescription>
//             Select month/quarter, division, supervisor, KAM and set revenue target.
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">

//           {/* Month / Quarter Toggle */}
//           <div className="flex gap-2">
//             <Button
//               size="sm"
//               onClick={() => setPeriodType('month')}
//               className={cn(
//                 'flex-1',
//                 periodType === 'month' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Month
//             </Button>

//             <Button
//               size="sm"
//               onClick={() => setPeriodType('quarter')}
//               className={cn(
//                 'flex-1',
//                 periodType === 'quarter' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Quarter
//             </Button>
//           </div>

//           {/* Month Picker */}
//           {periodType === 'month' && (
//             <DatePicker
//               selected={selectedMonthDate || undefined}
//               onChange={(d: Date | null) => {
//                 if (!d) return;
//                 setMonthData({
//                   month: MONTHS[d.getMonth()],
//                   year: d.getFullYear().toString(),
//                 });
//                 setQuarterData(null);
//               }}
//               showMonthYearPicker
//               dateFormat="MMMM yyyy"
//               customInput={<FloatingDatePickerInput label="Month & Year" />}
//             />
//           )}

//           {/* Quarter Picker */}
//           {periodType === 'quarter' && (
//             <DatePicker
//               selected={selectedQuarterDate || undefined}
//               onChange={(d: Date | null) => {
//                 if (!d) return;
//                 const q = Math.floor(d.getMonth() / 3) + 1;
//                 setQuarterData({
//                   quarter: q,
//                   year: d.getFullYear().toString(),
//                 });
//                 setMonthData(null);
//               }}
//               showQuarterYearPicker
//               dateFormat="yyyy, QQQ"
//               customInput={<FloatingDatePickerInput label="Quarter & Year" />}
//             />
//           )}

//           {/* Division */}
//           <FloatingSelect
//             label="Division"
//             value={selectedDivisionId || ''}
//             onValueChange={(v) => {
//               const branch = branches.find((b) => b.id.toString() === v);
//               setSelectedDivisionId(v);
//               setSelectedDivisionName(branch?.branch_name || '');
//               setSelectedSupervisor('');
//               setSelectedKam('');
//             }}
//           >
//             {branches.map((b: any) => (
//               <SelectItem key={b.id} value={b.id.toString()}>
//                 {b.branch_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Supervisor */}
//           {isManagement && (
//             <FloatingSelect
//               label="Supervisor"
//               value={selectedSupervisor || ''}
//               onValueChange={(v) => {
//                 setSelectedSupervisor(v);
//                 setSelectedKam('');
//               }}
//               disabled={!selectedDivisionId}
//             >
//               {supervisors.map((s: any) => (
//                 <SelectItem key={s.supervisor_id} value={s.supervisor_id.toString()}>
//                   {s.supervisor}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>
//           )}

//           {/* KAM */}
//           <FloatingSelect
//             label="KAM"
//             value={selectedKam || ''}
//             onValueChange={(v) => setSelectedKam(v)}
//             disabled={isManagement && !selectedSupervisor}
//           >
//             {kams.map((k: any) => (
//               <SelectItem key={k.employee_id} value={k.employee_id.toString()}>
//                 {k.full_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Target Amount */}
//           <FloatingInput
//             label="Target Amount (৳)"
//             type="number"
//             value={targetAmount}
//             onChange={(e) => setTargetAmount(e.target.value)}
//           />
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }




// // src/components/target/SetTargetModal.tsx
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
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';
// import { cn } from '@/lib/utils';

// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
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
//     if (open) {
//       setSelectedDivisionId('');
//       setSelectedDivisionName('');
//       setSelectedSupervisor('');
//       setSelectedKam('');
//       setTargetAmount('');
//       setMonthData(null);
//       setQuarterData(null);
//       setYearData(null);
//       setTargetType('monthly');
//     }
//   }, [open]);

//   // ✅ Load branches
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getBranchList()
//         .then((res) => setBranches(res.data || []))
//         .catch(() => setBranches([]));
//     }
//   }, [open]);

//   // ✅ Load supervisors
//   useEffect(() => {
//     if (selectedDivisionId) {
//       PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
//         .then((res) => setSupervisors(res.data || []))
//         .catch(() => setSupervisors([]));
//     } else {
//       setSupervisors([]);
//       setSelectedSupervisor('');
//     }
//   }, [selectedDivisionId]);

//   // ✅ Load KAMs
//   useEffect(() => {
//     if (selectedSupervisor) {
//       PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
//         .then((res) => setKams(res.data || []))
//         .catch(() => setKams([]));
//     } else {
//       setKams([]);
//     }
//   }, [selectedSupervisor]);

//   // ✅ Date picker values
//   const selectedMonthDate =
//     monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

//   const selectedQuarterDate =
//     quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

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
//       division: selectedDivisionId ? `${selectedDivisionId}` : '',
//       supervisor_id: selectedSupervisor ? Number(selectedSupervisor) : null,
//       kam_id: selectedKam ? Number(selectedKam) : null,
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
//             Select period type, month/quarter/year, division, supervisor, KAM and set revenue target.
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
//                 targetType === 'quarterly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Quarterly
//             </Button>

//             {/* <Button
//               size="sm"
//               onClick={() => {
//                 setTargetType('yearly');
//                 setMonthData(null);
//                 setQuarterData(null);
//                 setYearData(null);
//               }}
//               className={cn(
//                 'flex-1',
//                 targetType === 'yearly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
//               )}
//               variant="outline"
//             >
//               Yearly
//             </Button> */}
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

//           {/* ✅ Year Picker - for Yearly */}
//           {/* {targetType === 'yearly' && (
//             <DatePicker
//               selected={selectedYearDate || undefined}
//               onChange={(d: Date | null) => {
//                 if (!d) return;
//                 setYearData(d.getFullYear().toString());
//               }}
//               showYearPicker
//               dateFormat="yyyy"
//               customInput={<FloatingDatePickerInput label="Select Year" />}
//             />
//           )} */}

//           {/* Division */}
//           <FloatingSelect
//             label="Division"
//             value={selectedDivisionId || ''}
//             onValueChange={(v) => {
//               const branch = branches.find((b) => b.id.toString() === v);
//               setSelectedDivisionId(v);
//               setSelectedDivisionName(branch?.branch_name || '');
//               setSelectedSupervisor('');
//               setSelectedKam('');
//             }}
//           >
//             {branches.map((b: any) => (
//               <SelectItem key={b.id} value={b.id.toString()}>
//                 {b.branch_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Supervisor */}
//           {isManagement && (
//             <FloatingSelect
//               label="Supervisor"
//               value={selectedSupervisor || ''}
//               onValueChange={(v) => {
//                 setSelectedSupervisor(v);
//                 setSelectedKam('');
//               }}
//               disabled={!selectedDivisionId}
//             >
//               {supervisors.map((s: any) => (
//                 <SelectItem key={s.supervisor_id} value={s.supervisor_id.toString()}>
//                   {s.supervisor}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>
//           )}

//           {/* KAM */}
//           <FloatingSelect
//             label="KAM"
//             value={selectedKam || ''}
//             onValueChange={(v) => setSelectedKam(v)}
//             disabled={isManagement && !selectedSupervisor}
//           >
//             {kams.map((k: any) => (
//               <SelectItem key={k.employee_id} value={k.employee_id.toString()}>
//                 {k.full_name}
//               </SelectItem>
//             ))}
//           </FloatingSelect>

//           {/* Target Amount */}
//           <FloatingInput
//             label="Target Amount (৳)"
//             type="number"
//             value={targetAmount}
//             onChange={(e) => setTargetAmount(e.target.value)}
//           />
//         </div>

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save Target</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }






// // src/components/target/SetTargetModal.tsx
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
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';
// import { cn } from '@/lib/utils';

// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
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
//     if (open) {
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
//   }, [open]);

//   // ✅ Load ALL KAMs by default when modal opens
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getKams()
//         .then((res) => {
//           console.log('✅ All KAMs loaded - Full Response:', res);
//           console.log('✅ res.data:', res.data);
          
//           // Handle nested data structure
//           const kamsData = res.data?.data || res.data || [];
//           console.log('✅ KAMs array:', kamsData);
          
//           setKams(kamsData);
//         })
//         .catch((err) => {
//           console.error('❌ Error loading KAMs:', err);
//           setKams([]);
//         });
//     }
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
//   const selectedMonthDate =
//     monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

//   const selectedQuarterDate =
//     quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

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
//       division: selectedDivisionId ? `${selectedDivisionId}` : '',
//       supervisor_id: selectedSupervisor ? Number(selectedSupervisor) : null,
//       kam_id: selectedKam ? Number(selectedKam) : null,
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
//             Select period type, month/quarter/year, KAM, and set revenue target. Division and supervisor will be auto-populated.
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
//                 targetType === 'quarterly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
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
//             value={selectedKam || ''}
//             onValueChange={(v) => {
//               setSelectedKam(v);
//               // Clear dependent fields when KAM changes
//               if (!v) {
//                 setSelectedSupervisor('');
//                 setSelectedDivisionId('');
//                 setSelectedDivisionName('');
//               }
//             }}
//           >
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
//           </FloatingSelect>

//           {/* ✅ Supervisor - AUTO-POPULATED from KAM selection */}
//           {isManagement && (
//             <FloatingSelect
//               label="Supervisor"
//               value={selectedSupervisor || ''}
//               onValueChange={(v) => {
//                 setSelectedSupervisor(v);
//               }}
//               disabled={true} // ✅ Disabled - auto-populated from KAM
//             >
//               {kamWiseSupervisorData ? (
//                 <SelectItem value={kamWiseSupervisorData.kam_id?.toString() || ''}>
//                   {kamWiseSupervisorData.supervisor || 'N/A'}
//                 </SelectItem>
//               ) : (
//                 supervisors.map((s: any, index: number) => {
//                   const supId = s.supervisor_id || s.id;
//                   const supName = s.supervisor || s.full_name || s.name || 'Unknown';
                  
//                   if (!supId) return null;
                  
//                   return (
//                     <SelectItem key={supId || index} value={supId.toString()}>
//                       {supName}
//                     </SelectItem>
//                   );
//                 })
//               )}
//             </FloatingSelect>
//           )}

//           {/* ✅ Division - AUTO-POPULATED from KAM selection */}
//           <FloatingSelect
//             label="Division"
//             value={selectedDivisionId || ''}
//             onValueChange={(v) => {
//               const branch = branches.find((b) => b.id.toString() === v);
//               setSelectedDivisionId(v);
//               setSelectedDivisionName(branch?.branch_name || '');
//             }}
//             disabled={true} // ✅ Disabled - auto-populated from KAM
//           >
//             {kamWiseSupervisorData ? (
//               <SelectItem value={kamWiseSupervisorData.employment_branch_id?.toString() || ''}>
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

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save Target</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }





// // src/components/target/SetTargetModal.tsx
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
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';
// import { PrismAPI } from '@/api/prismAPI';
// import { cn } from '@/lib/utils';

// const MONTHS = [
//   'January', 'February', 'March', 'April', 'May', 'June',
//   'July', 'August', 'September', 'October', 'November', 'December',
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
//     if (open) {
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
//   }, [open]);

//   // ✅ Load ALL KAMs by default when modal opens
//   useEffect(() => {
//     if (open) {
//       PrismAPI.getKams()
//         .then((res) => {
//           console.log('✅ All KAMs loaded - Full Response:', res);
//           console.log('✅ res.data:', res.data);
          
//           // Handle nested data structure
//           const kamsData = res.data?.data || res.data || [];
//           console.log('✅ KAMs array:', kamsData);
          
//           setKams(kamsData);
//         })
//         .catch((err) => {
//           console.error('❌ Error loading KAMs:', err);
//           setKams([]);
//         });
//     }
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
//   const selectedMonthDate =
//     monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

//   const selectedQuarterDate =
//     quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

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
//       division: selectedDivisionId ? `${selectedDivisionId}` : '',
//       supervisor_id: selectedSupervisor ? Number(selectedSupervisor) : null,
//       kam_id: selectedKam ? Number(selectedKam) : null,
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
//             Select period type, month/quarter/year, KAM, and set revenue target. Division and supervisor will be auto-populated.
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
//                 targetType === 'quarterly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
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
//             value={selectedKam || ''}
//             onValueChange={(v) => {
//               setSelectedKam(v);
//               // Clear dependent fields when KAM changes
//               if (!v) {
//                 setSelectedSupervisor('');
//                 setSelectedDivisionId('');
//                 setSelectedDivisionName('');
//               }
//             }}
//           >
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
//           </FloatingSelect>

//           {/* ✅ Supervisor - AUTO-POPULATED from KAM selection - SHOWS FOR ALL ROLES */}
//           <FloatingSelect
//             label="Supervisor"
//             value={selectedSupervisor || ''}
//             onValueChange={(v) => {
//               setSelectedSupervisor(v);
//             }}
//             disabled={true} // ✅ Disabled - auto-populated from KAM
//           >
//             {kamWiseSupervisorData ? (
//               <SelectItem value={kamWiseSupervisorData.kam_id?.toString() || ''}>
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
//             label="Branch"
//             value={selectedDivisionId || ''}
//             onValueChange={(v) => {
//               const branch = branches.find((b) => b.id.toString() === v);
//               setSelectedDivisionId(v);
//               setSelectedDivisionName(branch?.branch_name || '');
//             }}
//             disabled={true} // ✅ Disabled - auto-populated from KAM
//           >
//             {kamWiseSupervisorData ? (
//               <SelectItem value={kamWiseSupervisorData.employment_branch_id?.toString() || ''}>
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

//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button onClick={handleSave}>Save Target</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }


// src/components/target/SetTargetModal.tsx
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
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
    isManagement,
    onSave,
  } = props;

  const [targetType, setTargetType] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [monthData, setMonthData] = useState<{ month: string; year: string } | null>(null);
  const [quarterData, setQuarterData] = useState<{ quarter: number; year: string } | null>(null);
  const [yearData, setYearData] = useState<string | null>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [kams, setKams] = useState<any[]>([]);

  // ✅ NEW: Store KAM-wise supervisor data
  const [kamWiseSupervisorData, setKamWiseSupervisorData] = useState<any>(null);

  // ✅ Helper function to get target_month date based on target_type
  const getTargetMonthDate = (): string | null => {
    if (targetType === 'monthly' && monthData) {
      const monthIndex = MONTHS.indexOf(monthData.month) + 1;
      return `${monthData.year}-${String(monthIndex).padStart(2, '0')}-01`;
    }

    if (targetType === 'quarterly' && quarterData) {
      // Q1 = January (01), Q2 = April (04), Q3 = July (07), Q4 = October (10)
      const monthMap: { [key: number]: string } = {
        1: '01', // Q1 -> January
        2: '04', // Q2 -> April
        3: '07', // Q3 -> July
        4: '10', // Q4 -> October
      };
      const month = monthMap[quarterData.quarter];
      return `${quarterData.year}-${month}-01`;
    }

    if (targetType === 'yearly' && yearData) {
      return `${yearData}-01-01`;
    }

    return null;
  };

  // ✅ Reset form when modal opens
  useEffect(() => {
    if (open) {
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
  }, [open]);

  // ✅ Load ALL KAMs by default when modal opens
  useEffect(() => {
    if (open) {
      PrismAPI.getKams()
        .then((res) => {
          console.log('✅ All KAMs loaded - Full Response:', res);
          console.log('✅ res.data:', res.data);
          
          // Handle nested data structure
          const kamsData = res.data?.data || res.data || [];
          console.log('✅ KAMs array:', kamsData);
          
          setKams(kamsData);
        })
        .catch((err) => {
          console.error('❌ Error loading KAMs:', err);
          setKams([]);
        });
    }
  }, [open]);

  // ✅ Load branches (kept for backward compatibility)
  useEffect(() => {
    if (open) {
      PrismAPI.getBranchList()
        .then((res) => {
          console.log('✅ Branches loaded:', res.data);
          setBranches(res.data?.data || res.data || []);
        })
        .catch(() => setBranches([]));
    }
  }, [open]);

  // ✅ NEW: When KAM is selected, fetch their supervisor and division info
  useEffect(() => {
    if (selectedKam) {
      console.log('🔍 Fetching supervisor for KAM:', selectedKam);
      
      PrismAPI.getKamWiseSupervisorList(selectedKam)
        .then((res) => {
          console.log('✅ KAM-wise supervisor data:', res.data);
          
          const data = res.data?.data?.[0] || res.data?.[0];
          
          if (data) {
            setKamWiseSupervisorData(data);
            
            // ✅ Auto-populate supervisor
            if (data.kam_id) {
              setSelectedSupervisor(data.kam_id.toString());
            }
            
            // ✅ Auto-populate division
            if (data.employment_branch_id && data.branch_name) {
              setSelectedDivisionId(data.employment_branch_id.toString());
              setSelectedDivisionName(data.branch_name);
            }
          }
        })
        .catch((err) => {
          console.error('❌ Error fetching KAM-wise supervisor:', err);
          setKamWiseSupervisorData(null);
        });
    } else {
      setKamWiseSupervisorData(null);
    }
  }, [selectedKam]);

  // ✅ Load supervisors when division changes (original flow)
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

  // ✅ Load KAMs when supervisor changes (original flow - only if no KAM selected yet)
  useEffect(() => {
    if (selectedSupervisor && !selectedKam) {
      PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
        .then((res) => setKams(res.data?.data || res.data || []))
        .catch(() => setKams([]));
    }
  }, [selectedSupervisor, selectedKam]);

  // ✅ Date picker values
  const selectedMonthDate =
    monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

  const selectedQuarterDate =
    quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

  const selectedYearDate = yearData ? new Date(Number(yearData), 0) : null;

  // ✅ Save handler - NOW SENDS target_type
  const handleSave = () => {
    const targetMonth = getTargetMonthDate();

    if (!targetMonth) {
      console.error('❌ Invalid date selection');
      return;
    }

    const payload = {
      target_type: targetType, // ✅ SEND target_type
      target_month: targetMonth, // ✅ SEND target_month
      division: selectedDivisionId && selectedDivisionId !== '__select__' ? `${selectedDivisionId}` : '',
      supervisor_id: selectedSupervisor && selectedSupervisor !== '__select__' ? Number(selectedSupervisor) : null,
      kam_id: selectedKam && selectedKam !== '__select__' ? Number(selectedKam) : null,
      amount: targetAmount ? Number(targetAmount) : 0,
      posted_by: 0, // Will be set in parent component
    };

    console.log('✅ PAYLOAD TO SEND:', payload);
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          <DialogDescription>
            Select period type, month/quarter/year, KAM, and set revenue target. Division and supervisor will be auto-populated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* ✅ Period Type Toggle - Monthly / Quarterly / Yearly */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                setTargetType('monthly');
                setMonthData(null);
                setQuarterData(null);
                setYearData(null);
              }}
              className={cn(
                'flex-1',
                targetType === 'monthly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
              )}
              variant="outline"
            >
              Monthly
            </Button>

            <Button
              size="sm"
              onClick={() => {
                setTargetType('quarterly');
                setMonthData(null);
                setQuarterData(null);
                setYearData(null);
              }}
              className={cn(
                'flex-1',
                targetType === 'quarterly' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
              )}
              variant="outline"
            >
              Quarterly
            </Button>
          </div>

          {/* ✅ Month Picker - for Monthly */}
          {targetType === 'monthly' && (
            <DatePicker
              selected={selectedMonthDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                setMonthData({
                  month: MONTHS[d.getMonth()],
                  year: d.getFullYear().toString(),
                });
              }}
              showMonthYearPicker
              dateFormat="MMMM yyyy"
              customInput={<FloatingDatePickerInput label="Select Month & Year" />}
            />
          )}

          {/* ✅ Quarter Picker - for Quarterly */}
          {targetType === 'quarterly' && (
            <DatePicker
              selected={selectedQuarterDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                const q = Math.floor(d.getMonth() / 3) + 1;
                setQuarterData({
                  quarter: q,
                  year: d.getFullYear().toString(),
                });
              }}
              showQuarterYearPicker
              dateFormat="yyyy, QQQ"
              customInput={<FloatingDatePickerInput label="Select Quarter & Year" />}
            />
          )}

          {/* ✅ KAM - NOW FIRST (loads all KAMs by default) */}
          <FloatingSelect
            label="KAM"
            value={selectedKam || '__select__'}
            onValueChange={(v) => {
              if (v !== '__select__') {
                setSelectedKam(v);
              }
              // Clear dependent fields when KAM changes
              if (!v || v === '__select__') {
                setSelectedSupervisor('');
                setSelectedDivisionId('');
                setSelectedDivisionName('');
              }
            }}
          >
            <SelectItem value="__select__">Select KAM</SelectItem>
            {kams.map((k: any, index: number) => {
              // Handle different possible field names
              const kamId = k.employee_id || k.kam_id || k.id;
              const kamName = k.full_name || k.kam_name || k.name || 'Unknown';
              
              // Skip if no valid ID
              if (!kamId) {
                console.warn('⚠️ KAM without ID:', k);
                return null;
              }
              
              return (
                <SelectItem key={kamId || index} value={kamId.toString()}>
                  {kamName}
                </SelectItem>
              );
            })}
          </FloatingSelect>

          {/* ✅ Supervisor - AUTO-POPULATED from KAM selection - SHOWS FOR ALL ROLES */}
          <FloatingSelect
            label="Supervisor"
            value={selectedSupervisor || '__select__'}
            onValueChange={(v) => {
              if (v !== '__select__') {
                setSelectedSupervisor(v);
              }
            }}
            disabled={true} // ✅ Disabled - auto-populated from KAM
          >
            <SelectItem value="__select__">Select Supervisor</SelectItem>
            {kamWiseSupervisorData ? (
              <SelectItem value={kamWiseSupervisorData.kam_id?.toString() || '__select__'}>
                {kamWiseSupervisorData.supervisor || 'N/A'}
              </SelectItem>
            ) : (
              supervisors.map((s: any, index: number) => {
                const supId = s.supervisor_id || s.id;
                const supName = s.supervisor || s.full_name || s.name || 'Unknown';
                
                if (!supId) return null;
                
                return (
                  <SelectItem key={supId || index} value={supId.toString()}>
                    {supName}
                  </SelectItem>
                );
              })
            )}
          </FloatingSelect>

          {/* ✅ Division - AUTO-POPULATED from KAM selection */}
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
            disabled={true} // ✅ Disabled - auto-populated from KAM
          >
            <SelectItem value="__select__">Select Branch</SelectItem>
            {kamWiseSupervisorData ? (
              <SelectItem value={kamWiseSupervisorData.employment_branch_id?.toString() || '__select__'}>
                {kamWiseSupervisorData.branch_name || 'N/A'}
              </SelectItem>
            ) : (
              branches.map((b: any, index: number) => {
                const branchId = b.id || b.branch_id;
                const branchName = b.branch_name || b.full_name || b.name || 'Unknown';
                
                if (!branchId) return null;
                
                return (
                  <SelectItem key={branchId || index} value={branchId.toString()}>
                    {branchName}
                  </SelectItem>
                );
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Target</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}