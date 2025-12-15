import { Shield, Wifi, Battery, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className }: SystemStatusProps) {
  const stats = [
    { icon: <Shield className="w-5 h-5" />, label: "Security", value: "Armed", status: "online" as const },
    { icon: <Wifi className="w-5 h-5" />, label: "Network", value: "Connected", status: "online" as const },
    { icon: <Battery className="w-5 h-5" />, label: "Backup", value: "98%", status: "online" as const },
    { icon: <Thermometer className="w-5 h-5" />, label: "Temperature", value: "22°C", status: "online" as const },
  ];

  const statusColors = {
    online: "text-status-online bg-status-online/10",
    offline: "text-status-offline bg-status-offline/10",
    warning: "text-status-warning bg-status-warning/10",
  };

  return (
    <div className={cn("glass rounded-2xl p-6 fade-in", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="p-4 rounded-xl bg-secondary/50 transition-all duration-300 hover:bg-secondary/70"
          >
            <div className={cn("p-2 rounded-lg w-fit mb-2", statusColors[stat.status])}>
              {stat.icon}
            </div>
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
