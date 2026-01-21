import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LeadStatusBadge, LeadStageBadge } from "./LeadStatusBadge";
import { Search, MoreHorizontal, Eye, Edit, Trash2, Filter, CalendarPlus, Forward, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lead, LeadStatus, LeadStage } from "@/data/mockData";
import { formatCurrency, formatDate, products, leadSources } from "@/data/mockData";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface LeadListViewProps {
  leads: Lead[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onUpdateLead: (lead: Lead) => void;
  onAddActivity: (leadId: string) => void;
  onForwardLead?: (lead: Lead) => void;
  onStageChange?: (leadId: string, newStage: LeadStage) => void;
  pageSize?: number;
  showFilters?: boolean;
}

export function LeadListView({ 
  leads, 
  onView, 
  onEdit, 
  onDelete, 
  onUpdateLead, 
  onAddActivity, 
  onForwardLead,
  onStageChange,
  pageSize = 5,
  showFilters = true
}: LeadListViewProps) {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.businessEntity?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesStage = stageFilter === "all" || lead.stage === stageFilter;
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [leads, searchQuery, statusFilter, stageFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const getProductNames = (productIds?: string[]) => {
    if (!productIds || productIds.length === 0) return [];
    return productIds.map(id => products.find(p => p.id === id)?.name).filter(Boolean);
  };

  // Get lead source display - "Self" if created by current KAM, otherwise show the source from helpdesk
  const getLeadSourceDisplay = (lead: Lead) => {
    // If the lead was created by the current user (KAM), show "Self"
    if (lead.createdBy === currentUser?.id) {
      return { label: 'Self', variant: 'default' as const };
    }
    // Otherwise show the source from helpdesk
    if (lead.source) {
      const sourceInfo = leadSources.find(s => s.value === lead.source);
      return { label: sourceInfo?.label || lead.source, variant: 'outline' as const };
    }
    return { label: 'Direct', variant: 'outline' as const };
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange(); }}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as LeadStatus | "all"); handleFilterChange(); }}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="backlog">Backlog</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={(v) => { setStageFilter(v as LeadStage | "all"); handleFilterChange(); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Client</TableHead>
              <TableHead className="font-semibold">Products</TableHead>
              <TableHead className="font-semibold">Source</TableHead>
              <TableHead className="font-semibold">Assigned KAM</TableHead>
              <TableHead className="font-semibold">Stage</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Value</TableHead>
              <TableHead className="font-semibold">Assigned Date</TableHead>
              <TableHead className="font-semibold">Duration</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                  No leads found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(lead)}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{lead.company}</p>
                      <p className="text-sm text-muted-foreground">{lead.businessEntity || '-'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getProductNames(lead.products).length > 0 ? (
                        getProductNames(lead.products).slice(0, 2).map((name, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                      {(lead.products?.length || 0) > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{(lead.products?.length || 0) - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const sourceDisplay = getLeadSourceDisplay(lead);
                      return (
                        <Badge variant={sourceDisplay.variant} className="text-xs capitalize">
                          {sourceDisplay.label}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {lead.assignedKamName ? (
                      <span className="text-foreground">{lead.assignedKamName}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <LeadStageBadge 
                      stage={lead.stage} 
                      editable={!!onStageChange}
                      onStageChange={(newStage) => onStageChange?.(lead.id, newStage)}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <LeadStatusBadge 
                      status={lead.status} 
                      editable 
                      onStatusChange={(newStatus) => onUpdateLead({ ...lead, status: newStatus })} 
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(lead.expectedValue)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assignedDate ? formatDate(lead.assignedDate) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.assignedDate ? formatDistanceToNow(new Date(lead.assignedDate), { addSuffix: false }) : '-'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(lead); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(lead); }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onAddActivity(lead.id); }}>
                          <CalendarPlus className="h-4 w-4 mr-2" />
                          Add Activity
                        </DropdownMenuItem>
                        {onForwardLead && lead.assignedKamId && (
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onForwardLead(lead); }}>
                            <Forward className="h-4 w-4 mr-2" />
                            Forward Lead
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); onDelete(lead.id); }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {paginatedLeads.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} - {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} leads
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
