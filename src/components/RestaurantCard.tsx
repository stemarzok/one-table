import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavorites } from "@/hooks/useFavorites";

interface RestaurantCardProps {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  city: string;
  rating: number;
  priceRange: string;
  image: string;
  logoUrl?: string | null;
  available: boolean;
  sponsored: boolean;
  coordinates: { lat: number; lng: number };
}

const RestaurantCard = ({ 
  id,
  name, 
  cuisine, 
  location, 
  rating, 
  priceRange, 
  image,
  logoUrl,
  available,
  sponsored
}: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleCardClick = () => {
    navigate(`/restaurant/${id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay at bottom with logo and name */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4">
          <div className="flex items-center gap-3">
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={`${name} logo`}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
              />
            )}
            <h3 className="text-lg font-bold text-white truncate">{name}</h3>
          </div>
        </div>
        {sponsored && (
          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
            Sponsorizzato
          </Badge>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="absolute top-4 left-4 bg-background/90 hover:bg-background"
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(String(id));
          }}
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite(String(id)) ? 'fill-primary text-primary' : ''}`} 
          />
        </Button>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">{cuisine}</p>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-primary" fill="currentColor" />
              <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">{priceRange}</span>
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/restaurant/${id}?tab=booking`);
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
          >
            Prenota Ora
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
