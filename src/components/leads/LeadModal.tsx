import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Check, Upload, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect, FloatingSelectItem } from "@/components/ui/floating-label-select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import type { Lead, LeadStage, LeadStatus, KAM, Client } from "@/data/mockData";
import { pipelineStages, businessEntities, businessTypes, products, initialClients, divisions, divisionZones } from "@/data/mockData";

interface LeadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt" | "createdBy">) => void;
  onBulkSave?: (leads: Omit<Lead, "id" | "createdAt" | "updatedAt" | "createdBy">[]) => void;
  editingLead: Lead | null;
  kams: KAM[];
}

export function LeadModal({ open, onOpenChange, onSave, onBulkSave, editingLead, kams }: LeadModalProps) {
  const [clients] = useState<Client[]>(initialClients);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [tempSelectedProducts, setTempSelectedProducts] = useState<string[]>([]);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState<string>("single");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    contact: "",
    email: "",
    phone: "",
    department: "",
    division: "",
    area: "",
    title: "",
    stage: "new" as LeadStage,
    status: "in_progress" as LeadStatus,
    assignedKamId: "",
    expectedValue: 0,
    notes: "",
    businessEntity: "",
    businessType: "",
    clientId: "",
    clientAddress: "",
    clientLatitude: 0,
    clientLongitude: 0,
    zone: "",
  });

  useEffect(() => {
    if (editingLead) {
      const client = clients.find(c => c.id === editingLead.clientId);
      setFormData({
        name: editingLead.name,
        company: editingLead.company,
        contact: editingLead.contact,
        email: editingLead.email,
        phone: editingLead.phone,
        department: editingLead.department,
        division: editingLead.division,
        area: editingLead.area,
        title: editingLead.title,
        stage: editingLead.stage,
        status: editingLead.status,
        assignedKamId: editingLead.assignedKamId || "",
        expectedValue: editingLead.expectedValue,
        notes: editingLead.notes,
        businessEntity: client?.businessEntities?.[0] || "",
        businessType: client?.businessType || "",
        clientId: editingLead.clientId || "",
        clientAddress: client?.address || "",
        clientLatitude: client?.latitude || 0,
        clientLongitude: client?.longitude || 0,
        zone: "",
      });
      setSelectedProducts([]);
      setDeadline(undefined);
    } else {
      resetForm();
    }
  }, [editingLead, open, clients]);

  const resetForm = () => {
    setFormData({
      name: "",
      company: "",
      contact: "",
      email: "",
      phone: "",
      department: "",
      division: "",
      area: "",
      title: "",
      stage: "new",
      status: "in_progress",
      assignedKamId: "",
      expectedValue: 0,
      notes: "",
      businessEntity: "",
      businessType: "",
      clientId: "",
      clientAddress: "",
      clientLatitude: 0,
      clientLongitude: 0,
      zone: "",
    });
    setSelectedProducts([]);
    setDeadline(undefined);
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId,
        company: client.name,
        contact: client.contact,
        phone: client.phone,
        email: client.email,
        clientAddress: client.address,
        clientLatitude: client.latitude || 0,
        clientLongitude: client.longitude || 0,
        division: client.division,
        area: client.zone,
      });
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
    const kamId = formData.assignedKamId === "unassigned" ? null : formData.assignedKamId;
    const selectedKam = kams.find((k) => k.id === kamId);
    const client = clients.find(c => c.id === formData.clientId);
    
    // Auto-generate name and title from client if not editing
    const leadName = editingLead ? formData.name : `${client?.name || 'New'} Lead`;
    const leadTitle = editingLead ? formData.title : `${formData.businessType || 'Business'} Opportunity`;
    
    onSave({
      ...formData,
      name: leadName,
      title: leadTitle,
      assignedKamId: kamId || null,
      assignedKamName: selectedKam?.name || null,
      attachments: editingLead?.attachments || [],
      businessEntity: formData.businessEntity,
      products: selectedProducts,
      assignedDate: kamId ? new Date().toISOString() : undefined,
    });
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      setCsvFile(file);
      parseCsvFile(file);
    }
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const errors: string[] = [];
      const parsedLeads: any[] = [];
      
      // Required headers
      const requiredHeaders = ['business_entity', 'client', 'expected_revenue', 'stage'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
        setCsvErrors(errors);
        setCsvPreview([]);
        return;
      }
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        // Validate row
        const rowErrors: string[] = [];
        
        if (!row.business_entity || !businessEntities.includes(row.business_entity)) {
          rowErrors.push(`Invalid business entity`);
        }
        
        const client = clients.find(c => c.name.toLowerCase() === row.client?.toLowerCase());
        if (!client) {
          rowErrors.push(`Client "${row.client}" not found`);
        }
        
        const revenue = parseFloat(row.expected_revenue);
        if (isNaN(revenue) || revenue < 0) {
          rowErrors.push(`Invalid expected revenue`);
        }
        
        const validStages = pipelineStages.map(s => s.id);
        if (!validStages.includes(row.stage)) {
          rowErrors.push(`Invalid stage. Use: ${validStages.join(', ')}`);
        }
        
        if (rowErrors.length > 0) {
          errors.push(`Row ${i}: ${rowErrors.join('; ')}`);
        }
        
        parsedLeads.push({
          ...row,
          rowNumber: i,
          client: client,
          hasErrors: rowErrors.length > 0,
          errorMessages: rowErrors,
        });
      }
      
      setCsvErrors(errors);
      setCsvPreview(parsedLeads);
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = () => {
    if (!onBulkSave || csvPreview.length === 0) return;
    
    const validLeads = csvPreview.filter(row => !row.hasErrors);
    
    if (validLeads.length === 0) {
      toast.error("No valid leads to import");
      return;
    }
    
    const leadsToCreate = validLeads.map(row => {
      const productIds = row.products 
        ? row.products.split(';').map((p: string) => {
            const product = products.find(prod => prod.name.toLowerCase() === p.trim().toLowerCase());
            return product?.id;
          }).filter(Boolean)
        : [];
      
      return {
        name: `${row.client?.name || 'New'} Lead`,
        company: row.client?.name || '',
        contact: row.client?.contact || '',
        email: row.client?.email || '',
        phone: row.client?.phone || '',
        department: row.department || '',
        division: row.division || row.client?.division || '',
        area: row.zone || row.client?.zone || '',
        title: `${row.business_type || 'Business'} Opportunity`,
        status: 'in_progress' as LeadStatus,
        stage: row.stage as LeadStage,
        assignedKamId: null,
        assignedKamName: null,
        expectedValue: parseFloat(row.expected_revenue) || 0,
        notes: row.notes || '',
        attachments: [],
        businessEntity: row.business_entity,
        products: productIds,
        clientId: row.client?.id,
      };
    });
    
    onBulkSave(leadsToCreate);
    toast.success(`${leadsToCreate.length} leads imported successfully`);
    setCsvFile(null);
    setCsvPreview([]);
    setCsvErrors([]);
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const headers = ['business_entity', 'business_type', 'client', 'products', 'expected_revenue', 'stage', 'division', 'zone', 'notes'];
    const sampleRow = [
      businessEntities[0],
      businessTypes[0],
      clients[0]?.name || 'Client Name',
      products.slice(0, 2).map(p => p.name).join(';'),
      '50000',
      'new',
      divisions[0],
      divisionZones[divisions[0]]?.[0] || '',
      'Sample notes',
    ];
    
    const csv = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearCsvUpload = () => {
    setCsvFile(null);
    setCsvPreview([]);
    setCsvErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingLead ? "Edit Lead" : "Create New Lead"}</DialogTitle>
        </DialogHeader>
        
        {!editingLead ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Lead</TabsTrigger>
              <TabsTrigger value="bulk">Bulk Upload (CSV)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  {/* Business Entity */}
                  <FloatingLabelSelect
                    label="Business Entity *"
                    value={formData.businessEntity}
                    onValueChange={(value) => setFormData({ ...formData, businessEntity: value })}
                  >
                    {businessEntities.map((entity) => (
                      <FloatingSelectItem key={entity} value={entity}>
                        {entity}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Business Type */}
                  <FloatingLabelSelect
                    label="Business Type *"
                    value={formData.businessType}
                    onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                  >
                    {businessTypes.map((type) => (
                      <FloatingSelectItem key={type} value={type}>
                        {type}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Products Multi-Select */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label className="text-xs text-primary font-medium">Select Products *</Label>
                    <Popover open={productDropdownOpen} onOpenChange={(open) => {
                      if (open) {
                        handleOpenProductDropdown();
                      } else {
                        setProductDropdownOpen(false);
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal h-12"
                        >
                          {selectedProducts.length > 0 
                            ? `${selectedProducts.length} product(s) selected`
                            : "Select products"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full min-w-[300px] p-0" align="start">
                        <div className="max-h-60 overflow-y-auto p-2">
                          {products.map((product) => (
                            <div
                              key={product.id}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-accent",
                                tempSelectedProducts.includes(product.id) && "bg-accent"
                              )}
                              onClick={() => handleTempProductToggle(product.id)}
                            >
                              <div className={cn(
                                "h-4 w-4 border rounded flex items-center justify-center",
                                tempSelectedProducts.includes(product.id) 
                                  ? "bg-primary border-primary" 
                                  : "border-input"
                              )}>
                                {tempSelectedProducts.includes(product.id) && (
                                  <Check className="h-3 w-3 text-primary-foreground" />
                                )}
                              </div>
                              <span className="text-sm">{product.name}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t p-2">
                          <Button 
                            type="button" 
                            size="sm" 
                            className="w-full"
                            onClick={handleConfirmProducts}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Confirm Selection ({tempSelectedProducts.length})
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedProducts.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProducts.map((productId) => {
                          const product = products.find(p => p.id === productId);
                          return (
                            <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                              {product?.name}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => removeProduct(productId)} 
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Select Client */}
                  <FloatingLabelSelect
                    label="Select Client *"
                    value={formData.clientId}
                    onValueChange={handleClientSelect}
                  >
                    {clients.map((client) => (
                      <FloatingSelectItem key={client.id} value={client.id}>
                        {client.name}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Client Address (auto-filled) */}
                  <FloatingLabelInput
                    label="Client Address"
                    value={formData.clientAddress}
                    disabled
                    className="bg-muted"
                  />

                  {/* Client Map Location */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label className="text-xs text-primary font-medium">Client Map Location</Label>
                    <div className="w-full h-48 bg-muted rounded-lg border flex items-center justify-center">
                      {formData.clientLatitude && formData.clientLongitude ? (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Map Location</p>
                          <p className="text-xs">Lat: {formData.clientLatitude.toFixed(4)}, Lng: {formData.clientLongitude.toFixed(4)}</p>
                          <p className="text-xs text-muted-foreground mt-2">(Google Maps integration placeholder)</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Select a client to view map location</p>
                      )}
                    </div>
                  </div>

                  {/* Client Contact Person (auto-filled) */}
                  <FloatingLabelInput
                    label="Contact Person"
                    value={formData.contact}
                    disabled
                    className="bg-muted"
                  />

                  {/* Client Contact Number (auto-filled) */}
                  <FloatingLabelInput
                    label="Contact Number"
                    value={formData.phone}
                    disabled
                    className="bg-muted"
                  />

                  {/* Expected Revenue */}
                  <FloatingLabelInput
                    label="Expected Revenue (৳) *"
                    type="number"
                    value={formData.expectedValue.toString()}
                    onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                    min={0}
                    required
                  />

                  {/* Stage */}
                  <FloatingLabelSelect
                    label="Stage *"
                    value={formData.stage}
                    onValueChange={(value) => setFormData({ ...formData, stage: value as LeadStage })}
                  >
                    {pipelineStages.map((stage) => (
                      <FloatingSelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Division */}
                  <FloatingLabelSelect
                    label="Division"
                    value={formData.division}
                    onValueChange={(value) => setFormData({ ...formData, division: value, zone: "" })}
                  >
                    {divisions.map((div) => (
                      <FloatingSelectItem key={div} value={div}>
                        {div}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Zone */}
                  <FloatingLabelSelect
                    label="Zone"
                    value={formData.zone}
                    onValueChange={(value) => setFormData({ ...formData, zone: value })}
                    disabled={!formData.division}
                  >
                    {(divisionZones[formData.division] || []).map((zone) => (
                      <FloatingSelectItem key={zone} value={zone}>
                        {zone}
                      </FloatingSelectItem>
                    ))}
                  </FloatingLabelSelect>

                  {/* Lead Deadline */}
                  <div className="space-y-2">
                    <Label className="text-xs text-primary font-medium">Lead Deadline *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-12",
                            !deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={deadline}
                          onSelect={setDeadline}
                          initialFocus
                          className="pointer-events-auto"
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Lead</Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="bulk" className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file to create multiple leads at once
                </p>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
              
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  csvFile ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {csvFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-10 w-10 text-primary" />
                    <p className="font-medium">{csvFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {csvPreview.length} lead(s) found
                    </p>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearCsvUpload(); }}>
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium">Click to upload CSV file</p>
                    <p className="text-sm text-muted-foreground">
                      or drag and drop
                    </p>
                  </div>
                )}
              </div>
              
              {csvErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {csvErrors.slice(0, 5).map((error, i) => (
                        <li key={i} className="text-sm">{error}</li>
                      ))}
                      {csvErrors.length > 5 && (
                        <li className="text-sm">...and {csvErrors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              {csvPreview.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted px-4 py-2 text-sm font-medium">
                    Preview ({csvPreview.filter(r => !r.hasErrors).length} valid / {csvPreview.length} total)
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left">Row</th>
                          <th className="px-4 py-2 text-left">Client</th>
                          <th className="px-4 py-2 text-left">Business Entity</th>
                          <th className="px-4 py-2 text-left">Revenue</th>
                          <th className="px-4 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((row, i) => (
                          <tr key={i} className={cn(row.hasErrors && "bg-destructive/10")}>
                            <td className="px-4 py-2">{row.rowNumber}</td>
                            <td className="px-4 py-2">{row.client?.name || row.client_name || '-'}</td>
                            <td className="px-4 py-2">{row.business_entity}</td>
                            <td className="px-4 py-2">৳{row.expected_revenue}</td>
                            <td className="px-4 py-2">
                              {row.hasErrors ? (
                                <Badge variant="destructive">Error</Badge>
                              ) : (
                                <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={handleBulkUpload}
                  disabled={!csvFile || csvPreview.filter(r => !r.hasErrors).length === 0}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {csvPreview.filter(r => !r.hasErrors).length} Lead(s)
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Business Entity */}
              <FloatingLabelSelect
                label="Business Entity *"
                value={formData.businessEntity}
                onValueChange={(value) => setFormData({ ...formData, businessEntity: value })}
              >
                {businessEntities.map((entity) => (
                  <FloatingSelectItem key={entity} value={entity}>
                    {entity}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Business Type */}
              <FloatingLabelSelect
                label="Business Type *"
                value={formData.businessType}
                onValueChange={(value) => setFormData({ ...formData, businessType: value })}
              >
                {businessTypes.map((type) => (
                  <FloatingSelectItem key={type} value={type}>
                    {type}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Products Multi-Select */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label className="text-xs text-primary font-medium">Select Products *</Label>
                <Popover open={productDropdownOpen} onOpenChange={(open) => {
                  if (open) {
                    handleOpenProductDropdown();
                  } else {
                    setProductDropdownOpen(false);
                  }
                }}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal h-12"
                    >
                      {selectedProducts.length > 0 
                        ? `${selectedProducts.length} product(s) selected`
                        : "Select products"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full min-w-[300px] p-0" align="start">
                    <div className="max-h-60 overflow-y-auto p-2">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-accent",
                            tempSelectedProducts.includes(product.id) && "bg-accent"
                          )}
                          onClick={() => handleTempProductToggle(product.id)}
                        >
                          <div className={cn(
                            "h-4 w-4 border rounded flex items-center justify-center",
                            tempSelectedProducts.includes(product.id) 
                              ? "bg-primary border-primary" 
                              : "border-input"
                          )}>
                            {tempSelectedProducts.includes(product.id) && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="text-sm">{product.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t p-2">
                      <Button 
                        type="button" 
                        size="sm" 
                        className="w-full"
                        onClick={handleConfirmProducts}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Confirm Selection ({tempSelectedProducts.length})
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedProducts.map((productId) => {
                      const product = products.find(p => p.id === productId);
                      return (
                        <Badge key={productId} variant="secondary" className="flex items-center gap-1">
                          {product?.name}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeProduct(productId)} 
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Select Client */}
              <FloatingLabelSelect
                label="Select Client *"
                value={formData.clientId}
                onValueChange={handleClientSelect}
              >
                {clients.map((client) => (
                  <FloatingSelectItem key={client.id} value={client.id}>
                    {client.name}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Client Address (auto-filled) */}
              <FloatingLabelInput
                label="Client Address"
                value={formData.clientAddress}
                disabled
                className="bg-muted"
              />

              {/* Client Map Location */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label className="text-xs text-primary font-medium">Client Map Location</Label>
                <div className="w-full h-48 bg-muted rounded-lg border flex items-center justify-center">
                  {formData.clientLatitude && formData.clientLongitude ? (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Map Location</p>
                      <p className="text-xs">Lat: {formData.clientLatitude.toFixed(4)}, Lng: {formData.clientLongitude.toFixed(4)}</p>
                      <p className="text-xs text-muted-foreground mt-2">(Google Maps integration placeholder)</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a client to view map location</p>
                  )}
                </div>
              </div>

              {/* Client Contact Person (auto-filled) */}
              <FloatingLabelInput
                label="Contact Person"
                value={formData.contact}
                disabled
                className="bg-muted"
              />

              {/* Client Contact Number (auto-filled) */}
              <FloatingLabelInput
                label="Contact Number"
                value={formData.phone}
                disabled
                className="bg-muted"
              />

              {/* Expected Revenue */}
              <FloatingLabelInput
                label="Expected Revenue (৳) *"
                type="number"
                value={formData.expectedValue.toString()}
                onChange={(e) => setFormData({ ...formData, expectedValue: Number(e.target.value) })}
                min={0}
                required
              />

              {/* Stage */}
              <FloatingLabelSelect
                label="Stage *"
                value={formData.stage}
                onValueChange={(value) => setFormData({ ...formData, stage: value as LeadStage })}
              >
                {pipelineStages.map((stage) => (
                  <FloatingSelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Division */}
              <FloatingLabelSelect
                label="Division"
                value={formData.division}
                onValueChange={(value) => setFormData({ ...formData, division: value, zone: "" })}
              >
                {divisions.map((div) => (
                  <FloatingSelectItem key={div} value={div}>
                    {div}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Zone */}
              <FloatingLabelSelect
                label="Zone"
                value={formData.zone}
                onValueChange={(value) => setFormData({ ...formData, zone: value })}
                disabled={!formData.division}
              >
                {(divisionZones[formData.division] || []).map((zone) => (
                  <FloatingSelectItem key={zone} value={zone}>
                    {zone}
                  </FloatingSelectItem>
                ))}
              </FloatingLabelSelect>

              {/* Lead Deadline */}
              <div className="space-y-2">
                <Label className="text-xs text-primary font-medium">Lead Deadline *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-12",
                        !deadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deadline ? format(deadline, "PPP") : <span>Pick a deadline</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deadline}
                      onSelect={setDeadline}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Lead</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
