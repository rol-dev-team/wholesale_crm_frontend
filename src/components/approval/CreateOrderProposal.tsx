import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { ClientAPI } from "@/api/ClientAPI";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FloatingSearchSelect } from "@/components/ui/FloatingSearchSelect";
import { FloatingMultiSelect } from "@/components/ui/FloatingMultiSelect";
import { Trash2 } from "lucide-react";
import { products } from "@/data/mockData";

const CLIENTS = [
  { label: "Grameenphone", value: "gp" },
  { label: "Robi Axiata", value: "robi" },
  { label: "Banglalink", value: "bl" },
];

const PRODUCTS = [
  { label: "SMS Bundle", value: "sms" },
  { label: "Data Pack", value: "data" },
  { label: "Voice Minutes", value: "voice" },
  { label: "Cloud Storage", value: "cloud" },
  { label: "API Access", value: "api" },
  { label: "Support Package", value: "support" },
];

const UNITS = ["MB", "GB", "Quantity"] as const;

interface ProposalItem {
  product: string;
  price: string;
  unit: string;
  volume: string;
  status?: "Approved" | "Rejected"; // to know which product is editable
}


interface Proposal {
  id: string;
  client: string;
  items: ProposalItem[];
}

interface Props {
  proposal?: Proposal;
}

export default function CreateOrderProposal({ proposal }: Props) {
  const navigate = useNavigate();
  interface RowItem {
    product: string;
    price: string;
    unit: string;
    volume: string;
    status?: "Approved" | "Rejected";
  }

  const isRevision = !!proposal;

  const [client, setClient] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [rows, setRows] = useState<RowItem[]>([]);

  // sync rows with selected products
  useEffect(() => {
    setRows((prev) => {
      const existing = prev.map((r) => r.product);
      const added = selectedProducts.filter((p) => !existing.includes(p));
      const remaining = prev.filter((r) =>
        selectedProducts.includes(r.product)
      );

      return [
        ...remaining,
        ...added.map((p) => ({
          product: p,
          price: "",
          unit: "Quantity",
          volume: "",
        })),
      ];
    });
  }, [selectedProducts]);

  // load proposal if editing
  useEffect(() => {
    if (!proposal) return;

    setClient(proposal.client);
    setSelectedProducts(proposal.items.map((i) => i.product));
    setRows(
      proposal.items.map((i) => ({
        product: i.product,
        price: i.price,
        unit: i.unit,
        volume: i.volume,
        status: i.status, // to know which row is editable
      }))
    );
  }, [proposal]);

  const updateRow = (product: string, data: Partial<RowItem>) => {
    setRows((prev) =>
      prev.map((r) => (r.product === product ? { ...r, ...data } : r))
    );
  };

  const deleteRow = (product: string) => {
    setRows((prev) => prev.filter((r) => r.product !== product));
    setSelectedProducts((prev) => prev.filter((p) => p !== product));
  };

  const submitProposal = () => {
    const payload = {
      client,
      products: selectedProducts,
      price: String,
      unit: String,
      volume: String,
    };

    console.log("Submit for approval", payload);
    alert("Order proposal submitted for approval");
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingSearchSelect
          label="Client"
          value={client ?? undefined}
          onValueChange={isRevision ? undefined : setClient}
          disabled={isRevision}
          searchable
        >
          {CLIENTS.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </FloatingSearchSelect>

        <FloatingMultiSelect
          label="Products"
          value={selectedProducts}
          options={PRODUCTS}
          onChange={isRevision ? undefined : setSelectedProducts}
          disabled={isRevision}
        />
      </div>

      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="w-[280px]">Price / Unit</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
  // Editable if:
  // - New proposal (not a revision) → everything editable
  // - Revision and row was rejected → editable
  const isEditable = !isRevision || row.status === "Rejected";

  return (
    <TableRow key={row.product}>
      <TableCell className="font-medium">
        {PRODUCTS.find((p) => p.value === row.product)?.label}
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          {/* Price input */}
          <Input
            type="number"
            value={row.price}
            onChange={(e) =>
              isEditable && updateRow(row.product, { price: e.target.value })
            }
            disabled={!isEditable}
          />
          <span>/</span>
          {/* Unit select */}
          <select
            className="border rounded-md px-2 py-1"
            value={row.unit}
            onChange={(e) =>
              isEditable && updateRow(row.product, { unit: e.target.value })
            }
            disabled={!isEditable}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </TableCell>

      {/* Volume input */}
      <TableCell>
        <Input
          type="number"
          value={row.volume}
          onChange={(e) =>
            isEditable && updateRow(row.product, { volume: e.target.value })
          }
          disabled={!isEditable}
        />
      </TableCell>

      {/* Total amount */}
      <TableCell className="font-semibold">
        {(Number(row.price) || 0) * (Number(row.volume) || 0)}
      </TableCell>

      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => isEditable && deleteRow(row.product)}
          disabled={!isEditable}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
})}

            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
       <Button
        onClick={() => {
          if (isRevision) {
            const revisedItems = rows.filter(r => r.status === "Rejected");
            // TODO: call your backend API with revisedItems and proposal.id
            console.log("Submitting revised proposal", {
              proposalId: proposal!.id,
              revisedItems,
            });
            alert("Revised proposal submitted");
            navigate("/order-proposals"); // go back to list
          } else {
            const payload = { client, items: rows };
            // TODO: call your backend API for new proposal
            console.log("Submitting new proposal", payload);
            alert("Order proposal submitted for approval");
            navigate("/order-proposal-list"); // go back to list
          }
        }}
        disabled={!client || rows.length === 0}
      >
        {isRevision ? "Submit Revision" : "Submit for Approval"}
      </Button>
      </div>
    </div>
  );
}
