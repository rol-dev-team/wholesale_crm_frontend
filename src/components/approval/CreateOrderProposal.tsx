// import { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { SelectItem } from '@/components/ui/select';
// import { useNavigate } from 'react-router-dom';
// import { PriceProposalAPI } from '@/api/priceProposalApi.js';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
// import { FloatingMultiSelect } from '@/components/ui/FloatingMultiSelect';
// import { Trash2 } from 'lucide-react';
// import { PrismAPI } from '@/api';
// import { ClientAPI } from '@/api/clientApi';
// import { getUserInfo } from '@/utility/utility';
// import { FloatingSingleDatePicker } from '@/components/ui/FloatingSingleDatePicker';
// import { FloatingSelect } from '@/components/ui/FloatingSelect';

// const UNITS = ['MB', 'GB', 'Quantity'] as const;

// interface Proposal {
//   id: string;
// }

// interface Props {
//   proposal?: Proposal;
// }

// interface RowItem {
//   id: string;
//   product: string;
//   price: string;
//   unit: string;
//   volume: string;
//   total_amount?: number;
//   expected_invoice?: number;
//   new_invoice_amount?: number;
//   current_rate?: string | number;
//   quantity?: string | number;
//   current_invoice?: string | number;
//   invoice_difference?: number;
//   effective_date?: string;
//   service_uid?: string;
// }

// interface Option {
//   label: string;
//   value: string;
// }

// export default function CreateOrderProposal({ proposal }: Props) {
//   const navigate = useNavigate();
//   const userInfo = getUserInfo();

//   const [client, setClient] = useState<string | null>(null);
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [status, setStatus] = useState<'active' | 'inactive' | 'organization'>('active');

//   const [rows, setRows] = useState<RowItem[]>([]);
//   const [clients, setClients] = useState<Option[]>([]);
//   const [products, setProducts] = useState<Option[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [clientLoading, setClientLoading] = useState(false);
//   const [fetchingUnitCosts, setFetchingUnitCosts] = useState(false);

//   /* ================= LOAD CLIENTS ================= */
//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         setClients([]);
//         setClientLoading(true);
//         const response = await PrismAPI.getClientsByStatusAndKam(status, userInfo?.default_kam_id);
//         setClients(
//           response.data.map((c: any) => ({
//             label: c.client,
//             value: String(c.id),
//           }))
//         );
//       } catch {
//         setClients([]);
//       } finally {
//         setClientLoading(false);
//       }
//     };
//     loadClients();
//   }, [status]);

//   /* ================= LOAD PRODUCTS ================= */
//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         setLoading(true);
//         const productRes = await PrismAPI.getProductList();
//         setProducts(
//           productRes.data.map((p: any) => ({
//             label: p.product_name,
//             value: String(p.product_id),
//           }))
//         );
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadProducts();
//   }, []);

//   /* ================= UPDATE ROWS ================= */
//   useEffect(() => {
//     const fetchAndUpdateRows = async () => {
//       if (!client || selectedProducts.length === 0) {
//         setRows([]);
//         return;
//       }

//       setFetchingUnitCosts(true);

//       try {
//         const newRows: RowItem[] = [];

//         for (const productId of selectedProducts) {
//           const res = await ClientAPI.getUnitCost({
//             party_id: Number(client),
//             product_id: Number(productId),
//           });

//           if (res?.status && res.data && res.data.length > 0) {
//             // Create a row for each unit cost entry
//             res.data.forEach((item: any, index: number) => {
//               newRows.push({
//                 id: `${productId}-${item.service_uid || index}`,
//                 product: productId,
//                 price: '',
//                 unit: 'MB',
//                 volume: '',
//                 current_rate: Number(item.unit_cost),
//                 quantity: Number(item.quantity),
//                 current_invoice: Number(item.total),
//                 effective_date: '',
//                 service_uid: item.service_uid,
//               });
//             });
//           } else {
//             // No unit costs, create one default row
//             newRows.push({
//               id: `${productId}-default`,
//               product: productId,
//               price: '',
//               unit: 'MB',
//               volume: '',
//               current_rate: 0,
//               quantity: 0,
//               current_invoice: 0,
//               effective_date: '',
//             });
//           }
//         }

//         setRows(newRows);
//       } finally {
//         setFetchingUnitCosts(false);
//       }
//     };

//     fetchAndUpdateRows();
//   }, [selectedProducts, client]);

//   /* ================= AUTO CALCULATION ================= */
//   const updateRow = (id: string, data: Partial<RowItem>) => {
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.id !== id) return r;

//         const updated = { ...r, ...data };

//         const price = parseFloat(updated.price || '0');
//         const volume = parseFloat(updated.volume || '0');
//         const currentRate =
//           typeof updated.current_rate === 'number'
//             ? updated.current_rate
//             : parseFloat(String(updated.current_rate || '0'));
//         const currentInvoice =
//           typeof updated.current_invoice === 'number'
//             ? updated.current_invoice
//             : parseFloat(String(updated.current_invoice || '0'));

//         const proposedAmount = price * volume;
//         const expectedInvoice = currentRate * volume;
//         const newInvoiceAmount = currentInvoice + proposedAmount;
//         const invoiceDifference = newInvoiceAmount - currentInvoice;
//         const invoiceDifferenceUnitBased = proposedAmount - expectedInvoice;

//         return {
//           ...updated,
//           total_amount: proposedAmount || 0,
//           expected_invoice: expectedInvoice || 0,
//           invoice_difference: invoiceDifference || 0,
//           new_invoice_amount: newInvoiceAmount || 0,
//           invoice_difference_unit_based: invoiceDifferenceUnitBased || 0,
//         };
//       })
//     );
//   };

//   const deleteRow = (id: string) => {
//     setRows((prev) => prev.filter((r) => r.id !== id));
//     // If no more rows for this product, remove from selectedProducts
//     const remainingForProduct = prev.filter((r) => r.id !== id && r.product === prev.find(p => p.id === id)?.product);
//     if (remainingForProduct.length === 0) {
//       setSelectedProducts((prev) => prev.filter((p) => p !== prev.find(r => r.id === id)?.product));
//     }
//   };

//   /* ================= SUBMIT (UNCHANGED PAYLOAD) ================= */
//   const submitProposal = async () => {
//     try {
//       setLoading(true);

//       const payload = {
//         client_id: Number(client),
//         items: rows.map((r) => ({
//           product_id: Number(r.product),
//           current_rate:
//             r.current_rate !== undefined && r.current_rate !== '-' ? Number(r.current_rate) : null,
//           price: Number(r.price),
//           volume: r.volume ? Number(r.volume) : 1,
//           unit: r.unit,
//           total_amount: r.total_amount ? Number(r.total_amount) : 0,
//           effective_date: r.effective_date || null,
//         })),
//       };

//       await PriceProposalAPI.create(payload);
//       navigate('/order-proposal-list');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const isEffectiveDateValid = rows.length > 0 && rows.every((r) => r.effective_date);
//   return (
//     <div className="space-y-6">
//       {/* STATUS RADIO BUTTONS */}
//       <div className="flex items-center space-x-6">
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             name="status"
//             value="active"
//             checked={status === 'active'}
//             onChange={() => setStatus('active')}
//             className="accent-blue-500"
//           />
//           <span>Active</span>
//         </label>

//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             name="status"
//             value="inactive"
//             checked={status === 'inactive'}
//             onChange={() => setStatus('inactive')}
//             className="accent-blue-500"
//           />
//           <span>Inactive</span>
//         </label>

//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             name="status"
//             value="organization"
//             checked={status === 'organization'}
//             onChange={() => setStatus('organization')}
//             className="accent-blue-500"
//           />
//           <span>Organization</span>
//         </label>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* <FloatingSearchSelect
//           label="Client"
//           value={client ?? undefined}
//           onValueChange={setClient}
//           disabled={clientLoading}
//           searchable
//         >
//           {clients.map((c, index) => (
//             <SelectItem key={`${c.value}-${index}`} value={c.value}>
//               {c.label}
//             </SelectItem>
//           ))}
//         </FloatingSearchSelect> */}
//         <FloatingSelect
//           label="Client"
//           value={client ?? undefined}
//           onValueChange={setClient}
//           className={clientLoading ? 'pointer-events-none opacity-60' : ''}
//         >
//           {clients.map((c, index) => (
//             <SelectItem key={`${c.value}-${index}`} value={c.value} textValue={c.label}>
//               {c.label}
//             </SelectItem>
//           ))}
//         </FloatingSelect>

//         <FloatingMultiSelect
//           label="Products"
//           value={selectedProducts}
//           options={products}
//           onChange={setSelectedProducts}
//           disabled={loading}
//         />
//       </div>

//       <div className="border rounded-xl overflow-x-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Current Price</TableHead>
//               <TableHead>Current Volume</TableHead>
//               <TableHead>Propose Price</TableHead>
//               <TableHead>Propose Volume</TableHead>
//               <TableHead>Proposed Amount</TableHead>
//               <TableHead>Current Unit Invoice</TableHead>
//               <TableHead>Unit Based Invoice Difference</TableHead>
//               <TableHead>Current Total Invoice</TableHead>
//               <TableHead>New Total Invoice</TableHead>
//               <TableHead>Invoice Difference</TableHead>
//               <TableHead>Effective Date</TableHead>

//               <TableHead />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {rows.length > 0 ? (
//               rows.map((row) => (
//                 <TableRow key={row.id}>
//                   <TableCell>{products.find((p) => p.value === row.product)?.label}</TableCell>

//                   <TableCell>{Number(row.current_rate || 0).toFixed(2)}</TableCell>

//                   <TableCell>{Number(row.quantity || 0).toFixed(2)}</TableCell>

//                   {/* Propose Price + Unit Dropdown */}
//                   <TableCell>
//                     <div className="flex items-center gap-2">
//                       <Input
//                         type="number"
//                         value={row.price}
//                         onChange={(e) =>
//                           updateRow(row.id, {
//                             price: e.target.value,
//                           })
//                         }
//                         placeholder="0"
//                         className="min-w-[80px]"
//                       />
//                       <span>/</span>
//                       <select
//                         className="border rounded-md px-2 py-1 min-w-[50px]"
//                         value={row.unit}
//                         onChange={(e) =>
//                           updateRow(row.id, {
//                             unit: e.target.value,
//                           })
//                         }
//                       >
//                         {UNITS.map((u) => (
//                           <option key={u} value={u}>
//                             {u}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </TableCell>

//                   <TableCell>
//                     <Input
//                       type="number"
//                       value={row.volume}
//                       onChange={(e) =>
//                         updateRow(row.id, {
//                           volume: e.target.value,
//                         })
//                       }
//                       className="min-w-[180px]"
//                     />
//                   </TableCell>

//                   <TableCell>{row.total_amount?.toFixed(2)}</TableCell>
//                   <TableCell>{row.expected_invoice?.toFixed(2)}</TableCell>

//                   <TableCell
//                     className={
//                       row.invoice_difference_unit_based && row.invoice_difference_unit_based >= 0
//                         ? 'text-green-600'
//                         : 'text-red-600'
//                     }
//                   >
//                     {row.invoice_difference_unit_based?.toFixed(2)}
//                   </TableCell>
//                   <TableCell>{Number(row.current_invoice || 0).toFixed(2)}</TableCell>

//                   <TableCell>{row.new_invoice_amount?.toFixed(2)}</TableCell>
//                   <TableCell
//                     className={
//                       row.invoice_difference && row.invoice_difference >= 0
//                         ? 'text-green-600'
//                         : 'text-red-600'
//                     }
//                   >
//                     {row.invoice_difference?.toFixed(2)}
//                   </TableCell>
//                   <TableCell className="min-w-[200px]">
//                     <FloatingSingleDatePicker
//                       label="Effective Date"
//                       value={row.effective_date}
//                       onChange={(date) =>
//                         updateRow(row.id, {
//                           effective_date: date,
//                         })
//                       }
//                     />
//                   </TableCell>

//                   <TableCell>
//                     <Button variant="ghost" size="icon" onClick={() => deleteRow(row.id)}>
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               ))
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={13} className="text-center">
//                   No products selected
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       <div className="flex justify-end">
//         <Button
//           onClick={submitProposal}
//           disabled={!client || rows.length === 0 || !isEffectiveDateValid}
//         >
//           Submit for Approval
//         </Button>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectItem } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { PriceProposalAPI } from '@/api/priceProposalApi.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FloatingSearchSelect } from '@/components/ui/FloatingSearchSelect';
import { FloatingMultiSelect } from '@/components/ui/FloatingMultiSelect';
import { Trash2 } from 'lucide-react';
import { PrismAPI } from '@/api';
import { ClientAPI } from '@/api/clientApi';
import { getUserInfo } from '@/utility/utility';
import { FloatingSingleDatePicker } from '@/components/ui/FloatingSingleDatePicker';
import { FloatingSelect } from '@/components/ui/FloatingSelect';

const UNITS = ['MB', 'GB', 'Quantity'] as const;

interface Proposal {
  id: string;
}

interface Props {
  proposal?: Proposal;
}

interface RowItem {
  id: string;
  product: string;
  price: string;
  unit: string;
  volume: string;
  total_amount?: number;
  expected_invoice?: number;
  new_invoice_amount?: number;
  current_rate?: string | number;
  quantity?: string | number;
  current_invoice?: string | number;
  invoice_difference?: number;
  effective_date?: string;
  service_uid?: string;
}

interface Option {
  label: string;
  value: string;
}

export default function CreateOrderProposal({ proposal }: Props) {
  const navigate = useNavigate();
  const userInfo = getUserInfo();

  const [client, setClient] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive' | 'organization'>('active');

  const [rows, setRows] = useState<RowItem[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [clientLoading, setClientLoading] = useState(false);
  const [fetchingUnitCosts, setFetchingUnitCosts] = useState(false);

  /* ================= LOAD CLIENTS ================= */
  useEffect(() => {
    const loadClients = async () => {
      try {
        setClients([]);
        setClientLoading(true);
        const response = await PrismAPI.getClientsByStatusAndKam(status, userInfo?.default_kam_id);
        setClients(
          response.data.map((c: any) => ({
            label: c.client,
            value: String(c.id),
          }))
        );
      } catch {
        setClients([]);
      } finally {
        setClientLoading(false);
      }
    };
    loadClients();
  }, [status]);

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const productRes = await PrismAPI.getProductList();
        setProducts(
          productRes.data.map((p: any) => ({
            label: p.product_name,
            value: String(p.product_id),
          }))
        );
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  /* ================= UPDATE ROWS ================= */
  useEffect(() => {
    const fetchAndUpdateRows = async () => {
      if (!client || selectedProducts.length === 0) {
        setRows([]);
        return;
      }

      setFetchingUnitCosts(true);

      try {
        const newRows: RowItem[] = [];

        for (const productId of selectedProducts) {
          const res = await ClientAPI.getUnitCost({
            party_id: Number(client),
            product_id: Number(productId),
          });

          if (res?.status && res.data && res.data.length > 0) {
            res.data.forEach((item: any, index: number) => {
              newRows.push({
                id: `${productId}-${item.service_uid || index}`,
                product: productId,
                price: '',
                unit: 'MB',
                volume: '',
                current_rate: Number(item.unit_cost),
                quantity: Number(item.quantity),
                current_invoice: Number(item.total),
                effective_date: '',
                service_uid: item.service_uid,
              });
            });
          } else {
            newRows.push({
              id: `${productId}-default`,
              product: productId,
              price: '',
              unit: 'MB',
              volume: '',
              current_rate: 0,
              quantity: 0,
              current_invoice: 0,
              effective_date: '',
              service_uid: undefined,
            });
          }
        }

        setRows(newRows);
      } finally {
        setFetchingUnitCosts(false);
      }
    };

    fetchAndUpdateRows();
  }, [selectedProducts, client]);

  /* ================= AUTO CALCULATION ================= */
  const updateRow = (id: string, data: Partial<RowItem>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const updated = { ...r, ...data };

        const price = parseFloat(updated.price || '0');
        const volume = parseFloat(updated.volume || '0');
        const currentRate =
          typeof updated.current_rate === 'number'
            ? updated.current_rate
            : parseFloat(String(updated.current_rate || '0'));
        const currentInvoice =
          typeof updated.current_invoice === 'number'
            ? updated.current_invoice
            : parseFloat(String(updated.current_invoice || '0'));

        const proposedAmount = price * volume;
        const expectedInvoice = currentRate * volume;
        const newInvoiceAmount = currentInvoice + proposedAmount;
        const invoiceDifference = newInvoiceAmount - currentInvoice;
        const invoiceDifferenceUnitBased = proposedAmount - expectedInvoice;

        return {
          ...updated,
          total_amount: proposedAmount || 0,
          expected_invoice: expectedInvoice || 0,
          invoice_difference: invoiceDifference || 0,
          new_invoice_amount: newInvoiceAmount || 0,
          invoice_difference_unit_based: invoiceDifferenceUnitBased || 0,
        };
      })
    );
  };

  const deleteRow = (id: string) => {
    setRows((prev) => {
      const rowToDelete = prev.find((r) => r.id === id);
      const remaining = prev.filter((r) => r.id !== id);
      if (rowToDelete) {
        const stillHasProduct = remaining.some((r) => r.product === rowToDelete.product);
        if (!stillHasProduct) {
          setSelectedProducts((sp) => sp.filter((p) => p !== rowToDelete.product));
        }
      }
      return remaining;
    });
  };

  /* ================= SUBMIT ================= */
  const submitProposal = async () => {
    try {
      setLoading(true);

      const payload = {
        client_id: Number(client),
        items: rows.map((r) => ({
          product_id: Number(r.product),
          current_rate:
            r.current_rate !== undefined && r.current_rate !== '-' ? Number(r.current_rate) : null,
          price: Number(r.price),
          volume: r.volume ? Number(r.volume) : 1,
          unit: r.unit,
          total_amount: r.total_amount ? Number(r.total_amount) : 0,
          effective_date: r.effective_date || null,
        })),
      };

      await PriceProposalAPI.create(payload);
      navigate('/order-proposal-list');
    } finally {
      setLoading(false);
    }
  };

  const isEffectiveDateValid = rows.length > 0 && rows.every((r) => r.effective_date);

  return (
    <div className="space-y-6">
      {/* STATUS RADIO BUTTONS */}
      <div className="flex items-center space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="status"
            value="active"
            checked={status === 'active'}
            onChange={() => setStatus('active')}
            className="accent-blue-500"
          />
          <span>Active</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="status"
            value="inactive"
            checked={status === 'inactive'}
            onChange={() => setStatus('inactive')}
            className="accent-blue-500"
          />
          <span>Inactive</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="status"
            value="organization"
            checked={status === 'organization'}
            onChange={() => setStatus('organization')}
            className="accent-blue-500"
          />
          <span>Organization</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingSelect
          label="Client"
          value={client ?? undefined}
          onValueChange={setClient}
          className={clientLoading ? 'pointer-events-none opacity-60' : ''}
        >
          {clients.map((c, index) => (
            <SelectItem key={`${c.value}-${index}`} value={c.value} textValue={c.label}>
              {c.label}
            </SelectItem>
          ))}
        </FloatingSelect>

        <FloatingMultiSelect
          label="Products"
          value={selectedProducts}
          options={products}
          onChange={setSelectedProducts}
          disabled={loading}
        />
      </div>

      <div className="border rounded-xl overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Service ID</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>Current Volume</TableHead>
              <TableHead>Propose Price</TableHead>
              <TableHead>Propose Volume</TableHead>
              <TableHead>Proposed Amount</TableHead>
              <TableHead>Current Unit Invoice</TableHead>
              <TableHead>Unit Based Invoice Difference</TableHead>
              <TableHead>Current Total Invoice</TableHead>
              <TableHead>New Total Invoice</TableHead>
              <TableHead>Invoice Difference</TableHead>
              <TableHead>Effective Date</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {/* Product */}
                  <TableCell>
                    {products.find((p) => p.value === row.product)?.label}
                  </TableCell>

                  {/* Service UID */}
                  <TableCell>
                    {row.service_uid ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                        {row.service_uid}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>

                  {/* Current Price */}
                  <TableCell>{Number(row.current_rate || 0).toFixed(2)}</TableCell>

                  {/* Current Volume */}
                  <TableCell>{Number(row.quantity || 0).toFixed(2)}</TableCell>

                  {/* Propose Price + Unit Dropdown */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={row.price}
                        onChange={(e) => updateRow(row.id, { price: e.target.value })}
                        placeholder="0"
                        className="min-w-[80px]"
                      />
                      <span>/</span>
                      <select
                        className="border rounded-md px-2 py-1 min-w-[50px]"
                        value={row.unit}
                        onChange={(e) => updateRow(row.id, { unit: e.target.value })}
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TableCell>

                  {/* Propose Volume */}
                  <TableCell>
                    <Input
                      type="number"
                      value={row.volume}
                      onChange={(e) => updateRow(row.id, { volume: e.target.value })}
                      className="min-w-[180px]"
                    />
                  </TableCell>

                  {/* Proposed Amount */}
                  <TableCell>{row.total_amount?.toFixed(2)}</TableCell>

                  {/* Current Unit Invoice */}
                  <TableCell>{row.expected_invoice?.toFixed(2)}</TableCell>

                  {/* Unit Based Invoice Difference */}
                  <TableCell
                    className={
                      (row as any).invoice_difference_unit_based >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {(row as any).invoice_difference_unit_based?.toFixed(2)}
                  </TableCell>

                  {/* Current Total Invoice */}
                  <TableCell>{Number(row.current_invoice || 0).toFixed(2)}</TableCell>

                  {/* New Total Invoice */}
                  <TableCell>{row.new_invoice_amount?.toFixed(2)}</TableCell>

                  {/* Invoice Difference */}
                  <TableCell
                    className={
                      row.invoice_difference && row.invoice_difference >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {row.invoice_difference?.toFixed(2)}
                  </TableCell>

                  {/* Effective Date */}
                  <TableCell className="min-w-[200px]">
                    <FloatingSingleDatePicker
                      label="Effective Date"
                      value={row.effective_date}
                      onChange={(date) => updateRow(row.id, { effective_date: date })}
                    />
                  </TableCell>

                  {/* Delete */}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteRow(row.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={14} className="text-center">
                  No products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={submitProposal}
          disabled={!client || rows.length === 0 || !isEffectiveDateValid}
        >
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}