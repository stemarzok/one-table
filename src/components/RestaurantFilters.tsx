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
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Ristoranti vicino a te</DialogTitle>
            </DialogHeader>
            
            {!mapToken ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <MapPin className="w-16 h-16 text-primary" />
                <h3 className="text-xl font-semibold">Inserisci il tuo Mapbox Token</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Per visualizzare la mappa, hai bisogno di un token pubblico Mapbox. 
                  Puoi ottenerlo gratuitamente su{' '}
                  <a 
                    href="https://mapbox.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    mapbox.com
                  </a>
                </p>
                <Input 
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapToken}
                  onChange={(e) => setMapToken(e.target.value)}
                  className="max-w-md"
                />
                <Button 
                  onClick={() => {
                    if (mapToken.startsWith('pk.')) {
                      // Token valido, la mappa si caricherà
                    } else {
                      alert('Inserisci un token Mapbox valido che inizia con "pk."');
                    }
                  }}
                  disabled={!mapToken.startsWith('pk.')}
                >
                  Continua
                </Button>
              </div>
            ) : userLocation ? (
              <div className="flex-1 h-full">
                <Map 
                  accessToken={mapToken}
                  center={[userLocation.lng, userLocation.lat]}
                  zoom={12}
                  restaurants={restaurants.filter(r => {
                    const distance = calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      r.coordinates.lat,
                      r.coordinates.lng
                    );
                    return distance <= filters.radius;
                  })}
                  userLocation={userLocation}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground">Caricamento posizione...</p>
              </div>
            )}
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
