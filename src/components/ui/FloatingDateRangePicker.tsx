import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

interface DateRangeValue {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

interface FloatingDateRangePickerProps {
  label: string;
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
  error?: string;
}

export function FloatingDateRangePicker({
  label,
  value,
  onChange,
  className,
  error,
}: FloatingDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [tempRange, setTempRange] = React.useState<
    [Date | null, Date | null]
  >([
    value?.startDate ? new Date(value.startDate) : null,
    value?.endDate ? new Date(value.endDate) : null,
  ]);

  const hasValue = Boolean(value?.startDate || value?.endDate);

  React.useEffect(() => {
    setTempRange([
      value?.startDate ? new Date(value.startDate) : null,
      value?.endDate ? new Date(value.endDate) : null,
    ]);
  }, [value?.startDate, value?.endDate]);

  const displayValue =
    tempRange[0] && tempRange[1]
      ? `${tempRange[0].toLocaleDateString()} – ${tempRange[1].toLocaleDateString()}`
      : '';

  return (
    <div className={cn('relative w-full', className)}>
      {/* CLICKABLE INPUT */}
      <div
        className={cn(
          'peer h-11 w-full rounded-md border border-input bg-background px-3 pt-5 pb-1 text-sm cursor-pointer',
          'focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
          error && 'border-red-500'
        )}
        onClick={() => setOpen(true)}
      >
        {displayValue || <span className="text-muted-foreground"> </span>}
      </div>

      {/* FLOATING LABEL */}
      <label
        className={cn(
          'pointer-events-none absolute left-3 px-1 transition-all bg-background',
          'text-muted-foreground',
          hasValue || open
            ? '-top-2 text-xs font-semibold text-primary'
            : 'top-3 text-sm'
        )}
      >
        {label}
      </label>

      {/* DATE RANGE PICKER */}
      <DatePicker
        selectsRange
        startDate={tempRange[0]}
        endDate={tempRange[1]}
        onChange={(update) => setTempRange(update as [Date | null, Date | null])}
        open={open}
        onClickOutside={() => setOpen(false)}
        shouldCloseOnSelect={false}
        popperPlacement="bottom-start"
        popperClassName="z-50"
        calendarClassName="shadow-lg border rounded-md"
        dateFormat="yyyy-MM-dd"
        customInput={<div />}
      >
        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t p-2 bg-background">
          <button
            type="button"
            className="text-sm px-3 py-1 rounded-md border"
            onClick={() => {
              setTempRange([
                value?.startDate ? new Date(value.startDate) : null,
                value?.endDate ? new Date(value.endDate) : null,
              ]);
              setOpen(false);
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground"
            disabled={!tempRange[0] || !tempRange[1]}
            onClick={() => {
              if (tempRange[0] && tempRange[1]) {
                onChange({
                  startDate: tempRange[0].toISOString().slice(0, 10),
                  endDate: tempRange[1].toISOString().slice(0, 10),
                });
              }
              setOpen(false);
            }}
          >
            Confirm
          </button>
        </div>
      </DatePicker>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
