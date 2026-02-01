import * as React from 'react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X } from 'lucide-react';

export interface MultiSelectOption {
  label: string;
  value: string;
}

interface FloatingMultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
}

export function FloatingMultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  searchable = true,
  className,
}: FloatingMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const hasValue = value.length > 0;

  const selectedOptions = options.filter((o) => value.includes(o.value));

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !search) return options;
    return options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search, searchable]);

  const toggleValue = (val: string) => {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  };

  const removeChip = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className={cn('relative w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            className={cn(
              'peer min-h-10 w-full rounded-md border border-input bg-background px-3 pt-4 pb-2 text-sm outline-none',
              'flex flex-wrap gap-1 items-center cursor-pointer',
              'focus:ring-1 focus:ring-primary'
            )}
          >
            {
              hasValue
                ? selectedOptions.map((opt) => (
                    <span
                      key={opt.value}
                      className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
                    >
                      {opt.label}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeChip(opt.value);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))
                : null /* <-- no placeholder text */
            }
          </div>
        </PopoverTrigger>

        <PopoverContent className="w-full p-2 max-h-[200px] overflow-y-auto">
          {searchable && (
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${label}`}
              className="mb-2 w-full rounded-md border border-input px-2 py-1 text-sm outline-none"
            />
          )}

          <div className="flex flex-col gap-1">
            {filteredOptions.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(opt.value)}
                  onChange={() => toggleValue(opt.value)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Floating label */}
      <label
        className={cn(
          'pointer-events-none absolute left-3 px-1 transition-all bg-background text-muted-foreground',
          hasValue || open ? '-top-2 text-xs font-semibold text-primary' : 'top-2.5 text-sm'
        )}
      >
        {label}
      </label>
    </div>
  );
}

// import * as React from 'react';
// import { cn } from '@/lib/utils';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
// import { X } from 'lucide-react';

// export interface MultiSelectOption {
//   label: string;
//   value: string;
// }

// interface FloatingMultiSelectProps {
//   label: string;
//   options: MultiSelectOption[];
//   value: string[];
//   onChange: (values: string[]) => void;
//   placeholder?: string;
//   searchable?: boolean;
//   className?: string;
// }

// export function FloatingMultiSelect({
//   label,
//   options,
//   value,
//   onChange,
//   placeholder = 'Select...',
//   searchable = true,
//   className,
// }: FloatingMultiSelectProps) {
//   const [open, setOpen] = React.useState(false);
//   const [search, setSearch] = React.useState('');

//   const hasValue = value.length > 0;

//   const selectedOptions = options.filter((o) => value.includes(o.value));

//   const filteredOptions = React.useMemo(() => {
//     if (!searchable || !search) return options;
//     return options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
//   }, [options, search, searchable]);

//   const toggleValue = (val: string) => {
//     onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
//   };

//   const removeChip = (val: string) => {
//     onChange(value.filter((v) => v !== val));
//   };

//   return (
//     <div className={cn('relative w-full', className)}>
//       <Popover open={open} onOpenChange={setOpen}>
//         <PopoverTrigger asChild>
//           <div
//             role="button"
//             tabIndex={0}
//             className={cn(
//               'peer min-h-10 w-full rounded-md border border-input bg-background px-3 pt-4 pb-2 text-sm outline-none',
//               'flex flex-wrap gap-1 items-center cursor-pointer',
//               'focus:ring-1 focus:ring-primary'
//             )}
//           >
//             {
//               hasValue
//                 ? selectedOptions.map((opt) => (
//                     <span
//                       key={opt.value}
//                       className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs"
//                     >
//                       {opt.label}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removeChip(opt.value);
//                         }}
//                         className="text-muted-foreground hover:text-foreground"
//                       >
//                         <X size={12} />
//                       </button>
//                     </span>
//                   ))
//                 : null /* <-- no placeholder text */
//             }
//           </div>
//         </PopoverTrigger>

//         <PopoverContent
//           align="start"
//           className="w-[--radix-popover-trigger-width] p-1 max-h-[200px] overflow-y-auto"
//         >
//           {searchable && (
//             <input
//               autoFocus
//               type="text"
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               placeholder={`Search ${label}`}
//               className="mb-2 w-full rounded-md border border-input px-2 py-1 text-sm outline-none"
//             />
//           )}

//           <div className="flex flex-col">
//             {filteredOptions.map((opt) => {
//               const selected = value.includes(opt.value);

//               return (
//                 <div
//                   key={opt.value}
//                   role="option"
//                   aria-selected={selected}
//                   onClick={() => toggleValue(opt.value)}
//                   className={cn(
//                     'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
//                     'hover:bg-accent hover:text-accent-foreground',
//                     'focus:bg-accent focus:text-accent-foreground',
//                     selected && 'bg-accent text-accent-foreground'
//                   )}
//                 >
//                   <span className="flex-1">{opt.label}</span>

//                   {selected && <span className="text-xs opacity-70">✓</span>}
//                 </div>
//               );
//             })}
//           </div>
//         </PopoverContent>
//       </Popover>

//       {/* Floating label */}
//       <label
//         className={cn(
//           'pointer-events-none absolute left-3 px-1 transition-all bg-background text-muted-foreground',
//           hasValue || open ? '-top-2 text-xs font-semibold text-primary' : 'top-2.5 text-sm'
//         )}
//       >
//         {label}
//       </label>
//     </div>
//   );
// }
