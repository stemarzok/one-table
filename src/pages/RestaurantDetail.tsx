import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Phone, Mail, Star, Utensils, CreditCard, Check, Users } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDialog } from "@/components/ReviewDialog";
import { ReviewsList } from "@/components/ReviewsList";
import { HeroCarousel } from "@/components/restaurant/HeroCarousel";
import { BookingWidget } from "@/components/restaurant/BookingWidget";
import { OpeningHoursDisplay } from "@/components/restaurant/OpeningHoursDisplay";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<any>(null);
  const [showAllDescription, setShowAllDescription] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    if (!id) return;
    
    try {
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single();

      if (restaurantError) throw restaurantError;
      setRestaurant(restaurantData);

      const { data: menuData } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurant_id', id)
        .eq('is_available', true);

      setMenuItems(menuData || []);

      // Fetch rating
      const { data: ratingData } = await supabase.rpc('get_restaurant_rating', {
        restaurant_id_param: id
      });
      
      if (ratingData && ratingData.length > 0) {
        setRating(ratingData[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedMenu = useMemo(() => {
    return menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, any[]>);
  }, [menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-[50vh] bg-muted rounded-xl" />
              <div className="h-8 bg-muted rounded w-1/3 mx-auto" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Ristorante non trovato</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const description = restaurant.description || "";
  const truncatedDescription = description.length > 300 
    ? description.substring(0, 300) + "..." 
    : description;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Carousel */}
          <div className="mb-6">
            <HeroCarousel 
              coverImage={restaurant.cover_image_url}
              galleryImages={restaurant.gallery_images}
              restaurantName={restaurant.name}
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Restaurant Header */}
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {restaurant.logo_url && (
                  <img 
                    src={restaurant.logo_url} 
                    alt={`${restaurant.name} logo`}
                    className="w-20 h-20 rounded-xl object-cover border-2 border-border shadow-sm"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {rating?.avg_rating && (
                      <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                        <Star className="w-5 h-5 fill-primary text-primary" />
                        <span className="font-semibold text-primary">{rating.avg_rating}</span>
                        <span className="text-muted-foreground text-sm">
                          ({rating.total_reviews} recensioni)
                        </span>
                      </div>
                    )}
                    {restaurant.price_range && (
                      <Badge variant="outline" className="text-sm">
                        {restaurant.price_range}
                      </Badge>
                    )}
                    {restaurant.cuisine_type && (
                      <Badge variant="secondary">{restaurant.cuisine_type}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurant.address}, {restaurant.city}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Info - In breve */}
              <div>
                <h2 className="text-xl font-semibold mb-4">In breve</h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="underline">{restaurant.phone}</span>
                  </a>
                  <a href={`mailto:${restaurant.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="underline">{restaurant.email}</span>
                  </a>
                </div>
              </div>

              {/* Description - Info */}
              {description && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {showAllDescription ? description : truncatedDescription}
                    </p>
                    {description.length > 300 && (
                      <button 
                        onClick={() => setShowAllDescription(!showAllDescription)}
                        className="text-primary font-medium mt-2 hover:underline"
                      >
                        {showAllDescription ? "Mostra meno" : "Scopri di più"} ▾
                      </button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Features - Caratteristiche */}
              {(restaurant.extra_features?.length > 0 || restaurant.specializations?.length > 0 || restaurant.occasions?.length > 0) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Caratteristiche</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {restaurant.extra_features?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {restaurant.extra_features.map((feature: string) => (
                          <div key={feature} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {restaurant.occasions?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {restaurant.occasions.map((occasion: string) => (
                          <Badge key={occasion} variant="outline">{occasion}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Menu Section */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    Menu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(groupedMenu).length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nessun piatto disponibile al momento
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupedMenu).map(([category, items]: [string, any[]]) => (
                        <div key={category}>
                          <h3 className="font-semibold text-lg mb-3 text-primary">{category}</h3>
                          <div className="space-y-3">
                            {items.map((item: any) => (
                              <div 
                                key={item.id} 
                                className="flex justify-between items-start py-3 border-b border-border/50 last:border-0"
                              >
                                <div className="flex-1 pr-4">
                                  <h4 className="font-medium">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <span className="font-semibold text-primary whitespace-nowrap">
                                  €{item.price.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Recensioni
                      {rating?.total_reviews > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {rating.total_reviews}
                        </Badge>
                      )}
                    </CardTitle>
                    <ReviewDialog restaurantId={id!} onReviewSubmitted={fetchRestaurant} />
                  </div>
                </CardHeader>
                <CardContent>
                  <ReviewsList restaurantId={id!} />
                </CardContent>
              </Card>
            </div>

            {/* Right column - Booking widget & hours */}
            <div className="space-y-6">
              <BookingWidget restaurantId={id!} restaurantName={restaurant.name} />
              
              <OpeningHoursDisplay openingHours={restaurant.opening_hours} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
