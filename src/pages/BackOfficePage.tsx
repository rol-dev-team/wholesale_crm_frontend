import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { toast } from "sonner";
import { 
  initialLeads, 
  initialKAMs, 
  systemUsers,
  formatCurrency, 
  formatDate,
  Lead,
} from "@/data/mockData";
import { 
  Inbox, 
  ArrowRight, 
  Building2, 
  User, 
  Clock,
  CheckCircle2,
  UserPlus,
  Users,
  Briefcase,
  TrendingUp,
  XCircle,
  Eye,
  LayoutList,
  LayoutGrid,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { TakaIcon } from '@/components/ui/taka-icon';
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function BackOfficePage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedKamId, setSelectedKamId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Get back office user IDs (no helpdesk role exists anymore)
  const backOfficeUserIds = systemUsers
    .filter(u => u.role === 'boss' || u.role === 'super_admin')
    .map(u => u.id);

  // Pending leads: status is pending_review
  const pendingLeads = leads.filter(
    lead => lead.status === 'pending_review'
  );

  // Ongoing leads: have an assigned KAM and are in progress
  const ongoingLeads = leads.filter(
    lead => lead.assignedKamId !== null && 
            lead.status !== 'pending_review' &&
            lead.status !== 'won' &&
            lead.status !== 'lost'
  );

  const handleOpenAssignModal = (lead: Lead) => {
    setSelectedLead(lead);
    setSelectedKamId("");
    setAssignModalOpen(true);
  };

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setDetailSheetOpen(true);
  };

  const handleAssignKam = () => {
    if (!selectedLead || !selectedKamId) return;

    const kam = initialKAMs.find(k => k.id === selectedKamId);
    if (!kam) return;

    setLeads(prev => prev.map(lead => 
      lead.id === selectedLead.id 
        ? {
            ...lead,
            assignedKamId: kam.id,
            assignedKamName: kam.name,
            status: 'in_progress' as const,
            updatedAt: new Date().toISOString(),
          }
        : lead
    ));

    toast.success(`Lead assigned to ${kam.name}`);
    setAssignModalOpen(false);
    setSelectedLead(null);
    setSelectedKamId("");
  };

  const totalPendingValue = pendingLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);
  const totalOngoingValue = ongoingLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);

  // Calculate KAM workload
  const kamWorkload = initialKAMs.map(kam => {
    const assignedLeads = leads.filter(
      lead => lead.assignedKamId === kam.id && 
              lead.status !== 'won' && 
              lead.status !== 'lost'
    );
    const totalValue = assignedLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);
    return {
      ...kam,
      activeLeads: assignedLeads.length,
      totalValue,
    };
  }).sort((a, b) => b.activeLeads - a.activeLeads);

  const maxLeads = Math.max(...kamWorkload.map(k => k.activeLeads), 1);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Back Office Dashboard</h1>
          <p className="text-muted-foreground">Manage and assign leads from helpdesk</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Inbox className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Leads</p>
                <p className="text-2xl font-bold">{pendingLeads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <ArrowRight className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ongoing Leads</p>
                <p className="text-2xl font-bold">{ongoingLeads.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <TakaIcon className="text-lg text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPendingValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ongoing Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalOngoingValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KAM Workload Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            KAM Workload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kamWorkload.map((kam) => (
              <div 
                key={kam.id} 
                className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{kam.name}</p>
                    <p className="text-xs text-muted-foreground">{kam.division} • {kam.zone}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5" />
                      Active Leads
                    </span>
                    <span className="font-semibold">{kam.activeLeads}</span>
                  </div>
                  <Progress value={(kam.activeLeads / maxLeads) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Pipeline Value
                    </span>
                    <span className="font-semibold text-green-600">{formatCurrency(kam.totalValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Leads Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-amber-500" />
              Pending Leads
              {pendingLeads.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingLeads.length}</Badge>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No pending leads from helpdesk</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Division / Zone</TableHead>
                  <TableHead>Expected Value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {lead.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {lead.contact}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span>{lead.division}</span>
                        <span className="text-muted-foreground"> / {lead.area}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(lead.expectedValue)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(lead.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewDetails(lead)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenAssignModal(lead)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ongoing Leads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-blue-500" />
            Ongoing Leads
            {ongoingLeads.length > 0 && (
              <Badge variant="secondary" className="ml-2">{ongoingLeads.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ongoingLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ArrowRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No ongoing leads assigned from back office yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lead</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Assigned KAM</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Expected Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ongoingLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {lead.company}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {lead.assignedKamName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{lead.stage}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(lead.expectedValue)}</TableCell>
                    <TableCell>
                      <LeadStatusBadge status={lead.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatDate(lead.updatedAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assign KAM Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign KAM to Lead</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedLead.name}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.company}</p>
                <p className="text-sm font-medium mt-2">{formatCurrency(selectedLead.expectedValue)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select KAM</label>
                <Select value={selectedKamId} onValueChange={setSelectedKamId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a KAM to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {initialKAMs.map((kam) => {
                      const workload = kamWorkload.find(k => k.id === kam.id);
                      return (
                        <SelectItem key={kam.id} value={kam.id}>
                          <div className="flex flex-col">
                            <span>{kam.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {kam.division} - {kam.zone} • {workload?.activeLeads || 0} active leads
                            </span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignKam} disabled={!selectedKamId}>
              Assign KAM
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Lead Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Lead Details</SheetTitle>
          </SheetHeader>
          {selectedLead && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                  <p className="text-muted-foreground">{selectedLead.company}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Contact</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {selectedLead.contact}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {selectedLead.phone}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {selectedLead.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Expected Value</p>
                    <p className="font-medium flex items-center gap-2">
                      <TakaIcon className="text-green-500" />
                      {formatCurrency(selectedLead.expectedValue)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Division / Zone</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {selectedLead.division} / {selectedLead.area}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Department</p>
                  <p className="font-medium">{selectedLead.department}</p>
                </div>

                {selectedLead.notes && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Notes</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Created: {formatDate(selectedLead.createdAt)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last Updated: {formatDate(selectedLead.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setDetailSheetOpen(false);
                    handleOpenAssignModal(selectedLead);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign KAM
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
