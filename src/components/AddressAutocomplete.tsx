import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressResult {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
  };
}

interface ParsedAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  fullAddress: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ 
  onAddressSelect, 
  placeholder = "Inizia a digitare l'indirizzo...",
  className 
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?` +
          `format=json&addressdetails=1&countrycodes=it&limit=5&q=${encodeURIComponent(query)}`,
          {
            headers: {
              'Accept-Language': 'it',
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const parseAddress = (result: AddressResult): ParsedAddress => {
    const addr = result.address;
    
    // Format: "Via Roma, 123" or just "Via Roma" if no house number
    let street = addr.road || "";
    if (addr.house_number) {
      street = `${street}, ${addr.house_number}`;
    }
    
    const city = addr.city || addr.town || addr.village || addr.municipality || "";
    // Use county for province (e.g., "Milano", "Roma")
    const province = addr.county || addr.state || "";
    const postalCode = addr.postcode || "";

    return {
      street,
      city,
      province,
      postalCode,
      fullAddress: result.display_name
    };
  };

  const handleSelect = (result: AddressResult) => {
    const parsed = parseAddress(result);
    setQuery(parsed.street || result.display_name);
    setShowDropdown(false);
    onAddressSelect(parsed);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-b-0"
            >
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {showDropdown && results.length === 0 && !isLoading && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground text-sm">
          Nessun indirizzo trovato
        </div>
      )}
    </div>
  );
}
