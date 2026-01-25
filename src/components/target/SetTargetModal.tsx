// // SetTargetModal.tsx
// import { useEffect, useMemo, useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogFooter,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { divisions } from '@/data/mockData';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { FloatingInput } from '@/components/ui/FloatingInput';
// import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
// import { SelectItem } from '@/components/ui/select';

// import { useForm, Controller } from 'react-hook-form';
// import * as yup from 'yup';
// import { yupResolver } from '@hookform/resolvers/yup';
// import toast from 'react-hot-toast';

// interface Supervisor {
//   id: string;
//   name: string;
//   division: string;
// }

// interface KAM {
//   id: string;
//   name: string;
//   division: string;
//   supervisor?: string;
//   supervisor_id?: number;
// }

// interface Props {
//   open: boolean;
//   onOpenChange: (o: boolean) => void;
//   supervisors: Supervisor[];
//   kams: KAM[];
//   selectedDivision: string;
//   setSelectedDivision: (v: string) => void;
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
//   onSave: (values: any) => Promise<void>;
// }

// const MONTHS = [
//   'January','February','March','April','May','June',
//   'July','August','September','October','November','December'
// ];

// // Yup validation schema
// const schema = yup.object().shape({
//   selectedDivision: yup.string().required('Division is required'),
//   selectedSupervisor: yup.string().test(
//     'supervisor-required',
//     'Supervisor is required',
//     function (value) {
//       const { isManagement } = this.options.context;
//       if (isManagement) return !!value;
//       return true;
//     }
//   ),
//   selectedKam: yup.string().required('KAM is required'),
//   targetAmount: yup
//     .number()
//     .typeError('Amount must be a number')
//     .positive('Amount must be positive')
//     .required('Target amount is required'),
//   targetMonthName: yup.string().required('Month is required'),
//   targetYear: yup.string().required('Year is required'),
// });

// export default function SetTargetModal(props: Props) {
//   const {
//     open,
//     onOpenChange,
//     supervisors,
//     kams,
//     isManagement,
//     setSelectedDivision,
//     setSelectedSupervisor,
//     setSelectedKam,
//     setTargetAmount,
//     setTargetMonthName,
//     setTargetYear,
//     onSave,
//     selectedDivision,
//     selectedSupervisor,
//     selectedKam,
//     targetAmount,
//     targetMonthName,
//     targetYear,
//   } = props;

//   const [loading, setLoading] = useState(false);

//   const { 
//     handleSubmit, 
//     control, 
//     formState: { errors }, 
//     reset 
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       selectedDivision: '',
//       selectedSupervisor: '',
//       selectedKam: '',
//       targetAmount: '',
//       targetMonthName: MONTHS[new Date().getMonth()],
//       targetYear: new Date().getFullYear().toString(),
//     },
//     context: { isManagement },
//   });

//   // Reset form when modal opens
//   useEffect(() => {
//     if (open) {
//       reset({
//         selectedDivision: '',
//         selectedSupervisor: '',
//         selectedKam: '',
//         targetAmount: '',
//         targetMonthName: MONTHS[new Date().getMonth()],
//         targetYear: new Date().getFullYear().toString(),
//       });
//     }
//   }, [open, reset]);

//   const filteredSupervisors = useMemo(
//     () =>
//       supervisors.filter(
//         s => !selectedDivision || s.division === selectedDivision
//       ),
//     [supervisors, selectedDivision]
//   );

//   const filteredKams = useMemo(
//     () =>
//       kams.filter(
//         k =>
//           k.division === selectedDivision &&
//           (!selectedSupervisor || String(k.supervisor_id) === selectedSupervisor)
//       ),
//     [kams, selectedDivision, selectedSupervisor]
//   );

//   const selectedDate =
//     targetMonthName && targetYear
//       ? new Date(Number(targetYear), MONTHS.indexOf(targetMonthName))
//       : null;

//   const submitHandler = async (data: any) => {
//     setLoading(true);
//     try {
//       await new Promise(r => setTimeout(r, 1000)); // simulate 1s loader
//       await onSave(data); // call parent save function
//       toast.success('Target set successfully!');
//       onOpenChange(false);
//     } catch (err: any) {
//       toast.error('Failed to save target: ' + (err.message || err));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Set Revenue Target</DialogTitle>
//           <DialogDescription>
//             Select month, division, supervisor, KAM and set revenue target.
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
//           {/* Month Picker */}
//           <Controller
//             control={control}
//             name="targetMonthName"
//             render={({ field }) => (
//               <DatePicker
//                 selected={selectedDate || undefined}
//                 onChange={(d: Date | null) => {
//                   if (!d) return;
//                   field.onChange(MONTHS[d.getMonth()]);
//                   setTargetMonthName(MONTHS[d.getMonth()]);
//                   setTargetYear(d.getFullYear().toString());
//                 }}
//                 showMonthYearPicker
//                 dateFormat="MMMM yyyy"
//                 customInput={<FloatingDatePickerInput label="Month & Year" />}
//               />
//             )}
//           />
//           {errors.targetMonthName && <p className="text-red-500 text-sm">{errors.targetMonthName.message}</p>}

//           {/* Division */}
//           <Controller
//             control={control}
//             name="selectedDivision"
//             render={({ field }) => (
//               <FloatingSelect
//                 label="Division"
//                 value={field.value}
//                 onValueChange={v => {
//                   field.onChange(v);
//                   setSelectedDivision(v);
//                   setSelectedSupervisor('');
//                   setSelectedKam('');
//                 }}
//               >
//                 {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
//               </FloatingSelect>
//             )}
//           />
//           {errors.selectedDivision && <p className="text-red-500 text-sm">{errors.selectedDivision.message}</p>}

//           {/* Supervisor */}
//           {isManagement && (
//             <>
//               <Controller
//                 control={control}
//                 name="selectedSupervisor"
//                 render={({ field }) => (
//                   <FloatingSelect
//                     label="Supervisor"
//                     value={field.value}
//                     onValueChange={v => {
//                       field.onChange(v);
//                       setSelectedSupervisor(v);
//                     }}
//                     disabled={!selectedDivision}
//                   >
//                     {filteredSupervisors.map(s => (
//                       <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
//                     ))}
//                   </FloatingSelect>
//                 )}
//               />
//               {errors.selectedSupervisor && <p className="text-red-500 text-sm">{errors.selectedSupervisor.message}</p>}
//             </>
//           )}

//           {/* KAM */}
//           <Controller
//             control={control}
//             name="selectedKam"
//             render={({ field }) => (
//               <FloatingSelect
//                 label="KAM"
//                 value={field.value}
//                 onValueChange={v => {
//                   field.onChange(v);
//                   setSelectedKam(v);
//                 }}
//                 disabled={isManagement && !selectedSupervisor}
//               >
//                 {filteredKams.map(k => (
//                   <SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>
//                 ))}
//               </FloatingSelect>
//             )}
//           />
//           {errors.selectedKam && <p className="text-red-500 text-sm">{errors.selectedKam.message}</p>}

//           {/* Target Amount */}
//           <Controller
//             control={control}
//             name="targetAmount"
//             render={({ field }) => (
//               <FloatingInput
//                 label="Target Amount (৳)"
//                 type="number"
//                 value={field.value}
//                 onChange={e => {
//                   field.onChange(e.target.value);
//                   setTargetAmount(e.target.value);
//                 }}
//               />
//             )}
//           />
//           {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}

//           <DialogFooter>
//             <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={loading}>
//               {loading ? 'Saving...' : 'Save'}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }


// SetTargetModal.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { divisions } from '@/data/mockData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';

import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface Supervisor {
  id: string;
  name: string;
  division: string;
}

interface KAM {
  id: string;
  name: string;
  division: string;
  supervisor?: string;
  supervisor_id?: number;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  supervisors: Supervisor[];
  kams: KAM[];
  selectedDivision: string;
  setSelectedDivision: (v: string) => void;
  selectedSupervisor: string;
  setSelectedSupervisor: (v: string) => void;
  selectedKam: string;
  setSelectedKam: (v: string) => void;
  targetAmount: string;
  setTargetAmount: (v: string) => void;
  targetMonthName: string;
  setTargetMonthName: (v: string) => void;
  targetYear: string;
  setTargetYear: (v: string) => void;
  isManagement: boolean;
  onSave: (values: any) => Promise<void>;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

// Yup validation schema
const schema = yup.object().shape({
  selectedDivision: yup.string().required('Division is required'),
  selectedSupervisor: yup.string().test(
    'supervisor-required',
    'Supervisor is required',
    function (value) {
      const { isManagement } = this.options.context;
      if (isManagement) return !!value;
      return true;
    }
  ),
  selectedKam: yup.string().required('KAM is required'),
  targetAmount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be positive')
    .required('Target amount is required'),
  targetMonthName: yup.string().required('Month is required'),
  targetYear: yup.string().required('Year is required'),
});

export default function SetTargetModal(props: Props) {
  const {
    open,
    onOpenChange,
    supervisors,
    kams,
    isManagement,
    setSelectedDivision,
    setSelectedSupervisor,
    setSelectedKam,
    setTargetAmount,
    setTargetMonthName,
    setTargetYear,
    onSave,
    selectedDivision,
    selectedSupervisor,
    selectedKam,
    targetAmount,
    targetMonthName,
    targetYear,
  } = props;

  const [loading, setLoading] = useState(false);

  const { 
    handleSubmit, 
    control, 
    formState: { errors }, 
    reset 
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      selectedDivision: '',
      selectedSupervisor: '',
      selectedKam: '',
      targetAmount: '',
      targetMonthName: MONTHS[new Date().getMonth()],
      targetYear: new Date().getFullYear().toString(),
    },
    context: { isManagement },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      reset({
        selectedDivision: '',
        selectedSupervisor: '',
        selectedKam: '',
        targetAmount: '',
        targetMonthName: MONTHS[new Date().getMonth()],
        targetYear: new Date().getFullYear().toString(),
      });
    }
  }, [open, reset]);

  const filteredSupervisors = useMemo(
    () =>
      supervisors.filter(
        s => !selectedDivision || s.division === selectedDivision
      ),
    [supervisors, selectedDivision]
  );

  const filteredKams = useMemo(
    () =>
      kams.filter(
        k =>
          k.division === selectedDivision &&
          (!selectedSupervisor || String(k.supervisor_id) === selectedSupervisor)
      ),
    [kams, selectedDivision, selectedSupervisor]
  );

  const selectedDate =
    targetMonthName && targetYear
      ? new Date(Number(targetYear), MONTHS.indexOf(targetMonthName))
      : null;

  const submitHandler = async (data: any) => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1000)); // 1s loader
      await onSave(data); // parent handles toast
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          <DialogDescription>
            Select month, division, supervisor, KAM and set revenue target.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
          {/* Month Picker */}
          <Controller
            control={control}
            name="targetMonthName"
            render={({ field }) => (
              <DatePicker
                selected={selectedDate || undefined}
                onChange={(d: Date | null) => {
                  if (!d) return;
                  field.onChange(MONTHS[d.getMonth()]);
                  setTargetMonthName(MONTHS[d.getMonth()]);
                  setTargetYear(d.getFullYear().toString());
                }}
                showMonthYearPicker
                dateFormat="MMMM yyyy"
                customInput={<FloatingDatePickerInput label="Month & Year" />}
              />
            )}
          />
          {errors.targetMonthName && <p className="text-red-500 text-sm">{errors.targetMonthName.message}</p>}

          {/* Division */}
          <Controller
            control={control}
            name="selectedDivision"
            render={({ field }) => (
              <FloatingSelect
                label="Division"
                value={field.value}
                onValueChange={v => {
                  field.onChange(v);
                  setSelectedDivision(v);
                  setSelectedSupervisor('');
                  setSelectedKam('');
                }}
              >
                {divisions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </FloatingSelect>
            )}
          />
          {errors.selectedDivision && <p className="text-red-500 text-sm">{errors.selectedDivision.message}</p>}

          {/* Supervisor */}
          {isManagement && (
            <>
              <Controller
                control={control}
                name="selectedSupervisor"
                render={({ field }) => (
                  <FloatingSelect
                    label="Supervisor"
                    value={field.value}
                    onValueChange={v => {
                      field.onChange(v);
                      setSelectedSupervisor(v);
                    }}
                    disabled={!selectedDivision}
                  >
                    {filteredSupervisors.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </FloatingSelect>
                )}
              />
              {errors.selectedSupervisor && <p className="text-red-500 text-sm">{errors.selectedSupervisor.message}</p>}
            </>
          )}

          {/* KAM */}
          <Controller
            control={control}
            name="selectedKam"
            render={({ field }) => (
              <FloatingSelect
                label="KAM"
                value={field.value}
                onValueChange={v => {
                  field.onChange(v);
                  setSelectedKam(v);
                }}
                disabled={isManagement && !selectedSupervisor}
              >
                {filteredKams.map(k => (
                  <SelectItem key={k.id} value={String(k.id)}>{k.name}</SelectItem>
                ))}
              </FloatingSelect>
            )}
          />
          {errors.selectedKam && <p className="text-red-500 text-sm">{errors.selectedKam.message}</p>}

          {/* Target Amount */}
          <Controller
            control={control}
            name="targetAmount"
            render={({ field }) => (
              <FloatingInput
                label="Target Amount (৳)"
                type="number"
                value={field.value}
                onChange={e => {
                  field.onChange(e.target.value);
                  setTargetAmount(e.target.value);
                }}
              />
            )}
          />
          {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
