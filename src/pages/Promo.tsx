import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Megaphone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useAdminRole } from "@/hooks/useAdminRole";
import { supabase } from "@/integrations/supabase/client";
import { SponsorshipManagement } from "@/components/dashboard/SponsorshipManagement";

const Promo = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const { hasRole, loading: businessLoading, businessRoles } = useBusinessRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const navigate = useNavigate();
  
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  
  const loading = businessLoading || adminLoading;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    if (!loading && !isBusinessMode && !isAdmin && !hasRole()) {
      navigate("/restaurants");
    }
  }, [isLoggedIn, isBusinessMode, isAdmin, hasRole, loading, navigate]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (isAdmin) {
        const { data } = await supabase.from('restaurants').select('*').order('name');
        if (data) {
          setAllRestaurants(data);
          if (data.length > 0 && !selectedRestaurantId) {
            setSelectedRestaurantId(data[0].id);
          }
        }
      } else if (businessRoles.length > 0) {
        const restaurantIds = businessRoles.map(r => r.restaurant_id);
        const { data } = await supabase.from('restaurants').select('*').in('id', restaurantIds);
        if (data) {
          setAllRestaurants(data);
          if (data.length > 0 && !selectedRestaurantId) {
            setSelectedRestaurantId(data[0].id);
          }
        }
      }
    };
    if (!loading) fetchRestaurants();
  }, [isAdmin, businessRoles, loading, selectedRestaurantId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Caricamento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAdmin && !hasRole()) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Accesso non autorizzato</h1>
              <p className="text-muted-foreground mb-6">Non hai i permessi per accedere a questa pagina.</p>
              <Button onClick={() => navigate('/dashboard')}>Torna alla Dashboard</Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  const currentRestaurant = allRestaurants.find(r => r.id === selectedRestaurantId);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-6 h-6 text-primary" />
                    <h1 className="text-3xl font-bold">Promozione</h1>
                  </div>
                  {currentRestaurant && (
                    <p className="text-muted-foreground mt-1">{currentRestaurant.name}</p>
                  )}
                </div>
              </div>
              {allRestaurants.length > 1 && (
                <div className="w-full md:w-64">
                  <Select value={selectedRestaurantId} onValueChange={setSelectedRestaurantId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona ristorante" />
                    </SelectTrigger>
                    <SelectContent>
                      {allRestaurants.map((rest) => (
                        <SelectItem key={rest.id} value={rest.id}>
                          {rest.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {selectedRestaurantId ? (
            <SponsorshipManagement restaurantId={selectedRestaurantId} />
          ) : (
            <Card className="p-12 text-center">
              <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Nessun ristorante selezionato</h2>
              <p className="text-muted-foreground">Seleziona un ristorante per gestire le promozioni.</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Promo;
