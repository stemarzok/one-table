import { useParams } from "react-router-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Star, Utensils, Check, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewDialog } from "@/components/ReviewDialog";
import { ReviewsList } from "@/components/ReviewsList";
import { HeroCarousel } from "@/components/restaurant/HeroCarousel";
import { BookingWidget } from "@/components/restaurant/BookingWidget";
import { OpeningHoursDisplay } from "@/components/restaurant/OpeningHoursDisplay";
import { SectionNav } from "@/components/restaurant/SectionNav";
import { RatingBreakdown } from "@/components/restaurant/RatingBreakdown";
import { QuickLinks } from "@/components/restaurant/QuickLinks";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/useFavorites";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState<any>(null);
  const [showAllDescription, setShowAllDescription] = useState(false);
  const [activeSection, setActiveSection] = useState("panoramica");
  const { favorites, toggleFavorite } = useFavorites();

  // Section refs
  const panoramicaRef = useRef<HTMLDivElement>(null);
  const orariRef = useRef<HTMLDivElement>(null);
  const posizioneRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const recensioniRef = useRef<HTMLDivElement>(null);

  const isFavorite = id ? favorites.includes(id) : false;

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

  const scrollToSection = (section: string) => {
    setActiveSection(section);
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      panoramica: panoramicaRef,
      orari: orariRef,
      posizione: posizioneRef,
      menu: menuRef,
      recensioni: recensioniRef,
    };
    
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      
      <main className="pt-16">
        {/* Restaurant Name Header */}
        <div className="bg-background border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                {restaurant.logo_url && (
                  <img 
                    src={restaurant.logo_url} 
                    alt={`${restaurant.name} logo`}
                    className="w-14 h-14 rounded-xl object-cover border border-border shadow-sm"
                  />
                )}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {restaurant.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {rating?.avg_rating && (
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-3 h-3 rounded-full ${
                                star <= Math.round(rating.avg_rating) 
                                  ? 'bg-green-500' 
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-primary font-medium ml-1">
                          ({rating.total_reviews} recensioni)
                        </span>
                      </div>
                    )}
                    {restaurant.cuisine_type && (
                      <span className="text-sm text-muted-foreground">
                        • {restaurant.cuisine_type}
                      </span>
                    )}
                    {restaurant.price_range && (
                      <span className="text-sm text-muted-foreground">
                        • {restaurant.price_range}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => id && toggleFavorite(id)}
                  className="gap-2"
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorite ? 'Salvato' : 'Salva'}
                </Button>
                <ReviewDialog restaurantId={id!} onReviewSubmitted={fetchRestaurant}>
                  <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                    <Star className="w-4 h-4" />
                    Scrivi una recensione
                  </Button>
                </ReviewDialog>
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <SectionNav activeSection={activeSection} onSectionClick={scrollToSection} />

        <div className="container mx-auto px-4 py-6">
          {/* Hero Carousel */}
          <div className="mb-8">
            <HeroCarousel 
              coverImage={restaurant.cover_image_url}
              galleryImages={restaurant.gallery_images}
              restaurantName={restaurant.name}
            />
          </div>

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Main info */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Panoramica Section */}
              <section ref={panoramicaRef} id="panoramica" className="scroll-mt-32">
                <h2 className="text-xl font-semibold mb-4">In breve</h2>
                
                {/* Quick Links */}
                <QuickLinks 
                  phone={restaurant.phone}
                  email={restaurant.email}
                  address={`${restaurant.address}, ${restaurant.city}`}
                  onScrollToMenu={() => scrollToSection('menu')}
                />

                {/* Description */}
                {description && (
                  <div className="mt-6 p-5 bg-muted/30 rounded-xl">
                    <h3 className="font-semibold mb-2">Info</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {showAllDescription ? description : truncatedDescription}
                    </p>
                    {description.length > 300 && (
                      <button 
                        onClick={() => setShowAllDescription(!showAllDescription)}
                        className="text-primary font-medium mt-2 hover:underline text-sm"
                      >
                        {showAllDescription ? "Mostra meno" : "Scopri di più"} ▾
                      </button>
                    )}
                  </div>
                )}

                {/* Features */}
                {(restaurant.extra_features?.length > 0 || restaurant.occasions?.length > 0) && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Caratteristiche</h3>
                    <div className="flex flex-wrap gap-3">
                      {restaurant.extra_features?.map((feature: string) => (
                        <div key={feature} className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {restaurant.occasions?.map((occasion: string) => (
                        <Badge key={occasion} variant="outline" className="rounded-full">
                          {occasion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <Separator />

              {/* Posizione Section */}
              <section ref={posizioneRef} id="posizione" className="scroll-mt-32">
                <h2 className="text-xl font-semibold mb-4">Posizione</h2>
                <div className="bg-muted/30 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{restaurant.address}</p>
                      <p className="text-muted-foreground">{restaurant.city}</p>
                      <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${restaurant.address}, ${restaurant.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm mt-2 inline-block hover:underline"
                      >
                        Apri in Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Menu Section */}
              <section ref={menuRef} id="menu" className="scroll-mt-32">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" />
                  Menu
                </h2>
                
                {Object.keys(groupedMenu).length === 0 ? (
                  <div className="bg-muted/30 rounded-xl p-8 text-center">
                    <p className="text-muted-foreground">
                      Nessun piatto disponibile al momento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedMenu).map(([category, items]: [string, any[]]) => (
                      <div key={category} className="bg-muted/30 rounded-xl p-5">
                        <h3 className="font-semibold text-lg mb-4 text-primary">{category}</h3>
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
              </section>

              <Separator />

              {/* Recensioni Section */}
              <section ref={recensioniRef} id="recensioni" className="scroll-mt-32">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Recensioni
                    {rating?.total_reviews > 0 && (
                      <Badge variant="secondary" className="ml-2 rounded-full">
                        {rating.total_reviews}
                      </Badge>
                    )}
                  </h2>
                  <ReviewDialog restaurantId={id!} onReviewSubmitted={fetchRestaurant}>
                    <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
                      <Star className="w-4 h-4" />
                      Scrivi una recensione
                    </Button>
                  </ReviewDialog>
                </div>

                {/* Rating Breakdown */}
                {rating && <RatingBreakdown rating={rating} />}

                <div className="mt-6">
                  <ReviewsList restaurantId={id!} />
                </div>
              </section>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              <BookingWidget 
                restaurantId={id!} 
                restaurantName={restaurant.name} 
                openingHours={restaurant.opening_hours}
              />
              
              <div ref={orariRef} id="orari" className="scroll-mt-32">
                <OpeningHoursDisplay openingHours={restaurant.opening_hours} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
