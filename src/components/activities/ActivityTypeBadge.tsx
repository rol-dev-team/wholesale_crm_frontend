import { Badge } from "@/components/ui/badge";
import type { ActivityType } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { MapPin, Video, Phone, Mail, CheckSquare, Calendar } from "lucide-react";

interface ActivityTypeBadgeProps {
  type: ActivityType;
  className?: string;
}

const typeConfig: Record<ActivityType, { label: string; variant: string; icon: typeof MapPin }> = {
  physical_meeting: { label: "Physical Meeting", variant: "bg-primary/20 text-primary border-primary/30", icon: MapPin },
  virtual_meeting: { label: "Virtual Meeting", variant: "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800", icon: Video },
  call: { label: "Call", variant: "bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800", icon: Phone },
  email: { label: "Email", variant: "bg-warning/20 text-warning border-warning/30", icon: Mail },
  task: { label: "Task", variant: "bg-accent text-accent-foreground border-accent", icon: CheckSquare },
  follow_up: { label: "Follow-up", variant: "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800", icon: Calendar },
};

export function ActivityTypeBadge({ type, className }: ActivityTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  
  return (
    <Badge variant="outline" className={cn("font-medium gap-1", config.variant, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

export function getActivityIcon(type: ActivityType) {
  return typeConfig[type].icon;
}
