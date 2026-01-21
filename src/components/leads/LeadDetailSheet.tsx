import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LeadStatusBadge, LeadStageBadge } from "./LeadStatusBadge";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Video,
  PhoneCall,
  MessageSquare,
  CheckSquare,
  RefreshCw,
  Plus,
  Package,
  Briefcase,
  Clock,
} from "lucide-react";
import { TakaIcon } from '@/components/ui/taka-icon';
import type { Lead, Activity, ActivityType } from "@/data/mockData";
import { formatCurrency, formatDate, formatDateTime, products } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface LeadDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  activities: Activity[];
  onEdit: (lead: Lead) => void;
  onClose: (leadId: string, status: "won" | "lost", reason?: string) => void;
  onAddActivity: (leadId: string) => void;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  physical_meeting: MapPin,
  virtual_meeting: Video,
  call: PhoneCall,
  email: MessageSquare,
  task: CheckSquare,
  follow_up: RefreshCw,
};

const activityLabels: Record<ActivityType, string> = {
  physical_meeting: "Physical Meeting",
  virtual_meeting: "Virtual Meeting",
  call: "Call",
  email: "Email",
  task: "Task",
  follow_up: "Follow-up",
};

const getProductNames = (productIds?: string[]) => {
  if (!productIds || productIds.length === 0) return [];
  return productIds.map(id => products.find(p => p.id === id)?.name).filter(Boolean);
};

export function LeadDetailSheet({
  open,
  onOpenChange,
  lead,
  activities,
  onEdit,
  onClose,
  onAddActivity,
}: LeadDetailSheetProps) {
  if (!lead) return null;

  const leadActivities = activities.filter((a) => a.clientId === lead.id);
  const upcomingActivities = leadActivities.filter((a) => !a.completedAt);
  const completedActivities = leadActivities.filter((a) => a.completedAt);
  const productNames = getProductNames(lead.products);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl">{lead.company}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">{lead.businessEntity || '-'}</p>
            </div>
            <div className="flex gap-2">
              <LeadStageBadge stage={lead.stage} />
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="activities" className="flex-1">Activities</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Business Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Business Entity</span>
                    <span className="text-sm font-medium">{lead.businessEntity || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Business Type</span>
                    <span className="text-sm font-medium">{lead.division || '-'}</span>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Products
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {productNames.length > 0 ? (
                        productNames.map((name, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No products selected</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.company}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.contact || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{lead.phone || '-'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {lead.email ? (
                      <a href={`mailto:${lead.email}`} className="text-sm text-primary hover:underline">
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-sm">-</span>
                    )}
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{lead.area || '-'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Lead Details */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Lead Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assigned KAM</span>
                    <span className="text-sm font-medium">{lead.assignedKamName || "Unassigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stage</span>
                    <LeadStageBadge stage={lead.stage} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <LeadStatusBadge status={lead.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expected Revenue</span>
                    <span className="text-sm font-medium text-success flex items-center gap-1">
                      <TakaIcon className="text-sm" />
                      {formatCurrency(lead.expectedValue)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Assigned Date</span>
                    <span className="text-sm">{lead.assignedDate ? formatDate(lead.assignedDate) : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created</span>
                    <span className="text-sm">{formatDate(lead.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Updated</span>
                    <span className="text-sm">{formatDate(lead.updatedAt)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {lead.notes && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.notes}</p>
                  </CardContent>
                </Card>
              )}

              {/* Closing Reason */}
              {lead.status === "lost" && lead.closingReason && (
                <Card className="border-destructive/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-destructive">
                      Closing Reason
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{lead.closingReason}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="activities" className="space-y-4 mt-4">
              {/* Add Activity Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onAddActivity(lead.id)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>

              {/* Upcoming Activities */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming ({upcomingActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No upcoming activities</p>
                  ) : (
                    <div className="space-y-3">
                      {upcomingActivities.map((activity) => {
                        const Icon = activityIcons[activity.type];
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                            <Icon className="h-4 w-4 mt-0.5 text-primary" />
                            <div>
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {activityLabels[activity.type]} • {formatDateTime(activity.scheduledAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Completed Activities */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Completed ({completedActivities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {completedActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No completed activities</p>
                  ) : (
                    <div className="space-y-3">
                      {completedActivities.map((activity) => {
                        const Icon = activityIcons[activity.type];
                        return (
                          <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                            <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(activity.completedAt!)}
                              </p>
                              {activity.outcome && (
                                <p className="text-sm mt-1 text-muted-foreground">{activity.outcome}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Actions */}
        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onEdit(lead)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Lead
            </Button>
          </div>
          {lead.status === "in_progress" && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-success text-success hover:bg-success/10"
                onClick={() => onClose(lead.id, "won")}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Won
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                onClick={() => onClose(lead.id, "lost")}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Mark as Lost
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
