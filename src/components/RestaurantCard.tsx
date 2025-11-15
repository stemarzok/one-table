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
  available,
  sponsored
}: RestaurantCardProps) => {
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
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
            <h3 className="text-xl font-bold text-card-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-primary" fill="currentColor" />
            <span className="font-semibold text-sm">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">{priceRange}</span>
          <Button 
            onClick={() => navigate(`/restaurant/${id}?tab=booking`)}
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
