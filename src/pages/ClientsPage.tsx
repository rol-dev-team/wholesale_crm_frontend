import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Check,
  ChevronDown,
  MapPin,
  Filter,
  X,
} from 'lucide-react';
import {
  initialClients,
  initialKAMs,
  formatDate,
  businessEntities,
  divisions,
  zones,
  businessTypes,
  type Client,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { MapLocationPicker } from '@/components/maps/MapLocationPicker';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { FloatingLabelSelect, FloatingSelectItem } from '@/components/ui/floating-label-select';

export default function ClientsPage() {
  const { hasPermission, currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [kams] = useState(initialKAMs);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [filterDivision, setFilterDivision] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    businessEntities: [] as string[],
    businessType: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    division: '',
    zone: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [entityPopoverOpen, setEntityPopoverOpen] = useState(false);

  // Get user's KAM ID if they are a KAM
  const userKamId = currentUser?.role === 'kam' 
    ? initialKAMs.find(k => k.userId === currentUser.id)?.id 
    : null;

  // Filter clients based on search, entity, and division
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.businessType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = filterEntity === 'all' || client.businessEntities?.includes(filterEntity);
    const matchesDivision = filterDivision === 'all' || client.division === filterDivision;
    return matchesSearch && matchesEntity && matchesDivision;
  });

  // Stats calculations based on role
  const myClients = userKamId 
    ? clients.filter(c => c.assignedKamId === userKamId)
    : clients;
  const clientsCreatedByMe = userKamId
    ? clients.filter(c => c.createdBy === userKamId)
    : clients.filter(c => c.createdBy === currentUser?.id);
  const myDivisions = userKamId
    ? new Set(myClients.map(c => c.division)).size
    : new Set(clients.map(c => c.division)).size;
  const myZones = userKamId
    ? new Set(myClients.map(c => c.zone).filter(Boolean)).size
    : new Set(clients.map(c => c.zone).filter(Boolean)).size;

  const hasActiveFilters = filterEntity !== 'all' || filterDivision !== 'all';

  const clearFilters = () => {
    setFilterEntity('all');
    setFilterDivision('all');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      businessEntities: [],
      businessType: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      division: '',
      zone: '',
      latitude: undefined,
      longitude: undefined,
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setFormData({
      name: client.name,
      businessEntities: client.businessEntities || [],
      businessType: client.businessType,
      contact: client.contact,
      phone: client.phone,
      email: client.email,
      address: client.address,
      division: client.division,
      zone: client.zone,
      latitude: client.latitude,
      longitude: client.longitude,
    });
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.contact || !formData.email) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    if (editingClient) {
      setClients(prev =>
        prev.map(c =>
          c.id === editingClient.id
            ? { ...c, ...formData, updatedAt: new Date().toISOString() }
            : c
        )
      );
      toast({ title: 'Client Updated', description: `${formData.name} has been updated.` });
    } else {
      const newClient: Client = {
        id: `client-${Date.now()}`,
        name: formData.name,
        businessEntities: formData.businessEntities,
        businessType: formData.businessType,
        contact: formData.contact,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        division: formData.division,
        zone: formData.zone,
        latitude: formData.latitude,
        longitude: formData.longitude,
        assignedKamId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setClients(prev => [...prev, newClient]);
      toast({ title: 'Client Created', description: `${formData.name} has been added.` });
    }

    setIsModalOpen(false);
    resetForm();
    setEditingClient(null);
  };

  const handleDelete = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    setClients(prev => prev.filter(c => c.id !== clientId));
    toast({ title: 'Client Deleted', description: `${client?.name} has been removed.` });
  };

  return (
    <div className="page-container space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Clients</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Manage your client database</p>
          </div>
        </div>
        <Button onClick={openCreateModal} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          <span className="sm:inline">Add Client</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <p className="text-xl md:text-2xl font-bold">{myClients.length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <p className="text-xl md:text-2xl font-bold">{clientsCreatedByMe.length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Clients Created(Self)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <p className="text-xl md:text-2xl font-bold">{myDivisions}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Divisions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <p className="text-xl md:text-2xl font-bold">{myZones}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Zones</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
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
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 bg-popover" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs">
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Business Entity</Label>
                <Select value={filterEntity} onValueChange={setFilterEntity}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {businessEntities.map((entity) => (
                      <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Division</Label>
                <Select value={filterDivision} onValueChange={setFilterDivision}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Divisions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Divisions</SelectItem>
                    {divisions.map((division) => (
                      <SelectItem key={division} value={division}>{division}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Client List - Mobile Cards / Desktop Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile View - Cards */}
          <div className="md:hidden space-y-3">
            {filteredClients.map(client => {
              const kam = kams.find(k => k.id === client.assignedKamId);
              return (
                <div key={client.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.businessType}</p>
                    </div>
                    <Badge variant="secondary">{client.division}</Badge>
                  </div>
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-3 w-3" />
                      <span>{client.contact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      <span>{client.phone || '-'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    {kam && (
                      <Badge variant="outline" className="text-xs">
                        KAM: {kam.name}
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => { setViewingClient(client); setIsDetailModalOpen(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(client)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Division</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Assigned KAM</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => {
                  const kam = kams.find(k => k.id === client.assignedKamId);
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.businessType}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{client.contact}</p>
                          <p className="text-sm text-muted-foreground">{client.phone || '-'}</p>
                        </div>
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
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => { setViewingClient(client); setIsDetailModalOpen(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(client)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(client.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Edit Client' : 'Create Client'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Client Name */}
            <FloatingLabelInput
              label="Client Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            {/* Business Entity - Multi-select */}
            <div className="space-y-2">
              <Label className="text-xs text-primary font-medium">Business Entity</Label>
              <Popover open={entityPopoverOpen} onOpenChange={setEntityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between h-12">
                    {formData.businessEntities.length > 0
                      ? `${formData.businessEntities.length} selected`
                      : 'Select business entities'}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-[300px] p-2 bg-popover" align="start">
                  <div className="space-y-2">
                    {businessEntities.map((entity) => (
                      <div
                        key={entity}
                        className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                        onClick={() => {
                          const isSelected = formData.businessEntities.includes(entity);
                          setFormData({
                            ...formData,
                            businessEntities: isSelected
                              ? formData.businessEntities.filter((e) => e !== entity)
                              : [...formData.businessEntities, entity],
                          });
                        }}
                      >
                        <Checkbox
                          checked={formData.businessEntities.includes(entity)}
                          onCheckedChange={() => {}}
                        />
                        <span className="text-sm">{entity}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <Button
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => setEntityPopoverOpen(false)}
                      >
                        <Check className="h-4 w-4" />
                        Confirm Selection
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {formData.businessEntities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.businessEntities.map((entity) => (
                    <Badge key={entity} variant="secondary" className="text-xs">
                      {entity}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Business Type */}
            <FloatingLabelSelect
              label="Business Type"
              value={formData.businessType}
              onValueChange={(value) => setFormData({ ...formData, businessType: value })}
            >
              {businessTypes.map(type => (
                <FloatingSelectItem key={type} value={type}>{type}</FloatingSelectItem>
              ))}
            </FloatingLabelSelect>

            {/* Contact Person, Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FloatingLabelInput
                label="Contact Person *"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              />
              <FloatingLabelInput
                label="Contact Number"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <FloatingLabelInput
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            {/* Address */}
            <FloatingLabelInput
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            {/* Map Location */}
            <div className="space-y-2">
              <Label className="text-xs text-primary font-medium">Map Location</Label>
              <MapLocationPicker
                value={formData.latitude && formData.longitude ? {
                  lat: formData.latitude,
                  lng: formData.longitude,
                } : undefined}
                onChange={(location) => setFormData({
                  ...formData,
                  latitude: location.lat,
                  longitude: location.lng,
                  address: location.address || formData.address,
                })}
              />
            </div>

            {/* Division & Zone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FloatingLabelSelect
                label="Division"
                value={formData.division}
                onValueChange={(value) => setFormData({ ...formData, division: value })}
              >
                {divisions.map(div => (
                  <FloatingSelectItem key={div} value={div}>{div}</FloatingSelectItem>
                ))}
              </FloatingLabelSelect>
              <FloatingLabelSelect
                label="Zone"
                value={formData.zone}
                onValueChange={(value) => setFormData({ ...formData, zone: value })}
              >
                {zones.map(zone => (
                  <FloatingSelectItem key={zone} value={zone}>{zone}</FloatingSelectItem>
                ))}
              </FloatingLabelSelect>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto">
              {editingClient ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium">{viewingClient.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Entities</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingClient.businessEntities?.length > 0 
                      ? viewingClient.businessEntities.map(entity => (
                          <Badge key={entity} variant="secondary" className="text-xs">{entity}</Badge>
                        ))
                      : <span className="text-muted-foreground">-</span>
                    }
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Business Type</p>
                  <p className="font-medium">{viewingClient.businessType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                  <p className="font-medium">{viewingClient.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p className="font-medium">{viewingClient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingClient.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Division</p>
                  <Badge variant="secondary">{viewingClient.division}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Zone</p>
                  <p className="font-medium">{viewingClient.zone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assigned KAM</p>
                  <p className="font-medium">
                    {kams.find(k => k.id === viewingClient.assignedKamId)?.name || '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {viewingClient.products?.length ? viewingClient.products.map((product) => (
                    <Badge key={product} variant="outline" className="text-xs">{product}</Badge>
                  )) : <span className="text-muted-foreground">-</span>}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <p>{viewingClient.address || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDate(viewingClient.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Updated</p>
                  <p>{formatDate(viewingClient.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
