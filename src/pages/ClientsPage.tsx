import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  Search,
  MapPin,
} from 'lucide-react';
import {
  initialClients,
  initialKAMs,
  divisions,
  type Client,
} from '@/data/mockData';
import ClientsFilterDrawer from '@/components/filters/ClientsFilterDrawer';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [kams] = useState(initialKAMs);
  const [searchQuery, setSearchQuery] = useState('');

  // === FILTER STATES ===
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [filterKam, setFilterKam] = useState<string>('all');

  // === FILTER LOGIC ===
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.businessType.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient =
      filterClient === 'all' || client.id === filterClient;

    const matchesDivision =
      filterDivision === 'all' || client.division === filterDivision;

    const matchesKam =
      filterKam === 'all' || client.assignedKamId === filterKam;

    return matchesSearch && matchesClient && matchesDivision && matchesKam;
  });

  const hasActiveFilters =
    filterClient !== 'all' ||
    filterDivision !== 'all' ||
    filterKam !== 'all';

  const clearFilters = () => {
    setFilterClient('all');
    setFilterDivision('all');
    setFilterKam('all');
  };

  return (
    <div className="page-container space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
        </div>
      </div>

      {/* ===== IMPROVED TWO CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Number of Clients */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              {/* Icon Container with Gradient Background */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold">{clients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Division Count Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              {/* Icon Container with Gradient Background */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5">
                <MapPin className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Divisions</p>
                <p className="text-2xl font-bold">{divisions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KAM Count Card */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 pb-3 flex items-center gap-3">
              {/* Icon Container with Gradient Background */}
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5">
                <MapPin className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total KAM</p>
                <p className="text-2xl font-bold">{kams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* ===== END CARDS ===== */}

      {/* SEARCH + FILTER */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* FILTER DRAWER */}
        <ClientsFilterDrawer
          currentClient={filterClient}
          setClient={setFilterClient}
          currentDivision={filterDivision}
          setDivision={setFilterDivision}
          currentKam={filterKam}
          setKam={setFilterKam}
          clients={clients}
          divisions={divisions}
          kams={initialKAMs}
          hasActiveFilters={hasActiveFilters}
          onApply={() => {}}
          onClear={clearFilters}
        />
      </div>

      {/* CLIENT LIST TABLE */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Assigned KAM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => {
                  const kam = kams.find(k => k.id === client.assignedKamId);

                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.businessType}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p>{client.contact}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.phone || '-'}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{client.division}</Badge>
                      </TableCell>
                      <TableCell>{client.zone}</TableCell>
                      <TableCell>
                        {kam ? (
                          <Badge variant="outline">{kam.name}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
