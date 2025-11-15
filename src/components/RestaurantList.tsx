import RestaurantCard from "./RestaurantCard";
import RestaurantFilters, { FilterState } from "./RestaurantFilters";
import SearchBar from "./SearchBar";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";

const restaurants = [
  {
    id: 1,
    name: "La Terrazza del Sole",
    cuisine: "Cucina Italiana Gourmet",
    location: "Centro Storico, Milano",
    city: "milano",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    available: true,
    sponsored: true,
    coordinates: { lat: 45.4654, lng: 9.1859 }
  },
  {
    id: 2,
    name: "Sushi Zen Garden",
    cuisine: "Giapponese Fusion",
    location: "Brera, Milano",
    city: "milano",
    rating: 4.9,
    priceRange: "€€€€",
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=800&q=80",
    available: true,
    sponsored: false,
    coordinates: { lat: 45.4719, lng: 9.1881 }
  },
  {
    id: 3,
    name: "Trattoria del Porto",
    cuisine: "Cucina Mediterranea",
    location: "Navigli, Milano",
    city: "milano",
    rating: 4.7,
    priceRange: "€€",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&q=80",
    available: false,
    sponsored: false,
    coordinates: { lat: 45.4500, lng: 9.1732 }
  },
  {
    id: 4,
    name: "Le Jardin Étoilé",
    cuisine: "Cucina Francese",
    location: "Porta Venezia, Milano",
    city: "milano",
    rating: 4.9,
    priceRange: "€€€€",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    available: true,
    sponsored: true,
    coordinates: { lat: 45.4773, lng: 9.2080 }
  },
  {
    id: 5,
    name: "Osteria della Luna",
    cuisine: "Cucina Tradizionale",
    location: "Porta Romana, Milano",
    city: "milano",
    rating: 4.6,
    priceRange: "€€",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80",
    available: true,
    sponsored: false,
    coordinates: { lat: 45.4511, lng: 9.2038 }
  },
  {
    id: 6,
    name: "The Urban Bistrot",
    cuisine: "Cucina Contemporanea",
    location: "Isola, Milano",
    city: "milano",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80",
    available: false,
    sponsored: true,
    coordinates: { lat: 45.4875, lng: 9.1889 }
  },
  {
    id: 7,
    name: "Ristorante Roma Antica",
    cuisine: "Cucina Romana",
    location: "Centro, Roma",
    city: "roma",
    rating: 4.7,
    priceRange: "€€",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    available: true,
    sponsored: false,
    coordinates: { lat: 41.9028, lng: 12.4964 }
  },
  {
    id: 8,
    name: "Trattoria Fiorentina",
    cuisine: "Cucina Toscana",
    location: "Centro, Firenze",
    city: "firenze",
    rating: 4.8,
    priceRange: "€€€",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    available: true,
    sponsored: false,
    coordinates: { lat: 43.7696, lng: 11.2558 }
  }
 ];
 
// Estendi la lista per mostrare più pagine (demo)
const extraRestaurants = Array.from({ length: 24 }).map((_, idx) => {
  const base = restaurants[idx % restaurants.length];
  return {
    ...base,
    id: 100 + idx + 1,
    name: `${base.name} ${idx + 1}`,
    sponsored: (idx % 3) === 0,
  };
});
const allRestaurants = [...restaurants, ...extraRestaurants];

const RestaurantList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    radius: 5,
    priceRange: "all",
    sortBy: "rating-desc"
  });

  const filteredRestaurants = useMemo(() => {
    let filtered = [...allRestaurants];

    // Filtra per ricerca
    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtra per città
    if (filters.city !== "all") {
      filtered = filtered.filter(r => r.city === filters.city);
    }

    // Filtra per prezzo
    if (filters.priceRange !== "all") {
      filtered = filtered.filter(r => r.priceRange === filters.priceRange);
    }

    // Ordina
    switch (filters.sortBy) {
      case "rating-desc":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "rating-asc":
        filtered.sort((a, b) => a.rating - b.rating);
        break;
      case "price-asc":
        filtered.sort((a, b) => a.priceRange.length - b.priceRange.length);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.priceRange.length - a.priceRange.length);
        break;
    }

    return filtered;
  }, [searchQuery, filters]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const paginatedRestaurants = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    return filteredRestaurants.slice(startIdx, startIdx + itemsPerPage);
  }, [filteredRestaurants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters]);

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
          restaurants={allRestaurants}
        />
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-full"
            >
              Precedente
            </Button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className="rounded-full w-10 h-10 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full"
            >
              Successivo
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantList;
