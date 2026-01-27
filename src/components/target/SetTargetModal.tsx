// src/components/modals/SetTargetModal.tsx
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

interface KAM {
  id: string;
  name: string;
  division?: string;
  supervisor?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;

  // selectedDivision: string;
  // setSelectedDivision: (v: string) => void;

  // --- new added ---
  selectedDivisionId: string;
  setSelectedDivisionId: (v: string) => void;

  selectedDivisionName: string;
  setSelectedDivisionName: (v: string) => void;
  // --- new added ---

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
  onSave: () => void;
}

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

export default function SetTargetModal(props: Props) {
  const {
    open,
    onOpenChange,
    // selectedDivision,
    // setSelectedDivision,
    selectedDivisionId,
    setSelectedDivisionId,
    selectedDivisionName,
    setSelectedDivisionName,
    selectedSupervisor,
    setSelectedSupervisor,
    selectedKam,
    setSelectedKam,
    targetAmount,
    setTargetAmount,
    targetMonthName,
    setTargetMonthName,
    targetYear,
    setTargetYear,
    isManagement,
    onSave,
  } = props;

  // ----------------- API State -----------------
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [supervisors, setSupervisors] = useState<{ id: string; name: string }[]>([]);
  const [kams, setKams] = useState<KAM[]>([]);

  // ----------------- Reset form when modal opens -----------------
  useEffect(() => {
    if (open) {
      setSelectedDivisionId('');
      setSelectedDivisionName('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      setTargetMonthName('');
      setTargetYear('');
    }
  }, [open]);

  // ----------------- Load branches -----------------
  useEffect(() => {
    if (open) {
      PrismAPI.getBranchList()
        .then((res) => setBranches(res.data || []))
        .catch((err) => {
          console.error(err);
          setBranches([]);
        });
    }
  }, [open]);

  // ----------------- Load supervisors -----------------
  useEffect(() => {
    if (selectedDivisionId) {
      PrismAPI.getBranchWiseSupervisorList(selectedDivisionId)
        .then((res) => setSupervisors(res.data || []))
        .catch((err) => {
          console.error(err);
          setSupervisors([]);
        });
    } else {
      setSupervisors([]);
      setSelectedSupervisor('');
    }
  }, [selectedDivisionId]);

  // ----------------- Load KAMs -----------------
  useEffect(() => {
    if (selectedSupervisor) {
      PrismAPI.getSupervisorWiseKAMList(selectedSupervisor)
        .then((res) => setKams(res.data || []))
        .catch((err) => {
          console.error(err);
          setKams([]);
        });
    } else if (!isManagement) {
      setKams([]);
    }
  }, [selectedSupervisor, isManagement]);

  // ----------------- Selected date for DatePicker -----------------
  const selectedDate =
    targetMonthName && targetYear
      ? new Date(Number(targetYear), MONTHS.indexOf(targetMonthName))
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          <DialogDescription>
            Select month, division, supervisor, KAM and set revenue target.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month & Year Picker */}
          <DatePicker
            selected={selectedDate || undefined}
            onChange={(d: Date | null) => {
              if (!d) return;
              setTargetMonthName(MONTHS[d.getMonth()]);
              setTargetYear(d.getFullYear().toString());
            }}
            showMonthYearPicker
            dateFormat="MMMM yyyy"
            customInput={<FloatingDatePickerInput label="Month & Year" />}
          />

          {/* Division Select */}
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
            {(branches || []).map((b) => (
              <SelectItem key={b.id} value={b.id.toString()}>
                {b.branch_name}
              </SelectItem>
            ))}
          </FloatingSelect>

          {/* Supervisor Select (only for management) */}
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
              {(supervisors || []).map((s) => (
                <SelectItem key={s.supervisor_id} value={s.supervisor_id.toString()}>
                  {s.supervisor}
                </SelectItem>
              ))}
            </FloatingSelect>
          )}

          {/* KAM Select */}
          <FloatingSelect
            label="KAM"
            value={selectedKam || ''}
            onValueChange={(v) => setSelectedKam(Number(v))}
            disabled={isManagement && !selectedSupervisor}
          >
            {(kams || []).map((k) => (
              <SelectItem key={k.employee_id} value={k.employee_id}>
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
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
