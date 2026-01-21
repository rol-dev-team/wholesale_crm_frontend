// SetTargetModal.tsx
import { useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // ✅ ADD THIS
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { divisions, initialKAMs } from '@/data/mockData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';

interface KAM {
  id: string;
  name: string;
  division: string;
  supervisor?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;

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
  onSave: () => void;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function SetTargetModal(props: Props) {
  const {
    open,
    onOpenChange,
    selectedDivision,
    setSelectedDivision,
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

  const kams: KAM[] = initialKAMs;

  useEffect(() => {
    if (open) {
      setSelectedDivision('');
      setSelectedSupervisor('');
      setSelectedKam('');
      setTargetAmount('');
      setTargetMonthName('');
      setTargetYear('');
    }
  }, [open]);

  const supervisors = useMemo(() => {
    return Array.from(
      new Set(
        kams
          .filter(k => !selectedDivision || k.division === selectedDivision)
          .map(k => k.supervisor)
          .filter(Boolean)
      )
    ) as string[];
  }, [kams, selectedDivision]);

  const selectedDate =
    targetMonthName && targetYear
      ? new Date(
          Number(targetYear),
          MONTHS.indexOf(targetMonthName)
        )
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
          {/* ✅ ADD THIS */}
          <DialogDescription>
            Select month, division, supervisor, KAM and set revenue target.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
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

          <FloatingSelect
            label="Division"
            value={selectedDivision}
            onValueChange={v => {
              setSelectedDivision(v);
              setSelectedSupervisor('');
              setSelectedKam('');
            }}
          >
            {divisions.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </FloatingSelect>

          {isManagement && (
            <FloatingSelect
              label="Supervisor"
              value={selectedSupervisor}
              onValueChange={v => {
                setSelectedSupervisor(v);
                setSelectedKam('');
              }}
              disabled={!selectedDivision}
            >
              {supervisors.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </FloatingSelect>
          )}

          <FloatingSelect
            label="KAM"
            value={selectedKam}
            onValueChange={setSelectedKam}
            disabled={isManagement && !selectedSupervisor}
          >
            {kams
              .filter(k =>
                k.division === selectedDivision &&
                (!isManagement || k.supervisor === selectedSupervisor)
              )
              .map(k => (
                <SelectItem key={k.id} value={k.id}>
                  {k.name}
                </SelectItem>
              ))}
          </FloatingSelect>

          <FloatingInput
            label="Target Amount (৳)"
            type="number"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
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
