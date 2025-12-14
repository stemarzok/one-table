import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Star, Euro } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
}

const Favorites = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const { favorites, toggleFavorite, loading: favoritesLoading } = useFavorites();
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

      setRestaurants(data || []);
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
                <Card 
                  key={restaurant.id}
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div 
                    className="relative h-48 bg-muted"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    {restaurant.cover_image_url ? (
                      <img 
                        src={restaurant.cover_image_url} 
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Nessuna immagine</p>
                      </div>
                    )}
                    
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-4 right-4 bg-background/90 hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(restaurant.id);
                      }}
                    >
                      <Heart className="w-5 h-5 fill-primary text-primary" />
                    </Button>
                  </div>

                  <div 
                    className="p-6"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                        {restaurant.name}
                      </h3>
                      {restaurant.price_range && (
                        <div className="flex items-center text-muted-foreground">
                          <span className="text-sm">{restaurant.price_range}</span>
                        </div>
                      )}
                    </div>

                    {restaurant.cuisine_type && (
                      <p className="text-sm text-primary mb-2">{restaurant.cuisine_type}</p>
                    )}

                    {restaurant.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {restaurant.description}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="truncate">{restaurant.address}, {restaurant.city}</span>
                    </div>
                  </div>
                </Card>
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
