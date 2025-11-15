import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

const mockSuggestions = [
  "La Terrazza del Sole",
  "Osteria Milano",
  "Ristorante Venezia",
  "Trattoria Roma",
  "Pizzeria Napoli"
];

const SearchBar = ({ onSearch, showFilters, onToggleFilters }: SearchBarProps) => {
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

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto relative">
      <div className="flex gap-2 bg-background/95 backdrop-blur-sm rounded-full p-2 shadow-2xl border-2 border-primary/20">
        <Input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={t('hero.search')}
          className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg px-6"
        />
        {showFilters !== undefined && (
          <Button 
            type="button"
            onClick={onToggleFilters}
            size="lg" 
            variant="outline"
            className="rounded-full"
          >
            <Filter className="w-5 h-5" />
          </Button>
        )}
        <Button 
          type="submit" 
          size="lg" 
          className="rounded-full bg-primary hover:bg-primary/90 px-8 font-semibold"
        >
          <Search className="w-5 h-5 mr-2" />
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
