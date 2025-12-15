import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "online" | "offline" | "warning";
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const statusColors = {
    online: "bg-status-online",
    offline: "bg-status-offline",
    warning: "bg-status-warning",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", statusColors[status], status === "online" && "status-pulse")} />
      {label && (
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
      )}
    </div>
  );
}
