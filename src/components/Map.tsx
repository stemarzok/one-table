import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  accessToken: string;
  center?: [number, number];
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ accessToken, center = [30, 15], zoom = 1.5 }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      projection: "globe",
      zoom,
      center,
      pitch: 45,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    mapRef.current.scrollZoom.disable();

    mapRef.current.on("style.load", () => {
      mapRef.current?.setFog({
        color: "rgb(255, 255, 255)",
        "high-color": "rgb(200, 200, 225)",
        "horizon-blend": 0.2,
      } as any);
    });

    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      if (!mapRef.current) return;
      const z = mapRef.current.getZoom();
      if (spinEnabled && !userInteracting && z < maxSpinZoom) {
        let dps = 360 / secondsPerRevolution;
        if (z > slowSpinZoom) {
          const zoomDif = (maxSpinZoom - z) / (maxSpinZoom - slowSpinZoom);
          dps *= zoomDif;
        }
        const c = mapRef.current.getCenter();
        c.lng -= dps;
        mapRef.current.easeTo({ center: c, duration: 1000, easing: (n) => n });
      }
    }

    mapRef.current.on("mousedown", () => (userInteracting = true));
    mapRef.current.on("dragstart", () => (userInteracting = true));
    mapRef.current.on("mouseup", () => { userInteracting = false; spinGlobe(); });
    mapRef.current.on("touchend", () => { userInteracting = false; spinGlobe(); });
    mapRef.current.on("moveend", () => spinGlobe());

    spinGlobe();

    return () => {
      mapRef.current?.remove();
    };
  }, [accessToken, center.toString(), zoom]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
};

export default Map;
