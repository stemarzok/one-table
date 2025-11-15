import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  Store, 
  Table2, 
  UtensilsCrossed, 
  Calendar, 
  TrendingUp,
  Megaphone,
  AlertCircle
} from "lucide-react";

const Dashboard = () => {
  const { isLoggedIn, profile } = useAuth();
  const { hasRole, loading, businessRoles } = useBusinessRole();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (businessRoles.length > 0) {
        const { data } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', businessRoles[0].restaurant_id)
          .maybeSingle();

        if (data) {
          setRestaurant(data);
        }
      }
    };

    if (!loading && businessRoles.length > 0) {
      fetchRestaurant();
    }
  }, [businessRoles, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">{t('dashboard.loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!hasRole()) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">{t('dashboard.noAccess')}</h1>
              <p className="text-muted-foreground mb-6">{t('dashboard.noAccessMsg')}</p>
              <Button onClick={() => navigate('/business-registration')}>
                Registra il Tuo Ristorante
              </Button>
            </Card>
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
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            {restaurant && (
              <p className="text-xl text-muted-foreground">{restaurant.name}</p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-10 h-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.todayBookings')}</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-10 h-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.monthRevenue')}</p>
                  <p className="text-2xl font-bold">€8,450</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Store className="w-10 h-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('dashboard.avgRating')}</p>
                  <p className="text-2xl font-bold">4.8</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Table2 className="w-10 h-10 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tavoli Totali</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.overview')}</span>
              </TabsTrigger>
              <TabsTrigger value="restaurant" className="flex items-center gap-2">
                <Store className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.restaurant')}</span>
              </TabsTrigger>
              <TabsTrigger value="tables" className="flex items-center gap-2">
                <Table2 className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.tables')}</span>
              </TabsTrigger>
              <TabsTrigger value="menu" className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.menu')}</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.bookings')}</span>
              </TabsTrigger>
              <TabsTrigger value="promote" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                <span className="hidden md:inline">{t('dashboard.promote')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.overview')}</h2>
                <p className="text-muted-foreground">
                  Dashboard overview - Qui vedrai le statistiche principali del tuo ristorante
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="restaurant">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.restaurantInfo')}</h2>
                {restaurant && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="text-lg font-medium">{restaurant.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Indirizzo</p>
                      <p className="text-lg font-medium">{restaurant.address}, {restaurant.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-lg font-medium">{restaurant.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefono</p>
                      <p className="text-lg font-medium">{restaurant.phone}</p>
                    </div>
                    <Button className="mt-4">{t('dashboard.editInfo')}</Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="tables">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t('dashboard.manageTables')}</h2>
                  <Button>{t('dashboard.addTable')}</Button>
                </div>
                <p className="text-muted-foreground">
                  Qui potrai gestire i tavoli del tuo ristorante
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="menu">
              <Card className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">{t('dashboard.manageMenu')}</h2>
                  <Button>{t('dashboard.addDish')}</Button>
                </div>
                <p className="text-muted-foreground">
                  Qui potrai gestire il menu del tuo ristorante
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="bookings">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.bookings')}</h2>
                <p className="text-muted-foreground">
                  Qui vedrai tutte le prenotazioni del tuo ristorante
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="promote">
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">{t('dashboard.promoteCampaign')}</h2>
                <p className="text-muted-foreground mb-6">
                  Crea campagne promozionali per aumentare la visibilità del tuo ristorante
                </p>
                <Button>{t('dashboard.createCampaign')}</Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
