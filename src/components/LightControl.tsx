import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleExteriorLights, getDeviceAuth, getDeviceStatus } from "@/lib/deviceApi";
import { useToast } from "@/hooks/use-toast";

interface LightControlProps {
  className?: string;
}

export function LightControl({ className }: LightControlProps) {
  const [isOn, setIsOn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [deviceMac, setDeviceMac] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    // fetch device MAC and initial status
    (async () => {
      try {
        const auth = await getDeviceAuth();
        const mac = auth?.device?.mac;
        setDeviceMac(mac || null);
        if (mac) {
          const statusResp = await getDeviceStatus(mac);
          const status = statusResp?.message && statusResp.message[0];
          setIsOn(status?.status2 === '1');
        }
      } catch (e) {
        // silently ignore; keep UI functional
      }
    })();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const resp = await toggleExteriorLights();
      const before = resp?.before;
      const newState = before === '1' ? false : true;
      setIsOn(newState);
      toast.toast({ title: `Exterior lights ${newState ? 'ON' : 'OFF'}` });
    } catch (err: any) {
      toast.toast({ title: 'Failed to toggle lights', description: err?.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("glass rounded-2xl p-6 fade-in", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Exterior Lights</h3>
          <p className="text-sm text-muted-foreground">Single switch for all exterior lights</p>
        </div>
        <div className="flex items-center gap-2">
          <Lightbulb className={cn(
            "w-5 h-5 transition-colors",
            isOn ? "text-status-warning" : "text-muted-foreground"
          )} />
        </div>
      </div>

      <div className={cn("p-4 rounded-xl transition-all duration-300", isOn ? "bg-secondary/80" : "bg-secondary/40")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Exterior Lights</p>
            <p className="text-xs text-muted-foreground">{isOn ? 'On' : 'Off'}</p>
          </div>

          <button
            onClick={handleToggle}
            disabled={loading}
            className={cn(
              "w-12 h-7 rounded-full transition-all duration-300 relative",
              isOn ? "bg-status-warning" : "bg-muted",
              loading ? 'opacity-60 cursor-not-allowed' : ''
            )}
          >
            <div className={cn(
              "absolute top-1 w-5 h-5 rounded-full bg-foreground transition-all duration-300",
              isOn ? "left-6" : "left-1"
            )} />
          </button>
        </div>
      </div>
    </div>
  );
}
