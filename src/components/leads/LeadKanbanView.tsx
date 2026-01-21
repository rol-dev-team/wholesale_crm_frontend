import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { GripVertical, User, Building2, MoreHorizontal, Eye, Edit, CalendarPlus, Calendar, Package, Forward, ChevronLeft, ChevronRight } from "lucide-react";
import { TakaIcon } from '@/components/ui/taka-icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Lead, LeadStage, PipelineStage, Activity } from "@/data/mockData";
import { pipelineStages, formatCurrency, formatDate, products } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { format, isAfter } from "date-fns";

interface LeadKanbanViewProps {
  leads: Lead[];
  activities?: Activity[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onStageChange: (leadId: string, newStage: LeadStage) => void;
  onAddActivity: (leadId: string) => void;
  onViewActivity?: (activity: Activity) => void;
  onForwardLead?: (lead: Lead) => void;
}

interface KanbanColumnProps {
  stage: PipelineStage;
  leads: Lead[];
  activities: Activity[];
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onAddActivity: (leadId: string) => void;
  onViewActivity?: (activity: Activity) => void;
  onForwardLead?: (lead: Lead) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, stage: LeadStage) => void;
}

interface LeadCardProps {
  lead: Lead;
  upcomingActivity?: Activity;
  onView: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onAddActivity: (leadId: string) => void;
  onViewActivity?: (activity: Activity) => void;
  onForwardLead?: (lead: Lead) => void;
}

const getProductNames = (productIds?: string[]) => {
  if (!productIds || productIds.length === 0) return [];
  return productIds.map(id => products.find(p => p.id === id)?.name).filter(Boolean);
};

function LeadCard({ lead, upcomingActivity, onView, onEdit, onAddActivity, onViewActivity, onForwardLead }: LeadCardProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("leadId", lead.id);
  };

  const productNames = getProductNames(lead.products);

  return (
    <Card
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab active:cursor-grabbing transition-all duration-200 bg-card border-border group hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <h4 className="font-medium text-sm text-foreground line-clamp-1">{lead.company}</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">{lead.businessEntity || '-'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(lead)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(lead)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddActivity(lead.id)}>
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add Activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onForwardLead?.(lead)}>
                <Forward className="h-4 w-4 mr-2" />
                Forward Lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          {/* Products */}
          {productNames.length > 0 && (
            <div className="flex items-start gap-1.5">
              <Package className="h-3 w-3 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {productNames.slice(0, 2).map((name, idx) => (
                  <Badge key={idx} variant="outline" className="text-[10px] px-1 py-0">
                    {name}
                  </Badge>
                ))}
                {productNames.length > 2 && (
                  <Badge variant="secondary" className="text-[10px] px-1 py-0">
                    +{productNames.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span className="line-clamp-1">{lead.assignedKamName || "Unassigned"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-medium text-foreground">
              <TakaIcon className="text-xs text-success" />
              {formatCurrency(lead.expectedValue)}
            </div>
            <LeadStatusBadge status={lead.status} className="text-[10px] px-1.5 py-0" />
          </div>

          {/* Assigned Date */}
          {lead.assignedDate && (
            <div className="text-[10px] text-muted-foreground">
              Assigned: {formatDate(lead.assignedDate)}
            </div>
          )}
          
          {/* Upcoming Activity */}
          {upcomingActivity && (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                onViewActivity?.(upcomingActivity);
              }}
              className="mt-2 p-2 bg-primary/10 rounded-md cursor-pointer hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                <Calendar className="h-3 w-3" />
                <span className="line-clamp-1">{upcomingActivity.title}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5 pl-4">
                {format(new Date(upcomingActivity.scheduledAt), "MMM d, h:mm a")}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({ stage, leads, activities, onView, onEdit, onAddActivity, onViewActivity, onForwardLead, onDragOver, onDrop }: KanbanColumnProps) {
  const stageLeads = leads.filter((lead) => lead.stage === stage.id && lead.status !== 'lost');
  const totalValue = stageLeads.reduce((sum, lead) => sum + lead.expectedValue, 0);
  
  // Get upcoming activity for each lead
  const getUpcomingActivity = (leadId: string): Activity | undefined => {
    const now = new Date();
    return activities
      .filter(a => a.clientId === leadId && !a.completedAt && isAfter(new Date(a.scheduledAt), now))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  };

  return (
    <div
      className="flex-shrink-0 w-72 rounded-lg transition-all duration-200"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stage.id as LeadStage)}
    >
      {/* Header Section */}
      <div 
        className="rounded-t-lg p-3 shadow-md"
        style={{ 
          backgroundColor: stage.color,
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-white">{stage.name}</h3>
            <Badge 
              variant="secondary" 
              className="text-xs bg-white/20 text-white border-0"
            >
              {stageLeads.length}
            </Badge>
          </div>
          <Badge 
            className="text-xs font-semibold bg-white/90 text-foreground border-0 shadow-sm"
          >
            {formatCurrency(totalValue)}
          </Badge>
        </div>
      </div>

      {/* Cards Section */}
      <div 
        className="p-3 rounded-b-lg"
        style={{ 
          backgroundColor: `${stage.color}15`,
          borderLeft: `1px solid ${stage.color}`,
          borderRight: `1px solid ${stage.color}`,
          borderBottom: `1px solid ${stage.color}`,
        }}
      >
        <div className="space-y-2 min-h-[200px]">
          {stageLeads.map((lead) => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              upcomingActivity={getUpcomingActivity(lead.id)}
              onView={onView} 
              onEdit={onEdit} 
              onAddActivity={onAddActivity}
              onViewActivity={onViewActivity}
              onForwardLead={onForwardLead}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeadKanbanView({ leads, activities = [], onView, onEdit, onStageChange, onAddActivity, onViewActivity, onForwardLead }: LeadKanbanViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollContainer.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [leads]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStage: LeadStage) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("leadId");
    if (leadId) {
      onStageChange(leadId, newStage);
    }
  };

  return (
    <div className="relative w-full max-w-full">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-background/95 border shadow-lg hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-background/95 border shadow-lg hover:bg-muted transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      {/* Scroll container */}
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto overflow-y-visible pb-4 px-6"
        onScroll={checkScroll}
      >
        <div className="flex gap-4 min-w-max">
          {pipelineStages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leads}
              activities={activities}
              onView={onView}
              onEdit={onEdit}
              onAddActivity={onAddActivity}
              onViewActivity={onViewActivity}
              onForwardLead={onForwardLead}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
