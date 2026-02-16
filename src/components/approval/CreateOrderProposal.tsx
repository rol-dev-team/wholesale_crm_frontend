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
// import { FloatingInput } from '../ui/FloatingInput';
// import { FloatingMultiSelect } from '@/components/ui/FloatingMultiSelect';
// import { Trash2 } from 'lucide-react';
// import { PrismAPI } from '@/api';
// import { ClientAPI } from '@/api/clientApi';
// import { getUserInfo } from '@/utility/utility';

// const UNITS = ['MB', 'GB', 'Quantity'] as const;

// /* ================= TYPES ================= */

// interface ProposalItem {
//   product: string;
//   price: string;
//   unit: string;
//   volume: string;
//   status?: 'Approved' | 'Rejected';
// }

// interface Proposal {
//   id: string;
//   active: boolean;
//   client: string;
//   items: ProposalItem[];
// }

// interface Props {
//   proposal?: Proposal;
// }

// interface RowItem {
//   product: string;
//   price: string;
//   unit: string;
//   volume: string;
//   total_amount?: string;
//   current_rate?: string | number;
//   quantity?: string | number;
//   current_invoice?: string | number;
//   invoice_difference?: number;
//   status?: 'Approved' | 'Rejected';
// }

// interface Option {
//   label: string;
//   value: string;
// }

// /* ================= COMPONENT ================= */

// export default function CreateOrderProposal({ proposal }: Props) {
//   const navigate = useNavigate();
//   const isRevision = !!proposal;
//   const userInfo = getUserInfo();

//   /* ================= STATE ================= */

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
//         setClientLoading(true);
//         setClients([]);
//         const response = await PrismAPI.getClientsByStatusAndKam(status, userInfo?.default_kam_id);
//         setClients(
//           response.data.map((c: any) => ({
//             label: c.client,
//             value: String(c.id),
//           }))
//         );
//       } catch (err) {
//         console.error('Client load failed', err);
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
//       } catch (err) {
//         console.error('Product load failed', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadProducts();
//   }, []);

//   /* ================= UPDATE ROWS WHEN PRODUCTS CHANGE ================= */
//   useEffect(() => {
//     setRows((prev) => {
//       const existing = prev.map((r) => r.product);

//       const added = selectedProducts.filter((p) => !existing.includes(p));

//       const remaining = prev.filter((r) => selectedProducts.includes(r.product));

//       return [
//         ...remaining,
//         ...added.map((p) => ({
//           product: p,
//           price: '',
//           unit: 'MB',
//           volume: '',
//           current_rate: '-',
//           current_invoice: '-',
//         })),
//       ];
//     });
//   }, [selectedProducts]);

//   useEffect(() => {
//     const fetchUnitCosts = async () => {
//       if (!client || rows.length === 0) return;

//       const needsFetch = rows.some((r) => r.current_rate === '-');
//       if (!needsFetch) return;

//       setFetchingUnitCosts(true);

//       try {
//         const updated = await Promise.all(
//           rows.map(async (row) => {
//             if (row.current_rate !== '-') return row;

//             const res = await ClientAPI.getUnitCost({
//               party_id: Number(client),
//               product_id: Number(row.product),
//             });

//             if (res?.status && res.unit_cost) {
//               return {
//                 ...row,
//                 current_rate: Number(res.unit_cost),
//                 current_invoice: res.total ? Number(res.total) : '-',
//                 quantity: res.quantity ? Number(res.quantity) : '-',
//               };
//             }

//             return row;
//           })
//         );

//         setRows(updated);
//       } finally {
//         setFetchingUnitCosts(false);
//       }
//     };

//     fetchUnitCosts();
//   }, [rows.length]);

//   /* ================= HELPERS ================= */

//   const calculateInvoiceDifference = (totalAmount?: string, currentInvoice?: string | number) => {
//     if (
//       !totalAmount ||
//       totalAmount === '' ||
//       currentInvoice === '-' ||
//       currentInvoice === undefined
//     ) {
//       return undefined;
//     }

//     const total = parseFloat(totalAmount);
//     const invoice =
//       typeof currentInvoice === 'number' ? currentInvoice : parseFloat(String(currentInvoice));

//     if (isNaN(total) || isNaN(invoice)) {
//       return undefined;
//     }

//     return total - invoice;
//   };

//   const updateRow = (product: string, data: Partial<RowItem>) => {
//     setRows((prev) =>
//       prev.map((r) => {
//         if (r.product === product) {
//           const updated = { ...r, ...data };
//           const difference = calculateInvoiceDifference(
//             updated.total_amount,
//             updated.current_invoice
//           );
//           return { ...updated, invoice_difference: difference };
//         }
//         return r;
//       })
//     );
//   };

//   const deleteRow = (product: string) => {
//     setRows((prev) => prev.filter((r) => r.product !== product));
//     setSelectedProducts((prev) => prev.filter((p) => p !== product));
//   };

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
//           total_amount: Number(r.total_amount),
//         })),
//       };
//       await PriceProposalAPI.create(payload);
//       navigate('/order-proposal-list');
//     } catch (error) {
//       console.error('Create proposal failed', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= UI ================= */

//   return (
//     <div className="space-y-6">
//       {/* STATUS RADIO BUTTONS */}
//       <div className="flex items-center space-x-6">
//         <span className="font-medium">Status:</span>
//         <label className="flex items-center space-x-2">
//           <input
//             type="radio"
//             name="status"
//             value="active"
//             checked={status === 'active'}
//             onChange={() => setStatus('active')}
//             disabled={loading}
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
//             disabled={loading}
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
//             disabled={loading}
//             className="accent-blue-500"
//           />
//           <span>Organization</span>
//         </label>
//       </div>

//       {/* CLIENT & PRODUCTS SELECTION */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FloatingSearchSelect
//           label="Client"
//           value={client ?? undefined}
//           onValueChange={isRevision ? undefined : setClient}
//           disabled={clientLoading}
//           searchable
//         >
//           {clients.map((c) => (
//             <SelectItem key={`client-${c.value}`} value={c.value}>
//               {c.label}
//             </SelectItem>
//           ))}
//         </FloatingSearchSelect>

//         <FloatingMultiSelect
//           label="Products"
//           value={selectedProducts}
//           options={products}
//           onChange={isRevision ? undefined : setSelectedProducts}
//           disabled={isRevision || loading}
//         />
//       </div>

//       {/* TABLE */}
//       <div className="border rounded-xl">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Current Price</TableHead>
//               <TableHead>Current Volume</TableHead>
//               <TableHead>Propose Price</TableHead>
//               <TableHead>Propose Volume</TableHead>
//               <TableHead>Proposed Amount</TableHead>
//               <TableHead>Current Invoice</TableHead>
//               <TableHead>Expected Invoice</TableHead>
//               <TableHead>Invoice Difference</TableHead>
//               <TableHead>New Invoice Amount</TableHead>

//               <TableHead />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {rows.length > 0 ? (
//               rows.map((row) => {
//                 const isEditable = !isRevision || row.status === 'Rejected';

//                 return (
//                   <TableRow key={`product-row-${row.product}`}>
//                     <TableCell className="font-medium">
//                       {products.find((p) => p.value === row.product)?.label}
//                     </TableCell>

//                     <TableCell className="font-medium">
//                       {fetchingUnitCosts ? (
//                         <span className="text-gray-400 text-sm">Loading...</span>
//                       ) : row.current_rate && row.current_rate !== '-' ? (
//                         <span className="text-blue-600 font-semibold">
//                           {typeof row.current_rate === 'number'
//                             ? row.current_rate.toFixed(2)
//                             : row.current_rate}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </TableCell>
//                     <TableCell className="font-medium">
//                       {fetchingUnitCosts ? (
//                         <span className="text-gray-400 text-sm">Loading...</span>
//                       ) : row.quantity && row.quantity !== '-' ? (
//                         <span className="text-purple-600 font-semibold">
//                           {typeof row.quantity === 'number'
//                             ? row.quantity.toFixed(2)
//                             : row.quantity}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </TableCell>

//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <Input
//                           type="number"
//                           value={row.price}
//                           onChange={(e) =>
//                             isEditable && updateRow(row.product, { price: e.target.value })
//                           }
//                           disabled={!isEditable}
//                           placeholder="0"
//                         />
//                         <span>/</span>
//                         <select
//                           className="border rounded-md px-2 py-1"
//                           value={row.unit}
//                           onChange={(e) =>
//                             isEditable && updateRow(row.product, { unit: e.target.value })
//                           }
//                           disabled={!isEditable}
//                         >
//                           {UNITS.map((u) => (
//                             <option key={u} value={u}>
//                               {u}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                     </TableCell>

//                     <TableCell>
//                       <Input
//                         type="number"
//                         value={row.volume}
//                         onChange={(e) =>
//                           isEditable && updateRow(row.product, { volume: e.target.value })
//                         }
//                         disabled={!isEditable}
//                         placeholder="0"
//                       />
//                     </TableCell>

//                     <TableCell>
//                       <Input
//                         type="number"
//                         value={row.total_amount || ''}
//                         onChange={(e) =>
//                           isEditable && updateRow(row.product, { total_amount: e.target.value })
//                         }
//                         disabled={!isEditable}
//                         placeholder="0"
//                       />
//                     </TableCell>

//                     <TableCell className="font-medium">
//                       {fetchingUnitCosts ? (
//                         <span className="text-gray-400 text-sm">Loading...</span>
//                       ) : row.current_invoice && row.current_invoice !== '-' ? (
//                         <span className="text-green-600 font-semibold">
//                           {typeof row.current_invoice === 'number'
//                             ? row.current_invoice.toFixed(2)
//                             : row.current_invoice}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </TableCell>

//                     <TableCell className="font-medium">
//                       {row.invoice_difference !== undefined ? (
//                         <span
//                           className={`font-semibold ${
//                             row.invoice_difference >= 0 ? 'text-green-600' : 'text-red-600'
//                           }`}
//                         >
//                           {row.invoice_difference.toFixed(2)}
//                         </span>
//                       ) : (
//                         <span className="text-gray-400">-</span>
//                       )}
//                     </TableCell>

//                     <TableCell>
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={() => isEditable && deleteRow(row.product)}
//                         disabled={!isEditable}
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 );
//               })
//             ) : (
//               <TableRow>
//                 <TableCell colSpan={9} className="text-center text-muted-foreground">
//                   No products selected
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

//       {/* BUTTONS */}
//       <div className="flex justify-end">
//         <Button
//           onClick={() => {
//             if (isRevision) {
//               const revisedItems = rows.filter((r) => r.status === 'Rejected');
//               console.log('Submitting revised proposal', {
//                 proposalId: proposal!.id,
//                 revisedItems,
//               });
//               navigate('/order-proposals');
//             } else {
//               submitProposal();
//             }
//           }}
//           disabled={!client || rows.length === 0 || loading || fetchingUnitCosts}
//         >
//           {loading ? 'Submitting...' : isRevision ? 'Submit Revision' : 'Submit for Approval'}
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

const UNITS = ['MB', 'GB', 'Quantity'] as const;

interface Proposal {
  id: string;
}

interface Props {
  proposal?: Proposal;
}

interface RowItem {
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
    setRows((prev) => {
      const existing = prev.map((r) => r.product);
      const added = selectedProducts.filter((p) => !existing.includes(p));
      const remaining = prev.filter((r) => selectedProducts.includes(r.product));

      return [
        ...remaining,
        ...added.map((p) => ({
          product: p,
          price: '',
          unit: 'MB',
          volume: '',
          current_rate: 0,
          current_invoice: 0,
        })),
      ];
    });
  }, [selectedProducts]);

  /* ================= FETCH UNIT COST ================= */
  useEffect(() => {
    const fetchUnitCosts = async () => {
      if (!client || rows.length === 0) return;

      const needsFetch = rows.some((r) => r.current_rate === '-');
      if (!needsFetch) return;

      setFetchingUnitCosts(true);

      try {
        const updated = await Promise.all(
          rows.map(async (row) => {
            if (row.current_rate !== '-') return row;

            const res = await ClientAPI.getUnitCost({
              party_id: Number(client),
              product_id: Number(row.product),
            });

            if (res?.status && res.unit_cost) {
              return {
                ...row,
                current_rate: Number(res.unit_cost),
                current_invoice: res.total ? Number(res.total) : 0,
                quantity: res.quantity ? Number(res.quantity) : 0,
              };
            }
            return row;
          })
        );

        setRows(updated);
      } finally {
        setFetchingUnitCosts(false);
      }
    };

    fetchUnitCosts();
  }, [rows.length, client]);

  /* ================= AUTO CALCULATION ================= */
  const updateRow = (product: string, data: Partial<RowItem>) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.product !== product) return r;

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

  const deleteRow = (product: string) => {
    setRows((prev) => prev.filter((r) => r.product !== product));
    setSelectedProducts((prev) => prev.filter((p) => p !== product));
  };

  /* ================= SUBMIT (UNCHANGED PAYLOAD) ================= */
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
        })),
      };

      await PriceProposalAPI.create(payload);
      navigate('/order-proposal-list');
    } finally {
      setLoading(false);
    }
  };

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
        <FloatingSearchSelect
          label="Client"
          value={client ?? undefined}
          onValueChange={setClient}
          disabled={clientLoading}
          searchable
        >
          {clients.map((c) => (
            <SelectItem key={c.value} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </FloatingSearchSelect>

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

              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.product}>
                  <TableCell>{products.find((p) => p.value === row.product)?.label}</TableCell>

                  <TableCell>{Number(row.current_rate || 0).toFixed(2)}</TableCell>

                  <TableCell>{Number(row.quantity || 0).toFixed(2)}</TableCell>

                  {/* Propose Price + Unit Dropdown */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={row.price}
                        onChange={(e) =>
                          updateRow(row.product, {
                            price: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="min-w-[80px]"
                      />
                      <span>/</span>
                      <select
                        className="border rounded-md px-2 py-1 min-w-[50px]"
                        value={row.unit}
                        onChange={(e) =>
                          updateRow(row.product, {
                            unit: e.target.value,
                          })
                        }
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Input
                      type="number"
                      value={row.volume}
                      onChange={(e) =>
                        updateRow(row.product, {
                          volume: e.target.value,
                        })
                      }
                      className="min-w-[180px]"
                    />
                  </TableCell>

                  <TableCell>{row.total_amount?.toFixed(2)}</TableCell>
                  <TableCell>{row.expected_invoice?.toFixed(2)}</TableCell>

                  <TableCell
                    className={
                      row.invoice_difference_unit_based && row.invoice_difference_unit_based >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {row.invoice_difference_unit_based?.toFixed(2)}
                  </TableCell>
                  <TableCell>{Number(row.current_invoice || 0).toFixed(2)}</TableCell>

                  <TableCell>{row.new_invoice_amount?.toFixed(2)}</TableCell>
                  <TableCell
                    className={
                      row.invoice_difference && row.invoice_difference >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {row.invoice_difference?.toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteRow(row.product)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center">
                  No products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end">
        <Button onClick={submitProposal} disabled={!client || rows.length === 0}>
          Submit for Approval
        </Button>
      </div>
    </div>
  );
}
