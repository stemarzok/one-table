import { Heart, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";
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
      {/* Card verticale stile TripAdvisor */}
      <div className="relative rounded-xl overflow-hidden bg-card border border-border/30 shadow-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
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
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          )}
          
          {/* Badge Sponsorizzato */}
          {sponsored && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs">
              Sponsorizzato
            </Badge>
          )}
          
          {/* Heart button - stile TripAdvisor */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
          >
            <Heart 
              className={`w-5 h-5 transition-colors duration-200 ${
                isFavorite(String(id)) 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-600 hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Content area */}
        <div className="p-4 bg-card">
          {/* City badge */}
          <span className="inline-block px-2 py-0.5 text-xs font-medium bg-muted rounded-sm text-muted-foreground mb-2">
            {city}
          </span>

          {/* Restaurant name and price */}
          <div className="flex items-center gap-3 mb-2">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
            )}
            <h4 className="font-semibold text-foreground text-sm leading-tight line-clamp-2 flex-1">
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
                  className="text-xs px-2 py-0.5"
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          {/* Rating - stile TripAdvisor */}
          {rating > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground">{rating.toFixed(1)}</span>
              <div className="flex">
                {[...Array(totalDots)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
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
      </div>
    </motion.div>
  );
};

export default RestaurantCard;
