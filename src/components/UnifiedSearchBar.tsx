import { Search, SlidersHorizontal, MapPin, X, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import RestaurantFiltersContent from "./RestaurantFiltersContent";
import { FilterState } from "./RestaurantFilters";

interface UnifiedSearchBarProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: FilterState) => void;
  onNearMe?: () => void;
  filters: FilterState;
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine_type: string | null;
}

interface SearchHistory {
  id: string;
  search_query: string;
}

const UnifiedSearchBar = ({ onSearch, onFilterChange, onNearMe, filters }: UnifiedSearchBarProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Restaurant[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFiltersCount = 
    (filters.city !== "all" ? 1 : 0) +
    (filters.priceRange !== "all" ? 1 : 0) +
    filters.cuisineTypes.length +
    filters.specializations.length +
    filters.occasions.length +
    filters.extraFeatures.length;

  // Fetch search history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('user_searches')
        .select('id, search_query')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (data) {
        // Remove duplicates
        const unique = data.filter((item, index, self) => 
          index === self.findIndex(t => t.search_query === item.search_query)
        );
        setSearchHistory(unique);
      }
    };
    fetchHistory();
  }, [user]);

  // Search restaurants
  useEffect(() => {
    const searchRestaurants = async () => {
      if (query.length > 0) {
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, city, cuisine_type')
          .eq('is_active', true)
          .or(`name.ilike.%${query}%,city.ilike.%${query}%,cuisine_type.ilike.%${query}%`)
          .limit(5);
        
        if (data && !error) {
          setSuggestions(data);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(searchRestaurants, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const saveSearch = async (searchQuery: string) => {
    if (!user || !searchQuery.trim()) return;
    await supabase.from('user_searches').insert([{
      user_id: user.id,
      search_query: searchQuery.trim(),
      filters: filters as any
    }]);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(query);
    saveSearch(query);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (restaurant: Restaurant) => {
    setQuery(restaurant.name);
    setShowSuggestions(false);
    saveSearch(restaurant.name);
    navigate(`/restaurant/${restaurant.id}`);
  };

  const handleHistoryClick = (searchQuery: string) => {
    setQuery(searchQuery);
    onSearch?.(searchQuery);
    setShowSuggestions(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1 sm:gap-2 bg-background/95 backdrop-blur-sm rounded-full p-1.5 sm:p-2 shadow-2xl border-2 border-primary/20">
          {/* Search Input */}
          <div className="flex-1 min-w-0 relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-muted-foreground" />
            <Input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder={t('hero.search')}
              className="pl-9 sm:pl-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-lg font-medium truncate"
            />
          </div>

          {/* Filters Button */}
          <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
            <PopoverTrigger asChild>
              <Button 
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full gap-1 sm:gap-2 text-muted-foreground hover:text-foreground px-2 sm:px-3 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden md:inline text-sm">Filtri</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90vw] sm:w-[600px] max-h-[70vh] overflow-y-auto p-0" align="end">
              <RestaurantFiltersContent 
                filters={filters} 
                onFilterChange={onFilterChange!}
                onClose={() => setFiltersOpen(false)}
              />
            </PopoverContent>
          </Popover>

          {/* Near Me Button - Location icon */}
          <Button 
            type="button"
            variant="ghost"
            size="sm"
            onClick={onNearMe}
            className="rounded-full text-muted-foreground hover:text-foreground px-2 sm:px-3 shrink-0"
            title="Trova ristoranti vicino a te"
          >
            <MapPin className="w-4 h-4" />
          </Button>

          {/* Search Button */}
          <Button 
            type="submit" 
            size="sm"
            className="rounded-full px-3 sm:px-6 font-semibold bg-primary hover:bg-primary/90 text-sm sm:text-base shrink-0"
          >
            {t('hero.searchButton')}
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length > 0 || searchHistory.length > 0) && (
        <div 
          className="absolute top-full mt-2 w-full bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50"
          onMouseLeave={() => setTimeout(() => setShowSuggestions(false), 200)}
        >
          {/* Search History */}
          {query.length === 0 && searchHistory.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground flex items-center gap-2">
                <History className="w-3 h-3" />
                Ricerche recenti
              </div>
              {searchHistory.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleHistoryClick(item.search_query)}
                  className="w-full px-4 py-2 text-left hover:bg-muted rounded-lg transition-colors text-sm"
                >
                  {item.search_query}
                </button>
              ))}
            </div>
          )}

          {/* Restaurant Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {query.length > 0 && (
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
                  Ristoranti
                </div>
              )}
              {suggestions.map((restaurant) => (
                <button
                  key={restaurant.id}
                  type="button"
                  onClick={() => handleSuggestionClick(restaurant)}
                  className="w-full px-4 py-3 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="font-semibold text-foreground">{restaurant.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {restaurant.city} {restaurant.cuisine_type && `• ${restaurant.cuisine_type}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 justify-center">
          {filters.city !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.city}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange?.({...filters, city: "all"})} />
            </Badge>
          )}
          {filters.priceRange !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {filters.priceRange}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange?.({...filters, priceRange: "all"})} />
            </Badge>
          )}
          {filters.cuisineTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange?.({...filters, cuisineTypes: filters.cuisineTypes.filter(t => t !== type)})} />
            </Badge>
          ))}
          {filters.specializations.slice(0, 2).map(spec => (
            <Badge key={spec} variant="secondary" className="gap-1">
              {spec}
              <X className="w-3 h-3 cursor-pointer" onClick={() => onFilterChange?.({...filters, specializations: filters.specializations.filter(s => s !== spec)})} />
            </Badge>
          ))}
          {(filters.specializations.length > 2 || filters.occasions.length > 0 || filters.extraFeatures.length > 0) && (
            <Badge variant="secondary">
              +{filters.specializations.length - 2 + filters.occasions.length + filters.extraFeatures.length} altri
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default UnifiedSearchBar;