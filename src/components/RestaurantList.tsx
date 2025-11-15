import RestaurantCard from "./RestaurantCard";
import RestaurantFilters, { FilterState } from "./RestaurantFilters";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string | null;
  address: string;
  city: string;
  price_range: string | null;
  cover_image_url: string | null;
  is_active: boolean;
}

const RestaurantList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 9;
  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    radius: 5,
    priceRange: "all",
    sortBy: "rating-desc"
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Filtra per ricerca
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.cuisine_type && r.cuisine_type.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filtra per città
    if (filters.city !== "all") {
      filtered = filtered.filter(r => r.city.toLowerCase() === filters.city.toLowerCase());
    }

    // Filtra per prezzo
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(r => r.price_range === filters.priceRange);
    }

    return filtered;
  }, [searchQuery, filters, restaurants]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRestaurants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

  if (loading) {
    return (
      <section id="ristoranti" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="ristoranti" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Ristoranti Partner
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Scopri i migliori ristoranti e prenota il tuo tavolo con un click
          </p>
          
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar onSearch={(q) => setSearchQuery(q)} />
          </div>
        </div>
        
        <RestaurantFilters 
          onFilterChange={setFilters}
          restaurants={restaurants.map(r => ({
            id: parseInt(r.id) || 0,
            name: r.name,
            cuisine: r.cuisine_type || '',
            location: r.address,
            city: r.city.toLowerCase(),
            rating: 4.5,
            priceRange: r.price_range || '€€',
            image: r.cover_image_url || '',
            available: true,
            sponsored: false,
            coordinates: { lat: 0, lng: 0 }
          }))}
        />
        
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
                  rating={4.5}
                  priceRange={restaurant.price_range || '€€'}
                  image={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                  available={true}
                  sponsored={false}
                  coordinates={{ lat: 0, lng: 0 }}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Precedente
                </Button>
                <span className="text-muted-foreground mx-4">
                  Pagina {currentPage} di {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Successiva
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default RestaurantList;
