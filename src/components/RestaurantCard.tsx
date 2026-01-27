import { Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
import { useTilt } from "@/hooks/useTilt";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RestaurantCardCarousel } from "./RestaurantCardCarousel";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  city: string;
  rating: number;
  reviewCount?: number;
  priceRange: string;
  image: string;
  logoUrl?: string | null;
  galleryImages?: string[];
  available: boolean;
  sponsored: boolean;
  coordinates: { lat: number; lng: number };
  cuisineTypes?: string[];
  specializations?: string[];
  occasions?: string[];
  extraFeatures?: string[];
}

const RestaurantCard = ({ 
  id,
  name, 
  city,
  location,
  rating,
  reviewCount = 0,
  priceRange, 
  image,
  logoUrl,
  galleryImages = [],
  sponsored,
  cuisineTypes = [],
  specializations = [],
  occasions = [],
}: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { ref, style, handlers } = useTilt({ max: 8, scale: 1.02, speed: 300 });

  const handleCardClick = () => {
    navigate(`/restaurant/${id}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(String(id));
  };

  // Combina i primi tag per mostrare (max 3)
  const displayTags = [
    ...(cuisineTypes?.slice(0, 1) || []),
    ...(specializations?.slice(0, 1) || []),
    ...(occasions?.slice(0, 1) || [])
  ].slice(0, 3);

  // Convert rating to filled dots (out of 5)
  const filledDots = Math.round(rating);
  const totalDots = 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="cursor-pointer group/card"
      onClick={handleCardClick}
    >
      {/* Card verticale con effetto 3D tilt */}
      <div 
        ref={ref}
        style={style}
        {...handlers}
        className="relative rounded-xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-2xl will-change-transform"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/10" />
        </div>

        {/* Immagine - più alta per aspetto verticale */}
        <div className="relative h-56 overflow-hidden">
          {galleryImages.length > 0 ? (
            <RestaurantCardCarousel 
              images={galleryImages} 
              alt={name} 
            />
          ) : (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
          )}
          
          {/* Badge Sponsorizzato */}
          {sponsored && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs shadow-lg">
              Sponsorizzato
            </Badge>
          )}
          
          {/* Heart button - stile TripAdvisor con animazione */}
          <button
            onClick={handleFavoriteClick}
            aria-label={isFavorite(String(id)) ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Heart 
              className={`w-5 h-5 transition-all duration-300 ${
                isFavorite(String(id)) 
                  ? 'fill-red-500 text-red-500 scale-110' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Content area */}
        <div className="relative p-4 bg-card">
          {/* City badge */}
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-muted rounded-sm text-muted-foreground mb-2">
            {city}
          </span>

          {/* Restaurant name and price */}
          <div className="flex items-center gap-3 mb-2">
            {logoUrl && (
              <motion.img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-sm"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            )}
            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 flex-1 group-hover/card:text-primary transition-colors duration-300">
              {name}
            </h4>
            <span className="text-sm font-semibold text-primary flex-shrink-0">{priceRange}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {displayTags.length > 0 ? (
              displayTags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5 transition-all duration-200 hover:bg-primary/10"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                Ristorante
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 group-hover/card:text-foreground/80 transition-colors duration-300">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Rating - stile TripAdvisor con animazione */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{rating.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[...Array(totalDots)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring", stiffness: 500 }}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      i < filledDots ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              {reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden">
          <div className="absolute -inset-full top-0 h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/5 group-hover/card:animate-[shimmer_1.5s_ease-in-out]" />
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
