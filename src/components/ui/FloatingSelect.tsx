// // FloatingSelect.tsx
// import * as React from 'react';
// import { cn } from '@/lib/utils';
// import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface FloatingSelectProps {
//   label: string;
//   value?: string;
//   onValueChange: (value: string) => void;
//   onBlur?: () => void;
//   placeholder?: string;
//   children: React.ReactNode;
//   className?: string;
//   error?: string;
//   onTouched?: () => void;
// }

// export function FloatingSelect({
//   label,
//   value,
//   onValueChange,
//   placeholder = ' ',
//   children,
//   className,
//   error,
//   onTouched,
// }: FloatingSelectProps) {
//   const hasValue = Boolean(value);
//   const [open, setOpen] = React.useState(false);

//   // ✅ track if a value was selected while dropdown is open
//   const selectedWhileOpenRef = React.useRef(false);

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

// FloatingSelect.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FloatingSelectProps {
  label: string;
  value?: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
  onTouched?: () => void;
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
}: FloatingSelectProps) {
  const hasValue = Boolean(value);
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedWhileOpenRef = React.useRef(false);

  const items = React.useMemo(
    () => React.Children.toArray(children) as React.ReactElement[],
    [children]
  );

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items;

    const q = search.toLowerCase();

    return items.filter((item) => {
      const text =
        item.props.textValue ??
        (typeof item.props.children === 'string' ? item.props.children : '');

      return text.toLowerCase().includes(q);
    });
  }, [items, search]);

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
            selectedWhileOpenRef.current = false;
            setSearch('');
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
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

        <SelectContent
          className="max-h-[260px] overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onFocusOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            if ((e.target as HTMLElement).closest('input')) {
              e.preventDefault();
            }
          }}
          onKeyDownCapture={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT') {
              e.stopPropagation();
            }
          }}
        >
          {/* 🔍 SEARCH INPUT */}
          <div className="border-b p-2">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label}`}
              className="w-full rounded-md border px-2 py-1 text-sm outline-none"
              onKeyDown={(e) => e.stopPropagation()}
              onKeyDownCapture={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onBlur={() => {
                requestAnimationFrame(() => {
                  inputRef.current?.focus();
                });
              }}
            />
          </div>

          <div className="max-h-[200px] overflow-y-auto">
            {filteredItems.length > 0 ? (
              filteredItems
            ) : (
              <div className="p-3 text-sm text-muted-foreground">No results</div>
            )}
          </div>
        </SelectContent>
      </Select>

      <label
        className={cn(
          'pointer-events-none absolute left-3 bg-background px-1 transition-all',
          hasValue
            ? '-top-2 text-xs font-semibold text-primary'
            : 'top-2.5 text-sm text-muted-foreground',
          'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
        )}
      >
        {label}
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
