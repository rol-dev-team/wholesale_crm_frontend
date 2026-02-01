

import { useState } from "react";
import OrderProposalList from "../components/approval/OrderProposalList";
import { Button } from "@/components/ui/button";



export default function OrderProposalListPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Approval Requests</h1>


      <OrderProposalList />
    </div>
  );
}
