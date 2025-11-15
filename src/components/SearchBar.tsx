import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  variant?: 'default' | 'hero';
}

const mockSuggestions = [
  "La Terrazza del Sole",
  "Osteria Milano",
  "Ristorante Venezia",
  "Trattoria Roma",
  "Pizzeria Napoli"
];

const SearchBar = ({ onSearch, showFilters, onToggleFilters, variant = 'default' }: SearchBarProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.length > 0) {
      const filtered = mockSuggestions.filter(s => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(query);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    setSuggestions([]);
  };

  const isHero = variant === 'hero';
  
  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      <div className={`flex gap-2 rounded-full p-2 ${
        isHero 
          ? 'bg-white/10 backdrop-blur-md border border-white/20' 
          : 'bg-background/95 backdrop-blur-sm shadow-2xl border-2 border-primary/20'
      }`}>
        <div className="flex-1 relative">
          <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            isHero ? 'text-white/60' : 'text-muted-foreground'
          }`} />
          <Input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={t('hero.search')}
            className={`pl-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg ${
              isHero ? 'text-white placeholder:text-white/60' : 'text-foreground'
            }`}
          />
        </div>
        {showFilters !== undefined && (
          <Button 
            type="button"
            onClick={onToggleFilters}
            size="lg" 
            variant={isHero ? "ghost" : "outline"}
            className={`rounded-full ${isHero ? 'text-white hover:bg-white/20' : ''}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        )}
        <Button 
          type="submit" 
          size="lg" 
          className={`rounded-full px-8 font-semibold ${
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
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-6 py-3 text-left hover:bg-muted transition-colors text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </form>
  );
};

export default SearchBar;
