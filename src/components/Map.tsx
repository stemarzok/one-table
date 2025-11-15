import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapProps {
  accessToken: string;
  center?: [number, number];
  zoom?: number;
  restaurants?: Array<{
    id: number;
    name: string;
    coordinates: { lat: number; lng: number };
  }>;
  userLocation?: { lat: number; lng: number };
}

const Map: React.FC<MapProps> = ({ 
  accessToken, 
  center = [30, 15], 
  zoom = 1.5, 
  restaurants = [],
  userLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !accessToken) return;

    mapboxgl.accessToken = accessToken;

    // Disable globe for restaurant view
    const useGlobe = !restaurants.length && !userLocation;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      projection: useGlobe ? "globe" : { name: "mercator" },
      zoom,
      center,
      pitch: useGlobe ? 45 : 0,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    if (!useGlobe) {
      mapRef.current.scrollZoom.enable();
    } else {
      mapRef.current.scrollZoom.disable();
    }

    // Add user location marker
    if (userLocation) {
      new mapboxgl.Marker({ color: "#84cc16" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<p class="font-semibold">La tua posizione</p>'))
        .addTo(mapRef.current);
    }

    // Add restaurant markers
    restaurants.forEach((restaurant) => {
      const marker = new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat([restaurant.coordinates.lng, restaurant.coordinates.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <p class="font-semibold">${restaurant.name}</p>
            </div>
          `)
        );
      
      if (mapRef.current) {
        marker.addTo(mapRef.current);
      }
    });

    if (useGlobe) {
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
    }

    return () => {
      mapRef.current?.remove();
    };
  }, [accessToken, center.toString(), zoom, restaurants, userLocation]);

  return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
};

export default Map;
