import { CameraFeedAll } from "@/components/CameraFeed";
import { GateControl } from "@/components/GateControl";
import { LightControl } from "@/components/LightControl";
import { SystemStatus } from "@/components/SystemStatus";
import { Home, Settings, Bell } from "lucide-react";

// Insert your RTSP URLs below (replace placeholders). These values are visible in code
// and will prefill each camera's RTSP input field in the UI.
const cameras = [
  {
    id: "driveway",
    name: "Driveway",
    location: "Front Drive",
    isOnline: true,
    // Example placeholder — replace with your actual RTSP URL for Driveway
    streamUrl: "http://127.0.0.1:8554/driveway",
  },
  {
    id: "garden",
    name: "Garden",
    location: "Back Garden",
    isOnline: true,
    // Example placeholder — replace with your actual RTSP URL for Garden
    streamUrl: "http://127.0.0.1:8554/garden",
  },
  {
    id: "gate",
    name: "Gate",
    location: "Side Gate",
    isOnline: false,
    // Example placeholder — replace with your actual RTSP URL for Gate
    streamUrl: "http://127.0.0.1:8554/gate",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <Home className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Home Control</h1>
                <p className="text-sm text-muted-foreground">Security & Automation</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-status-online rounded-full" />
              </button>
              <button className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* CCTV Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">CCTV Monitoring</h2>
            <span className="text-sm text-muted-foreground">
              {cameras.filter(c => c.isOnline).length} of {cameras.length} online
            </span>
          </div>
          
          <div className="w-full">
            <CameraFeedAll cameras={cameras} />
          </div>
        </section>

        {/* Controls Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Controls</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GateControl className="lg:col-span-1" />
            <LightControl className="lg:col-span-1" />
            <SystemStatus className="lg:col-span-1" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <p className="text-sm text-muted-foreground text-center">
            System last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
