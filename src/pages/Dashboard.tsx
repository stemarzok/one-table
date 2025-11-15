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
import { LayoutDashboard, Store, Table2, UtensilsCrossed, Calendar, AlertCircle } from "lucide-react";
import { TablesManagement } from "@/components/dashboard/TablesManagement";
import { MenuManagement } from "@/components/dashboard/MenuManagement";
import { BookingsManagement } from "@/components/dashboard/BookingsManagement";

const Dashboard = () => {
  const { isLoggedIn } = useAuth();
  const { hasRole, loading, businessRoles } = useBusinessRole();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [stats, setStats] = useState({ tables: 0, menuItems: 0 });

  useEffect(() => {
    if (!isLoggedIn) navigate("/auth");
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (businessRoles.length > 0) {
        const { data } = await supabase.from('restaurants').select('*').eq('id', businessRoles[0].restaurant_id).maybeSingle();
        if (data) {
          setRestaurant(data);
          const [tablesResult, menuResult] = await Promise.all([
            supabase.from('restaurant_tables').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
            supabase.from('menus').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
          ]);
          setStats({ tables: tablesResult.count || 0, menuItems: menuResult.count || 0 });
        }
      }
    };
    if (!loading && businessRoles.length > 0) fetchRestaurant();
  }, [businessRoles, loading]);

  if (loading) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 text-center"><p className="text-lg text-muted-foreground">{t('dashboard.loading')}</p></div></main><Footer /></div>;
  if (!hasRole()) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 max-w-2xl"><Card className="p-12 text-center"><AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" /><h1 className="text-3xl font-bold mb-4">{t('dashboard.noAccess')}</h1><p className="text-muted-foreground mb-6">{t('dashboard.noAccessMsg')}</p><Button onClick={() => navigate('/business-registration')}>Registra il Tuo Ristorante</Button></Card></div></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            {restaurant && <p className="text-xl text-muted-foreground">{restaurant.name}</p>}
          </div>
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
              <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('dashboard.overview')}</span></TabsTrigger>
              <TabsTrigger value="bookings"><Calendar className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Prenotazioni</span></TabsTrigger>
              <TabsTrigger value="restaurant"><Store className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('dashboard.restaurant')}</span></TabsTrigger>
              <TabsTrigger value="tables"><Table2 className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('dashboard.tables')}</span></TabsTrigger>
              <TabsTrigger value="menu"><UtensilsCrossed className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('dashboard.menu')}</span></TabsTrigger>
            </TabsList>
            <TabsContent value="overview"><div className="grid gap-6 md:grid-cols-2"><Card className="p-6"><div className="flex items-center gap-4"><Table2 className="w-10 h-10 text-primary" /><div><p className="text-sm text-muted-foreground">Totale Tavoli</p><p className="text-3xl font-bold">{stats.tables}</p></div></div></Card><Card className="p-6"><div className="flex items-center gap-4"><UtensilsCrossed className="w-10 h-10 text-primary" /><div><p className="text-sm text-muted-foreground">Piatti nel Menu</p><p className="text-3xl font-bold">{stats.menuItems}</p></div></div></Card></div></TabsContent>
            <TabsContent value="bookings">{restaurant && <BookingsManagement restaurantId={restaurant.id} />}</TabsContent>
            <TabsContent value="restaurant"><Card className="p-6"><h2 className="text-2xl font-bold mb-6">{t('dashboard.restaurantInfo')}</h2>{restaurant && <div className="space-y-4"><div><p className="text-sm text-muted-foreground">Nome</p><p className="text-lg font-medium">{restaurant.name}</p></div><div><p className="text-sm text-muted-foreground">Indirizzo</p><p className="text-lg font-medium">{restaurant.address}, {restaurant.city}</p></div></div>}</Card></TabsContent>
            <TabsContent value="tables">{restaurant && <TablesManagement restaurantId={restaurant.id} />}</TabsContent>
            <TabsContent value="menu">{restaurant && <MenuManagement restaurantId={restaurant.id} />}</TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
