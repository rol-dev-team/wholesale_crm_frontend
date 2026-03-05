

// import { useState } from "react";
// import OrderProposalListHistory from "../components/approval/OrderProposalListHistory";
// import { Button } from "@/components/ui/button";



// export default function OrderProposalListPageHistory() {
//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Approval Requests</h1>


//       <OrderProposalListHistory />
//     </div>
//   );
// }



import { useState } from 'react';
import OrderProposalListHistory from '../components/approval/OrderProposalListHistory';
import {
  ProposalFilterDrawer,
  DEFAULT_PROPOSAL_FILTERS,
  type ProposalFilters,
} from '@/components/filters/Proposalfilterdrawer';

export default function OrderProposalListPageHistory() {
  const [filters, setFilters] = useState<ProposalFilters>(DEFAULT_PROPOSAL_FILTERS);

  const handleApply = (newFilters: ProposalFilters) => {
    setFilters(newFilters);
  };

  const handleClear = () => {
    setFilters(DEFAULT_PROPOSAL_FILTERS);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approval Requests</h1>

        {/* Filter drawer trigger */}
        <ProposalFilterDrawer
          filters={filters}
          onApply={handleApply}
          onClear={handleClear}
        />
      </div>

      {/* List gets filters injected */}
      <OrderProposalListHistory filters={filters} />
    </div>
  );
}