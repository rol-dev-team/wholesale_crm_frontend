import * as React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  className?: string;
  error?: string;
}

export function FloatingSingleDatePicker({ value, onChange, className, error }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | null>(value ? new Date(value) : null);

  React.useEffect(() => {
    setDate(value ? new Date(value) : null);
  }, [value]);

  const handleChange = (d: Date | null) => {
    setDate(d);

    if (d) {
      const formatted = d.toISOString().slice(0, 10);
      onChange(formatted);
    } else {
      onChange(undefined);
    }
  };

  return (
    <div className={cn('custom-datepicker relative w-full', className)}>
      <DatePicker
        selected={date}
        onChange={handleChange}
        showIcon
        withPortal
        popperPlacement="bottom-start"
        popperClassName="z-[9999]"
        dateFormat="yyyy-MM-dd"
        placeholderText="Select date"
        className={cn(
          'h-11 w-full rounded-md border border-input bg-background px-10 text-sm',
          error && 'border-red-500'
        )}
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
