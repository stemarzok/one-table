import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('restaurant_id')
        .eq('user_id', user?.id);

      if (error) throw error;

      setFavorites(data?.map(f => f.restaurant_id) || []);
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (restaurantId: string) => {
    if (!user) {
      toast({
        title: 'Accedi per salvare i preferiti',
        description: 'Devi essere autenticato per aggiungere ristoranti ai preferiti',
        variant: 'destructive',
      });
      return;
    }

    try {
      const isFavorite = favorites.includes(restaurantId);

      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('restaurant_id', restaurantId);

        if (error) throw error;

        setFavorites(favorites.filter(id => id !== restaurantId));
        toast({
          title: 'Rimosso dai preferiti',
          description: 'Il ristorante è stato rimosso dai tuoi preferiti',
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, restaurant_id: restaurantId });

        if (error) throw error;

        setFavorites([...favorites, restaurantId]);
        toast({
          title: 'Aggiunto ai preferiti',
          description: 'Il ristorante è stato aggiunto ai tuoi preferiti',
        });
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore. Riprova più tardi.',
        variant: 'destructive',
      });
    }
  };

  const isFavorite = (restaurantId: string) => favorites.includes(restaurantId);

  return { favorites, loading, toggleFavorite, isFavorite, refetch: fetchFavorites };
};
