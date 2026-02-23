

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { Building2, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
// import ClientsFilterDrawer from '@/components/filters/ClientsFilterDrawer';
// import { ClientAPI } from '@/api/clientApi';
// import { isSuperAdmin } from '@/utility/utility';

// interface Client {
//   id: string;
//   name: string;
//   contact: string;
//   phone?: string;
//   division: string;
//   type: string;
//   businessType: string;
//   assignedKamId: string;
// }

// export default function ClientsPage() {
//   const navigate = useNavigate();

//   // All data from backend (fetched once)
//   const [allClients, setAllClients] = useState<Client[]>([]);
//   const [loading, setLoading] = useState(false);

//   // Filter states
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterClient, setFilterClient] = useState('all');
//   const [filterDivision, setFilterDivision] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [filterClientType, setFilterClientType] = useState('all');

//   // Pagination states
//   const [page, setPage] = useState(1);
//   const itemsPerPage = 100;

//   // ===== FETCH ALL DATA ONCE =====
//   useEffect(() => {
//     setLoading(true);
    
//     // Fetch all pages at once
//     const fetchAllData = async () => {
//       try {
//         let allData: Client[] = [];
//         let currentPage = 1;
//         let hasMore = true;

//         while (hasMore) {
//           const res = await ClientAPI.getClients(currentPage);
          
//           if (res.data && res.data.length > 0) {
//             const mappedClients = res.data.map((c: any, index: number) => ({
//               id: `${currentPage}-${index}`,
//               name: c.full_name || '',
//               contact: c.full_name || '',
//               phone: c.mobile || '',
//               division: c.division || '',
//               type: c.type || '',
//               businessType: c.type === 'Organization' ? 'Organization' : 'Customer',
//               assignedKamId: c.assigned_kam || '',
//             }));
            
//             allData = [...allData, ...mappedClients];
            
//             // Check if there are more pages
//             if (res.pagination && currentPage < res.pagination.last_page) {
//               currentPage++;
//             } else {
//               hasMore = false;
//             }
//           } else {
//             hasMore = false;
//           }
//         }
        
//         setAllClients(allData);
//       } catch (error) {
//         console.error('Error fetching clients:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, []); // Only fetch once on mount

//   // ===== FRONTEND FILTERING =====
//   const filteredClients = allClients.filter((client) => {
//     // Search filter
//     const matchesSearch =
//       searchQuery === '' ||
//       client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       client.phone.toLowerCase().includes(searchQuery.toLowerCase());

//     // Division filter
//     const matchesDivision =
//       filterDivision === 'all' || client.division === filterDivision;

//     // KAM filter
//     const matchesKam =
//       filterKam === 'all' || client.assignedKamId === filterKam;

//     // Client Type filter
//     const matchesClientType =
//       filterClientType === 'all'
//         ? true
//         : filterClientType === 'active'
//         ? client.type === 'Active'
//         : filterClientType === 'inactive'
//         ? client.type === 'Inactive'
//         : filterClientType === 'organization'
//         ? client.type === 'Organization'
//         : true;

//     return matchesSearch && matchesDivision && matchesKam && matchesClientType;
//   });

//   // ===== DYNAMIC COUNTS FROM FILTERED DATA =====
//   const dynamicCounts = {
//     customers: filteredClients.filter((c) => c.type === 'Active').length,
//     local_clients: filteredClients.filter((c) => c.type === 'Inactive').length,
//     organizations: filteredClients.filter((c) => c.type === 'Organization').length,
//     divisions: new Set(filteredClients.map((c) => c.division).filter(Boolean)).size,
//     kams: new Set(filteredClients.map((c) => c.assignedKamId).filter(Boolean)).size,
//   };

//   // ===== CHECK IF ANY FILTER IS ACTIVE =====
//   const hasActiveFilters =
//     filterClient !== 'all' ||
//     filterDivision !== 'all' ||
//     filterKam !== 'all' ||
//     filterClientType !== 'all' ||
//     searchQuery !== '';

//   // ===== FRONTEND PAGINATION =====
//   const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
//   const startIndex = (page - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const paginatedClients = filteredClients.slice(startIndex, endIndex);

//   // ===== PAGINATION LOGIC =====
//   const getPageNumbers = () => {
//     const pages = [];
//     const start = Math.max(1, page - 2);
//     const end = Math.min(totalPages, start + 4);
//     for (let i = start; i <= end; i++) pages.push(i);
//     return pages;
//   };

//   const pageNumbers = getPageNumbers();
//   const showFirstEllipsis = pageNumbers[0] > 1;
//   const showLastEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

//   // ===== RESET PAGE TO 1 WHEN FILTERS CHANGE =====
//   useEffect(() => {
//     setPage(1);
//   }, [filterClient, filterDivision, filterKam, filterClientType, searchQuery]);

//   // ===== GET UNIQUE VALUES FOR FILTERS =====
//   const uniqueDivisions = Array.from(new Set(allClients.map((c) => c.division).filter(Boolean)));
//   const uniqueKams = Array.from(new Set(allClients.map((c) => c.assignedKamId).filter(Boolean)));

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//           <Building2 className="h-5 w-5 text-primary" />
//         </div>
//         <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
//       </div>

//       {/* DYNAMIC STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
//         <Card>
//           <CardContent className="p-3">
//             <p className="text-sm text-muted-foreground">Prism Active Clients</p>
//             <p className="text-2xl font-bold">{dynamicCounts.customers}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-3">
//             <p className="text-sm text-muted-foreground">Prism InActive Clients</p>
//             <p className="text-2xl font-bold">{dynamicCounts.local_clients}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-3">
//             <p className="text-sm text-muted-foreground">Organizations</p>
//             <p className="text-2xl font-bold">{dynamicCounts.organizations}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-3">
//             <p className="text-sm text-muted-foreground">Total Branch</p>
//             <p className="text-2xl font-bold">{dynamicCounts.divisions}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-3">
//             <p className="text-sm text-muted-foreground">Total KAM</p>
//             <p className="text-2xl font-bold">{dynamicCounts.kams}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* SEARCH & FILTERS */}
//       <div className="flex gap-2">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
//           <Input
//             placeholder="Search clients..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <ClientsFilterDrawer
//           currentClient={filterClient}
//           setClient={setFilterClient}
//           currentDivision={filterDivision}
//           setDivision={setFilterDivision}
//           currentKam={filterKam}
//           setKam={setFilterKam}
//           currentClientType={filterClientType}
//           setClientType={setFilterClientType}
//           hasActiveFilters={hasActiveFilters}
//           onApply={() => {}}
//           onClear={() => {
//             setSearchQuery('');
//             setFilterClient('all');
//             setFilterDivision('all');
//             setFilterKam('all');
//             setFilterClientType('all');
//           }}
//           divisions={uniqueDivisions}
//           kams={uniqueKams}
//         />
//       </div>

//       {/* TABLE */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>
//             Client List
//             {hasActiveFilters && (
//               <span className="ml-2 text-sm font-normal text-muted-foreground">
//                 ({filteredClients.length} results)
//               </span>
//             )}
//           </CardTitle>

//           {isSuperAdmin() && (
//             <Button onClick={() => navigate('/clients-create')}>
//               <Plus className="h-4 w-4 mr-2" />
//               Add New Client
//             </Button>
//           )}
//         </CardHeader>

//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Client</TableHead>
//                 <TableHead>Contact</TableHead>
//                 <TableHead>Division</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Assigned KAM</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-6">
//                     Loading all clients...
//                   </TableCell>
//                 </TableRow>
//               ) : filteredClients.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
//                     No clients found matching your filters
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 paginatedClients.map((client) => (
//                   <TableRow key={client.id}>
//                     <TableCell className="font-medium">{client.name}</TableCell>
//                     <TableCell>{client.phone || '--'}</TableCell>
//                     <TableCell>{client.division || '--'}</TableCell>
//                     <TableCell>
//                       <Badge
//                         variant={
//                           client.type === 'Active'
//                             ? 'default'
//                             : client.type === 'Inactive'
//                             ? 'secondary'
//                             : 'outline'
//                         }
//                       >
//                         {client.type}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{client.assignedKamId || '--'}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>

//           {/* PAGINATION */}
//           {!loading && filteredClients.length > 0 && totalPages > 1 && (
//             <>
//               <div className="flex justify-end items-center gap-2 mt-4">
//                 {/* FIRST PAGE BUTTON */}
//                 <button
//                   onClick={() => setPage(1)}
//                   disabled={page === 1}
//                   className={`px-3 py-1 border rounded transition-colors ${
//                     page === 1
//                       ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                   title="First Page"
//                 >
//                   First
//                 </button>

//                 {/* PREVIOUS PAGE BUTTON */}
//                 <button
//                   onClick={() => setPage(Math.max(1, page - 1))}
//                   disabled={page === 1}
//                   className={`px-3 py-1 border rounded transition-colors ${
//                     page === 1
//                       ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                   title="Previous Page"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                 </button>

//                 {/* FIRST ELLIPSIS */}
//                 {showFirstEllipsis && (
//                   <>
//                     <button
//                       onClick={() => setPage(1)}
//                       className="px-3 py-1 border rounded hover:bg-gray-50"
//                     >
//                       1
//                     </button>
//                     <span className="px-2">...</span>
//                   </>
//                 )}

//                 {/* PAGE NUMBERS */}
//                 {pageNumbers.map((p) => (
//                   <button
//                     key={p}
//                     onClick={() => setPage(p)}
//                     className={`px-3 py-1 border rounded transition-colors ${
//                       p === page
//                         ? 'bg-primary text-white font-bold'
//                         : 'hover:bg-gray-50'
//                     }`}
//                   >
//                     {p}
//                   </button>
//                 ))}

//                 {/* LAST ELLIPSIS */}
//                 {showLastEllipsis && (
//                   <>
//                     <span className="px-2">...</span>
//                     <button
//                       onClick={() => setPage(totalPages)}
//                       className="px-3 py-1 border rounded hover:bg-gray-50"
//                     >
//                       {totalPages}
//                     </button>
//                   </>
//                 )}

//                 {/* NEXT PAGE BUTTON */}
//                 <button
//                   onClick={() => setPage(Math.min(totalPages, page + 1))}
//                   disabled={page === totalPages}
//                   className={`px-3 py-1 border rounded transition-colors ${
//                     page === totalPages
//                       ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                   title="Next Page"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>

//                 {/* LAST PAGE BUTTON */}
//                 <button
//                   onClick={() => setPage(totalPages)}
//                   disabled={page === totalPages}
//                   className={`px-3 py-1 border rounded transition-colors ${
//                     page === totalPages
//                       ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                       : 'hover:bg-gray-50'
//                   }`}
//                   title="Last Page"
//                 >
//                   Last
//                 </button>
//               </div>

//               {/* PAGE INFO */}
//               <div className="text-sm text-gray-500 mt-4 text-center">
//                 Page {page} of {totalPages} • Showing {startIndex + 1}-
//                 {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} results
//               </div>
//             </>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }




import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building2, Search, Plus, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ClientsFilterDrawer from '@/components/filters/ClientsFilterDrawer';
import { ClientAPI } from '@/api/clientApi';
import { isSuperAdmin } from '@/utility/utility';

interface Client {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  division: string;
  type: string;
  businessType: string;
  assignedKamId: string;
}

export default function ClientsPage() {
  const navigate = useNavigate();

  const [allClients, setAllClients] = useState<Client[]>([]);
  
  // ✅ Two loading states: initial (no data yet) and background (streaming more pages)
  const [initialLoading, setInitialLoading] = useState(true);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [filterClientType, setFilterClientType] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // ✅ Ref to cancel fetch if component unmounts
  const abortRef = useRef(false);

  // ===== STREAMING FETCH: Show data page-by-page as it arrives =====
  useEffect(() => {
    abortRef.current = false;
    setAllClients([]);
    setInitialLoading(true);
    setBackgroundLoading(false);
    setLoadingProgress({ current: 0, total: 0 });

    const fetchStreaming = async () => {
      try {
        let currentPage = 1;
        let isFirst = true;

        while (true) {
          if (abortRef.current) break;

          const res = await ClientAPI.getClients(currentPage);

          if (abortRef.current) break;

          if (!res.data || res.data.length === 0) break;

          const mappedClients: Client[] = res.data.map((c: any, index: number) => ({
            id: `${currentPage}-${index}`,
            name: c.full_name || '',
            contact: c.full_name || '',
            phone: c.mobile || '',
            division: c.division || '',
            type: c.type || '',
            businessType: c.type === 'Organization' ? 'Organization' : 'Customer',
            assignedKamId: c.assigned_kam || '',
          }));

          // ✅ Update total pages for progress indicator
          const totalPages = res.pagination?.last_page ?? 1;
          setLoadingProgress({ current: currentPage, total: totalPages });

          // ✅ Append this page's data immediately — don't wait for all pages
          setAllClients((prev) => [...prev, ...mappedClients]);

          if (isFirst) {
            // ✅ First page arrived → hide initial spinner, show table immediately
            setInitialLoading(false);
            setBackgroundLoading(true);
            isFirst = false;
          }

          if (currentPage >= totalPages) break;

          currentPage++;
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setInitialLoading(false);
        setBackgroundLoading(false);
      }
    };

    fetchStreaming();

    return () => {
      // ✅ Cancel on unmount
      abortRef.current = true;
    };
  }, []);

  // ===== FRONTEND FILTERING =====
  const filteredClients = allClients.filter((client) => {
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.phone ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision =
      filterDivision === 'all' || client.division === filterDivision;

    const matchesKam =
      filterKam === 'all' || client.assignedKamId === filterKam;

    const matchesClientType =
      filterClientType === 'all'
        ? true
        : filterClientType === 'active'
        ? client.type === 'Active'
        : filterClientType === 'inactive'
        ? client.type === 'Inactive'
        : filterClientType === 'organization'
        ? client.type === 'Organization'
        : true;

    return matchesSearch && matchesDivision && matchesKam && matchesClientType;
  });

  // ===== DYNAMIC COUNTS =====
  const dynamicCounts = {
    customers: filteredClients.filter((c) => c.type === 'Active').length,
    local_clients: filteredClients.filter((c) => c.type === 'Inactive').length,
    organizations: filteredClients.filter((c) => c.type === 'Organization').length,
    divisions: new Set(filteredClients.map((c) => c.division).filter(Boolean)).size,
    kams: new Set(filteredClients.map((c) => c.assignedKamId).filter(Boolean)).size,
  };

  const hasActiveFilters =
    filterClient !== 'all' ||
    filterDivision !== 'all' ||
    filterKam !== 'all' ||
    filterClientType !== 'all' ||
    searchQuery !== '';

  // ===== FRONTEND PAGINATION =====
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex   = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers        = getPageNumbers();
  const showFirstEllipsis  = pageNumbers[0] > 1;
  const showLastEllipsis   = pageNumbers[pageNumbers.length - 1] < totalPages;

  useEffect(() => {
    setPage(1);
  }, [filterClient, filterDivision, filterKam, filterClientType, searchQuery]);

  const uniqueDivisions = Array.from(new Set(allClients.map((c) => c.division).filter(Boolean)));
  const uniqueKams      = Array.from(new Set(allClients.map((c) => c.assignedKamId).filter(Boolean)));

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Clients</h1>

        {/* ✅ Background loading indicator in header */}
        {backgroundLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {/* <span>
              Loading more... ({loadingProgress.current}/{loadingProgress.total} pages)
            </span> */}
            <span>
              Loading more... 
            </span>
          </div>
        )}
      </div>

      {/* DYNAMIC STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {[
          { label: 'Prism Active Clients', value: dynamicCounts.customers },
          { label: 'Prism InActive Clients', value: dynamicCounts.local_clients },
          { label: 'Organizations', value: dynamicCounts.organizations },
          { label: 'Total Branch', value: dynamicCounts.divisions },
          { label: 'Total KAM', value: dynamicCounts.kams },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <p className="text-sm text-muted-foreground">{stat.label}</p>

              {initialLoading ? (
                // ✅ Full skeleton while no data yet
                <div className="mt-1 h-8 w-16 bg-gray-200 rounded animate-pulse" />
              ) : backgroundLoading ? (
                // ✅ Show current value + animated counting indicator
                <div className="flex items-end gap-1.5">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="mb-1 flex items-center gap-0.5">
                    <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="inline-block w-1 h-1 bg-primary rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              ) : (
                // ✅ Fully loaded
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <ClientsFilterDrawer
          currentClient={filterClient}
          setClient={setFilterClient}
          currentDivision={filterDivision}
          setDivision={setFilterDivision}
          currentKam={filterKam}
          setKam={setFilterKam}
          currentClientType={filterClientType}
          setClientType={setFilterClientType}
          hasActiveFilters={hasActiveFilters}
          onApply={() => {}}
          onClear={() => {
            setSearchQuery('');
            setFilterClient('all');
            setFilterDivision('all');
            setFilterKam('all');
            setFilterClientType('all');
          }}
          divisions={uniqueDivisions}
          kams={uniqueKams}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            Client List
            {hasActiveFilters && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({filteredClients.length}{backgroundLoading ? '+' : ''} results)
              </span>
            )}
          </CardTitle>

          {isSuperAdmin() && (
            <Button onClick={() => navigate('/clients-create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Client
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {/* ✅ Progress bar while background loading */}
          {/* {backgroundLoading && loadingProgress.total > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Loading all clients...</span>
                <span>{Math.round((loadingProgress.current / loadingProgress.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )} */}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned KAM</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* ✅ Only show full spinner if no data at all yet */}
              {initialLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Loading clients...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {backgroundLoading
                      ? 'Loading clients, please wait...'
                      : 'No clients found matching your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone || '--'}</TableCell>
                      <TableCell>{client.division || '--'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            client.type === 'Active'
                              ? 'default'
                              : client.type === 'Inactive'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {client.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{client.assignedKamId || '--'}</TableCell>
                    </TableRow>
                  ))}

                  {/* ✅ Subtle loading row at bottom while more data is coming */}
                  {backgroundLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-3 text-muted-foreground text-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          <span>Loading more clients ({allClients.length} loaded so far)...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          {!initialLoading && filteredClients.length > 0 && totalPages > 1 && (
            <>
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  First
                </button>

                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {showFirstEllipsis && (
                  <>
                    <button onClick={() => setPage(1)} className="px-3 py-1 border rounded hover:bg-gray-50">1</button>
                    <span className="px-2">...</span>
                  </>
                )}

                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 border rounded transition-colors ${
                      p === page ? 'bg-primary text-white font-bold' : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {showLastEllipsis && (
                  <>
                    <span className="px-2">...</span>
                    <button onClick={() => setPage(totalPages)} className="px-3 py-1 border rounded hover:bg-gray-50">
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'
                  }`}
                >
                  Last
                </button>
              </div>

              <div className="text-sm text-gray-500 mt-4 text-center">
                Page {page} of {totalPages}{backgroundLoading ? '+' : ''} • Showing {startIndex + 1}–
                {Math.min(endIndex, filteredClients.length)} of {filteredClients.length}
                {backgroundLoading ? '+' : ''} results
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}