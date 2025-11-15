import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface RestaurantFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
}

export interface FilterState {
  city: string;
  radius: number;
  priceRange: string;
  sortBy: string;
}

const RestaurantFilters = ({ onFilterChange }: RestaurantFiltersProps) => {
  const [radius, setRadius] = useState([5]);
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
          console.log("Posizione:", position.coords.latitude, position.coords.longitude);
          // Qui implementeresti la logica per ordinare per distanza
        },
        (error) => {
          console.error("Errore geolocalizzazione:", error);
        }
      );
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
            className="w-full"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Vicino a me
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantFilters;
