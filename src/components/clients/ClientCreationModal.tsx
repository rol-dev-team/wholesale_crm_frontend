import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown, Check } from 'lucide-react';
import { MapLocationPicker } from '@/components/maps/MapLocationPicker';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { FloatingLabelSelect, FloatingSelectItem } from '@/components/ui/floating-label-select';
import {
  businessEntities,
  businessTypes,
  divisions,
  zones,
  type Client,
} from '@/data/mockData';
import { toast } from '@/hooks/use-toast';

interface ClientCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClientCreated: (client: Client) => void;
}

export function ClientCreationModal({
  open,
  onOpenChange,
  onClientCreated,
}: ClientCreationModalProps) {
  const [entityPopoverOpen, setEntityPopoverOpen] = useState(false);
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

  const handleSubmit = () => {
    if (!formData.name || !formData.contact || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in required fields (Name, Contact, Email)',
        variant: 'destructive',
      });
      return;
    }

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

    onClientCreated(newClient);
    toast({
      title: 'Client Created',
      description: `${formData.name} has been added successfully.`,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Client</DialogTitle>
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
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            Create Client
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
