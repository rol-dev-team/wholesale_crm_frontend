import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FloatingLabelInput } from "@/components/ui/floating-label-input";
import { FloatingLabelSelect, FloatingSelectItem } from "@/components/ui/floating-label-select";
import { 
  systemUsers, 
  businessEntities, 
  divisions, 
  zones, 
  type KAM, 
  type SystemUser 
} from "@/data/mockData";

interface KAMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (kam: Omit<KAM, "id">) => void;
  editingKAM?: KAM | null;
}

export function KAMModal({ open, onOpenChange, onSave, editingKAM }: KAMModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
    reportingTo: "",
    divisions: [] as string[],
    zones: [] as string[],
    businessEntities: [] as string[],
  });

  // Get supervisors and managers for reporting dropdown
  const reportingOptions = systemUsers.filter(
    (user) => user.role === "supervisor" || user.role === "boss" || user.role === "super_admin"
  );

  useEffect(() => {
    if (editingKAM) {
      setSelectedUserId(editingKAM.userId);
      setFormData({
        name: editingKAM.name,
        contact: editingKAM.contact,
        email: editingKAM.email,
        address: editingKAM.address,
        reportingTo: editingKAM.reportingTo,
        divisions: editingKAM.division ? [editingKAM.division] : [],
        zones: editingKAM.zone ? [editingKAM.zone] : [],
        businessEntities: editingKAM.businessEntities || [],
      });
    } else {
      resetForm();
    }
  }, [editingKAM, open]);

  const resetForm = () => {
    setSelectedUserId("");
    setFormData({
      name: "",
      contact: "",
      email: "",
      address: "",
      reportingTo: "",
      divisions: [],
      zones: [],
      businessEntities: [],
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    const user = systemUsers.find((u) => u.id === userId);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        contact: user.phone,
        email: user.email,
        address: user.address,
      }));
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBusinessEntityToggle = (entity: string) => {
    setFormData((prev) => ({
      ...prev,
      businessEntities: prev.businessEntities.includes(entity)
        ? prev.businessEntities.filter((e) => e !== entity)
        : [...prev.businessEntities, entity],
    }));
  };

  const removeBusinessEntity = (entity: string) => {
    setFormData((prev) => ({
      ...prev,
      businessEntities: prev.businessEntities.filter((e) => e !== entity),
    }));
  };

  const handleDivisionToggle = (division: string) => {
    setFormData((prev) => ({
      ...prev,
      divisions: prev.divisions.includes(division)
        ? prev.divisions.filter((d) => d !== division)
        : [...prev.divisions, division],
    }));
  };

  const removeDivision = (division: string) => {
    setFormData((prev) => ({
      ...prev,
      divisions: prev.divisions.filter((d) => d !== division),
    }));
  };

  const handleZoneToggle = (zone: string) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.includes(zone)
        ? prev.zones.filter((z) => z !== zone)
        : [...prev.zones, zone],
    }));
  };

  const removeZone = (zone: string) => {
    setFormData((prev) => ({
      ...prev,
      zones: prev.zones.filter((z) => z !== zone),
    }));
  };

  const handleSave = () => {
    if (!selectedUserId || !formData.name || formData.divisions.length === 0 || !formData.reportingTo) return;
    onSave({
      userId: selectedUserId,
      name: formData.name,
      contact: formData.contact,
      email: formData.email,
      address: formData.address,
      reportingTo: formData.reportingTo,
      division: formData.divisions.join(", "),
      zone: formData.zones.length > 0 ? formData.zones.join(", ") : "",
      businessEntities: formData.businessEntities,
    });
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = selectedUserId && formData.name && formData.divisions.length > 0 && formData.reportingTo;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {editingKAM ? "Edit KAM" : "Create New KAM"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Select User/Name */}
          <FloatingLabelSelect
            label="Select Name *"
            value={selectedUserId}
            onValueChange={handleUserSelect}
          >
            {systemUsers.map((user) => (
              <FloatingSelectItem key={user.id} value={user.id}>
                {user.name}
              </FloatingSelectItem>
            ))}
          </FloatingLabelSelect>

          {/* Contact (auto-populated, read-only) */}
          <FloatingLabelInput
            label="Contact"
            value={formData.contact}
            readOnly
            className="bg-muted cursor-not-allowed"
          />

          {/* Email (auto-populated, read-only) */}
          <FloatingLabelInput
            label="Email"
            value={formData.email}
            readOnly
            className="bg-muted cursor-not-allowed"
          />

          {/* Business Entities (multi-select) */}
          <div className="space-y-2">
            <Label className="text-xs text-primary font-medium">Business Entities</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background h-12 min-h-12"
                >
                  {formData.businessEntities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.businessEntities.map((entity) => (
                        <Badge
                          key={entity}
                          variant="secondary"
                          className="mr-1"
                        >
                          {entity}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBusinessEntity(entity);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select business entities...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2 bg-popover z-50" align="start">
                <div className="space-y-2">
                  {businessEntities.map((entity) => (
                    <div key={entity} className="flex items-center space-x-2">
                      <Checkbox
                        id={entity}
                        checked={formData.businessEntities.includes(entity)}
                        onCheckedChange={() => handleBusinessEntityToggle(entity)}
                      />
                      <label
                        htmlFor={entity}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {entity}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Reporting To */}
          <FloatingLabelSelect
            label="Reporting To *"
            value={formData.reportingTo}
            onValueChange={(value) => handleInputChange("reportingTo", value)}
          >
            {reportingOptions.map((user) => (
              <FloatingSelectItem key={user.id} value={user.name}>
                {user.name} ({user.role.replace("_", " ")})
              </FloatingSelectItem>
            ))}
          </FloatingLabelSelect>

          {/* Division (multi-select) */}
          <div className="space-y-2">
            <Label className="text-xs text-primary font-medium">Division *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background h-12 min-h-12"
                >
                  {formData.divisions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.divisions.map((div) => (
                        <Badge
                          key={div}
                          variant="secondary"
                          className="mr-1"
                        >
                          {div}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeDivision(div);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select divisions...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2 bg-popover z-50" align="start">
                <div className="space-y-2">
                  {divisions.map((div) => (
                    <div key={div} className="flex items-center space-x-2">
                      <Checkbox
                        id={`div-${div}`}
                        checked={formData.divisions.includes(div)}
                        onCheckedChange={() => handleDivisionToggle(div)}
                      />
                      <label
                        htmlFor={`div-${div}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {div}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Zone (multi-select, optional) */}
          <div className="space-y-2">
            <Label className="text-xs text-primary font-medium">Zone (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-background h-12 min-h-12"
                >
                  {formData.zones.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {formData.zones.map((z) => (
                        <Badge
                          key={z}
                          variant="secondary"
                          className="mr-1"
                        >
                          {z}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeZone(z);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Select zones...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-2 bg-popover z-50" align="start">
                <div className="space-y-2">
                  {zones.map((z) => (
                    <div key={z} className="flex items-center space-x-2">
                      <Checkbox
                        id={`zone-${z}`}
                        checked={formData.zones.includes(z)}
                        onCheckedChange={() => handleZoneToggle(z)}
                      />
                      <label
                        htmlFor={`zone-${z}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {z}
                      </label>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Address */}
          <FloatingLabelInput
            label="Address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            {editingKAM ? "Save Changes" : "Create KAM"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
