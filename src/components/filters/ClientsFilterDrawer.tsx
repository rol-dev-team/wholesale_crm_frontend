


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
// import { ClientAPI } from '@/api/clientApi';

// interface Kam {
//   id: string;
//   name: string;
// }

// interface ClientOption {
//   id: string;
//   name: string;
// }

// interface ClientsFilterDrawerProps {
//   currentClient: string;
//   setClient: (val: string) => void;
//   currentDivision: string;
//   setDivision: (val: string) => void;
//   currentKam: string;
//   setKam: (val: string) => void;
//   onApply: () => void;
//   hasActiveFilters: boolean;
//   onClear: () => void;
// }

// export default function ClientsFilterDrawer({
//   currentClient,
//   setClient,
//   currentDivision,
//   setDivision,
//   currentKam,
//   setKam,
//   onApply,
//   hasActiveFilters,
//   onClear,
// }: ClientsFilterDrawerProps) {
//   const [clientLocal, setClientLocal] = useState(currentClient);
//   const [divisionLocal, setDivisionLocal] = useState(currentDivision);
//   const [kamLocal, setKamLocal] = useState(currentKam);
//   const [open, setOpen] = useState(false);

//   // Dynamic data states
//   const [clients, setClients] = useState<ClientOption[]>([]);
//   const [divisions, setDivisions] = useState<string[]>([]);
//   const [kams, setKams] = useState<Kam[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Sync local state with parent props
//   useEffect(() => setClientLocal(currentClient), [currentClient]);
//   useEffect(() => setDivisionLocal(currentDivision), [currentDivision]);
//   useEffect(() => setKamLocal(currentKam), [currentKam]);

//   // Fetch filter data when drawer opens
//   useEffect(() => {
//     if (open && clients.length === 0) {
//       loadFilterData();
//     }
//   }, [open]);

//   // Load dynamic filter data from backend
//   const loadFilterData = async () => {
//     setLoading(true);
//     try {
//       const response = await ClientAPI.getClients();
      
//       if (response.data) {
//         // Extract unique clients
//         const uniqueClients = response.data.map((c: any, index: number) => ({
//           id: String(index + 1),
//           name: c.full_name,
//         }));
//         setClients(uniqueClients);

//         // Extract unique divisions
//         const uniqueDivisions = [
//           ...new Set(response.data.map((c: any) => c.division).filter(Boolean)),
//         ] as string[];
//         setDivisions(uniqueDivisions);

//         // Extract unique KAMs
//         const kamMap = new Map();
//         response.data.forEach((c: any) => {
//           if (c.assigned_kam && !kamMap.has(c.assigned_kam)) {
//             kamMap.set(c.assigned_kam, {
//               id: c.assigned_kam,
//               name: c.assigned_kam,
//             });
//           }
//         });
//         setKams(Array.from(kamMap.values()));
//       }
//     } catch (error) {
//       console.error('Error loading filter data:', error);
//     }
//     setLoading(false);
//   };

//   // Apply filters
//   const handleApply = () => {
//     setClient(clientLocal);
//     setDivision(divisionLocal);
//     setKam(kamLocal);
//     onApply();
//     setOpen(false);
//   };

//   // Clear filters (local + parent)
//   const handleClear = () => {
//     setClientLocal('all');
//     setDivisionLocal('all');
//     setKamLocal('all');

//     setClient('all');
//     setDivision('all');
//     setKam('all');

//     onClear();
//   };

//   // ✅ Show placeholder by default
//   const getDisplayValue = (val: string) => (val === 'all' ? '' : val);

//   // Compute local active filters for showing Clear button
//   const hasLocalFilters = clientLocal !== 'all' || divisionLocal !== 'all' || kamLocal !== 'all';

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
//             {/* CLIENT FILTER */}
//             <FloatingSelect
//               label="All Client"
//               value={getDisplayValue(clientLocal)}
//               onValueChange={setClientLocal}
//             >
//               <SelectItem value="all">All Clients</SelectItem>
//               {loading ? (
//                 <SelectItem value="loading" disabled>
//                   Loading Clients...
//                 </SelectItem>
//               ) : (
//                 clients.map((client) => (
//                   <SelectItem key={client.id} value={client.id}>
//                     {client.name}
//                   </SelectItem>
//                 ))
//               )}
//             </FloatingSelect>

//             {/* DIVISION FILTER */}
//             <FloatingSelect
//               label="All Division"
//               value={getDisplayValue(divisionLocal)}
//               onValueChange={setDivisionLocal}
//             >
//               <SelectItem value="all">All Divisions</SelectItem>
//               {loading ? (
//                 <SelectItem value="loading" disabled>
//                   Loading Divisions...
//                 </SelectItem>
//               ) : (
//                 divisions.map((division) => (
//                   <SelectItem key={division} value={division}>
//                     {division}
//                   </SelectItem>
//                 ))
//               )}
//             </FloatingSelect>

//             {/* KAM FILTER */}
//             <FloatingSelect
//               label="All KAM"
//               value={getDisplayValue(kamLocal)}
//               onValueChange={setKamLocal}
//             >
//               <SelectItem value="all">All KAMs</SelectItem>
//               {loading ? (
//                 <SelectItem value="loading" disabled>
//                   Loading KAMs...
//                 </SelectItem>
//               ) : (
//                 kams.map((kam) => (
//                   <SelectItem key={kam.id} value={kam.id}>
//                     {kam.name}
//                   </SelectItem>
//                 ))
//               )}
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
import { ClientAPI } from '@/api/clientApi';

interface Kam {
  id: string;
  name: string;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ClientsFilterDrawerProps {
  currentClient: string;
  setClient: (val: string) => void;
  currentDivision: string;
  setDivision: (val: string) => void;
  currentKam: string;
  setKam: (val: string) => void;
  currentClientType: string;  // NEW
  setClientType: (val: string) => void;  // NEW
  onApply: () => void;
  hasActiveFilters: boolean;
  onClear: () => void;
}

export default function ClientsFilterDrawer({
  currentClient,
  setClient,
  currentDivision,
  setDivision,
  currentKam,
  setKam,
  currentClientType,  // NEW
  setClientType,  // NEW
  onApply,
  hasActiveFilters,
  onClear,
}: ClientsFilterDrawerProps) {
  const [clientLocal, setClientLocal] = useState(currentClient);
  const [divisionLocal, setDivisionLocal] = useState(currentDivision);
  const [kamLocal, setKamLocal] = useState(currentKam);
  const [clientTypeLocal, setClientTypeLocal] = useState(currentClientType);  // NEW
  const [open, setOpen] = useState(false);

  // Dynamic data states
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [divisions, setDivisions] = useState<string[]>([]);
  const [kams, setKams] = useState<Kam[]>([]);
  const [loading, setLoading] = useState(false);

  // Client type options (hardcoded as per requirements)
  const clientTypeOptions = [
    { id: 'active', label: 'Prism Active Clients' },
    { id: 'inactive', label: 'Prism InActive Clients' },
    { id: 'organization', label: 'Organizations' },
  ];

  // Sync local state with parent props
  useEffect(() => setClientLocal(currentClient), [currentClient]);
  useEffect(() => setDivisionLocal(currentDivision), [currentDivision]);
  useEffect(() => setKamLocal(currentKam), [currentKam]);
  useEffect(() => setClientTypeLocal(currentClientType), [currentClientType]);  // NEW

  // Fetch filter data when drawer opens
  useEffect(() => {
    if (open && clients.length === 0) {
      loadFilterData();
    }
  }, [open]);

  // Load dynamic filter data from backend
  const loadFilterData = async () => {
    setLoading(true);
    try {
      const response = await ClientAPI.getClients();
      
      if (response.data) {
        // Extract unique clients
        const uniqueClients = response.data.map((c: any, index: number) => ({
          id: String(index + 1),
          name: c.full_name,
        }));
        setClients(uniqueClients);

        // Extract unique divisions
        const uniqueDivisions = [
          ...new Set(response.data.map((c: any) => c.division).filter(Boolean)),
        ] as string[];
        setDivisions(uniqueDivisions);

        // Extract unique KAMs
        const kamMap = new Map();
        response.data.forEach((c: any) => {
          if (c.assigned_kam && !kamMap.has(c.assigned_kam)) {
            kamMap.set(c.assigned_kam, {
              id: c.assigned_kam,
              name: c.assigned_kam,
            });
          }
        });
        setKams(Array.from(kamMap.values()));
      }
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
    setLoading(false);
  };

  // Apply filters
  const handleApply = () => {
    setClient(clientLocal);
    setDivision(divisionLocal);
    setKam(kamLocal);
    setClientType(clientTypeLocal);  // NEW
    onApply();
    setOpen(false);
  };

  // Clear filters (local + parent)
  const handleClear = () => {
    setClientLocal('all');
    setDivisionLocal('all');
    setKamLocal('all');
    setClientTypeLocal('all');  // NEW

    setClient('all');
    setDivision('all');
    setKam('all');
    setClientType('all');  // NEW

    onClear();
  };

  // ✅ Show placeholder by default
  const getDisplayValue = (val: string) => (val === 'all' ? '' : val);

  // Compute local active filters for showing Clear button
  const hasLocalFilters = 
    clientLocal !== 'all' || 
    divisionLocal !== 'all' || 
    kamLocal !== 'all' ||
    clientTypeLocal !== 'all';  // NEW

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
            {/* CLIENT TYPE FILTER (NEW) */}
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

            {/* CLIENT FILTER */}
            <FloatingSelect
              label="All Client"
              value={getDisplayValue(clientLocal)}
              onValueChange={setClientLocal}
            >
              <SelectItem value="all">All Clients</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading Clients...
                </SelectItem>
              ) : (
                clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              )}
            </FloatingSelect>

            {/* DIVISION FILTER */}
            <FloatingSelect
              label="All Division"
              value={getDisplayValue(divisionLocal)}
              onValueChange={setDivisionLocal}
            >
              <SelectItem value="all">All Divisions</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading Divisions...
                </SelectItem>
              ) : (
                divisions.map((division) => (
                  <SelectItem key={division} value={division}>
                    {division}
                  </SelectItem>
                ))
              )}
            </FloatingSelect>

            {/* KAM FILTER */}
            <FloatingSelect
              label="All KAM"
              value={getDisplayValue(kamLocal)}
              onValueChange={setKamLocal}
            >
              <SelectItem value="all">All KAMs</SelectItem>
              {loading ? (
                <SelectItem value="loading" disabled>
                  Loading KAMs...
                </SelectItem>
              ) : (
                kams.map((kam) => (
                  <SelectItem key={kam.id} value={kam.id}>
                    {kam.name}
                  </SelectItem>
                ))
              )}
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