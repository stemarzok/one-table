import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { MapPin, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import Map from "@/components/Map";
import { CUISINE_TYPES, SPECIALIZATIONS, OCCASIONS, EXTRA_FEATURES } from "@/lib/restaurantCategories";
import { toast } from "sonner";

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
  cuisineTypes: string[];
  specializations: string[];
  occasions: string[];
  extraFeatures: string[];
}

const RestaurantFilters = ({ onFilterChange, restaurants }: RestaurantFiltersProps) => {
  const [radius, setRadius] = useState([5]);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    radius: 5,
    priceRange: "all",
    sortBy: "rating-desc",
    cuisineTypes: [],
    specializations: [],
    occasions: [],
    extraFeatures: []
  });

  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

  const handleFilterChange = (key: keyof FilterState, value: string | number | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleArrayFilter = (key: 'cuisineTypes' | 'specializations' | 'occasions' | 'extraFeatures', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      city: "all",
      radius: 5,
      priceRange: "all",
      sortBy: "rating-desc",
      cuisineTypes: [],
      specializations: [],
      occasions: [],
      extraFeatures: []
    };
    setFilters(clearedFilters);
    setRadius([5]);
    onFilterChange?.(clearedFilters);
  };

  const activeFiltersCount = 
    (filters.city !== "all" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0) +
    filters.cuisineTypes.length +
    filters.specializations.length +
    filters.occasions.length +
    filters.extraFeatures.length;

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
          if (import.meta.env.DEV) {
            console.error("Geolocation error:", error);
          }
          toast.error("Non è stato possibile ottenere la tua posizione. Verifica le autorizzazioni del browser.");
        }
      );
    } else {
      toast.error("La geolocalizzazione non è supportata dal tuo browser.");
    }
  };

  return (
    <div className="mb-8">
      {/* Barra compatta con ricerca e filtri */}
      <div className="flex items-center gap-3 mb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="flex-1">
          <div className="flex items-center gap-3">
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filtri
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>

            <Button 
              onClick={requestGeolocation}
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label="Trova ristoranti vicino a me"
            >
              <MapPin className="w-4 h-4" />
              Vicino a me
            </Button>

            {activeFiltersCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                Cancella filtri
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 space-y-6">
              {/* Filtri base */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              </div>

              {/* Tipo di Cucina */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Tipo di Cucina</label>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_TYPES.map((type) => (
                    <Badge
                      key={type}
                      variant={filters.cuisineTypes.includes(type) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleArrayFilter('cuisineTypes', type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specializzazione */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Specializzazione</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALIZATIONS.map((spec) => (
                    <Badge
                      key={spec}
                      variant={filters.specializations.includes(spec) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleArrayFilter('specializations', spec)}
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Occasione */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Occasione</label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((occasion) => (
                    <Badge
                      key={occasion}
                      variant={filters.occasions.includes(occasion) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleArrayFilter('occasions', occasion)}
                    >
                      {occasion}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Extra */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">Extra</label>
                <div className="flex flex-wrap gap-2">
                  {EXTRA_FEATURES.map((feature) => (
                    <Badge
                      key={feature}
                      variant={filters.extraFeatures.includes(feature) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 transition-colors"
                      onClick={() => toggleArrayFilter('extraFeatures', feature)}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Filtri attivi come chip */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.city !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.city}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("city", "all")} />
            </Badge>
          )}
          {filters.priceRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.priceRange}
              <X className="w-3 h-3 cursor-pointer" onClick={() => handleFilterChange("priceRange", "all")} />
            </Badge>
          )}
          {filters.cuisineTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('cuisineTypes', type)} />
            </Badge>
          ))}
          {filters.specializations.map(spec => (
            <Badge key={spec} variant="secondary" className="gap-1">
              {spec}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('specializations', spec)} />
            </Badge>
          ))}
          {filters.occasions.map(occ => (
            <Badge key={occ} variant="secondary" className="gap-1">
              {occ}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('occasions', occ)} />
            </Badge>
          ))}
          {filters.extraFeatures.map(feat => (
            <Badge key={feat} variant="secondary" className="gap-1">
              {feat}
              <X className="w-3 h-3 cursor-pointer" onClick={() => toggleArrayFilter('extraFeatures', feat)} />
            </Badge>
          ))}
        </div>
      )}

      {/* Dialog Mappa */}
      {restaurants && (
        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Ristoranti vicino a te</DialogTitle>
            </DialogHeader>
            
            {!mapboxToken ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
                <MapPin className="w-16 h-16 text-primary" />
                <h3 className="text-xl font-semibold">Token Mapbox Mancante</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  La visualizzazione della mappa richiede un token Mapbox configurato.
                  <br />
                  Contatta l'amministratore del sito per abilitare questa funzionalità.
                </p>
              </div>
            ) : userLocation ? (
              <div className="flex-1 h-full">
                <Map 
                  accessToken={mapboxToken}
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

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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