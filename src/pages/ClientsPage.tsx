




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
import { Building2, Search, Plus } from 'lucide-react';
import ClientsFilterDrawer from '@/components/filters/ClientsFilterDrawer';
import { ClientAPI } from '@/api/clientApi';
import { initialKAMs } from '@/data/mockData';
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

interface ClientCounts {
  clients: number;
  customers: number;
  local_clients: number;
  kams: number;
  divisions: number;
  types: number;
}

export default function ClientsPage() {
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState<ClientCounts>({
    clients: 0,
    customers: 0,
    local_clients: 0,
    kams: 0,
    divisions: 0,
    types: 0,
  });

  const [filterClient, setFilterClient] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterKam, setFilterKam] = useState('all');

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    setLoading(true);

    ClientAPI.getClients(page)
      .then((res) => {
        const mappedClients = (res.data || []).map(
          (c: any, index: number) => ({
            id: `${page}-${index}`,
            name: c.full_name,
            contact: c.full_name,
            phone: c.mobile,
            division: c.division,
            type: c.type,
            businessType: 'Customer',
            assignedKamId: c.assigned_kam,
          })
        );

        setClients(mappedClients);
        if (res.counts) setCounts(res.counts);
        if (res.pagination) setLastPage(res.pagination.last_page);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filteredClients = clients.filter((client) => {
    // Ensure name and contact exist
    const clientName = client.name || '';
    const clientContact = client.contact || '';

    const matchesSearch =
      clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientContact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision =
      filterDivision === 'all' || (client.division || '') === filterDivision;

    const matchesKam =
      filterKam === 'all' || (client.assignedKamId || '') === filterKam;

    return matchesSearch && matchesDivision && matchesKam;
  });


  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(lastPage, start + 4);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="page-container space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3"><p>Prism Clients</p><p className="text-2xl font-bold">{counts.customers}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p>Local Clients</p><p className="text-2xl font-bold">{counts.local_clients}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p>Total Branch</p><p className="text-2xl font-bold">{counts.divisions}</p></CardContent></Card>
        <Card><CardContent className="p-3"><p>Total KAM</p><p className="text-2xl font-bold">{counts.kams}</p></CardContent></Card>
      </div>

      {/* SEARCH */}
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
          hasActiveFilters={false}
          onApply={() => {}}
          onClear={() => {}}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client List</CardTitle>

          {/* ✅ ADD NEW CLIENT BUTTON */}
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
                <TableHead>Branch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned KAM</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.phone || '--'}</TableCell>
                    <TableCell><Badge>{client.division}</Badge></TableCell>
                    <TableCell>{client.type}</TableCell>
                    <TableCell>{client.assignedKamId}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* PAGINATION */}
          <div className="flex justify-end gap-2 mt-4">
            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 border rounded ${p === page ? 'font-bold' : ''}`}
              >
                {p}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

