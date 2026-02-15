


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
// import { initialKAMs } from '@/data/mockData';
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

// interface ClientCounts {
//   clients: number;
//   customers: number;
//   local_clients: number;
//   organizations: number;
//   kams: number;
//   divisions: number;
//   types: number;
// }

// export default function ClientsPage() {
//   const navigate = useNavigate();

//   const [clients, setClients] = useState<Client[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [counts, setCounts] = useState<ClientCounts>({
//     clients: 0,
//     customers: 0,
//     local_clients: 0,
//     organizations: 0,
//     kams: 0,
//     divisions: 0,
//     types: 0,
//   });

//   const [filterClient, setFilterClient] = useState('all');
//   const [filterDivision, setFilterDivision] = useState('all');
//   const [filterKam, setFilterKam] = useState('all');
//   const [filterClientType, setFilterClientType] = useState('all');  // NEW

//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(1);

//   useEffect(() => {
//     setLoading(true);

//     ClientAPI.getClients(page)
//       .then((res) => {
//         const mappedClients = (res.data || []).map(
//           (c: any, index: number) => ({
//             id: `${page}-${index}`,
//             name: c.full_name,
//             contact: c.full_name,
//             phone: c.mobile,
//             division: c.division,
//             type: c.type,
//             businessType: 'Customer',
//             assignedKamId: c.assigned_kam,
//           })
//         );

//         setClients(mappedClients);
//         if (res.counts) setCounts(res.counts);
//         if (res.pagination) setLastPage(res.pagination.last_page);
//       })
//       .finally(() => setLoading(false));
//   }, [page]);

//   const filteredClients = clients.filter((client) => {
//     // Ensure name and contact exist
//     const clientName = client.name || '';
//     const clientContact = client.contact || '';

//     const matchesSearch =
//       clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       clientContact.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesDivision =
//       filterDivision === 'all' || (client.division || '') === filterDivision;

//     const matchesKam =
//       filterKam === 'all' || (client.assignedKamId || '') === filterKam;

//     // NEW: Filter by client type
//     const matchesClientType = filterClientType === 'all' 
//       ? true
//       : filterClientType === 'active' 
//         ? client.type === 'Active'
//         : filterClientType === 'inactive'
//           ? client.type === 'Inactive'
//           : filterClientType === 'organization'
//             ? client.businessType === 'Organization'
//             : true;

//     return matchesSearch && matchesDivision && matchesKam && matchesClientType;
//   });

//   // ===== PAGINATION LOGIC WITH FIRST AND LAST =====
//   const getPageNumbers = () => {
//     const pages = [];
//     const start = Math.max(1, page - 2);
//     const end = Math.min(lastPage, start + 4);
//     for (let i = start; i <= end; i++) pages.push(i);
//     return pages;
//   };

//   const pageNumbers = getPageNumbers();
//   const showFirstEllipsis = pageNumbers[0] > 1;
//   const showLastEllipsis = pageNumbers[pageNumbers.length - 1] < lastPage;

//   return (
//     <div className="page-container space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//           <Building2 className="h-5 w-5 text-primary" />
//         </div>
//         <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
//       </div>

//       {/* STATS */}
//       <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
//         <Card><CardContent className="p-3"><p>Prism Active Clients</p><p className="text-2xl font-bold">{counts.customers}</p></CardContent></Card>
//         <Card><CardContent className="p-3"><p>Prism InActive Clients</p><p className="text-2xl font-bold">{counts.local_clients}</p></CardContent></Card>
//         <Card><CardContent className="p-3"><p>Organizations</p><p className="text-2xl font-bold">{counts.organizations}</p></CardContent></Card>
//         <Card><CardContent className="p-3"><p>Total Branch</p><p className="text-2xl font-bold">{counts.divisions}</p></CardContent></Card>
//         <Card><CardContent className="p-3"><p>Total KAM</p><p className="text-2xl font-bold">{counts.kams}</p></CardContent></Card>
//       </div>

//       {/* SEARCH */}
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
//           currentClientType={filterClientType}  // NEW
//           setClientType={setFilterClientType}  // NEW
//           hasActiveFilters={false}
//           onApply={() => {}}
//           onClear={() => {
//             setSearchQuery('');
//             setFilterClient('all');
//             setFilterDivision('all');
//             setFilterKam('all');
//             setFilterClientType('all');  // NEW
//           }}
//         />
//       </div>

//       {/* TABLE */}
//       <Card>
//         <CardHeader className="flex flex-row items-center justify-between">
//           <CardTitle>Client List</CardTitle>

//           {/* ✅ ADD NEW CLIENT BUTTON */}
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
//                 <TableHead>Type</TableHead>
//                 <TableHead>Assigned KAM</TableHead>
//               </TableRow>
//             </TableHeader>

//             <TableBody>
//               {loading ? (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-6">
//                     Loading...
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 filteredClients.map((client) => (
//                   <TableRow key={client.id}>
//                     <TableCell>{client.name}</TableCell>
//                     <TableCell>{client.phone || '--'}</TableCell>
//                     <TableCell>{client.type}</TableCell>
//                     <TableCell>{client.assignedKamId}</TableCell>
//                   </TableRow>
//                 ))
//               )}
//             </TableBody>
//           </Table>

//           {/* ===== PAGINATION WITH FIRST AND LAST ===== */}
//           <div className="flex justify-end items-center gap-2 mt-4">
//             {/* FIRST PAGE BUTTON */}
//             <button
//               onClick={() => setPage(1)}
//               disabled={page === 1}
//               className={`px-3 py-1 border rounded transition-colors ${
//                 page === 1
//                   ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                   : 'hover:bg-gray-50'
//               }`}
//               title="First Page"
//             >
//               First
//             </button>

//             {/* PREVIOUS PAGE BUTTON */}
//             <button
//               onClick={() => setPage(Math.max(1, page - 1))}
//               disabled={page === 1}
//               className={`px-3 py-1 border rounded transition-colors ${
//                 page === 1
//                   ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                   : 'hover:bg-gray-50'
//               }`}
//               title="Previous Page"
//             >
//               <ChevronLeft className="h-4 w-4" />
//             </button>

//             {/* FIRST ELLIPSIS */}
//             {showFirstEllipsis && (
//               <>
//                 <button
//                   onClick={() => setPage(1)}
//                   className="px-3 py-1 border rounded hover:bg-gray-50"
//                 >
//                   1
//                 </button>
//                 <span className="px-2">...</span>
//               </>
//             )}

//             {/* PAGE NUMBERS */}
//             {pageNumbers.map((p) => (
//               <button
//                 key={p}
//                 onClick={() => setPage(p)}
//                 className={`px-3 py-1 border rounded transition-colors ${
//                   p === page
//                     ? 'bg-primary text-white font-bold'
//                     : 'hover:bg-gray-50'
//                 }`}
//               >
//                 {p}
//               </button>
//             ))}

//             {/* LAST ELLIPSIS */}
//             {showLastEllipsis && (
//               <>
//                 <span className="px-2">...</span>
//                 <button
//                   onClick={() => setPage(lastPage)}
//                   className="px-3 py-1 border rounded hover:bg-gray-50"
//                 >
//                   {lastPage}
//                 </button>
//               </>
//             )}

//             {/* NEXT PAGE BUTTON */}
//             <button
//               onClick={() => setPage(Math.min(lastPage, page + 1))}
//               disabled={page === lastPage}
//               className={`px-3 py-1 border rounded transition-colors ${
//                 page === lastPage
//                   ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                   : 'hover:bg-gray-50'
//               }`}
//               title="Next Page"
//             >
//               <ChevronRight className="h-4 w-4" />
//             </button>

//             {/* LAST PAGE BUTTON */}
//             <button
//               onClick={() => setPage(lastPage)}
//               disabled={page === lastPage}
//               className={`px-3 py-1 border rounded transition-colors ${
//                 page === lastPage
//                   ? 'opacity-50 cursor-not-allowed bg-gray-100'
//                   : 'hover:bg-gray-50'
//               }`}
//               title="Last Page"
//             >
//               Last
//             </button>
//           </div>

//           {/* PAGE INFO */}
//           <div className="text-sm text-gray-500 mt-4 text-center">
//             Page {page} of {lastPage}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }





import { useState, useEffect } from 'react';
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
import { Building2, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // All data from backend (fetched once)
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClient, setFilterClient] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterKam, setFilterKam] = useState('all');
  const [filterClientType, setFilterClientType] = useState('all');

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 100;

  // ===== FETCH ALL DATA ONCE =====
  useEffect(() => {
    setLoading(true);
    
    // Fetch all pages at once
    const fetchAllData = async () => {
      try {
        let allData: Client[] = [];
        let currentPage = 1;
        let hasMore = true;

        while (hasMore) {
          const res = await ClientAPI.getClients(currentPage);
          
          if (res.data && res.data.length > 0) {
            const mappedClients = res.data.map((c: any, index: number) => ({
              id: `${currentPage}-${index}`,
              name: c.full_name || '',
              contact: c.full_name || '',
              phone: c.mobile || '',
              division: c.division || '',
              type: c.type || '',
              businessType: c.type === 'Organization' ? 'Organization' : 'Customer',
              assignedKamId: c.assigned_kam || '',
            }));
            
            allData = [...allData, ...mappedClients];
            
            // Check if there are more pages
            if (res.pagination && currentPage < res.pagination.last_page) {
              currentPage++;
            } else {
              hasMore = false;
            }
          } else {
            hasMore = false;
          }
        }
        
        setAllClients(allData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []); // Only fetch once on mount

  // ===== FRONTEND FILTERING =====
  const filteredClients = allClients.filter((client) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchQuery.toLowerCase());

    // Division filter
    const matchesDivision =
      filterDivision === 'all' || client.division === filterDivision;

    // KAM filter
    const matchesKam =
      filterKam === 'all' || client.assignedKamId === filterKam;

    // Client Type filter
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

  // ===== DYNAMIC COUNTS FROM FILTERED DATA =====
  const dynamicCounts = {
    customers: filteredClients.filter((c) => c.type === 'Active').length,
    local_clients: filteredClients.filter((c) => c.type === 'Inactive').length,
    organizations: filteredClients.filter((c) => c.type === 'Organization').length,
    divisions: new Set(filteredClients.map((c) => c.division).filter(Boolean)).size,
    kams: new Set(filteredClients.map((c) => c.assignedKamId).filter(Boolean)).size,
  };

  // ===== CHECK IF ANY FILTER IS ACTIVE =====
  const hasActiveFilters =
    filterClient !== 'all' ||
    filterDivision !== 'all' ||
    filterKam !== 'all' ||
    filterClientType !== 'all' ||
    searchQuery !== '';

  // ===== FRONTEND PAGINATION =====
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, endIndex);

  // ===== PAGINATION LOGIC =====
  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showFirstEllipsis = pageNumbers[0] > 1;
  const showLastEllipsis = pageNumbers[pageNumbers.length - 1] < totalPages;

  // ===== RESET PAGE TO 1 WHEN FILTERS CHANGE =====
  useEffect(() => {
    setPage(1);
  }, [filterClient, filterDivision, filterKam, filterClientType, searchQuery]);

  // ===== GET UNIQUE VALUES FOR FILTERS =====
  const uniqueDivisions = Array.from(new Set(allClients.map((c) => c.division).filter(Boolean)));
  const uniqueKams = Array.from(new Set(allClients.map((c) => c.assignedKamId).filter(Boolean)));

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
      </div>

      {/* DYNAMIC STATS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Prism Active Clients</p>
            <p className="text-2xl font-bold">{dynamicCounts.customers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Prism InActive Clients</p>
            <p className="text-2xl font-bold">{dynamicCounts.local_clients}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Organizations</p>
            <p className="text-2xl font-bold">{dynamicCounts.organizations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total Branch</p>
            <p className="text-2xl font-bold">{dynamicCounts.divisions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">Total KAM</p>
            <p className="text-2xl font-bold">{dynamicCounts.kams}</p>
          </CardContent>
        </Card>
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
                ({filteredClients.length} results)
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading all clients...
                  </TableCell>
                </TableRow>
              ) : filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No clients found matching your filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
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
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          {!loading && filteredClients.length > 0 && totalPages > 1 && (
            <>
              <div className="flex justify-end items-center gap-2 mt-4">
                {/* FIRST PAGE BUTTON */}
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === 1
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                  title="First Page"
                >
                  First
                </button>

                {/* PREVIOUS PAGE BUTTON */}
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === 1
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* FIRST ELLIPSIS */}
                {showFirstEllipsis && (
                  <>
                    <button
                      onClick={() => setPage(1)}
                      className="px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      1
                    </button>
                    <span className="px-2">...</span>
                  </>
                )}

                {/* PAGE NUMBERS */}
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 border rounded transition-colors ${
                      p === page
                        ? 'bg-primary text-white font-bold'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* LAST ELLIPSIS */}
                {showLastEllipsis && (
                  <>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => setPage(totalPages)}
                      className="px-3 py-1 border rounded hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                {/* NEXT PAGE BUTTON */}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === totalPages
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* LAST PAGE BUTTON */}
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`px-3 py-1 border rounded transition-colors ${
                    page === totalPages
                      ? 'opacity-50 cursor-not-allowed bg-gray-100'
                      : 'hover:bg-gray-50'
                  }`}
                  title="Last Page"
                >
                  Last
                </button>
              </div>

              {/* PAGE INFO */}
              <div className="text-sm text-gray-500 mt-4 text-center">
                Page {page} of {totalPages} • Showing {startIndex + 1}-
                {Math.min(endIndex, filteredClients.length)} of {filteredClients.length} results
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}