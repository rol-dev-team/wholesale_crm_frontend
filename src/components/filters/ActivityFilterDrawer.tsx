// 'use client';

// import * as React from 'react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { Button } from '@/components/ui/button';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { X, RotateCcw } from 'lucide-react';

// import { FloatingFilterSelector } from '@/components/ui/FloatingFilterSelector';
// import { FloatingDateRangePicker } from '@/components/ui/FloatingDateRangePicker';

// /* ------------------------------------------------------------------ */
// /* TYPES */
// /* ------------------------------------------------------------------ */

// export type Option<T = string> = {
//   label: string;
//   value: T;
// };

// export type FilterConfig<T = string> =
//   | {
//       type: 'single-select';
//       label: string;
//       value: T;
//       onChange: (v: T) => void;
//       options: Option<T>[];
//     }
//   | {
//       type: 'search-select';
//       label: string;
//       value: T;
//       onChange: (v: T) => void;
//       options: Option<T>[];
//     }
//   | {
//       type: 'multi-select';
//       label: string;
//       value: T[];
//       onChange: (v: T[]) => void;
//       options: Option<T>[];
//     }
//   | {
//       type: 'date-range';
//       label: string;
//       value: { from?: string; to?: string };
//       onChange: (v: { from?: string; to?: string }) => void;
//     };

// interface FilterDrawerProps<T = string> {
//   open: boolean;
//   onClose: () => void;
//   title?: string;
//   filters: FilterConfig<T>[];
//   onApply: () => void;
//   onReset: () => void;
// }

// /* ------------------------------------------------------------------ */
// /* COMPONENT */
// /* ------------------------------------------------------------------ */

// export function FilterDrawer<T = string>({
//   open,
//   onClose,
//   title = 'Filters',
//   filters,
//   onApply,
//   onReset,
// }: FilterDrawerProps<T>) {
//   // 1. Define the desired sequence (Case insensitive matching)
//   const sequence = ['division', 'supervisor', 'kam', 'type', 'client', 'date'];

//   // 2. Filter out "Business" and "Business Entity" and sort based on sequence
//   const orderedFilters = React.useMemo(() => {
//     return filters
//       .filter((f) => {
//         const label = f.label.toLowerCase();
//         // Removes "Business", "Business Entity", or any label containing "entity"
//         return !label.includes('business') && !label.includes('entity');
//       })
//       .sort((a, b) => {
//         const indexA = sequence.findIndex((s) => a.label.toLowerCase().includes(s));
//         const indexB = sequence.findIndex((s) => b.label.toLowerCase().includes(s));

//         const finalA = indexA === -1 ? 99 : indexA;
//         const finalB = indexB === -1 ? 99 : indexB;

//         return finalA - finalB;
//       });
//   }, [filters]);

//   return (
//     <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
//       <DrawerContent className="w-full sm:w-[420px]">
//         {/* Header */}
//         <DrawerHeader className="flex items-center justify-between">
//           <DrawerTitle>{title}</DrawerTitle>
//           <DrawerClose asChild>
//             <Button variant="ghost" size="icon">
//               <X className="h-4 w-4" />
//             </Button>
//           </DrawerClose>
//         </DrawerHeader>

//         {/* Body */}
//         <ScrollArea className="flex-1 px-4">
//           <div className="space-y-5 py-2">
//             {orderedFilters.map((filter, idx) => {
//               if (filter.type === 'single-select') {
//                 return (
//                   <FloatingFilterSelector
//                     key={idx}
//                     label={filter.label}
//                     value={String(filter.value)}
//                     onChange={(v) => {
//                       const selected = filter.options.find((o) => String(o.value) === v);
//                       if (selected) {
//                         filter.onChange(selected.value);
//                       }
//                     }}
//                     options={filter.options.map((o) => ({
//                       label: o.label,
//                       value: String(o.value),
//                     }))}
//                   />
//                 );
//               }

//               if (filter.type === 'search-select') {
//                 return (
//                   <FloatingFilterSelector
//                     key={idx}
//                     label={filter.label}
//                     value={String(filter.value)}
//                     searchable
//                     onChange={(v) => filter.onChange(v as T)}
//                     options={filter.options.map((o) => ({
//                       label: o.label,
//                       value: String(o.value),
//                     }))}
//                   />
//                 );
//               }

//               if (filter.type === 'multi-select') {
//                 return (
//                   <FloatingFilterSelector
//                     key={idx}
//                     label={filter.label}
//                     multiple
//                     value={filter.value.map(String)}
//                     onChange={(v) => {
//                       const selectedValues = (v as string[])
//                         .map((sv) => filter.options.find((o) => String(o.value) === sv)?.value)
//                         .filter(Boolean) as T[];

//                       filter.onChange(selectedValues);
//                     }}
//                     options={filter.options.map((o) => ({
//                       label: o.label,
//                       value: String(o.value),
//                     }))}
//                   />
//                 );
//               }

//               if (filter.type === 'date-range') {
//                 return (
//                   <FloatingDateRangePicker
//                     key={idx}
//                     label={filter.label}
//                     value={{
//                       startDate: filter.value.from,
//                       endDate: filter.value.to,
//                     }}
//                     onChange={(v) =>
//                       filter.onChange({
//                         from: v.startDate,
//                         to: v.endDate,
//                       })
//                     }
//                   />
//                 );
//               }

//               return null;
//             })}
//             <Button
//               variant="ghost"
//               className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
//               onClick={onReset}
//             >
//               <RotateCcw className="h-4 w-4" /> Clear All Filters
//             </Button>
//           </div>
//         </ScrollArea>

//         {/* Footer */}
//         <DrawerFooter>
//           <div className="grid grid-cols-1 gap-3">
//             {/* <Button variant="outline" onClick={onReset}>
//               Reset
//             </Button> */}
//             <Button onClick={onApply}>Apply Filters</Button>
//           </div>
//         </DrawerFooter>
//       </DrawerContent>
//     </Drawer>
//   );
// }

// ActivityFilterDrawer.tsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, RotateCcw } from 'lucide-react';
import { FloatingSelect } from '@/components/ui/FloatingSelect';

import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { FloatingDateRangePicker } from '@/components/ui/FloatingDateRangePicker';
import { SelectItem } from '@/components/ui/select';

import { PrismAPI } from '@/api/prismAPI';
import { ActivityTypeAPI } from '@/api';
import { toast } from '@/components/ui/use-toast';
import { isSuperAdmin, isManagement, isKAM, isSupervisor, getUserInfo } from '@/utility/utility';

const user = getUserInfo();
const supervisorIds = user?.supervisor_ids || [];
const isAdmin = isSuperAdmin() || isManagement();
const isSup = isSupervisor();
const isKamUser = isKAM();

/* ------------------------------------------------------------------ */
/* TYPES */
/* ------------------------------------------------------------------ */

interface ActivityFilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onApply: (filters: {
    branchId: string;
    supervisorId: string;
    kamId: string;
    clientId: string;
    activityType: number | null;
    dateRange: { from?: string; to?: string };
  }) => void;
}

export const FilterDrawer: React.FC<ActivityFilterDrawerProps> = ({ open, onClose, onApply }) => {
  /* ===================== STATE ===================== */

  const [branchId, setBranchId] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [kamId, setKamId] = useState('');
  const [clientId, setClientId] = useState('');

  // ✅ keep SINGLE number in state
  const [activityType, setActivityType] = useState<string>('');

  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const [branches, setBranches] = useState<any[]>([]);
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [kams, setKams] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [activityTypeOptions, setActivityTypeOptions] = useState<
    { value: number; label: string }[]
  >([]);

  /* ===================== API ===================== */

  // Branches
  useEffect(() => {
    if (!open) return;
    PrismAPI.getBranchList()
      .then((res) => setBranches(res.data || []))
      .catch(() => setBranches([]));
  }, [open]);

  // Supervisors
  useEffect(() => {
    if (!branchId) {
      setSupervisors([]);
      setSupervisorId('');
      return;
    }
    PrismAPI.getBranchWiseSupervisorList(Number(branchId))
      .then((res) => setSupervisors(res.data?.data || res.data || []))
      .catch(() => setSupervisors([]));
  }, [branchId]);

  // KAMs
  // useEffect(() => {
  //   if (!supervisorId) {
  //     setKams([]);
  //     setKamId('');
  //     return;
  //   }
  //   PrismAPI.getSupervisorWiseKAMList(Number(supervisorId))
  //     .then((res) => setKams(res.data?.data || res.data || []))
  //     .catch(() => setKams([]));
  // }, [supervisorId]);

  // new role wise code
  useEffect(() => {
    // ADMIN → selected supervisor
    if (isAdmin && supervisorId) {
      PrismAPI.getSupervisorWiseKAMList(Number(supervisorId))
        .then((res) => setKams(res.data?.data || res.data || []))
        .catch(() => setKams([]));
    }

    // SUPERVISOR → own supervisor_ids
    if (isSup && supervisorIds.length) {
      PrismAPI.getMultiSupervisorWiseKAMList(supervisorIds)
        .then((res) => setKams(res.data?.data || res.data || []))
        .catch(() => setKams([]));
    }
  }, [supervisorId, isAdmin, isSup]);

  // Clients
  useEffect(() => {
    if (!kamId) {
      setClients([]);
      setClientId('');
      return;
    }
    PrismAPI.getKamWiseClients(Number(kamId))
      .then((res) => setClients(res.data?.data || res.data || []))
      .catch(() => setClients([]));
  }, [kamId]);

  useEffect(() => {
    if (isKamUser && user?.default_kam_id) {
      setKamId(Number(user.default_kam_id));
    }
  }, [isKamUser]);

  // Activity Types
  useEffect(() => {
    if (!open) return;

    const fetchActivityTypes = async () => {
      try {
        const res = await ActivityTypeAPI.getActivityTypes();

        const options = (res.data || []).map((item: any) => ({
          value: String(item.id),
          label: item.activity_type_name,
        }));

        setActivityTypeOptions(options);
      } catch (error) {
        console.error('Error fetching activity types:', error);
        toast({
          title: 'Failed to load activity types',
          variant: 'destructive',
        });
      }
    };

    fetchActivityTypes();
  }, [open]);

  /* ===================== HANDLERS ===================== */

  const handleReset = () => {
    setBranchId('');
    setSupervisorId('');
    setKamId('');
    setClientId('');
    setActivityType(null);
    setDateRange({});
  };

  const handleApply = () => {
    onApply({
      branchId,
      supervisorId,
      kamId,
      clientId,
      activityType: activityType ? Number(activityType) : null,
      dateRange,
    });
    onClose();
  };

  /* ===================== FILTER CONFIG ===================== */

  // const filterConfigs = useMemo(
  //   () => [
  //     {
  //       type: 'search-select',
  //       label: 'Branch',
  //       value: branchId,
  //       setter: setBranchId,
  //       options: branches.map((b) => ({
  //         label: b.branch_name,
  //         value: String(b.id),
  //       })),
  //     },
  //     {
  //       type: 'search-select',
  //       label: 'Supervisor',
  //       value: supervisorId,
  //       setter: setSupervisorId,
  //       disabled: !branchId,
  //       options: supervisors.map((s) => ({
  //         label: s.supervisor,
  //         value: String(s.supervisor_id),
  //       })),
  //     },
  //     {
  //       type: 'search-select',
  //       label: 'KAM',
  //       value: kamId,
  //       setter: setKamId,
  //       disabled: !supervisorId,
  //       options: kams.map((k) => ({
  //         label: k.full_name,
  //         value: String(k.employee_id),
  //       })),
  //     },
  //     {
  //       type: 'search-select',
  //       label: 'Client',
  //       value: clientId,
  //       setter: setClientId,
  //       disabled: !kamId,
  //       options: clients.map((c) => ({
  //         label: c.client,
  //         value: String(c.party_id),
  //       })),
  //     },
  //     {
  //       type: 'select',
  //       label: 'Activity Type',
  //       options: activityTypeOptions,
  //     },
  //     {
  //       type: 'date-range',
  //       label: 'Date Range',
  //       value: dateRange,
  //       setter: setDateRange,
  //     },
  //   ],
  //   [
  //     branches,
  //     supervisors,
  //     kams,
  //     clients,
  //     branchId,
  //     supervisorId,
  //     kamId,
  //     clientId,
  //     activityTypeOptions,
  //     dateRange,
  //   ]
  // );

  const filterConfigs = useMemo(() => {
    const filters: any[] = [];

    // 🟢 ADMIN / MANAGEMENT
    if (isAdmin) {
      filters.push(
        {
          type: 'search-select',
          label: 'Branch',
          value: branchId,
          setter: setBranchId,
          options: branches.map((b) => ({
            label: b.branch_name,
            value: String(b.id),
          })),
        },
        {
          type: 'search-select',
          label: 'Supervisor',
          value: supervisorId,
          setter: setSupervisorId,
          disabled: !branchId,
          options: supervisors.map((s) => ({
            label: s.supervisor,
            value: String(s.supervisor_id),
          })),
        }
      );
    }

    // 🟡 ADMIN + SUPERVISOR
    if (isAdmin || isSup) {
      filters.push({
        type: 'search-select',
        label: 'KAM',
        value: kamId,
        setter: setKamId,
        options: kams.map((k) => ({
          label: k.full_name,
          value: String(k.employee_id),
        })),
      });
    }

    // 🔵 ALL ROLES
    filters.push(
      {
        type: 'search-select',
        label: 'Client',
        value: clientId,
        setter: setClientId,
        disabled: !kamId && !isKamUser,
        options: clients.map((c) => ({
          label: c.client,
          value: String(c.party_id),
        })),
      },
      {
        type: 'select',
        label: 'Activity Type',
        options: activityTypeOptions,
      },
      {
        type: 'date-range',
        label: 'Date Range',
        value: dateRange,
        setter: setDateRange,
      }
    );

    return filters;
  }, [
    isAdmin,
    isSup,
    isKamUser,
    branchId,
    supervisorId,
    kamId,
    clientId,
    branches,
    supervisors,
    kams,
    clients,
    activityTypeOptions,
    dateRange,
  ]);

  /* ===================== RENDER ===================== */

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="w-full sm:w-[420px]">
        <DrawerHeader className="flex items-center justify-between">
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-5 py-2">
            {filterConfigs.map((filter, idx) => {
              if (filter.type === 'search-select') {
                return (
                  <FloatingSearchSelect
                    key={`${filter.label}-${idx}`}
                    label={filter.label}
                    value={filter.value}
                    searchable
                    onValueChange={filter.setter}
                    disabled={filter.disabled}
                  >
                    {(filter.options || []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </FloatingSearchSelect>
                );
              }

              if (filter.type === 'select') {
                return (
                  <FloatingSelect
                    label="Activity Type"
                    value={activityType}
                    onValueChange={(value) => setActivityType(value)}
                  >
                    {activityTypeOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </FloatingSelect>
                );
              }

              if (filter.type === 'date-range') {
                return (
                  <FloatingDateRangePicker
                    key={filter.label}
                    label={filter.label}
                    value={{
                      startDate: filter.value.from,
                      endDate: filter.value.to,
                    }}
                    onChange={(v) =>
                      filter.setter({
                        from: v.startDate,
                        to: v.endDate,
                      })
                    }
                  />
                );
              }

              return null;
            })}

            <Button
              variant="ghost"
              className="w-full text-destructive flex gap-2 py-4"
              onClick={handleReset}
            >
              <RotateCcw className="h-4 w-4" /> Clear All Filters
            </Button>
          </div>
        </ScrollArea>

        <DrawerFooter>
          <Button onClick={handleApply} className="w-full">
            Apply Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
