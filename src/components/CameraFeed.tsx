import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

type Camera = {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  streamUrl: string; // HLS URL, e.g., http://127.0.0.1:8888/driveway/index.m3u8
};

function CameraCard({ camera }: { camera: Camera }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = camera.streamUrl;
    } else if (Hls.isSupported()) {
      hls = new Hls({ 
        xhrSetup: (xhr) => {
          xhr.withCredentials = false; // prevent CORS issues
        },
      });
      hls.loadSource(camera.streamUrl);
      hls.attachMedia(video);
    } else {
      // fallback
      video.src = camera.streamUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    };
  }, [camera.streamUrl]);

  return (
    <div className="glass rounded-2xl overflow-hidden card-hover group cursor-pointer">
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        {camera.isOnline && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-white bg-black/60 px-2 py-0.5 rounded">
              Live
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg">{camera.name}</h3>
        <p className="text-sm text-muted-foreground">{camera.location}</p>
      </div>
    </div>
  );
}

export function CameraFeedAll() {
  // Put your HLS URLs here (MediaMTX default: port 8888)
  const cameras: Camera[] = [
    {
      id: "driveway",
      name: "Driveway",
      location: "Front Drive",
      isOnline: true,
      streamUrl: "http://127.0.0.1:8888/driveway/index.m3u8",
    },
    {
      id: "garden",
      name: "Garden",
      location: "Back Garden",
      isOnline: true,
      streamUrl: "http://127.0.0.1:8888/garden/index.m3u8",
    },
    {
      id: "gate",
      name: "Gate",
      location: "Side Gate",
      isOnline: true,
      streamUrl: "http://127.0.0.1:8888/gate/index.m3u8",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {cameras.map((camera) => (
        <CameraCard key={camera.id} camera={camera} />
      ))}
    </div>
  );
}
