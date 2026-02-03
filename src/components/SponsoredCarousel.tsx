import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useFavorites } from "@/hooks/useFavorites";
import { motion } from "framer-motion";
import { RestaurantCardCarousel } from "./RestaurantCardCarousel";
import { useTilt } from "@/hooks/useTilt";

interface SponsoredRestaurant {
  id: string;
  name: string;
  cuisine_type: string | null;
  city: string;
  cover_image_url: string | null;
  logo_url: string | null;
  gallery_images: string[] | null;
  price_range: string | null;
  avg_rating?: number;
  total_reviews?: number;
  cuisine_types?: string[];
}

// Componente card separato con effetto 3D tilt
interface SponsoredCardProps {
  restaurant: SponsoredRestaurant;
  index: number;
  isFavorite: boolean;
  onFavoriteClick: (e: React.MouseEvent) => void;
  onClick: () => void;
}

const SponsoredCard = ({ restaurant, index, isFavorite, onFavoriteClick, onClick }: SponsoredCardProps) => {
  const { ref, style, handlers } = useTilt({ max: 12, scale: 1.02 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="flex-shrink-0 w-[220px] cursor-pointer group/card"
      style={{ perspective: 1000 }}
      onClick={onClick}
    >
      {/* Card con effetto 3D tilt */}
      <motion.div 
        ref={ref as any}
        className="relative rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm transition-shadow duration-300"
        style={{ ...style, borderRadius: '1rem' }}
        {...handlers}
      >
        {/* Shine effect overlay */}
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover/card:translate-x-[200%] transition-transform duration-1000 ease-out"
          />
        </div>

        {/* Immagine */}
        <div className="relative h-56 overflow-hidden">
          {(restaurant.gallery_images?.length ?? 0) > 0 ? (
            <RestaurantCardCarousel 
              images={restaurant.gallery_images!} 
              alt={restaurant.name} 
            />
          ) : (
            <img
              src={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
              alt={restaurant.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
            />
          )}
          
          {/* Heart button */}
          <motion.button
            onClick={onFavoriteClick}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200"
          >
            <Heart 
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </motion.button>
        </div>

        {/* Content area */}
        <div className="p-4 bg-card relative">
          {/* Subtle glow on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            {/* City badge */}
            <span className="inline-block px-2 py-0.5 text-xs font-medium bg-muted rounded-sm text-muted-foreground mb-2">
              {restaurant.city}
            </span>

            {/* Restaurant name */}
            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 mb-2 min-h-[2.5rem]">
              {restaurant.name}
            </h4>

            {/* Rating with animated dots */}
            {(restaurant.avg_rating ?? 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground">
                  {restaurant.avg_rating?.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 15,
                        delay: index * 0.1 + i * 0.05
                      }}
                      className={`w-3 h-3 rounded-full ${
                        i < Math.round(restaurant.avg_rating || 0)
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                {(restaurant.total_reviews ?? 0) > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({restaurant.total_reviews})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SponsoredCarousel = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [restaurants, setRestaurants] = useState<SponsoredRestaurant[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    fetchSponsoredRestaurants();
  }, []);

  const fetchSponsoredRestaurants = async () => {
    const { data: sponsored } = await supabase
      .from('restaurants')
      .select('id, name, cuisine_type, city, cover_image_url, logo_url, gallery_images, price_range, cuisine_types, is_sponsored')
      .eq('is_active', true)
      .eq('is_sponsored', true)
      .limit(10);

    if (sponsored && sponsored.length > 0) {
      const withRatings = await Promise.all(
        sponsored.map(async (r) => {
          const { data } = await supabase.rpc('get_restaurant_rating', { restaurant_id_param: r.id });
          return { 
            ...r, 
            avg_rating: data?.[0]?.avg_rating || 0,
            total_reviews: data?.[0]?.total_reviews || 0
          };
        })
      );
      setRestaurants(withRatings);
    } else {
      const { data: topRated } = await supabase
        .from('restaurants')
        .select('id, name, cuisine_type, city, cover_image_url, logo_url, gallery_images, price_range, cuisine_types')
        .eq('is_active', true)
        .limit(10);

      if (topRated) {
        const withRatings = await Promise.all(
          topRated.map(async (r) => {
            const { data } = await supabase.rpc('get_restaurant_rating', { restaurant_id_param: r.id });
            return { 
              ...r, 
              avg_rating: data?.[0]?.avg_rating || 0,
              total_reviews: data?.[0]?.total_reviews || 0
            };
          })
        );
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
      const scrollAmount = 280;
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

  const handleFavoriteClick = (e: React.MouseEvent, restaurantId: string) => {
    e.stopPropagation();
    toggleFavorite(restaurantId);
  };

  if (restaurants.length === 0) return null;

  return (
    <div className="mb-10 overflow-x-hidden">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Consigliati per te
        </h3>
        <p className="text-sm text-muted-foreground">Esperienze selezionate per te</p>
      </div>

      <div className="relative group">
        {/* Navigation Arrows */}
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${!canScrollLeft ? 'hidden' : ''}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${!canScrollRight ? 'hidden' : ''}`}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>

        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-4 scroll-smooth touch-pan-x px-1 -mx-1 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain' }}
        >
          {restaurants.map((restaurant, index) => (
            <SponsoredCard
              key={restaurant.id}
              restaurant={restaurant}
              index={index}
              isFavorite={isFavorite(restaurant.id)}
              onFavoriteClick={(e) => handleFavoriteClick(e, restaurant.id)}
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsoredCarousel;
