import { useState, useEffect } from "react";
import { DoorOpen, DoorClosed, Lock, Unlock } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";
import { triggerGate, getGateStatus } from "@/lib/deviceApi";
import { useToast } from "@/hooks/use-toast"; 

interface GateControlProps {
  className?: string;
}

export function GateControl({ className }: GateControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let mounted = true;
    async function fetchStatus() {
      try {
        const s = await getGateStatus();
        if (!mounted) return;
        setIsOpen(s && typeof s.is_closed === "boolean" ? !s.is_closed : false);
      } catch (e) {
        // ignore errors
      }
    }
    fetchStatus();
    const id = setInterval(fetchStatus, 2000);
    return () => { mounted = false; clearInterval(id); };
  }, []); 

  const handleToggle = () => {
    if (isLocked) return;
    (async () => {
      try {
        await triggerGate();
        setIsOpen(!isOpen);
        toast.toast({ title: 'Gate triggered' });
      } catch (err: any) {
        toast.toast({ title: 'Failed to trigger gate', description: err?.message });
      }
    })();
  };

  const handleLockToggle = () => {
    if (isOpen) return; // Can't lock while open
    setIsLocked(!isLocked);
  };

  return (
    <div className={cn("glass rounded-2xl p-6 fade-in", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Main Gate</h3>
          <p className="text-sm text-muted-foreground">Front entrance</p>
        </div>
        <StatusIndicator 
          status={isOpen ? "warning" : "online"} 
          label={isOpen ? "Open" : "Secured"} 
        />
      </div>

      {/* Gate visual */}
      <div className="relative h-32 mb-6 rounded-xl bg-gradient-to-br from-secondary to-background flex items-center justify-center overflow-hidden">
        <div className={cn(
          "transition-all duration-500 ease-out",
          isOpen ? "scale-110 opacity-100" : "scale-100 opacity-60"
        )}>
          {isOpen ? (
            <DoorOpen className="w-16 h-16 text-status-warning" />
          ) : (
            <DoorClosed className="w-16 h-16 text-status-online" />
          )}
        </div>
        
        {/* Status glow */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isOpen ? "opacity-20 bg-status-warning" : "opacity-0"
        )} />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleToggle}
          disabled={isLocked}
          className={cn(
            "flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300",
            "flex items-center justify-center gap-2",
            isLocked 
              ? "bg-muted text-muted-foreground cursor-not-allowed" 
              : isOpen 
                ? "bg-status-warning/20 text-status-warning hover:bg-status-warning/30 glow-accent" 
                : "bg-primary/20 text-primary hover:bg-primary/30 glow-primary"
          )}
        >
        <p className="w-50 h-5">Toggle Gate</p>
        </button>
        
        <button
          onClick={handleLockToggle}
          className={cn(
            "p-4 rounded-xl transition-all duration-300",
            isLocked 
                ? "bg-status-online/20 text-status-online hover:bg-status-online/30" 
                : "bg-status-warning/20 text-status-warning hover:bg-status-warning/30"
          )}
        >
          {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
