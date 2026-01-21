import React, { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingDatePickerInputProps {
  value?: string;
  onClick?: () => void;
  label: string;
  error?: string;
}

export const FloatingDatePickerInput = forwardRef<HTMLButtonElement, FloatingDatePickerInputProps>(
  ({ value, onClick, label, error }, ref) => {
    // Check if value exists (datepicker passes a string to the custom input)
    const hasValue = Boolean(value && value.length > 0);

    return (
      <div className="relative w-full">
        <Button
          type="button"
          ref={ref}
          onClick={onClick}
          variant="outline"
          className={cn(
            // Matching FloatingInput: h-11, specific padding, and background
            'peer h-11 w-full rounded-md border border-input bg-background px-4 pt-3 pb-1 text-sm leading-5 focus:border-primary focus:ring-0 focus:outline-none',
            hasValue ? 'border-primary' : '',
            error ? 'border-red-500' : ''
          )}
        >
          <div className=" gap-2 overflow-hidden">
            {/* <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" /> */}
            <span className="truncate text-sm leading-5">
              {hasValue ? value : ""}
            </span>
          </div>
        </Button>

        <label
          className={cn(
            // Matching FloatingInput transition and pointer logic
            'pointer-events-none absolute left-3 transition-all duration-200 px-1',
            
            // If value is present, move to top border (Matches peer-[:not(:placeholder-shown)])
            // If empty, stay in the middle (Matches peer-placeholder-shown)
            hasValue 
              ? '-top-3 text-sm font-semibold text-primary bg-background' 
              : 'top-3 text-sm text-muted-foreground'
          )}
        >
          {label}
        </label>

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

FloatingDatePickerInput.displayName = 'FloatingDatePickerInput';