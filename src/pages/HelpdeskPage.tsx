import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Headphones,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  X,
  Filter,
  CalendarIcon,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  initialLeads,
  initialClients,
  initialKAMs,
  leadSources,
  businessEntities,
  businessTypes,
  products,
  divisions,
  divisionZones,
  formatCurrency,
  formatDate,
  type Lead,
  type LeadSource,
  type LeadStatus,
  type Client,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LeadStatusBadge } from '@/components/leads/LeadStatusBadge';
import { ClientCreationModal } from '@/components/clients/ClientCreationModal';
import { FloatingLabelInput, FloatingLabelTextarea } from '@/components/ui/floating-label-input';
import { FloatingLabelSelect, FloatingSelectItem } from '@/components/ui/floating-label-select';
import { SelectItem } from '@/components/ui/select';

// Back office users mapped to business entities (1 back office per entity)
const entityBackOfficeMap: Record<string, { id: string; name: string }> = {
  'Earth Telecommunication Ltd.': { id: 'bo-1', name: 'Sarah Admin' },
  'Race Online Ltd.': { id: 'bo-2', name: 'John Manager' },
  'Orbit Internet': { id: 'bo-3', name: 'Emily Support' },
  'Dhaka COLO': { id: 'bo-4', name: 'Michael Wong' },
  'Creative Bangladesh': { id: 'bo-5', name: 'Lisa Chen' },
};



export default function HelpdeskPage() {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [showForm, setShowForm] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [tempSelectedProducts, setTempSelectedProducts] = useState<string[]>([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  
  // Filter states
  const [filterEntity, setFilterEntity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<LeadStatus | null>(null);
  const [filterSource, setFilterSource] = useState<LeadSource | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    businessEntity: '',
    businessType: '',
    source: '' as LeadSource | '',
    clientNumber: '',
    email: '',
    address: '',
    division: '',
    zone: '',
    notes: '',
    assignedBackOffice: '',
    assignedBackOfficeName: '',
  });

  // Check if a client is selected (fields should be read-only)
  const isClientSelected = !!formData.clientId;

  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    // Auto-select the newly created client
    setFormData(prev => ({
      ...prev,
      clientId: newClient.id,
      clientName: newClient.name,
      clientNumber: newClient.phone || '',
      email: newClient.email || '',
      address: newClient.address || '',
      division: newClient.division || '',
      zone: newClient.zone || '',
    }));
  };

  // Filter leads created by helpdesk
  const myLeads = leads.filter(l => l.createdBy === currentUser?.id);
  const pendingLeads = myLeads.filter(l => l.status === 'pending_review');
  const assignedLeads = myLeads.filter(l => l.status === 'in_progress');
  const closedLeads = myLeads.filter(l => l.status === 'won' || l.status === 'lost');

  // Apply filters to myLeads
  const filteredLeads = myLeads.filter(lead => {
    if (filterEntity && lead.businessEntity !== filterEntity) return false;
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterSource && lead.source !== filterSource) return false;
    if (filterStartDate) {
      const leadDate = new Date(lead.createdAt);
      if (leadDate < filterStartDate) return false;
    }
    if (filterEndDate) {
      const leadDate = new Date(lead.createdAt);
      const endOfDay = new Date(filterEndDate);
      endOfDay.setHours(23, 59, 59, 999);
      if (leadDate > endOfDay) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterEntity(null);
    setFilterStatus(null);
    setFilterSource(null);
    setFilterStartDate(undefined);
    setFilterEndDate(undefined);
  };

  const hasActiveFilters = filterEntity || filterStatus || filterSource || filterStartDate || filterEndDate;

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      businessEntity: '',
      businessType: '',
      source: '',
      clientNumber: '',
      email: '',
      address: '',
      division: '',
      zone: '',
      notes: '',
      assignedBackOffice: '',
      assignedBackOfficeName: '',
    });
    setSelectedProducts([]);
    setTempSelectedProducts([]);
  };

  const handleEntitySelect = (entity: string) => {
    const backOffice = entityBackOfficeMap[entity];
    setFormData(prev => ({
      ...prev,
      businessEntity: entity,
      assignedBackOffice: backOffice?.id || '',
      assignedBackOfficeName: backOffice?.name || '',
    }));
  };

  const handleClientSelect = (clientId: string) => {
    if (!clientId) {
      setFormData(prev => ({
        ...prev,
        clientId: '',
        clientName: '',
        clientNumber: '',
        email: '',
        address: '',
        division: '',
        zone: '',
      }));
      return;
    }
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        clientId,
        clientName: client.name || '',
        clientNumber: client.phone || '',
        email: client.email || '',
        address: client.address || '',
        division: client.division || '',
        zone: client.zone || '',
      }));
    }
  };

  const handleTempProductToggle = (productId: string) => {
    setTempSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleConfirmProducts = () => {
    setSelectedProducts(tempSelectedProducts);
    setProductDropdownOpen(false);
  };

  const handleOpenProductDropdown = () => {
    setTempSelectedProducts(selectedProducts);
    setProductDropdownOpen(true);
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(id => id !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessEntity || !formData.businessType || !formData.source) {
      toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    const selectedClient = clients.find(c => c.id === formData.clientId);
    const clientDisplayName = formData.clientName || selectedClient?.name || 'New Lead';

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: clientDisplayName,
      company: clientDisplayName,
      contact: selectedClient?.contact || '',
      email: formData.email,
      phone: formData.clientNumber,
      department: '',
      division: formData.division,
      area: '',
      title: `${formData.businessType} - ${selectedProducts.map(id => products.find(p => p.id === id)?.name).join(', ')}`,
      status: 'pending_review',
      stage: 'new',
      source: formData.source as LeadSource,
      assignedKamId: null,
      assignedKamName: null,
      expectedValue: 0,
      notes: formData.notes + (formData.assignedBackOfficeName ? `\nAssigned Back Office: ${formData.assignedBackOfficeName}` : ''),
      attachments: [],
      createdBy: currentUser?.id || 'user-4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientId: formData.clientId || undefined,
      businessEntity: formData.businessEntity,
      products: selectedProducts,
    };

    setLeads(prev => [...prev, newLead]);
    toast({
      title: 'Lead Submitted',
      description: 'Your lead request has been sent to the Back Office for review.',
    });
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="page-container space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Headphones className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Helpdesk Portal</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">Submit leads from customer inquiries</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancel' : 'New Lead Request'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-warning/10">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold">{pendingLeads.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold">{assignedLeads.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 p-3 md:p-6 md:pt-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-success/10">
                <XCircle className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold">{closedLeads.length}</p>
                <p className="text-xs md:text-sm text-muted-foreground">Closed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Creation Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Submit Lead Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Business Entity & Business Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelSelect
                  label="Business Entity *"
                  value={formData.businessEntity}
                  onValueChange={handleEntitySelect}
                >
                  {businessEntities.map(entity => (
                    <FloatingSelectItem key={entity} value={entity}>
                      {entity} ({entityBackOfficeMap[entity]?.name || 'No BO'})
                    </FloatingSelectItem>
                  ))}
                </FloatingLabelSelect>
                <FloatingLabelSelect
                  label="Business Type *"
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                >
                  {businessTypes.map(type => (
                    <FloatingSelectItem key={type} value={type}>{type}</FloatingSelectItem>
                  ))}
                </FloatingLabelSelect>
              </div>

              {/* Row 2: Source & Client Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FloatingLabelSelect
                  label="Source *"
                  value={formData.source}
                  onValueChange={(value) => setFormData({ ...formData, source: value as LeadSource })}
                >
                  {leadSources.map(source => (
                    <FloatingSelectItem key={source.value} value={source.value}>
                      {source.label}
                    </FloatingSelectItem>
                  ))}
                </FloatingLabelSelect>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <FloatingLabelSelect
                      label="Select Client (Optional)"
                      value={formData.clientId}
                      onValueChange={handleClientSelect}
                    >
                      {clients.map(client => (
                        <FloatingSelectItem key={client.id} value={client.id}>
                          {client.name}
                        </FloatingSelectItem>
                      ))}
                    </FloatingLabelSelect>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-12 w-12"
                    onClick={() => setShowClientModal(true)}
                    title="Create new client"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Row 3: Products & Back Office - Full width when no client, two columns when client selected */}
              <div className={`grid gap-4 ${isClientSelected ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Left Column: Products, Assigned Back Office */}
                <div className="space-y-4">
                  {/* Products Multi-select */}
                  <div className="space-y-2">
                    <Popover open={productDropdownOpen} onOpenChange={setProductDropdownOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full justify-start font-normal h-12 relative pt-5"
                          onClick={handleOpenProductDropdown}
                        >
                          <span className="absolute left-3 top-1 text-xs text-primary font-medium">
                            Products
                          </span>
                          <span className="text-sm">
                            {selectedProducts.length > 0
                              ? `${selectedProducts.length} product(s) selected`
                              : 'Select products'}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full min-w-[300px] p-0 bg-popover" align="start">
                        <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                          {products.map(product => (
                            <div
                              key={product.id}
                              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => handleTempProductToggle(product.id)}
                            >
                              <Checkbox
                                checked={tempSelectedProducts.includes(product.id)}
                                onCheckedChange={() => handleTempProductToggle(product.id)}
                              />
                              <span className="text-sm">{product.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t p-2 flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setProductDropdownOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="button" size="sm" onClick={handleConfirmProducts}>
                            Confirm
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProducts.map(productId => {
                          const product = products.find(p => p.id === productId);
                          return product ? (
                            <Badge key={productId} variant="secondary" className="gap-1">
                              {product.name}
                              <button
                                type="button"
                                onClick={() => removeProduct(productId)}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Assigned Back Office (Auto-filled) */}
                  <FloatingLabelInput
                    label="Assigned Back Office"
                    value={formData.assignedBackOfficeName}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                {/* Right Column: Client Info Card - Only shows when client is selected */}
                {isClientSelected && (
                  <Card className="border-primary/20 bg-primary/5 h-fit">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-3">Client Information</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{formData.clientName}</span>
                        </div>
                        {clients.find(c => c.id === formData.clientId)?.contact && (
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{clients.find(c => c.id === formData.clientId)?.contact}</span>
                          </div>
                        )}
                        {formData.clientNumber && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formData.clientNumber}</span>
                          </div>
                        )}
                        {formData.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-primary" />
                            <a href={`mailto:${formData.email}`} className="text-sm text-primary hover:underline">
                              {formData.email}
                            </a>
                          </div>
                        )}
                        {(formData.address || formData.division || formData.zone) && (
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {[formData.address, formData.division, formData.zone].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Row 7: Notes */}
              <FloatingLabelTextarea
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="w-full sm:w-auto">
                  Cancel
                </Button>
                <Button type="submit" className="gap-2 w-full sm:w-auto">
                  <Send className="h-4 w-4" />
                  Submit Lead
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>My Submitted Leads</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                Clear Filters
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {[filterEntity, filterStatus, filterSource, filterStartDate, filterEndDate].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover">
                {/* Entity Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Entity {filterEntity && <Badge variant="secondary" className="ml-auto text-xs">{filterEntity.slice(0, 10)}...</Badge>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover">
                    <DropdownMenuItem onClick={() => setFilterEntity(null)}>
                      All Entities
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {businessEntities.map(entity => (
                      <DropdownMenuItem 
                        key={entity} 
                        onClick={() => setFilterEntity(entity)}
                        className={filterEntity === entity ? 'bg-accent' : ''}
                      >
                        {entity}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Status Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Status {filterStatus && <Badge variant="secondary" className="ml-auto text-xs capitalize">{filterStatus.replace('_', ' ')}</Badge>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover">
                    <DropdownMenuItem onClick={() => setFilterStatus(null)}>
                      All Statuses
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {(['pending_review', 'in_progress', 'on_hold', 'backlog', 'won', 'lost'] as LeadStatus[]).map(status => (
                      <DropdownMenuItem 
                        key={status} 
                        onClick={() => setFilterStatus(status)}
                        className={filterStatus === status ? 'bg-accent' : ''}
                      >
                        <span className="capitalize">{status.replace('_', ' ')}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Source Filter */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Source {filterSource && <Badge variant="secondary" className="ml-auto text-xs capitalize">{filterSource}</Badge>}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-popover">
                    <DropdownMenuItem onClick={() => setFilterSource(null)}>
                      All Sources
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {leadSources.map(source => (
                      <DropdownMenuItem 
                        key={source.value} 
                        onClick={() => setFilterSource(source.value as LeadSource)}
                        className={filterSource === source.value ? 'bg-accent' : ''}
                      >
                        {source.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                {/* Date Range Filter */}
                <div className="p-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Date Range</p>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterStartDate ? format(filterStartDate, 'PP') : 'Start date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterStartDate}
                        onSelect={(date) => { setFilterStartDate(date); setStartDateOpen(false); }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filterEndDate ? format(filterEndDate, 'PP') : 'End date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filterEndDate}
                        onSelect={(date) => { setFilterEndDate(date); setEndDateOpen(false); }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {filteredLeads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {hasActiveFilters ? 'No leads match your filters' : 'No leads submitted yet'}
              </p>
            ) : (
              filteredLeads.map(lead => (
                <div key={lead.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">{lead.company}</p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(lead.createdAt)}
                  </div>
                  {lead.businessEntity && entityBackOfficeMap[lead.businessEntity] && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      Forwarded to: {entityBackOfficeMap[lead.businessEntity].name}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Forwarded To</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {hasActiveFilters ? 'No leads match your filters' : 'No leads submitted yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map(lead => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.title}</p>
                      </TableCell>
                      <TableCell>{lead.company}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {lead.source || 'direct'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge status={lead.status} />
                      </TableCell>
                      <TableCell>
                        {lead.businessEntity && entityBackOfficeMap[lead.businessEntity]?.name || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell>{formatDate(lead.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Client Creation Modal */}
      <ClientCreationModal
        open={showClientModal}
        onOpenChange={setShowClientModal}
        onClientCreated={handleClientCreated}
      />
    </div>
  );
}
