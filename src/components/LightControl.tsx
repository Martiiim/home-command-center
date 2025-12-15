import { useState } from "react";
import { Lightbulb, Sun, Moon } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface LightRoom {
  id: string;
  name: string;
  icon: React.ReactNode;
  isOn: boolean;
  brightness: number;
}

interface LightControlProps {
  className?: string;
}

export function LightControl({ className }: LightControlProps) {
  const [rooms, setRooms] = useState<LightRoom[]>([
    { id: "1", name: "Living Room", icon: <Sun className="w-5 h-5" />, isOn: true, brightness: 80 },
    { id: "2", name: "Bedroom", icon: <Moon className="w-5 h-5" />, isOn: false, brightness: 40 },
    { id: "3", name: "Kitchen", icon: <Lightbulb className="w-5 h-5" />, isOn: true, brightness: 100 },
    { id: "4", name: "Garage", icon: <Lightbulb className="w-5 h-5" />, isOn: false, brightness: 60 },
  ]);

  const toggleLight = (id: string) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, isOn: !room.isOn } : room
    ));
  };

  const setBrightness = (id: string, value: number[]) => {
    setRooms(rooms.map(room => 
      room.id === id ? { ...room, brightness: value[0], isOn: value[0] > 0 } : room
    ));
  };

  const activeLights = rooms.filter(r => r.isOn).length;

  return (
    <div className={cn("glass rounded-2xl p-6 fade-in", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lights</h3>
          <p className="text-sm text-muted-foreground">{activeLights} of {rooms.length} active</p>
        </div>
        <div className="flex items-center gap-2">
          <Lightbulb className={cn(
            "w-5 h-5 transition-colors",
            activeLights > 0 ? "text-status-warning" : "text-muted-foreground"
          )} />
        </div>
      </div>

      <div className="space-y-4">
        {rooms.map((room) => (
          <div 
            key={room.id}
            className={cn(
              "p-4 rounded-xl transition-all duration-300",
              room.isOn ? "bg-secondary/80" : "bg-secondary/40"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  room.isOn ? "bg-status-warning/20 text-status-warning" : "bg-muted text-muted-foreground"
                )}>
                  {room.icon}
                </div>
                <div>
                  <p className="font-medium text-foreground">{room.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {room.isOn ? `${room.brightness}%` : "Off"}
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => toggleLight(room.id)}
                className={cn(
                  "w-12 h-7 rounded-full transition-all duration-300 relative",
                  room.isOn ? "bg-status-warning" : "bg-muted"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 rounded-full bg-foreground transition-all duration-300",
                  room.isOn ? "left-6" : "left-1"
                )} />
              </button>
            </div>
            
            {room.isOn && (
              <div className="pt-2">
                <Slider
                  value={[room.brightness]}
                  onValueChange={(value) => setBrightness(room.id, value)}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
