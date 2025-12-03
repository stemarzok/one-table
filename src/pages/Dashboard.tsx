import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Store, Table2, UtensilsCrossed, Calendar, AlertCircle, Info, CheckCircle, Clock, XCircle, BarChart3, Bell, MessageSquare } from "lucide-react";
import { TablesManagement } from "@/components/dashboard/TablesManagement";
import { MenuManagement } from "@/components/dashboard/MenuManagement";
import { BookingsManagement } from "@/components/dashboard/BookingsManagement";
import { RestaurantInfo } from "@/components/dashboard/RestaurantInfo";
import { RestaurantAnalytics } from "@/components/dashboard/RestaurantAnalytics";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { ReviewsManagement } from "@/components/dashboard/ReviewsManagement";
import { PaywallModal } from "@/components/PaywallModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Dashboard = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const { hasRole, loading: businessLoading, businessRoles } = useBusinessRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const subscription = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [stats, setStats] = useState({
    tables: 0, 
    menuItems: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0
  });
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  
  const loading = businessLoading || adminLoading;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    // Client users (not in business mode) cannot access business dashboard
    if (!loading && !isBusinessMode && !isAdmin && !hasRole()) {
      navigate("/restaurants");
    }
  }, [isLoggedIn, isBusinessMode, isAdmin, hasRole, loading, navigate]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      if (isAdmin) {
        // Admin can see all restaurants
        const { data } = await supabase.from('restaurants').select('*').order('name');
        if (data) {
          setAllRestaurants(data);
          if (data.length > 0 && !selectedRestaurantId) {
            setSelectedRestaurantId(data[0].id);
          }
        }
      } else if (businessRoles.length > 0) {
        // Business user sees only their restaurants
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

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (selectedRestaurantId) {
        const { data } = await supabase.from('restaurants').select('*').eq('id', selectedRestaurantId).maybeSingle();
        if (data) {
          setRestaurant(data);
          const [tablesResult, menuResult, bookingsResult] = await Promise.all([
            supabase.from('restaurant_tables').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
            supabase.from('menus').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
            supabase.from('bookings').select('id, status').eq('restaurant_id', data.id),
          ]);
          
          const bookings = bookingsResult.data || [];
          const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
          const pendingCount = bookings.filter(b => b.status === 'pending').length;
          const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
          
          setStats({ 
            tables: tablesResult.count || 0, 
            menuItems: menuResult.count || 0,
            totalBookings: bookings.length,
            confirmedBookings: confirmedCount,
            pendingBookings: pendingCount,
            cancelledBookings: cancelledCount
          });
        }
      }
    };
    fetchRestaurantDetails();
  }, [selectedRestaurantId]);

  if (loading) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 text-center"><p className="text-lg text-muted-foreground">{t('dashboard.loading')}</p></div></main><Footer /></div>;
  if (!isAdmin && !hasRole()) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 max-w-2xl"><Card className="p-12 text-center"><AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" /><h1 className="text-3xl font-bold mb-4">{t('dashboard.noAccess')}</h1><p className="text-muted-foreground mb-6">{t('dashboard.noAccessMsg')}</p><Button onClick={() => navigate('/business-registration')}>Registra il Tuo Ristorante</Button></Card></div></main><Footer /></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
                {restaurant && <p className="text-xl text-muted-foreground">{restaurant.name}</p>}
                {/* Trial Badge */}
                {subscription.inTrial && subscription.trialDaysRemaining && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    💡 Trial attivo – {subscription.trialDaysRemaining} giorni rimasti
                  </div>
                )}
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
          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" /><span className="hidden sm:inline">{t('dashboard.overview')}</span></TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications"
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Notifiche</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reviews"
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Recensioni</span>
            </TabsTrigger>
            <TabsTrigger value="info"><Info className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Info & Foto</span></TabsTrigger>
            <TabsTrigger 
              value="bookings"
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Prenotazioni</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tables"
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <Table2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('dashboard.tables')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="menu"
              onClick={(e) => {
                if (!isAdmin && !subscription.hasAccess) {
                  e.preventDefault();
                  setShowPaywall(true);
                }
              }}
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('dashboard.menu')}</span>
            </TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Totale Prenotazioni</p>
                      <p className="text-3xl font-bold">{stats.totalBookings}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Confermate</p>
                      <p className="text-3xl font-bold">{stats.confirmedBookings}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Clock className="w-10 h-10 text-yellow-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">In Attesa</p>
                      <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <XCircle className="w-10 h-10 text-red-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cancellate</p>
                      <p className="text-3xl font-bold">{stats.cancelledBookings}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <Table2 className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Totale Tavoli</p>
                      <p className="text-3xl font-bold">{stats.tables}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <UtensilsCrossed className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Piatti nel Menu</p>
                      <p className="text-3xl font-bold">{stats.menuItems}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics">{selectedRestaurantId && <RestaurantAnalytics restaurantId={selectedRestaurantId} />}</TabsContent>
            <TabsContent value="notifications">{selectedRestaurantId && <NotificationsCenter restaurantId={selectedRestaurantId} />}</TabsContent>
            <TabsContent value="reviews">{selectedRestaurantId && <ReviewsManagement restaurantId={selectedRestaurantId} />}</TabsContent>
            <TabsContent value="info">{restaurant && <RestaurantInfo restaurant={restaurant} onUpdate={() => setSelectedRestaurantId(selectedRestaurantId)} />}</TabsContent>
            <TabsContent value="bookings">{selectedRestaurantId && <BookingsManagement restaurantId={selectedRestaurantId} />}</TabsContent>
            <TabsContent value="tables">{selectedRestaurantId && <TablesManagement restaurantId={selectedRestaurantId} />}</TabsContent>
            <TabsContent value="menu">{selectedRestaurantId && <MenuManagement restaurantId={selectedRestaurantId} />}</TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};

export default Dashboard;
