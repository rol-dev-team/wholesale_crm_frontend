'use client';

import { useState, useEffect } from 'react';
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
import { Building2, Search, MapPin } from 'lucide-react';
import ClientsFilterDrawer from '@/components/filters/ClientsFilterDrawer';
import { ClientAPI } from '@/api/clientApi';
import { divisions, initialKAMs } from '@/data/mockData';

/* ---------- CLIENT TYPE (MATCH BACKEND) ---------- */
interface Client {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  division: string;
  zone: string;
  businessType: string;
  assignedKamId: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [kams] = useState(initialKAMs);
  const [searchQuery, setSearchQuery] = useState('');

  // === FILTER STATES ===
  const [filterClient, setFilterClient] = useState('all');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterKam, setFilterKam] = useState('all');

  /* ---------- FETCH CLIENTS FROM BACKEND ---------- */
  useEffect(() => {
    ClientAPI.getClients().then((res) => {
      const mappedClients: Client[] = res.data.map((c: any, index: number) => ({
        id: String(index + 1),
        name: c.full_name,
        contact: c.full_name,
        phone: c.mobile,
        division: c.division,
        zone: c.zone,
        businessType: 'Customer',
        assignedKamId: c.assigned_kam,
      }));

      setClients(mappedClients);
    });
  }, []);

  // === FILTER LOGIC ===
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClient = filterClient === 'all' || client.id === filterClient;

    const matchesDivision = filterDivision === 'all' || client.division === filterDivision;

    const matchesKam = filterKam === 'all' || client.assignedKamId === filterKam;

    return matchesSearch && matchesClient && matchesDivision && matchesKam;
  });

  const hasActiveFilters =
    filterClient !== 'all' || filterDivision !== 'all' || filterKam !== 'all';

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

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Clients</p>
            <p className="text-2xl font-bold">{clients.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Divisions</p>
            <p className="text-2xl font-bold">{divisions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total KAM</p>
            <p className="text-2xl font-bold">{kams.length}</p>
          </CardContent>
        </Card>
      </div>

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

        <ClientsFilterDrawer
          currentClient={filterClient}
          setClient={setFilterClient}
          currentDivision={filterDivision}
          setDivision={setFilterDivision}
          currentKam={filterKam}
          setKam={setFilterKam}
          clients={clients.map((c) => ({ id: c.id, name: c.name }))}
          divisions={divisions}
          kams={kams}
          hasActiveFilters={hasActiveFilters}
          onApply={() => {}}
          onClear={clearFilters}
        />
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
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
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.businessType}</p>
                  </TableCell>
                  <TableCell>
                    <p>{client.contact}</p>
                    <p className="text-sm text-muted-foreground">{client.phone || '-'}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{client.division}</Badge>
                  </TableCell>
                  <TableCell>{client.zone}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.assignedKamId}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
