import * as React from 'react';
import { cn } from '@/lib/utils';

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(({ label, className, error, ...props }, ref) => {
  const hasValue =
    props.value !== undefined && String(props.value).length > 0;

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        placeholder=" "
        className={cn(
          'peer h-11 w-full rounded-md border border-input bg-background px-3 pt-5 pb-1 text-sm',
          'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
          error && 'border-red-500',
          className
        )}
        {...props}
      />

      <label
        className={cn(
          'pointer-events-none absolute left-3 px-1 transition-all bg-background',
          'text-muted-foreground',
          hasValue
            ? '-top-2 text-xs font-semibold text-primary'
            : 'top-3 text-sm',
          'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
        )}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';