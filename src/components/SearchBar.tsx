import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  variant?: 'default' | 'hero';
}

interface Restaurant {
  id: string;
  name: string;
  city: string;
  cuisine_type: string | null;
}

const SearchBar = ({ onSearch, showFilters, onToggleFilters, variant = 'default' }: SearchBarProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Restaurant[]>([]);

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

  const handleInputChange = (value: string) => {
    setQuery(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(query);
    setSuggestions([]);
  };

  const handleSuggestionClick = (restaurant: Restaurant) => {
    setQuery(restaurant.name);
    setSuggestions([]);
    navigate(`/restaurant/${restaurant.id}`);
  };

  const isHero = variant === 'hero';
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      <div className={`flex gap-1 sm:gap-2 rounded-full p-1.5 sm:p-2 ${
        isHero 
          ? 'bg-[hsl(0,0%,15%)/90] backdrop-blur-md border border-white/30 shadow-lg' 
          : 'bg-background/95 backdrop-blur-sm shadow-2xl border-2 border-primary/20'
      }`}>
        <div className="flex-1 min-w-0 relative">
          <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 ${
            isHero ? 'text-white/70' : 'text-muted-foreground'
          }`} />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('hero.search')}
            className={`pl-9 sm:pl-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-lg font-medium truncate ${
              isHero ? 'text-white placeholder:text-white/50' : 'text-foreground'
            }`}
          />
        </div>
        {showFilters !== undefined && (
          <Button 
            type="button"
            onClick={onToggleFilters}
            size="sm"
            variant={isHero ? "ghost" : "outline"}
            className={`rounded-full shrink-0 px-2 sm:px-3 ${isHero ? 'text-white hover:bg-white/20' : ''}`}
          >
            <SlidersHorizontal className="w-4 sm:w-5 h-4 sm:h-5" />
          </Button>
        )}
        <Button 
          type="submit" 
          size="sm"
          className={`rounded-full px-3 sm:px-8 font-semibold text-sm sm:text-base shrink-0 ${
            isHero 
              ? 'bg-primary hover:bg-primary/90 text-background' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {t('hero.searchButton')}
        </Button>
      </div>
      
      {suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {suggestions.map((restaurant) => (
            <button
              key={restaurant.id}
              type="button"
              onClick={() => handleSuggestionClick(restaurant)}
              className="w-full px-4 sm:px-6 py-3 text-left hover:bg-muted transition-colors"
            >
              <div className="font-semibold text-foreground">{restaurant.name}</div>
              <div className="text-sm text-muted-foreground">
                {restaurant.city} {restaurant.cuisine_type && `• ${restaurant.cuisine_type}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
