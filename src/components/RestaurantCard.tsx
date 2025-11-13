import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock } from "lucide-react";

interface RestaurantCardProps {
  name: string;
  cuisine: string;
  location: string;
  rating: number;
  priceRange: string;
  image: string;
  available: boolean;
}

const RestaurantCard = ({ 
  name, 
  cuisine, 
  location, 
  rating, 
  priceRange, 
  image,
  available 
}: RestaurantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        {available && (
          <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Disponibile
          </Badge>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-card-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{cuisine}</p>
          </div>
          <div className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 text-accent" fill="currentColor" />
            <span className="font-semibold text-sm">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          {location}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-primary">{priceRange}</span>
          <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">
            Prenota Ora
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default RestaurantCard;
