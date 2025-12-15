import { Video, Maximize2 } from "lucide-react";
import { StatusIndicator } from "./StatusIndicator";
import { cn } from "@/lib/utils";
import React from "react";

interface CameraFeedProps {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function CameraFeed({ id, name, location, isOnline, className, style }: CameraFeedProps) {
  return (
    <div 
      className={cn(
        "glass rounded-2xl overflow-hidden card-hover group cursor-pointer fade-in",
        className
      )}
      style={style}
    >
      <div className="relative aspect-video bg-gradient-to-br from-secondary to-background">
        {/* Simulated camera feed pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Video className="w-12 h-12 text-muted-foreground/30" />
            {isOnline && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-status-online rounded-full status-pulse" />
            )}
          </div>
        </div>
        
        {/* Grid overlay for camera effect */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(hsl(var(--muted-foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--muted-foreground)) 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }} />
        
        {/* Timestamp */}
        <div className="absolute bottom-3 left-3 text-xs text-muted-foreground font-mono">
          {new Date().toLocaleTimeString()}
        </div>
        
        {/* Expand button */}
        <button className="absolute top-3 right-3 p-2 rounded-lg bg-background/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Maximize2 className="w-4 h-4 text-foreground" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{location}</p>
          </div>
          <StatusIndicator status={isOnline ? "online" : "offline"} label={isOnline ? "Live" : "Offline"} />
        </div>
      </div>
    </div>
  );
}
