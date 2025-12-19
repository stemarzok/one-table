import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RestaurantCard from '@/components/RestaurantCard';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  cuisine_type: string | null;
  price_range: string | null;
  address: string;
  city: string;
  cover_image_url: string | null;
  logo_url: string | null;
  avg_rating?: number;
  total_reviews?: number;
}

const Favorites = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavorites();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Business users cannot access client pages
    if (isBusinessMode) {
      navigate('/dashboard');
      return;
    }
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    
    if (!favoritesLoading && favorites.length > 0) {
      fetchFavoriteRestaurants();
    } else if (!favoritesLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, isBusinessMode, favorites, favoritesLoading, navigate]);

  const fetchFavoriteRestaurants = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .in('id', favorites)
        .eq('is_active', true);

      if (error) throw error;

      // Fetch ratings for each restaurant
      const restaurantsWithRatings = await Promise.all(
        (data || []).map(async (restaurant) => {
          const { data: ratingData } = await supabase
            .rpc('get_restaurant_rating', { restaurant_id_param: restaurant.id });
          
          return {
            ...restaurant,
            avg_rating: ratingData?.[0]?.avg_rating || 0,
            total_reviews: Number(ratingData?.[0]?.total_reviews ?? 0),
          };
        })
      );

      setRestaurants(restaurantsWithRatings);
    } catch (error: any) {
      console.error('Error fetching favorite restaurants:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i ristoranti preferiti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <p className="text-muted-foreground">Caricamento...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              I Miei Preferiti
            </h1>
            <p className="text-muted-foreground">
              {restaurants.length > 0 
                ? `${restaurants.length} ristorante${restaurants.length > 1 ? 'i' : ''} salvat${restaurants.length > 1 ? 'i' : 'o'}`
                : 'Nessun ristorante salvato'
              }
            </p>
          </div>

          {restaurants.length === 0 ? (
            <Card className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold mb-2">Nessun preferito ancora</h2>
              <p className="text-muted-foreground mb-6">
                Inizia ad aggiungere i tuoi ristoranti preferiti per trovarli facilmente qui
              </p>
              <Button onClick={() => navigate('/restaurants')}>
                Esplora Ristoranti
              </Button>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurants.map((restaurant) => (
                <RestaurantCard 
                  key={restaurant.id}
                  id={restaurant.id}
                  name={restaurant.name}
                  cuisine={restaurant.cuisine_type || 'Cucina Italiana'}
                  location={restaurant.address}
                  city={restaurant.city}
                  rating={restaurant.avg_rating || 0}
                  reviewCount={restaurant.total_reviews || 0}
                  priceRange={restaurant.price_range || '€€'}
                  image={restaurant.cover_image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}
                  logoUrl={restaurant.logo_url}
                  available={true}
                  sponsored={false}
                  coordinates={{ lat: 0, lng: 0 }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
