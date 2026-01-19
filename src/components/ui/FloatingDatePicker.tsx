import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

interface FloatingDatePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}

export function FloatingDatePicker({
  label,
  value,
  onChange,
  className,
  error,
}: FloatingDatePickerProps) {
  const hasValue = Boolean(value);
  const [open, setOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | null>(
    value ? new Date(value) : null
  );

  React.useEffect(() => {
    setTempDate(value ? new Date(value) : null);
  }, [value]);

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
        {tempDate ? (
          tempDate.toLocaleString()
        ) : (
          <span className="text-muted-foreground"> </span>
        )}
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

      {/* POPUP DATE PICKER */}
      <DatePicker
        selected={tempDate}
        onChange={(date) => setTempDate(date)}
        showTimeSelect
        open={open}
        onClickOutside={() => setOpen(false)}
        onSelect={() => {}}
        popperPlacement="bottom-start"
        popperClassName="z-50"
        calendarClassName="shadow-lg border rounded-md"
        shouldCloseOnSelect={false}
        customInput={<div />} // prevents default input
      >
        {/* CONFIRM FOOTER */}
        <div className="flex justify-end gap-2 border-t p-2 bg-background">
          <button
            type="button"
            className="text-sm px-3 py-1 rounded-md border"
            onClick={() => {
              setTempDate(value ? new Date(value) : null);
              setOpen(false);
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            className="text-sm px-3 py-1 rounded-md bg-primary text-primary-foreground"
            onClick={() => {
              if (tempDate) {
                onChange(tempDate.toISOString().slice(0, 16));
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
