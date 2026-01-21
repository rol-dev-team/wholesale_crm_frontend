import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDown, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  businessEntities,
  type Client,
  type KAM,
  type Sale,
} from "@/data/mockData";

interface SaleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (sale: Omit<Sale, "id">) => void;
  clients: Client[];
  kams: KAM[];
  currentUser: {
    id: string;
    name: string;
    role?: string;
  } | null;
}

export function SaleModal({
  open,
  onClose,
  onSave,
  clients,
  kams,
  currentUser,
}: SaleModalProps) {
  const [businessEntity, setBusinessEntity] = useState("");
  const [clientId, setClientId] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [salesAmount, setSalesAmount] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setBusinessEntity("");
      setClientId("");
      setProducts([]);
      setDetails("");
      setSalesAmount("");
      setClosingDate("");
    }
  }, [open]);

  const handleSave = () => {
    if (
      !businessEntity ||
      !clientId ||
      products.length === 0 ||
      !details ||
      !salesAmount ||
      !closingDate
    ) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    // Find the KAM entity ID for the current user
    const myKam = kams.find(k => k.userId === currentUser?.id);
    const kamId = myKam?.id || "";

    onSave({
      businessEntityId: businessEntity,
      businessEntityName: businessEntity,
      clientId,
      product: products,
      details,
      salesAmount: parseFloat(salesAmount),
      closingDate,
      kamId,
      createdAt: new Date().toISOString(),
    });


    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Record Achievement</DialogTitle>
        </DialogHeader>

        {/* Business Entity */}
        <div className="space-y-1">
          <Label>Business Entity</Label>
          <Select value={businessEntity} onValueChange={setBusinessEntity}>
            <SelectTrigger>
              <SelectValue placeholder="Select Business Entity" />
            </SelectTrigger>
            <SelectContent>
              {businessEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Client */}
        <div className="space-y-1">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={setClientId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products - Multi Select */}
        <div className="space-y-2">
          <Label>Products</Label>
          <Popover open={productPopoverOpen} onOpenChange={setProductPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {products.length > 0
                  ? `${products.length} selected`
                  : "Select products"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2">
              <div className="space-y-2">
                {["Product A", "Product B", "Product C"].map((product) => {
                  const selected = products.includes(product);
                  return (
                    <div
                      key={product}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                      onClick={() =>
                        setProducts((prev) =>
                          selected
                            ? prev.filter((p) => p !== product)
                            : [...prev, product]
                        )
                      }
                    >
                      <Checkbox checked={selected} />
                      <span className="text-sm">{product}</span>
                    </div>
                  );
                })}
                <Button
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => setProductPopoverOpen(false)}
                >
                  <Check className="h-4 w-4" />
                  Confirm Selection
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {products.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {products.map((p) => (
                <Badge key={p} variant="secondary" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <Label>Details</Label>
          <Input
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Achievement details"
          />
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label>Revenue Amount</Label>
          <Input
            type="number"
            value={salesAmount}
            onChange={(e) => setSalesAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>

        {/* Closing Date */}
        <div className="space-y-1">
          <Label>Closing Date</Label>
          <Input
            type="date"
            value={closingDate}
            onChange={(e) => setClosingDate(e.target.value)}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
