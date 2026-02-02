// import * as React from 'react';
// import { cn } from '@/lib/utils';
// import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface FloatingSearchSelectProps {
//   label: string;
//   value?: string;
//   onValueChange: (value: string) => void;
//   placeholder?: string;
//   children: React.ReactNode;
//   className?: string;
//   error?: string;
//   onTouched?: () => void;
//   searchable?: boolean;
// }

// export function FloatingSearchSelect({
//   label,
//   value,
//   onValueChange,
//   placeholder = ' ',
//   children,
//   className,
//   error,
//   onTouched,
//   searchable = false,
// }: FloatingSearchSelectProps) {
//   const hasValue = value !== undefined && value !== '';
//   const [open, setOpen] = React.useState(false);
//   const [searchTerm, setSearchTerm] = React.useState('');

//   const selectedWhileOpenRef = React.useRef(false);

//   const filteredChildren = React.useMemo(() => {
//     if (!searchable) return children;

//     const lowerSearch = searchTerm.toLowerCase();
//     return React.Children.toArray(children).filter((child: any) => {
//       if (!child?.props?.children) return false;
//       return child.props.children.toString().toLowerCase().includes(lowerSearch);
//     });
//   }, [children, searchTerm, searchable]);

//   return (
//     <div className={cn('relative w-full', className)}>
//       <Select
//         value={value}
//         onValueChange={(v) => {
//           selectedWhileOpenRef.current = true;
//           onValueChange(v);
//         }}
//         onOpenChange={(isOpen) => {
//           if (isOpen) {
//             setSearchTerm('');
//             selectedWhileOpenRef.current = false;
//           }

//           if (open && !isOpen && !selectedWhileOpenRef.current && !value) {
//             onTouched?.();
//           }

//           setOpen(isOpen);
//         }}
//       >
//         <SelectTrigger
//           className={cn(
//             'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm outline-none',
//             'focus:ring-1 focus:ring-primary',
//             error && 'border-red-500'
//           )}
//         >
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>

//         <SelectContent className="max-h-[200px] overflow-y-auto">
//           {searchable && (
//             <div className="p-2">
//               <input
//                 autoFocus
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder={`Search ${label}`}
//                 className="w-full rounded-md border border-input px-2 py-1 text-sm outline-none"
//               />
//             </div>
//           )}

//           {filteredChildren}
//         </SelectContent>
//       </Select>

//       <label
//         className={cn(
//           'pointer-events-none absolute left-3 px-1 transition-all',
//           'bg-background text-muted-foreground',
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

// import * as React from 'react';
// import { cn } from '@/lib/utils';
// import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

// interface FloatingSearchSelectProps {
//   label: string;
//   value?: string;
//   onValueChange: (value: string) => void;
//   placeholder?: string;
//   children: React.ReactNode;
//   className?: string;
//   error?: string;
//   onTouched?: () => void;
//   searchable?: boolean;
// }

// export function FloatingSearchSelect({
//   label,
//   value,
//   onValueChange,
//   placeholder = ' ',
//   children,
//   className,
//   error,
//   onTouched,
//   searchable = false,
// }: FloatingSearchSelectProps) {
//   const hasValue = Boolean(value);
//   const [open, setOpen] = React.useState(false);
//   const [search, setSearch] = React.useState('');
//   const selectedRef = React.useRef(false);

//   const items = React.useMemo(() => {
//     return React.Children.toArray(children) as React.ReactElement[];
//   }, [children]);

//   const filteredItems = React.useMemo(() => {
//     if (!searchable || !search) return items;

//     return items.filter((item) =>
//       item.props.textValue?.toLowerCase().includes(search.toLowerCase())
//     );
//   }, [items, search, searchable]);

//   return (
//     <div className={cn('relative w-full', className)}>
//       <Select
//         value={value}
//         onValueChange={(v) => {
//           selectedRef.current = true;
//           onValueChange(v);
//         }}
//         onOpenChange={(isOpen) => {
//           if (isOpen) {
//             setSearch('');
//             selectedRef.current = false;
//           }

//           if (!isOpen && !selectedRef.current && !value) {
//             onTouched?.();
//           }

//           setOpen(isOpen);
//         }}
//       >
//         <SelectTrigger
//           className={cn(
//             'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm',
//             'focus:ring-1 focus:ring-primary',
//             error && 'border-red-500'
//           )}
//         >
//           <SelectValue placeholder={placeholder} />
//         </SelectTrigger>

//         <SelectContent
//           className="max-h-[240px] overflow-hidden"
//           onPointerDownOutside={(e) => {
//             if ((e.target as HTMLElement).closest('input')) {
//               e.preventDefault();
//             }
//           }}
//         >
//           {searchable && (
//             <div className="p-2 border-b">
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder={`Search ${label}`}
//                 className="w-full rounded-md border px-2 py-1 text-sm outline-none"
//                 onKeyDown={(e) => e.stopPropagation()}
//               />
//             </div>
//           )}

//           <div className="max-h-[180px] overflow-y-auto">
//             {filteredItems.length > 0 ? (
//               filteredItems
//             ) : (
//               <div className="p-3 text-sm text-muted-foreground">No results</div>
//             )}
//           </div>
//         </SelectContent>
//       </Select>

//       <label
//         className={cn(
//           'pointer-events-none absolute left-3 px-1 transition-all bg-background',
//           hasValue
//             ? '-top-2 text-xs font-semibold text-primary'
//             : 'top-2.5 text-sm text-muted-foreground',
//           'peer-focus:-top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-primary'
//         )}
//       >
//         {label}
//       </label>

//       {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
//     </div>
//   );
// }

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const hasValue = Boolean(value);
  const [search, setSearch] = React.useState('');
  const selectedRef = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const items = React.useMemo(
    () => React.Children.toArray(children) as React.ReactElement[],
    [children]
  );

  const filteredItems = React.useMemo(() => {
    if (!searchable || search.trim() === '') return items;

    const q = search.toLowerCase();

    return items.filter((item) => {
      const text =
        item.props.textValue ??
        (typeof item.props.children === 'string' ? item.props.children : '');

      return text.toLowerCase().includes(q);
    });
  }, [items, search, searchable]);

  return (
    <div className={cn('relative w-full', className)}>
      <Select
        value={value}
        onValueChange={(v) => {
          selectedRef.current = true;
          onValueChange(v);
        }}
        onOpenChange={(open) => {
          if (open) {
            setSearch('');
            selectedRef.current = false;

            // ensure input gets focus when dropdown opens
            requestAnimationFrame(() => {
              inputRef.current?.focus();
            });
          }

          if (!open && !selectedRef.current && !value) {
            onTouched?.();
          }
        }}
      >
        <SelectTrigger
          className={cn(
            'peer h-10 w-full rounded-md border border-input bg-background px-3 pt-4 text-sm',
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
            // ⛔ block Radix typeahead ONLY when typing in input
            if (target.tagName === 'INPUT') {
              e.stopPropagation();
            }
          }}
        >
          {searchable && (
            <div className="border-b p-2">
              <input
                ref={inputRef}
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${label}`}
                className="w-full rounded-md border px-2 py-1 text-sm outline-none"
                onKeyDown={(e) => e.stopPropagation()}
                onKeyDownCapture={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onBlur={() => {
                  // 🔥 force cursor back if Radix steals focus
                  requestAnimationFrame(() => {
                    inputRef.current?.focus();
                  });
                }}
              />
            </div>
          )}

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
