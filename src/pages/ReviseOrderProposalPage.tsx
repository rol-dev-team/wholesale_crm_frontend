import { useLocation, useNavigate } from "react-router-dom";
import CreateOrderProposal from "../components/approval/CreateOrderProposal";

export default function ReviseOrderProposalPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const proposal = state?.proposal;

  if (!proposal) {
    return (
      <div className="p-6">
        <p>No proposal data found. Go back to the proposal list.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Revise Proposal</h1>

      <CreateOrderProposal proposal={proposal} />
    </div>
  );
}
