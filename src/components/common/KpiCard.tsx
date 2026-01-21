import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  icon: React.ReactNode;
  iconBg?: string; // Tailwind background class for icon
  value: string | number;
  lastValue?: string | number; // optional value for comparison (last month)
  bottomLabel?: string; // optional label instead of "Last month"
  subLabel?: string; // optional small span label (e.g., "This month")
}

export const KpiCard = ({
  title,
  icon,
  iconBg = "bg-gray-200",
  value,
  lastValue,
  bottomLabel,
  subLabel,
}: KpiCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 pb-3 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              {subLabel && (
                <span className="text-xs text-blue-400 font-semibold">{subLabel}</span>
              )}
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>

        {lastValue !== undefined && (
          <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
            {bottomLabel ? `${bottomLabel}: ${lastValue}` : `Last month: ${lastValue}`}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

