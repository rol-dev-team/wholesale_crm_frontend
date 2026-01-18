import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LeadStatus, LeadStage } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
  editable?: boolean;
  onStatusChange?: (status: LeadStatus) => void;
}

interface LeadStageBadgeProps {
  stage: LeadStage;
  className?: string;
  editable?: boolean;
  onStageChange?: (stage: LeadStage) => void;
}

const statusConfig: Record<LeadStatus, { label: string; variant: string }> = {
  pending_review: { label: "Pending Review", variant: "bg-warning/20 text-warning border-warning/30" },
  in_progress: { label: "In Progress", variant: "bg-primary/20 text-primary border-primary/30" },
  on_hold: { label: "On Hold", variant: "bg-muted text-muted-foreground border-border" },
  backlog: { label: "Backlog", variant: "bg-accent text-accent-foreground border-accent" },
  won: { label: "Won", variant: "bg-success/20 text-success border-success/30" },
  lost: { label: "Lost", variant: "bg-destructive/20 text-destructive border-destructive/30" },
};

const stageConfig: Record<LeadStage, { label: string; color: string }> = {
  new: { label: "New", color: "bg-primary/20 text-primary border-primary/30" },
  contacted: { label: "Contacted", color: "bg-warning/20 text-warning border-warning/30" },
  qualified: { label: "Qualified", color: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" },
  proposal: { label: "Proposal", color: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800" },
  negotiation: { label: "Negotiation", color: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800" },
  closed: { label: "Closed", color: "bg-success/20 text-success border-success/30" },
};

const statusOptions: LeadStatus[] = ['pending_review', 'in_progress', 'on_hold', 'backlog', 'won', 'lost'];
const stageOptions: LeadStage[] = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'];

export function LeadStatusBadge({ status, className, editable = false, onStatusChange }: LeadStatusBadgeProps) {
  const config = statusConfig[status];

  if (editable && onStatusChange) {
    return (
      <Select value={status} onValueChange={(value) => onStatusChange(value as LeadStatus)}>
        <SelectTrigger className={cn("h-7 w-auto min-w-[120px] border-0 p-0 focus:ring-0", className)}>
          <Badge variant="outline" className={cn("font-medium cursor-pointer", config.variant)}>
            {config.label}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((s) => (
            <SelectItem key={s} value={s}>
              <Badge variant="outline" className={cn("font-medium", statusConfig[s].variant)}>
                {statusConfig[s].label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.variant, className)}>
      {config.label}
    </Badge>
  );
}

export function LeadStageBadge({ stage, className, editable = false, onStageChange }: LeadStageBadgeProps) {
  const config = stageConfig[stage];

  if (editable && onStageChange) {
    return (
      <Select value={stage} onValueChange={(value) => onStageChange(value as LeadStage)}>
        <SelectTrigger className={cn("h-7 w-auto min-w-[120px] border-0 p-0 focus:ring-0", className)}>
          <Badge variant="outline" className={cn("font-medium cursor-pointer", config.color)}>
            {config.label}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          {stageOptions.map((s) => (
            <SelectItem key={s} value={s}>
              <Badge variant="outline" className={cn("font-medium", stageConfig[s].color)}>
                {stageConfig[s].label}
              </Badge>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-medium", config.color, className)}>
      {config.label}
    </Badge>
  );
}
