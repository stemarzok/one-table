import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useState } from "react";
import Map from "@/components/Map";

interface Restaurant {
  id: number;
  name: string;
  coordinates: { lat: number; lng: number };
  city: string;
}

interface RestaurantFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  restaurants?: Restaurant[];
}

export interface FilterState {
  city: string;
  radius: number;
  priceRange: string;
  sortBy: string;
}

const RestaurantFilters = ({ onFilterChange, restaurants }: RestaurantFiltersProps) => {
  const [radius, setRadius] = useState([5]);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapToken, setMapToken] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    radius: 5,
    priceRange: "all",
    sortBy: "rating-desc"
  });

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setShowMap(true);
        },
        (error) => {
          console.error("Errore geolocalizzazione:", error);
          alert("Non è stato possibile ottenere la tua posizione. Verifica le autorizzazioni del browser.");
        }
      );
    } else {
      alert("La geolocalizzazione non è supportata dal tuo browser.");
    }
  };

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 mb-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Città */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Città</label>
          <Select 
            value={filters.city} 
            onValueChange={(value) => handleFilterChange("city", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutte le città" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le città</SelectItem>
              <SelectItem value="milano">Milano</SelectItem>
              <SelectItem value="roma">Roma</SelectItem>
              <SelectItem value="torino">Torino</SelectItem>
              <SelectItem value="firenze">Firenze</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Raggio */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Raggio: {radius[0]} km
          </label>
          <Slider
            value={radius}
            onValueChange={(value) => {
              setRadius(value);
              handleFilterChange("radius", value[0]);
            }}
            max={50}
            min={1}
            step={1}
            className="mt-3"
          />
        </div>

        {/* Fascia di prezzo */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Prezzo</label>
          <Select 
            value={filters.priceRange} 
            onValueChange={(value) => handleFilterChange("priceRange", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tutte le fasce" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte le fasce</SelectItem>
              <SelectItem value="€">€ - Economico</SelectItem>
              <SelectItem value="€€">€€ - Medio</SelectItem>
              <SelectItem value="€€€">€€€ - Costoso</SelectItem>
              <SelectItem value="€€€€">€€€€ - Lusso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ordinamento */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Ordina per</label>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Punteggio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Punteggio (Alto → Basso)</SelectItem>
              <SelectItem value="rating-asc">Punteggio (Basso → Alto)</SelectItem>
              <SelectItem value="price-asc">Prezzo (Basso → Alto)</SelectItem>
              <SelectItem value="price-desc">Prezzo (Alto → Basso)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Geolocalizzazione */}
        <div className="flex items-end">
          <Button 
            onClick={requestGeolocation}
            variant="outline"
            className="w-full rounded-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Vicino a me
          </Button>
        </div>
      </div>

      {/* Dialog Mappa */}
      {restaurants && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="max-w-4xl h-[600px]">
            <DialogHeader>
              <DialogTitle>Ristoranti vicino a te</DialogTitle>
            </DialogHeader>
            <div className="flex-1 relative">
              {userLocation ? (
                <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapPin className="w-12 h-12 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-semibold mb-2">La tua posizione</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}
                    </p>
                    <div className="space-y-2 mt-6">
                      <p className="text-sm font-medium">Ristoranti nelle vicinanze:</p>
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {restaurants
                          .filter(r => r.city === filters.city || filters.city === "all")
                          .map(restaurant => {
                            const distance = calculateDistance(
                              userLocation.lat,
                              userLocation.lng,
                              restaurant.coordinates.lat,
                              restaurant.coordinates.lng
                            );
                            return (
                              <div key={restaurant.id} className="p-3 bg-card rounded-lg text-left border border-border">
                                <p className="font-semibold">{restaurant.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Distanza: {distance.toFixed(1)} km
                                </p>
                              </div>
                            );
                          })
                          .slice(0, 5)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Caricamento posizione...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Funzione per calcolare la distanza tra due coordinate (formula di Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raggio della Terra in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default RestaurantFilters;
