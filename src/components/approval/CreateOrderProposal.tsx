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

//   /* ================= STATE ================= */

//   const [client, setClient] = useState<string | null>(null);
//   const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
//   const [status, setStatus] = useState<'active' | 'inactive'>('active');

//   const [rows, setRows] = useState<RowItem[]>([]);
//   const [clients, setClients] = useState<Option[]>([]);
//   const [products, setProducts] = useState<Option[]>([]);
//   const [loading, setLoading] = useState(false);

//   /* ================= LOAD DROPDOWNS ================= */
//   useEffect(() => {
//     const loadClients = async () => {
//       try {
//         setLoading(true);
//         setClient(null); // reset selection when switching

//         let response;

//         if (status === 'active') {
//           // 🔵 ACTIVE → Prism
//           response = await PrismAPI.getClientList();
//         } else {
//           // 🟠 INACTIVE → Local DB
//           response = await LocalClientAPI.getInactiveClients();
//         }

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
//         setLoading(false);
//       }
//     };

//     loadClients();
//   }, [status]);

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
//         })),
//       ];
//     });
//   }, [selectedProducts]);

//   /* ================= HELPERS ================= */

//   const updateRow = (product: string, data: Partial<RowItem>) => {
//     setRows((prev) => prev.map((r) => (r.product === product ? { ...r, ...data } : r)));
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
//         //  active: status === 'active',
//         items: rows.map((r) => ({
//           product_id: Number(r.product),
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
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <FloatingSearchSelect
//           label="Client"
//           value={client ?? undefined}
//           onValueChange={isRevision ? undefined : setClient}
//           disabled={isRevision || loading}
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

//       <div className="border rounded-xl">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Product</TableHead>
//               <TableHead>Current Rate</TableHead>
//               <TableHead className="w-[280px]">Price / Unit(Proposed)</TableHead>
//               <TableHead>Volume</TableHead>
//               <TableHead>Total Amount</TableHead>
//               <TableHead />
//             </TableRow>
//           </TableHeader>

//           <TableBody>
//             {rows.map((row) => {
//               const isEditable = !isRevision || row.status === 'Rejected';

//               return (
//                 <TableRow key={`product-row-${row.product}`}>
//                   <TableCell className="font-medium">
//                     {products.find((p) => p.value === row.product)?.label}
//                   </TableCell>
//                   <TableCell className="font-medium">-</TableCell>

//                   <TableCell>
//                     <div className="flex items-center gap-2">
//                       <Input
//                         type="number"
//                         value={row.price}
//                         onChange={(e) =>
//                           isEditable && updateRow(row.product, { price: e.target.value })
//                         }
//                         disabled={!isEditable}
//                       />
//                       <span>/</span>
//                       <select
//                         className="border rounded-md px-2 py-1"
//                         value={row.unit}
//                         onChange={(e) =>
//                           isEditable && updateRow(row.product, { unit: e.target.value })
//                         }
//                         disabled={!isEditable}
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
//                         isEditable && updateRow(row.product, { volume: e.target.value })
//                       }
//                       disabled={!isEditable}
//                     />
//                   </TableCell>

//                   <TableCell>
//                     <Input
//                       type="number"
//                       value={row.total_amount || ''}
//                       onChange={(e) =>
//                         isEditable && updateRow(row.product, { total_amount: e.target.value })
//                       }
//                       disabled={!isEditable}
//                     />
//                   </TableCell>

//                   <TableCell>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => isEditable && deleteRow(row.product)}
//                       disabled={!isEditable}
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}

//             {rows.length === 0 && (
//               <TableRow>
//                 <TableCell colSpan={5} className="text-center text-muted-foreground">
//                   No products selected
//                 </TableCell>
//               </TableRow>
//             )}
//           </TableBody>
//         </Table>
//       </div>

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
//               navigate('/order-proposal-list');
//             }
//           }}
//           disabled={!client || rows.length === 0}
//         >
//           {isRevision ? 'Submit Revision' : 'Submit for Approval'}
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
import { FloatingInput } from '../ui/FloatingInput';
import { FloatingMultiSelect } from '@/components/ui/FloatingMultiSelect';
import { Trash2 } from 'lucide-react';
import { PrismAPI } from '@/api';
import { ClientAPI } from '@/api/clientApi';

const UNITS = ['MB', 'GB', 'Quantity'] as const;

/* ================= TYPES ================= */

interface ProposalItem {
  product: string;
  price: string;
  unit: string;
  volume: string;
  status?: 'Approved' | 'Rejected';
}

interface Proposal {
  id: string;
  active: boolean;
  client: string;
  items: ProposalItem[];
}

interface Props {
  proposal?: Proposal;
}

interface RowItem {
  product: string;
  price: string;
  unit: string;
  volume: string;
  total_amount?: string;
  current_rate?: string | number;
  status?: 'Approved' | 'Rejected';
}

interface Option {
  label: string;
  value: string;
}

/* ================= COMPONENT ================= */

export default function CreateOrderProposal({ proposal }: Props) {
  const navigate = useNavigate();
  const isRevision = !!proposal;

  /* ================= STATE ================= */

  const [client, setClient] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'inactive' | 'organisation'>('active');

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
        setClientLoading(true);
        setClients([]);

        const response = await PrismAPI.getClientsByStatus(status);
        setClients(
          response.data.map((c: any) => ({
            label: c.client,
            value: String(c.id),
          }))
        );
      } catch (err) {
        console.error('Client load failed', err);
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
      } catch (err) {
        console.error('Product load failed', err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  /* ================= UPDATE ROWS WHEN PRODUCTS CHANGE ================= */
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
          current_rate: '-',
        })),
      ];
    });
  }, [selectedProducts]);

  /* ================= FETCH UNIT COSTS ================= */
  // useEffect(() => {
  //   const fetchUnitCosts = async () => {
  //     // ✅ FIX: Check if we have client and rows with products that don't have rates yet
  //     if (!client || rows.length === 0) {
  //       console.log('⚠️ Skipping fetch: client or rows empty');
  //       return;
  //     }

  //     // Check if any row still has '-' as current_rate
  //     const needsFetch = rows.some((r) => r.current_rate === '-');
  //     if (!needsFetch) {
  //       console.log('✅ All rows already have rates');
  //       return;
  //     }

  //     setFetchingUnitCosts(true);

  //     try {
  //       console.log('🔵 Fetching unit costs for rows:', rows);

  //       // Call ClientAPI.getUnitCost for each product
  //       const updatedRows = await Promise.all(
  //         rows.map(async (row) => {
  //           // Skip if already fetched
  //           if (row.current_rate !== '-') {
  //             return row;
  //           }

  //           try {
  //             console.log('🔵 Fetching unit cost for:', {
  //               party_id: Number(client),
  //               product_id: Number(row.product),
  //             });

  //             const response = await ClientAPI.getUnitCost({
  //               party_id: Number(client),
  //               product_id: Number(row.product),
  //             });

  //             console.log('🔵 Full Response:', response);

  //             // ✅ FIX: Response is directly { status: true, unit_cost: "33.000000" }, not nested in response.data
  //             if (response && response.status && response.unit_cost) {
  //               const unitCost = parseFloat(response.unit_cost);
  //               console.log('🟢 Unit cost found:', unitCost);

  //               return {
  //                 ...row,
  //                 current_rate: unitCost,
  //               };
  //             } else {
  //               console.warn('🟡 No unit cost in response:', response);
  //               return row;
  //             }
  //           } catch (error) {
  //             console.error(`❌ Failed to fetch unit cost for product ${row.product}:`, error);
  //             return row;
  //           }
  //         })
  //       );

  //       console.log('🔵 Updated rows:', updatedRows);
  //       setRows(updatedRows);
  //     } catch (error) {
  //       console.error('❌ Failed to fetch unit costs', error);
  //     } finally {
  //       setFetchingUnitCosts(false);
  //     }
  //   };

  //   // ✅ FIX: Depend on rows instead of selectedProducts to ensure rows are created first
  //   fetchUnitCosts();
  // }, [client, rows.length]);

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
              return { ...row, current_rate: Number(res.unit_cost) };
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
  }, [rows.length]);

  /* ================= HELPERS ================= */

  const updateRow = (product: string, data: Partial<RowItem>) => {
    setRows((prev) => prev.map((r) => (r.product === product ? { ...r, ...data } : r)));
  };

  const deleteRow = (product: string) => {
    setRows((prev) => prev.filter((r) => r.product !== product));
    setSelectedProducts((prev) => prev.filter((p) => p !== product));
  };

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
          total_amount: Number(r.total_amount),
        })),
      };
      await PriceProposalAPI.create(payload);
      navigate('/order-proposal-list');
    } catch (error) {
      console.error('Create proposal failed', error);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* STATUS RADIO BUTTONS */}
      <div className="flex items-center space-x-6">
        <span className="font-medium">Status:</span>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="status"
            value="active"
            checked={status === 'active'}
            onChange={() => setStatus('active')}
            disabled={loading}
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
            disabled={loading}
            className="accent-blue-500"
          />
          <span>Inactive</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="status"
            value="organisation"
            checked={status === 'organisation'}
            onChange={() => setStatus('organisation')}
            disabled={loading}
            className="accent-blue-500"
          />
          <span>Organisation</span>
        </label>
      </div>

      {/* CLIENT & PRODUCTS SELECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FloatingSearchSelect
          label="Client"
          value={client ?? undefined}
          onValueChange={isRevision ? undefined : setClient}
          disabled={clientLoading}
          searchable
        >
          {clients.map((c) => (
            <SelectItem key={`client-${c.value}`} value={c.value}>
              {c.label}
            </SelectItem>
          ))}
        </FloatingSearchSelect>

        <FloatingMultiSelect
          label="Products"
          value={selectedProducts}
          options={products}
          onChange={isRevision ? undefined : setSelectedProducts}
          disabled={isRevision || loading}
        />
      </div>

      {/* TABLE */}
      <div className="border rounded-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Current Rate</TableHead>
              <TableHead>Price / Unit (Proposed)</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => {
                const isEditable = !isRevision || row.status === 'Rejected';

                return (
                  <TableRow key={`product-row-${row.product}`}>
                    <TableCell className="font-medium">
                      {products.find((p) => p.value === row.product)?.label}
                    </TableCell>

                    <TableCell className="font-medium">
                      {fetchingUnitCosts ? (
                        <span className="text-gray-400 text-sm">Loading...</span>
                      ) : row.current_rate && row.current_rate !== '-' ? (
                        <span className="text-blue-600 font-semibold">
                          {typeof row.current_rate === 'number'
                            ? row.current_rate.toFixed(2)
                            : row.current_rate}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={row.price}
                          onChange={(e) =>
                            isEditable && updateRow(row.product, { price: e.target.value })
                          }
                          disabled={!isEditable}
                          placeholder="0"
                        />
                        <span>/</span>
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

                    <TableCell>
                      <Input
                        type="number"
                        value={row.volume}
                        onChange={(e) =>
                          isEditable && updateRow(row.product, { volume: e.target.value })
                        }
                        disabled={!isEditable}
                        placeholder="0"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        value={row.total_amount || ''}
                        onChange={(e) =>
                          isEditable && updateRow(row.product, { total_amount: e.target.value })
                        }
                        disabled={!isEditable}
                        placeholder="0"
                      />
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
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No products selected
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            if (isRevision) {
              const revisedItems = rows.filter((r) => r.status === 'Rejected');
              console.log('Submitting revised proposal', {
                proposalId: proposal!.id,
                revisedItems,
              });
              navigate('/order-proposals');
            } else {
              submitProposal();
            }
          }}
          disabled={!client || rows.length === 0 || loading || fetchingUnitCosts}
        >
          {loading ? 'Submitting...' : isRevision ? 'Submit Revision' : 'Submit for Approval'}
        </Button>
      </div>
    </div>
  );
}
