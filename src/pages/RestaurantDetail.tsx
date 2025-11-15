import { useParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BookingDialog } from "@/components/BookingDialog";
import { ReviewDialog } from "@/components/ReviewDialog";
import { ReviewsList } from "@/components/ReviewsList";

const RestaurantDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<string>("menu");
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Caricamento...</p>
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

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src={restaurant.cover_image_url || restaurant.logo_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80"} 
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{restaurant.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    {restaurant.cuisine_type && (
                      <Badge variant="secondary" className="text-base">
                        {restaurant.cuisine_type}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-5 h-5" />
                      <span>{restaurant.city}</span>
                    </div>
                  </div>
                </div>
                <BookingDialog restaurantId={id!} restaurantName={restaurant.name} />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="reviews">Recensioni</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="menu" className="space-y-8">
              {Object.keys(groupedMenu).length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">Nessun piatto disponibile al momento</p>
                </Card>
              ) : (
                Object.entries(groupedMenu).map(([category, items]: [string, any[]]) => (
                  <Card key={category} className="p-6">
                    <h3 className="text-2xl font-semibold mb-6">{category}</h3>
                    <div className="space-y-4">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-start pb-4 border-b border-border last:border-0">
                          <div className="flex-1">
                            <h4 className="font-semibold">{item.name}</h4>
                            {item.description && (
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </div>
                          <span className="font-semibold text-primary ml-4">€{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div className="flex justify-end mb-4">
                <ReviewDialog restaurantId={id!} onReviewSubmitted={fetchRestaurant} />
              </div>
              <ReviewsList restaurantId={id!} />
            </TabsContent>

            <TabsContent value="info" className="space-y-6">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-6">Informazioni</h3>
                <div className="space-y-4">
                  {restaurant.description && (
                    <p className="text-muted-foreground">{restaurant.description}</p>
                  )}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Telefono</p>
                        <p className="font-medium">{restaurant.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{restaurant.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Indirizzo</p>
                        <p className="font-medium">{restaurant.address}</p>
                      </div>
                    </div>
                    {restaurant.opening_hours && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Orari</p>
                          <p className="font-medium">
                            {typeof restaurant.opening_hours === 'string' 
                              ? restaurant.opening_hours 
                              : JSON.stringify(restaurant.opening_hours)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;
