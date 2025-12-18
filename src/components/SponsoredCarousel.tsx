import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SponsoredRestaurant {
  id: string;
  name: string;
  cuisine_type: string | null;
  city: string;
  cover_image_url: string | null;
  logo_url: string | null;
  price_range: string | null;
  avg_rating?: number;
  cuisine_types?: string[];
}

const SponsoredCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [restaurants, setRestaurants] = useState<SponsoredRestaurant[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchSponsoredRestaurants();
  }, []);

  const fetchSponsoredRestaurants = async () => {
    // Fetch sponsored restaurants, or all if none are sponsored (for demo)
    const { data: sponsored } = await supabase
      .from('restaurants')
      .select('id, name, cuisine_type, city, cover_image_url, logo_url, price_range, cuisine_types, is_sponsored')
      .eq('is_active', true)
      .eq('is_sponsored', true)
      .limit(10);

    if (sponsored && sponsored.length > 0) {
      // Fetch ratings
      const withRatings = await Promise.all(
        sponsored.map(async (r) => {
          const { data } = await supabase.rpc('get_restaurant_rating', { restaurant_id_param: r.id });
          return { ...r, avg_rating: data?.[0]?.avg_rating || 0 };
        })
      );
      setRestaurants(withRatings);
    } else {
      // Fallback: show top rated restaurants as "suggestions"
      const { data: topRated } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, city, cover_image_url, logo_url, price_range, cuisine_types')
        .eq('is_active', true)
        .limit(10);

      if (topRated) {
        const withRatings = await Promise.all(
          topRated.map(async (r) => {
            const { data } = await supabase.rpc('get_restaurant_rating', { restaurant_id_param: r.id });
            return { ...r, avg_rating: data?.[0]?.avg_rating || 0 };
          })
        );
        // Sort by rating
        withRatings.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        setRestaurants(withRatings);
      }
    }
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, [restaurants]);

  if (restaurants.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Consigliati per te
          </h3>
          <p className="text-sm text-muted-foreground">Ristoranti selezionati in base alle tue preferenze</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            className="flex-shrink-0 w-72 overflow-hidden cursor-pointer hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
          >
            <div className="relative h-40 overflow-hidden">
              <img
                src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center gap-2">
                  {restaurant.logo_url && (
                    <img
                      src={restaurant.logo_url}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover border border-white/30"
                    />
                  )}
                  <h4 className="text-white font-semibold truncate">{restaurant.name}</h4>
                </div>
              </div>
              <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs">
                Consigliato
              </Badge>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  {restaurant.cuisine_types?.slice(0, 2).map((type, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">
                      {type}
                    </Badge>
                  ))}
                </div>
                {(restaurant.avg_rating ?? 0) > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="w-3.5 h-3.5 text-primary" fill="currentColor" />
                    <span className="font-medium">{restaurant.avg_rating?.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{restaurant.city}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SponsoredCarousel;