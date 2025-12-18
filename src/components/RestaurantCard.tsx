import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  city: string;
  rating: number; reviewCount?: number;
  priceRange: string;
  image: string;
  logoUrl?: string | null;
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
  cuisine, 
  location, 
  rating, reviewCount = 0,
  priceRange, 
  image,
  logoUrl,
  available,
  sponsored,
  cuisineTypes = [],
  specializations = [],
  occasions = [],
  extraFeatures = []
}: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleCardClick = () => {
    navigate(`/restaurant/${id}`);
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
    <Card 
      className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-card border-border/50 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {sponsored && (
          <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs">
            Sponsorizzato
          </Badge>
        )}
        <button
          className="absolute top-3 left-3 w-8 h-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(String(id));
          }}
        >
          <Heart 
            className={`w-4 h-4 ${isFavorite(String(id)) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} 
          />
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-4 bg-card">
        {/* Logo, Name and Price */}
        <div className="flex items-center gap-3 mb-2">
          {logoUrl && (
            <img 
              src={logoUrl} 
              alt={`${name} logo`}
              className="w-10 h-10 rounded-full object-cover border border-border"
            />
          )}
          <h3 className="text-lg font-bold text-foreground truncate flex-1">{name}</h3>
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
        
        {/* Rating - stile promo TripAdvisor */}
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
    </Card>
  );
};

export default RestaurantCard;