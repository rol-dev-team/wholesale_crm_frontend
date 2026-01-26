// FloatingSelect.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FloatingSelectProps {
  label: string;
  value?: string | string[]; // ✅ allow array for multi-select
  onValueChange: (value: string | string[]) => void; // ✅ allow string[] for multi-select
  onBlur?: () => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
  onTouched?: () => void;
  searchable?: boolean;
  multiple?: boolean;
}

export function FloatingSelect({
  label,
  value,
  onValueChange,
  placeholder = ' ',
  children,
  className,
  error,
  onTouched,
  searchable = false,
  multiple = false,
}: FloatingSelectProps) {
  const hasValue = Boolean(value);
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // ✅ track if a value was selected while dropdown is open
  const selectedWhileOpenRef = React.useRef(false);
  // Filter children if searchable
  const filteredChildren = React.useMemo(() => {
    if (!searchable) return children;

    const lowerSearch = searchTerm.toLowerCase();
    return React.Children.toArray(children).filter((child: any) => {
      if (!child?.props?.children) return false;
      return child.props.children.toString().toLowerCase().includes(lowerSearch);
    });
  }, [children, searchTerm, searchable]);
//   return (
//     <div className={cn('relative w-full', className)}>
//       <Select
//         value={value}
//         onValueChange={(v) => {
//           selectedWhileOpenRef.current = true;
//           onValueChange(v);
//         }}
//         onOpenChange={(isOpen) => {
//           // reset flag on open
//           if (isOpen) {
//             selectedWhileOpenRef.current = false;
//           }

//           // closing without selecting anything
//           if (open && !isOpen && !selectedWhileOpenRef.current && !value) {
//             onTouched?.();
//           }

//           setOpen(isOpen);
//         }}
//       >
//         <SelectTrigger
//           className={cn(
//             'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm outline-none',
//             'focus:border-none focus:ring-1 focus:ring-primary',
//             error ? 'border-red-500' : '',
//             className
//           )}
//         >
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>

//         <SelectContent className="max-h-[200px] overflow-y-scroll scrollbar-visible">
//           {children}
//         </SelectContent>
//       </Select>

//       <label
//         className={cn(
//           'pointer-events-none absolute left-3 px-1 transition-all',
//           'text-muted-foreground bg-background',
//           hasValue ? '-top-2 text-xs font-semibold text-primary' : 'top-2.5 text-sm',
//           'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
//         )}
//       >
//         {label}
//       </label>

//       {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
//     </div>
//   );
// }


return (
    <div className={cn('relative w-full', className)}>
      {searchable && (
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${label}`}
          className="mb-1 w-full rounded-md border border-input bg-background px-3 py-1 text-sm outline-none"
        />
      )}

      <Select
        value={value as any}
        onValueChange={(v: string | string[]) => {
          selectedWhileOpenRef.current = true;
          onValueChange(v);
        }}
        onOpenChange={(isOpen) => {
          if (isOpen) setSearchTerm(''); // reset search on open
          if (isOpen) selectedWhileOpenRef.current = false;

          if (
            open &&
            !isOpen &&
            !selectedWhileOpenRef.current &&
            (!value || (Array.isArray(value) && value.length === 0))
          ) {
            onTouched?.();
          }

          setOpen(isOpen);
        }}
      >
        <SelectTrigger
          className={cn(
            'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm outline-none',
            'focus:border-none focus:ring-1 focus:ring-primary',
            error ? 'border-red-500' : '',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className="max-h-[200px] overflow-y-scroll scrollbar-visible">
          {filteredChildren}
        </SelectContent>
      </Select>

      <label
        className={cn(
          'pointer-events-none absolute left-3 px-1 transition-all',
          'text-muted-foreground bg-background',
          hasValue ? '-top-2 text-xs font-semibold text-primary' : 'top-2.5 text-sm',
          'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
        )}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}