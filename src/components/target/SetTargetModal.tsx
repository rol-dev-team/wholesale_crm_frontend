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


// src/components/modals/SetTargetModal.tsx
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

  const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month');
  const [monthData, setMonthData] = useState<{ month: string; year: string } | null>(null);
  const [quarterData, setQuarterData] = useState<{ quarter: number; year: string } | null>(null);

  const [branches, setBranches] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [kams, setKams] = useState<any[]>([]);

  // ---------------- RESET FORM ----------------
  useEffect(() => {
    if (open) {
      setSelectedDivisionId('');
      setSelectedDivisionName('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      setMonthData(null);
      setQuarterData(null);
      setPeriodType('month');
    }
  }, [open]);

  // ---------------- LOAD BRANCHES ----------------
  useEffect(() => {
    if (open) {
      PrismAPI.getBranchList()
        .then((res) => setBranches(res.data || []))
        .catch(() => setBranches([]));
    }
  }, [open]);

  // ---------------- LOAD SUPERVISORS ----------------
  useEffect(() => {
    if (selectedDivisionId) {
      PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
        .then((res) => setSupervisors(res.data || []))
        .catch(() => setSupervisors([]));
    } else {
      setSupervisors([]);
      setSelectedSupervisor('');
    }
  }, [selectedDivisionId]);

  // ---------------- LOAD KAMS ----------------
  useEffect(() => {
    if (selectedSupervisor) {
      PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
        .then((res) => setKams(res.data || []))
        .catch(() => setKams([]));
    } else {
      setKams([]);
    }
  }, [selectedSupervisor]);

  // ---------------- DATE PICKER VALUES ----------------
  const selectedMonthDate =
    monthData ? new Date(Number(monthData.year), MONTHS.indexOf(monthData.month)) : null;

  const selectedQuarterDate =
    quarterData ? new Date(Number(quarterData.year), (quarterData.quarter - 1) * 3) : null;

  // ---------------- SAVE HANDLER ----------------
  const handleSave = () => {
    let target_year = '';
    let target_period: string | number = '';

    if (periodType === 'month' && monthData) {
      target_year = monthData.year;
      target_period = monthData.month; // string
    }

    if (periodType === 'quarter' && quarterData) {
      target_year = quarterData.year;
      target_period = quarterData.quarter; // integer (1,2,3,4)
    }

    const payload = {
      target_year,
      target_period,
      division_id: selectedDivisionId,
      supervisor_id: selectedSupervisor,
      kam_id: selectedKam,
      target_amount: targetAmount,
    };

    console.log('✅ PAYLOAD:', payload);
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          <DialogDescription>
            Select month/quarter, division, supervisor, KAM and set revenue target.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* Month / Quarter Toggle */}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => setPeriodType('month')}
              className={cn(
                'flex-1',
                periodType === 'month' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
              )}
              variant="outline"
            >
              Month
            </Button>

            <Button
              size="sm"
              onClick={() => setPeriodType('quarter')}
              className={cn(
                'flex-1',
                periodType === 'quarter' ? 'bg-slate-200 text-black hover:bg-slate-200' : 'bg-white'
              )}
              variant="outline"
            >
              Quarter
            </Button>
          </div>

          {/* Month Picker */}
          {periodType === 'month' && (
            <DatePicker
              selected={selectedMonthDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                setMonthData({
                  month: MONTHS[d.getMonth()],
                  year: d.getFullYear().toString(),
                });
                setQuarterData(null);
              }}
              showMonthYearPicker
              dateFormat="MMMM yyyy"
              customInput={<FloatingDatePickerInput label="Month & Year" />}
            />
          )}

          {/* Quarter Picker */}
          {periodType === 'quarter' && (
            <DatePicker
              selected={selectedQuarterDate || undefined}
              onChange={(d: Date | null) => {
                if (!d) return;
                const q = Math.floor(d.getMonth() / 3) + 1;
                setQuarterData({
                  quarter: q,
                  year: d.getFullYear().toString(),
                });
                setMonthData(null);
              }}
              showQuarterYearPicker
              dateFormat="yyyy, QQQ"
              customInput={<FloatingDatePickerInput label="Quarter & Year" />}
            />
          )}

          {/* Division */}
          <FloatingSelect
            label="Division"
            value={selectedDivisionId || ''}
            onValueChange={(v) => {
              const branch = branches.find((b) => b.id.toString() === v);
              setSelectedDivisionId(v);
              setSelectedDivisionName(branch?.branch_name || '');
              setSelectedSupervisor('');
              setSelectedKam('');
            }}
          >
            {branches.map((b: any) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.branch_name}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Supervisor */}
          {isManagement && (
            <FloatingSelect
              label="Supervisor"
              value={selectedSupervisor || ''}
              onValueChange={(v) => {
                setSelectedSupervisor(v);
                setSelectedKam('');
              }}
              disabled={!selectedDivisionId}
            >
              {supervisors.map((s: any) => (
                <SelectItem key={s.supervisor_id} value={s.supervisor_id.toString()}>
                  {s.supervisor}
                </SelectItem>
              ))}
            </FloatingSelect>
          )}

          {/* KAM */}
          <FloatingSelect
            label="KAM"
            value={selectedKam || ''}
            onValueChange={(v) => setSelectedKam(v)}
            disabled={isManagement && !selectedSupervisor}
          >
            {kams.map((k: any) => (
              <SelectItem key={k.employee_id} value={k.employee_id.toString()}>
                {k.full_name}
              </SelectItem>
            ))}
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
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}