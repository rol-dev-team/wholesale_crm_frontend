import { cn } from "@/lib/utils";

interface FloatingLabelWrapperProps {
  label: string;
  isActive: boolean;
  children: React.ReactNode;
}

export function FloatingLabelWrapper({
  label,
  isActive,
  children,
}: FloatingLabelWrapperProps) {
  return (
    <div className="relative">
      <label
        className={cn(
          "absolute left-3 px-1 text-muted-foreground bg-background transition-all pointer-events-none",
          isActive
            ? "-top-2 text-xs"
            : "top-2.5 text-sm"
        )}
      >
        {label}
      </label>

      <div className="pt-4">{children}</div>
    </div>
  );
}
