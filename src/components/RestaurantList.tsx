import RestaurantCard from "./RestaurantCard";
import { FilterState } from "./RestaurantFilters";
import UnifiedSearchBar from "./UnifiedSearchBar";
import SponsoredCarousel from "./SponsoredCarousel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, MapPin } from "lucide-react";
import Map from "@/components/Map";

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string | null;
  address: string;
  city: string;
  price_range: string | null;
  cover_image_url: string | null;
  logo_url: string | null;
  is_active: boolean;
  avg_rating?: number;
  cuisine_types?: string[];
  specializations?: string[];
  occasions?: string[];
  extra_features?: string[];
}

const RestaurantList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const itemsPerPage = 9;
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

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, address, city, price_range, cover_image_url, logo_url, is_active, cuisine_types, specializations, occasions, extra_features')
        .eq('is_active', true);

      if (error) throw error;
      
      const restaurantsWithRatings = await Promise.all(
        (data || []).map(async (restaurant) => {
          const { data: ratingData } = await supabase
            .rpc('get_restaurant_rating', { restaurant_id_param: restaurant.id });
          
          return {
            ...restaurant,
            avg_rating: ratingData?.[0]?.avg_rating || 0,
            cuisine_types: restaurant.cuisine_types || [],
            specializations: restaurant.specializations || [],
            occasions: restaurant.occasions || [],
            extra_features: restaurant.extra_features || []
          };
        })
      );
      
      setRestaurants(restaurantsWithRatings);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNearMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setShowMap(true);
        },
        () => alert("Non è stato possibile ottenere la tua posizione.")
      );
    }
  };

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.cuisine_type && r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (filters.city !== "all") {
      filtered = filtered.filter(r => r.city.toLowerCase() === filters.city.toLowerCase());
    }

    if (filters.priceRange !== "all") {
      filtered = filtered.filter(r => r.price_range === filters.priceRange);
    }

    if (filters.cuisineTypes.length > 0) {
      filtered = filtered.filter(r => r.cuisine_types?.some(type => filters.cuisineTypes.includes(type)));
    }

    if (filters.specializations.length > 0) {
      filtered = filtered.filter(r => r.specializations?.some(spec => filters.specializations.includes(spec)));
    }

    if (filters.occasions.length > 0) {
      filtered = filtered.filter(r => r.occasions?.some(occ => filters.occasions.includes(occ)));
    }

    if (filters.extraFeatures.length > 0) {
      filtered = filtered.filter(r => r.extra_features?.some(feat => filters.extraFeatures.includes(feat)));
    }

    // Sort
    const priceOrder = { "€": 1, "€€": 2, "€€€": 3, "€€€€": 4 };
    if (filters.sortBy === "rating-desc") filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    else if (filters.sortBy === "rating-asc") filtered.sort((a, b) => (a.avg_rating || 0) - (b.avg_rating || 0));
    else if (filters.sortBy === "price-asc") filtered.sort((a, b) => (priceOrder[a.price_range as keyof typeof priceOrder] || 2) - (priceOrder[b.price_range as keyof typeof priceOrder] || 2));
    else if (filters.sortBy === "price-desc") filtered.sort((a, b) => (priceOrder[b.price_range as keyof typeof priceOrder] || 2) - (priceOrder[a.price_range as keyof typeof priceOrder] || 2));

    return filtered;
  }, [searchQuery, filters, restaurants]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRestaurants, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  if (loading) {
    return (
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Ristoranti Partner</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Scopri i migliori ristoranti e prenota il tuo tavolo con un click
          </p>
          
          <UnifiedSearchBar 
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            onNearMe={handleNearMe}
            filters={filters}
          />
        </div>

        <SponsoredCarousel />
        
        {paginatedRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Nessun ristorante trovato</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedRestaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  cuisine={restaurant.cuisine_type || 'Cucina Italiana'}
                  location={restaurant.address}
                  city={restaurant.city}
                  rating={restaurant.avg_rating || 0}
                  priceRange={restaurant.price_range || '€€'}
                  image={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                  logoUrl={restaurant.logo_url}
                  available={true}
                  sponsored={false}
                  coordinates={{ lat: 0, lng: 0 }}
                  cuisineTypes={restaurant.cuisine_types}
                  specializations={restaurant.specializations}
                  occasions={restaurant.occasions}
                  extraFeatures={restaurant.extra_features}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Precedente</Button>
                <span className="text-muted-foreground mx-4">Pagina {currentPage} di {totalPages}</span>
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Successiva</Button>
              </div>
            )}
          </>
        )}

        <Dialog open={showMap} onOpenChange={setShowMap}>
          <DialogContent className="max-w-6xl h-[80vh]">
            <DialogHeader><DialogTitle>Ristoranti vicino a te</DialogTitle></DialogHeader>
            {!mapboxToken ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <MapPin className="w-16 h-16 text-primary" />
                <p className="text-muted-foreground text-center mt-4">Token Mapbox mancante</p>
              </div>
            ) : userLocation ? (
              <Map accessToken={mapboxToken} center={[userLocation.lng, userLocation.lat]} zoom={12} restaurants={[]} userLocation={userLocation} />
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default RestaurantList;