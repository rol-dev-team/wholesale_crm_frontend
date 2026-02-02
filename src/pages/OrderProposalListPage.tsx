// src/pages/OrderProposalListPage.tsx
import { useState } from "react";
import OrderProposalList from "../components/approval/OrderProposalList";
import { Button } from "@/components/ui/button";

export default function OrderProposalListPage() {
  return (
    <div className="p-6 space-y-6">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Approval Requests</h1>
      </div>

      <OrderProposalList />
    </div>
  );
}
