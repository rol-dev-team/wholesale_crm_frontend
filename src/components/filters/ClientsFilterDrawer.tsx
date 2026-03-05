

// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { X, Filter, RotateCcw } from 'lucide-react';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerHeader,
//   DrawerFooter,
//   DrawerTitle,
//   DrawerClose,
// } from '@/components/ui/drawer';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';
// import { SelectItem } from '@/components/ui/select';

// interface ClientsFilterDrawerProps {
//   currentClient: string;
//   setClient: (val: string) => void;
//   currentDivision: string;
//   setDivision: (val: string) => void;
//   currentKam: string;
//   setKam: (val: string) => void;
//   currentClientType: string;
//   setClientType: (val: string) => void;
//   onApply: () => void;
//   hasActiveFilters: boolean;
//   onClear: () => void;
  
//   // NEW: Accept filter options from parent
//   divisions?: string[];
//   kams?: string[];
// }

// export default function ClientsFilterDrawer({
//   currentClient,
//   setClient,
//   currentDivision,
//   setDivision,
//   currentKam,
//   setKam,
//   currentClientType,
//   setClientType,
//   onApply,
//   hasActiveFilters,
//   onClear,
//   divisions = [],
//   kams = [],
// }: ClientsFilterDrawerProps) {
//   const [clientLocal, setClientLocal] = useState(currentClient);
//   const [divisionLocal, setDivisionLocal] = useState(currentDivision);
//   const [kamLocal, setKamLocal] = useState(currentKam);
//   const [clientTypeLocal, setClientTypeLocal] = useState(currentClientType);
//   const [open, setOpen] = useState(false);

//   // Client type options
//   const clientTypeOptions = [
//     { id: 'active', label: 'Prism Active Clients' },
//     { id: 'inactive', label: 'Prism InActive Clients' },
//     { id: 'organization', label: 'Organizations' },
//   ];

//   // Sync local state with parent props
//   useEffect(() => setClientLocal(currentClient), [currentClient]);
//   useEffect(() => setDivisionLocal(currentDivision), [currentDivision]);
//   useEffect(() => setKamLocal(currentKam), [currentKam]);
//   useEffect(() => setClientTypeLocal(currentClientType), [currentClientType]);

//   // Apply filters
//   const handleApply = () => {
//     setClient(clientLocal);
//     setDivision(divisionLocal);
//     setKam(kamLocal);
//     setClientType(clientTypeLocal);
//     onApply();
//     setOpen(false);
//   };

//   // Clear filters (local + parent)
//   const handleClear = () => {
//     setClientLocal('all');
//     setDivisionLocal('all');
//     setKamLocal('all');
//     setClientTypeLocal('all');

//     setClient('all');
//     setDivision('all');
//     setKam('all');
//     setClientType('all');

//     onClear();
//   };

//   // Show placeholder by default
//   const getDisplayValue = (val: string) => (val === 'all' ? '' : val);

//   // Compute local active filters for showing Clear button
//   const hasLocalFilters =
//     clientLocal !== 'all' ||
//     divisionLocal !== 'all' ||
//     kamLocal !== 'all' ||
//     clientTypeLocal !== 'all';

//   return (
//     <>
//       {/* Filter Button */}
//       <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
//         <Filter className="h-4 w-4" />
//         <span className="hidden sm:inline">Filter</span>
//         {hasActiveFilters && (
//           <Badge
//             variant="secondary"
//             className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
//           >
//             !
//           </Badge>
//         )}
//       </Button>

//       {/* Drawer */}
//       <Drawer open={open} onOpenChange={setOpen}>
//         <DrawerContent className="max-w-sm">
//           <DrawerHeader>
//             <div className="flex justify-between items-center">
//               <DrawerTitle>Filters</DrawerTitle>
//               <DrawerClose asChild>
//                 <Button variant="ghost" size="sm">
//                   <X className="h-4 w-4" />
//                 </Button>
//               </DrawerClose>
//             </div>
//           </DrawerHeader>

//           <div className="p-4 space-y-4">
//             {/* CLIENT TYPE FILTER */}
//             <FloatingSelect
//               label="Client Type"
//               value={getDisplayValue(clientTypeLocal)}
//               onValueChange={setClientTypeLocal}
//             >
//               <SelectItem value="all">All Types</SelectItem>
//               {clientTypeOptions.map((type) => (
//                 <SelectItem key={type.id} value={type.id}>
//                   {type.label}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>

//             {/* DIVISION FILTER */}
//             <FloatingSelect
//               label="Division"
//               value={getDisplayValue(divisionLocal)}
//               onValueChange={setDivisionLocal}
//             >
//               <SelectItem value="all">All Divisions</SelectItem>
//               {divisions.map((division) => (
//                 <SelectItem key={division} value={division}>
//                   {division}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>

//             {/* KAM FILTER */}
//             <FloatingSelect
//               label="KAM"
//               value={getDisplayValue(kamLocal)}
//               onValueChange={setKamLocal}
//             >
//               <SelectItem value="all">All KAMs</SelectItem>
//               {kams.map((kam) => (
//                 <SelectItem key={kam} value={kam}>
//                   {kam}
//                 </SelectItem>
//               ))}
//             </FloatingSelect>

//             {/* Clear Filters */}
//             {hasLocalFilters && (
//               <Button
//                 variant="ghost"
//                 className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
//                 onClick={handleClear}
//               >
//                 <RotateCcw className="h-4 w-4" /> Clear All Filters
//               </Button>
//             )}
//           </div>

//           <DrawerFooter>
//             <Button className="w-full" onClick={handleApply}>
//               Apply
//             </Button>
//           </DrawerFooter>
//         </DrawerContent>
//       </Drawer>
//     </>
//   );
// }



'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { FloatingSelect } from '@/components/ui/FloatingSelect';
import { SelectItem } from '@/components/ui/select';
import { CATEGORY_OPTIONS } from '@/pages/ClientsPage'; // re-use the single source of truth

interface ClientsFilterDrawerProps {
  currentClient: string;
  setClient: (val: string) => void;
  currentDivision: string;
  setDivision: (val: string) => void;
  currentKam: string;
  setKam: (val: string) => void;
  currentClientType: string;
  setClientType: (val: string) => void;
  currentCategory: string;           // NEW
  setCategory: (val: string) => void; // NEW
  onApply: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
  divisions?: string[];
  kams?: string[];
}

export default function ClientsFilterDrawer({
  currentClient,
  setClient,
  currentDivision,
  setDivision,
  currentKam,
  setKam,
  currentClientType,
  setClientType,
  currentCategory,    // NEW
  setCategory,        // NEW
  onApply,
  hasActiveFilters,
  onClear,
  divisions = [],
  kams = [],
}: ClientsFilterDrawerProps) {
  const [clientLocal,     setClientLocal]     = useState(currentClient);
  const [divisionLocal,   setDivisionLocal]   = useState(currentDivision);
  const [kamLocal,        setKamLocal]        = useState(currentKam);
  const [clientTypeLocal, setClientTypeLocal] = useState(currentClientType);
  const [categoryLocal,   setCategoryLocal]   = useState(currentCategory); // NEW
  const [open, setOpen] = useState(false);

  const clientTypeOptions = [
    { id: 'active',       label: 'Prism Active Clients' },
    { id: 'inactive',     label: 'Prism InActive Clients' },
    { id: 'organization', label: 'Organizations' },
  ];

  // Sync local state with parent props
  useEffect(() => setClientLocal(currentClient),         [currentClient]);
  useEffect(() => setDivisionLocal(currentDivision),     [currentDivision]);
  useEffect(() => setKamLocal(currentKam),               [currentKam]);
  useEffect(() => setClientTypeLocal(currentClientType), [currentClientType]);
  useEffect(() => setCategoryLocal(currentCategory),     [currentCategory]); // NEW

  const handleApply = () => {
    setClient(clientLocal);
    setDivision(divisionLocal);
    setKam(kamLocal);
    setClientType(clientTypeLocal);
    setCategory(categoryLocal);  // NEW
    onApply();
    setOpen(false);
  };

  const handleClear = () => {
    setClientLocal('all');
    setDivisionLocal('all');
    setKamLocal('all');
    setClientTypeLocal('all');
    setCategoryLocal('all');   // NEW

    setClient('all');
    setDivision('all');
    setKam('all');
    setClientType('all');
    setCategory('all');        // NEW

    onClear();
  };

  const getDisplayValue = (val: string) => (val === 'all' ? '' : val);

  const hasLocalFilters =
    clientLocal     !== 'all' ||
    divisionLocal   !== 'all' ||
    kamLocal        !== 'all' ||
    clientTypeLocal !== 'all' ||
    categoryLocal   !== 'all'; // NEW

  return (
    <>
      {/* Filter Button */}
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filter</span>
        {hasActiveFilters && (
          <Badge
            variant="secondary"
            className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            !
          </Badge>
        )}
      </Button>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-sm">
          <DrawerHeader>
            <div className="flex justify-between items-center">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="p-4 space-y-4">

            {/* CLIENT TYPE FILTER */}
            <FloatingSelect
              label="Client Type"
              value={getDisplayValue(clientTypeLocal)}
              onValueChange={setClientTypeLocal}
            >
              <SelectItem value="all">All Types</SelectItem>
              {clientTypeOptions.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.label}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* CATEGORY FILTER — NEW */}
            <FloatingSelect
              label="Category"
              value={getDisplayValue(categoryLocal)}
              onValueChange={setCategoryLocal}
            >
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* DIVISION FILTER */}
            <FloatingSelect
              label="Division"
              value={getDisplayValue(divisionLocal)}
              onValueChange={setDivisionLocal}
            >
              <SelectItem value="all">All Divisions</SelectItem>
              {divisions.map((division) => (
                <SelectItem key={division} value={division}>
                  {division}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* KAM FILTER */}
            <FloatingSelect
              label="KAM"
              value={getDisplayValue(kamLocal)}
              onValueChange={setKamLocal}
            >
              <SelectItem value="all">All KAMs</SelectItem>
              {kams.map((kam) => (
                <SelectItem key={kam} value={kam}>
                  {kam}
                </SelectItem>
              ))}
            </FloatingSelect>

            {/* Clear Filters */}
            {hasLocalFilters && (
              <Button
                variant="ghost"
                className="w-full text-destructive hover:text-destructive flex gap-2 py-4"
                onClick={handleClear}
              >
                <RotateCcw className="h-4 w-4" /> Clear All Filters
              </Button>
            )}
          </div>

          <DrawerFooter>
            <Button className="w-full" onClick={handleApply}>
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}