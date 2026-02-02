'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { SelectItem } from '@/components/ui/select';
import { FloatingSelect } from '../ui/FloatingSelect';  

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

// ---- proposal data model ----
interface ProposalItem {
  product: string;
  price: string;
  unit: string;
  volume: string;
}

interface Proposal {
  id: string;
  kam: string;
  client: string;
  level: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  pendingUnder?: string;
  rejectedBy?: string;
  rejectionMessage?: string;
  items: ProposalItem[];
}

// ---- mock proposals ----
const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'OP-001',
    kam: 'KAM A',
    client: 'Client A',
    level: 1,
    status: 'Approved',
    items: [
      { product: 'Product A', price: '20', unit: 'MB', volume: '300' },
      { product: 'Product B', price: '20', unit: 'MB', volume: '300' },
      { product: 'Product C', price: '20', unit: 'MB', volume: '300' },
    ],
  },
  {
    id: 'OP-002',
    kam: 'KAM A',
    client: 'Client A',
    level: 2,
    status: 'Rejected',
    rejectedBy: 'Ashik',
    rejectionMessage: 'Pricing too low',
    items: [{ product: 'Product B', price: '40', unit: 'Quantity', volume: '500' }],
  },
  {
    id: 'OP-003',
    kam: 'KAM A',
    client: 'Client A',
    level: 1,
    status: 'Pending',
    pendingUnder: 'Samir',
    items: [
      { product: 'Product A', price: '30', unit: 'GB', volume: '400' },
      { product: 'Product B', price: '30', unit: 'GB', volume: '400' },
      { product: 'Product C', price: '30', unit: 'GB', volume: '400' },
    ],
  },
];

export default function OrderProposalList() {
  const { currentUser, hasPermission } = useAuth();

  const navigate = useNavigate();

  const [filter, setFilter] = useState<'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [rejecting, setRejecting] = useState<Proposal | null>(null);
  const [rejectMsg, setRejectMsg] = useState('');
  const [rejectingRow, setRejectingRow] = useState<{
  proposal: Proposal;
  item: ProposalItem;
} | null>(null);

  const [rejectData, setRejectData] = useState({
  price: '',
  unit: '',
  volume: '',
  reason: '',
  message: '',
});

const handleRejectClick = (proposal: Proposal, item: ProposalItem) => {
  setRejectingRow({ proposal, item });
  setRejectData({
    price: item.price,
    unit: item.unit,
    volume: item.volume,
    reason: '',
    message: '',
  });
};
  if (!currentUser) return null;

  const proposals = useMemo(() => MOCK_PROPOSALS.filter((p) => p.status === filter), [filter]);

  // const canSeeActions =
  //   hasPermission('revise_order_proposal') || hasPermission('approve_order_proposal');

  return (
    <div className="space-y-4">
  <div className="flex items-center justify-between">
    {/* STATUS TOGGLE */}
    <div className="flex gap-2">
      {['Pending', 'Approved', 'Rejected'].map((s) => (
        <Button
          key={s}
          variant={filter === s ? 'default' : 'outline'}
          onClick={() => setFilter(s as any)}
        >
          {s}
        </Button>
      ))}
    </div>

    {/* STATIC PIPELINE */}
    <div className="flex items-center space-x-2 text-sm font-medium text-gray-600">
      <span>Level 1</span>
      <span className="text-gray-400">→</span>
      <span>Level 2</span>
      <span className="text-gray-400">→</span>
      <span>Level 3</span>
    </div>
  </div>


      

      <div className="border rounded-xl">
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>KAM</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Proposed Unit Price</TableHead>
              <TableHead>Proposed Volume</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>

              {filter === 'Pending' && <TableHead>Pending Under</TableHead>}
              {filter === 'Rejected' && <TableHead>Rejected By</TableHead>}
              {filter === 'Rejected' && <TableHead>Rejection Message</TableHead>}

              {<TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {proposals.map((p) =>
              p.items.map((item, idx) => (
                <TableRow key={`${p.id}-${idx}`}>
                  {idx === 0 && (
                    <>
                      <TableCell rowSpan={p.items.length}>{p.kam}</TableCell>
                      <TableCell rowSpan={p.items.length}>{p.client}</TableCell>
                    </>
                  )}

                  <TableCell>{item.product}</TableCell>
                  <TableCell>
                    {item.price}/{item.unit}
                  </TableCell>
                  <TableCell>{item.volume}</TableCell>
                  <TableCell className="font-semibold">
                    {(Number(item.price) || 0) * (Number(item.volume) || 0)}
                  </TableCell>
                  <TableCell>{p.status}</TableCell>

                  {filter === 'Pending' && <TableCell>{p.pendingUnder}</TableCell>}

                  {filter === 'Rejected' && <TableCell>{p.rejectedBy}</TableCell>}

                  {filter === 'Rejected' && <TableCell>{p.rejectionMessage}</TableCell>}

                  <TableCell>
                    <div className="flex gap-2">
                      {/* Revise (KAM) */}
                      {currentUser?.role?.toLowerCase() === 'super_admin' &&
                        p.status === 'Rejected' && (
                          <Button
                            size="sm"
                            className="bg-yellow-400 text-white hover:bg-yellow-500"
                            onClick={() =>
                              navigate('/order-proposal/revise', { state: { proposal: p } })
                            }
                          >
                            Revise
                          </Button>
                        )}

                      {/* Approve / Reject (Supervisor & Super Admin) */}
                      <>
                        <Button size="sm">Approve</Button>
                       <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRejectClick(p, item)}
                      >
                        Reject
                      </Button>

                      </>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reject dialog */}
    <Dialog open={!!rejectingRow} onOpenChange={() => setRejectingRow(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reject Proposal</DialogTitle>
    </DialogHeader>

    <div className="space-y-4">
      <FloatingInput
        label="Price"
        value={rejectData.price}
        onChange={(e) =>
          setRejectData((prev) => ({ ...prev, price: e.target.value }))
        }
      />
     
      <FloatingInput
        label="Volume"
        value={rejectData.volume}
        onChange={(e) =>
          setRejectData((prev) => ({ ...prev, volume: e.target.value }))
        }
      />
      <FloatingInput
        label="Rejection Reason"
        value={rejectData.reason}
        onChange={(e) =>
          setRejectData((prev) => ({ ...prev, reason: e.target.value }))
        }
      />
      <FloatingInput
        label="Message to user"
        value={rejectData.message}
        onChange={(e) =>
          setRejectData((prev) => ({ ...prev, message: e.target.value }))
        }
      />
    </div>

    <Button
      variant="destructive"
      className="mt-4"
      onClick={() => {
        console.log('Rejected Row:', {
          proposalId: rejectingRow?.proposal.id,
          item: rejectingRow?.item,
          ...rejectData,
        });
        // TODO: send this to backend to update the proposal and notify creator

        setRejectingRow(null);
        setRejectData({ price: '', unit: '', volume: '', reason: '', message: '' });
      }}
    >
      Confirm Reject
    </Button>
  </DialogContent>
</Dialog>


    </div>
  );
}
