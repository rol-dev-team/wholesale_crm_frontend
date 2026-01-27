import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FloatingSearchSelectProps {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
  onTouched?: () => void;
  searchable?: boolean;
}

export function FloatingSearchSelect({
  label,
  value,
  onValueChange,
  placeholder = ' ',
  children,
  className,
  error,
  onTouched,
  searchable = false,
}: FloatingSearchSelectProps) {
  const hasValue = value !== undefined && value !== '';
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const selectedWhileOpenRef = React.useRef(false);

  const filteredChildren = React.useMemo(() => {
    if (!searchable) return children;

    const lowerSearch = searchTerm.toLowerCase();
    return React.Children.toArray(children).filter((child: any) => {
      if (!child?.props?.children) return false;
      return child.props.children
        .toString()
        .toLowerCase()
        .includes(lowerSearch);
    });
  }, [children, searchTerm, searchable]);

  return (
    <div className={cn('relative w-full', className)}>
      <Select
        value={value}
        onValueChange={(v) => {
          selectedWhileOpenRef.current = true;
          onValueChange(v);
        }}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setSearchTerm('');
            selectedWhileOpenRef.current = false;
          }

          if (open && !isOpen && !selectedWhileOpenRef.current && !value) {
            onTouched?.();
          }

          setOpen(isOpen);
        }}
      >
        <SelectTrigger
          className={cn(
            'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm outline-none',
            'focus:ring-1 focus:ring-primary',
            error && 'border-red-500'
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-[200px] overflow-y-auto">
          {searchable && (
            <div className="p-2">
              <input
                autoFocus
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${label}`}
                className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none"
              />
            </div>
          )}

          {filteredChildren}
        </SelectContent>
      </Select>

      <label
        className={cn(
          'pointer-events-none absolute left-3 px-1 transition-all',
          'bg-background text-muted-foreground',
          hasValue
            ? '-top-2 text-xs font-semibold text-primary'
            : 'top-2.5 text-sm',
          'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
        )}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
