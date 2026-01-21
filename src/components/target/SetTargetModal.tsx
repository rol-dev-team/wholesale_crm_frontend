// SetTargetModal.tsx
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { divisions, initialKAMs } from '@/data/mockData';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar as CalendarIcon } from 'lucide-react';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { FloatingDatePickerInput } from '@/components/ui/FloatingDatePickerInput';
import { SelectItem } from '@/components/ui/select';

interface KAM {
  id: string;
  name: string;
  division: string;
}

interface SetTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDivision: string;
  setSelectedDivision: (division: string) => void;
  selectedKam: string;
  setSelectedKam: (kam: string) => void;
  targetAmount: string;
  setTargetAmount: (amt: string) => void;
  targetMonthName: string;
  setTargetMonthName: (m: string) => void;
  targetYear: string;
  setTargetYear: (y: string) => void;
  onSave: () => void;
  isManagement: boolean;
}

const MONTHS_LIST = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function SetTargetModal({
  open, onOpenChange,
  selectedDivision, setSelectedDivision,
  selectedKam, setSelectedKam,
  targetAmount, setTargetAmount,
  targetMonthName, setTargetMonthName,
  targetYear, setTargetYear,
  onSave,
}: SetTargetModalProps) {
  const kams: KAM[] = initialKAMs;

  // Reset all fields when modal opens
  useEffect(() => {
    setSelectedDivision('');
    setSelectedKam('');
    setTargetMonthName('');
    setTargetYear('');
    setTargetAmount('');
  }, [open]);

  // Convert month + year to Date object
  const getPickerDate = (month: string, year: string) => {
    if (!month || !year) return null;
    const monthIndex = MONTHS_LIST.indexOf(month);
    return new Date(parseInt(year), monthIndex);
  };

  const handleMonthChange = (date: Date | null) => {
    if (!date) return;
    setTargetMonthName(MONTHS_LIST[date.getMonth()]);
    setTargetYear(date.getFullYear().toString());
  };

  const selectedDate = getPickerDate(targetMonthName, targetYear);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Set Revenue Target</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Picker */}
          <div className="w-full">
            <DatePicker
              selected={selectedDate || undefined}
              onChange={handleMonthChange}
              showMonthYearPicker
              dateFormat="MMMM yyyy"
              customInput={<FloatingDatePickerInput label="Select Month & Year" />}
              wrapperClassName="w-full"
            />

          </div>

          {/* Division */}
          <FloatingSelect
            label="Division"
            value={selectedDivision}
            onValueChange={(val) => {
              setSelectedDivision(val);
              setSelectedKam(''); // reset KAM when division changes
            }}
          >
            {divisions.map(d => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </FloatingSelect>

          {/* KAM */}
          <FloatingSelect
            label="KAM"
            value={selectedKam}
            onValueChange={setSelectedKam}
          >
            {kams
              .filter(k => k.division === selectedDivision)
              .map(k => (
                <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>
              ))}
          </FloatingSelect>

          {/* Target Amount */}
          <FloatingInput
            label="Target Amount (৳)"
            type="number"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
          />
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={onSave}
            disabled={!selectedKam || !targetAmount || !targetMonthName || !targetYear || !selectedDivision}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
