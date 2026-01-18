import { cn } from "@/lib/utils";

interface TakaIconProps {
  className?: string;
}

export function TakaIcon({ className }: TakaIconProps) {
  return (
    <span className={cn("font-semibold", className)}>৳</span>
  );
}
