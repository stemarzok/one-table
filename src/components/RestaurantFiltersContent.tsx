import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { CUISINE_TYPES, SPECIALIZATIONS, OCCASIONS, EXTRA_FEATURES } from "@/lib/restaurantCategories";
import { FilterState } from "./RestaurantFilters";

interface RestaurantFiltersContentProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClose?: () => void;
}

const RestaurantFiltersContent = ({ filters, onFilterChange, onClose }: RestaurantFiltersContentProps) => {
  const [radius, setRadius] = useState([filters.radius]);

  const handleFilterChange = (key: keyof FilterState, value: string | number | string[]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'cuisineTypes' | 'specializations' | 'occasions' | 'extraFeatures', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    onFilterChange({
      city: "all",
      radius: 5,
      priceRange: "all",
      sortBy: "rating-desc",
      cuisineTypes: [],
      specializations: [],
      occasions: [],
      extraFeatures: []
    });
    setRadius([5]);
  };

  const activeFiltersCount = 
    (filters.city !== "all" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0) +
    filters.cuisineTypes.length +
    filters.specializations.length +
    filters.occasions.length +
    filters.extraFeatures.length;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtri</h3>
        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Cancella tutto
            </Button>
          )}
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filtri base */}
      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium text-foreground mb-2 block">Ordina per</label>
          <Select 
            value={filters.sortBy} 
            onValueChange={(value) => handleFilterChange("sortBy", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Punteggio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Punteggio ↓</SelectItem>
              <SelectItem value="rating-asc">Punteggio ↑</SelectItem>
              <SelectItem value="price-asc">Prezzo ↑</SelectItem>
              <SelectItem value="price-desc">Prezzo ↓</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tipo di Cucina */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Tipo di Cucina</label>
        <div className="flex flex-wrap gap-1.5">
          {CUISINE_TYPES.map((type) => (
            <Badge
              key={type}
              variant={filters.cuisineTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
              onClick={() => toggleArrayFilter('cuisineTypes', type)}
            >
              {type}
            </Badge>
          ))}
        </div>
      </div>

      {/* Specializzazione */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Specializzazione</label>
        <div className="flex flex-wrap gap-1.5">
          {SPECIALIZATIONS.map((spec) => (
            <Badge
              key={spec}
              variant={filters.specializations.includes(spec) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
              onClick={() => toggleArrayFilter('specializations', spec)}
            >
              {spec}
            </Badge>
          ))}
        </div>
      </div>

      {/* Occasione */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Occasione</label>
        <div className="flex flex-wrap gap-1.5">
          {OCCASIONS.map((occasion) => (
            <Badge
              key={occasion}
              variant={filters.occasions.includes(occasion) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
              onClick={() => toggleArrayFilter('occasions', occasion)}
            >
              {occasion}
            </Badge>
          ))}
        </div>
      </div>

      {/* Extra */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Extra</label>
        <div className="flex flex-wrap gap-1.5">
          {EXTRA_FEATURES.map((feature) => (
            <Badge
              key={feature}
              variant={filters.extraFeatures.includes(feature) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors text-xs"
              onClick={() => toggleArrayFilter('extraFeatures', feature)}
            >
              {feature}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantFiltersContent;