import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddressResult {
  place_id: number;
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

export interface ParsedAddress {
  street: string; // road only (no civic)
  houseNumber: string;
  city: string;
  province: string;
  postalCode: string;
  fullAddress: string;
  hasHouseNumber: boolean;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: ParsedAddress) => void;
  placeholder?: string;
  className?: string;
}

function buildAltQuery(q: string): string | null {
  const match = q.match(/\b(\d+[a-zA-Z]?)\b/);
  if (!match) return null;
  const number = match[1];
  const rest = q.replace(match[0], "").trim();
  const alt = `${number} ${rest}`.trim();
  if (!alt || alt.toLowerCase() === q.toLowerCase()) return null;
  return alt;
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Inizia a digitare l'indirizzo...",
  className,
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
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const alt = buildAltQuery(query);
        const queries = [query, alt].filter(Boolean) as string[];

        const urls = queries.map(
          (q) =>
            `https://nominatim.openstreetmap.org/search?` +
            `format=json&addressdetails=1&countrycodes=it&limit=8&q=${encodeURIComponent(q)}`
        );

        const responses = await Promise.all(
          urls.map((url) =>
            fetch(url, {
              headers: {
                "Accept-Language": "it",
              },
            }).catch(() => null)
          )
        );

        const payloads = await Promise.all(
          responses.map(async (r) => {
            if (!r || !r.ok) return [];
            try {
              return (await r.json()) as AddressResult[];
            } catch {
              return [];
            }
          })
        );

        const merged = payloads.flat();
        const dedup = new Map<number, AddressResult>();
        for (const item of merged) {
          if (typeof item?.place_id === "number" && !dedup.has(item.place_id)) {
            dedup.set(item.place_id, item);
          }
        }

        // Prefer results that include house number
        const list = Array.from(dedup.values());
        list.sort((a, b) => {
          const ah = a.address?.house_number ? 1 : 0;
          const bh = b.address?.house_number ? 1 : 0;
          return bh - ah;
        });

        setResults(list);
        setShowDropdown(list.length > 0);
      } catch (error) {
        console.error("Error fetching addresses:", error);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const formatDisplayAddress = (result: AddressResult): string => {
    const addr = result.address || {};
    const parts: string[] = [];

    if (addr.road) {
      parts.push(addr.house_number ? `${addr.road}, ${addr.house_number}` : addr.road);
    }

    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city) parts.push(city);

    if (addr.county) parts.push(addr.county);
    if (addr.postcode) parts.push(addr.postcode);

    return parts.length > 0 ? parts.join(" - ") : result.display_name;
  };

  const parseAddress = (result: AddressResult): ParsedAddress => {
    const addr = result.address || {};
    const houseNumber = addr.house_number || "";

    return {
      street: addr.road || "",
      houseNumber,
      city: addr.city || addr.town || addr.village || addr.municipality || "",
      province: addr.county || addr.state || "",
      postalCode: addr.postcode || "",
      fullAddress: result.display_name,
      hasHouseNumber: !!houseNumber,
    };
  };

  const handleSelect = (result: AddressResult) => {
    const parsed = parseAddress(result);
    const preview = parsed.hasHouseNumber
      ? `${parsed.street}, ${parsed.houseNumber}`
      : parsed.street || result.display_name;

    setQuery(preview);
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
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-80 overflow-auto">
          {results.map((result) => {
            const hasNumber = !!result.address?.house_number;
            return (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-b-0",
                  !hasNumber && "opacity-70"
                )}
              >
                <MapPin
                  className={cn(
                    "h-4 w-4 mt-0.5 flex-shrink-0",
                    hasNumber ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <div className="flex-1">
                  <span className="text-sm block">{formatDisplayAddress(result)}</span>
                  {!hasNumber && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" />
                      Se non compare il civico, potrai inserirlo manualmente nel prossimo step
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {showDropdown && results.length === 0 && !isLoading && query.trim().length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg p-4 text-center text-muted-foreground text-sm">
          Nessun indirizzo trovato. Prova con "Via Nome 12, Città"
        </div>
      )}
    </div>
  );
}
