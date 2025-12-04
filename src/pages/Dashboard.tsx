import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Store, Table2, UtensilsCrossed, Calendar, AlertCircle, Info, CheckCircle, Clock, XCircle, BarChart3, MessageSquare, Lock, ArrowRight, TrendingUp, Users, Bell } from "lucide-react";
import { TablesManagement } from "@/components/dashboard/TablesManagement";
import { MenuManagement } from "@/components/dashboard/MenuManagement";
import { BookingsManagement } from "@/components/dashboard/BookingsManagement";
import { RestaurantInfo } from "@/components/dashboard/RestaurantInfo";
import { RestaurantAnalytics } from "@/components/dashboard/RestaurantAnalytics";
import { NotificationsCenter } from "@/components/dashboard/NotificationsCenter";
import { ReviewsManagement } from "@/components/dashboard/ReviewsManagement";
import { PaywallModal } from "@/components/PaywallModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const { hasRole, loading: businessLoading, businessRoles } = useBusinessRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const subscription = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    tables: 0, 
    menuItems: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalReviews: 0,
    avgRating: 0
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentMenuItems, setRecentMenuItems] = useState<any[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<any[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>("");
  
  const loading = businessLoading || adminLoading;
  
  // Tabs that require Pro subscription (notifications removed from this list)
  const proTabs = ['analytics', 'reviews', 'bookings', 'tables', 'menu'];
  const hasProAccess = isAdmin || subscription.hasAccess;

  // Handle URL tab parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl) {
      if (proTabs.includes(tabFromUrl) && !hasProAccess) {
        setShowPaywall(true);
      } else {
        setActiveTab(tabFromUrl);
      }
      // Clear the tab param from URL
      searchParams.delete('tab');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, hasProAccess]);

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

  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (selectedRestaurantId) {
        const { data } = await supabase.from('restaurants').select('*').eq('id', selectedRestaurantId).maybeSingle();
        if (data) {
          setRestaurant(data);
          const [tablesResult, menuResult, bookingsResult, reviewsResult, recentBookingsResult, recentMenuResult] = await Promise.all([
            supabase.from('restaurant_tables').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
            supabase.from('menus').select('id', { count: 'exact' }).eq('restaurant_id', data.id),
            supabase.from('bookings').select('id, status').eq('restaurant_id', data.id),
            supabase.from('reviews').select('rating').eq('restaurant_id', data.id),
            supabase.from('bookings').select('*').eq('restaurant_id', data.id).order('created_at', { ascending: false }).limit(5),
            supabase.from('menus').select('*').eq('restaurant_id', data.id).order('created_at', { ascending: false }).limit(4),
          ]);
          
          const bookings = bookingsResult.data || [];
          const reviews = reviewsResult.data || [];
          const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
          const pendingCount = bookings.filter(b => b.status === 'pending').length;
          const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 0;
          
          setStats({ 
            tables: tablesResult.count || 0, 
            menuItems: menuResult.count || 0,
            totalBookings: bookings.length,
            confirmedBookings: confirmedCount,
            pendingBookings: pendingCount,
            cancelledBookings: cancelledCount,
            totalReviews: reviews.length,
            avgRating: Math.round(avgRating * 10) / 10
          });
          setRecentBookings(recentBookingsResult.data || []);
          setRecentMenuItems(recentMenuResult.data || []);
        }
      }
    };
    fetchRestaurantDetails();
  }, [selectedRestaurantId]);

  const handleTabChange = (value: string) => {
    if (proTabs.includes(value) && !hasProAccess) {
      setShowPaywall(true);
      return;
    }
    setActiveTab(value);
  };

  const handlePaywallClose = () => {
    // Reset to overview when paywall is closed
    setActiveTab("overview");
  };

  const handleStatClick = (tab: string) => {
    if (proTabs.includes(tab) && !hasProAccess) {
      setShowPaywall(true);
      return;
    }
    setActiveTab(tab);
  };

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
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="overview">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('dashboard.overview')}</span>
              </TabsTrigger>
              <TabsTrigger value="info">
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Info & Foto</span>
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Notifiche</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="relative">
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Analytics</span>
                {!hasProAccess && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="relative">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Recensioni</span>
                {!hasProAccess && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger value="bookings" className="relative">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Prenotazioni</span>
                {!hasProAccess && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger value="tables" className="relative">
                <Table2 className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('dashboard.tables')}</span>
                {!hasProAccess && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
              </TabsTrigger>
              <TabsTrigger value="menu" className="relative">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('dashboard.menu')}</span>
                {!hasProAccess && <Lock className="w-3 h-3 absolute -top-1 -right-1 text-muted-foreground" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${!hasProAccess ? 'opacity-75' : ''}`}
                    onClick={() => handleStatClick('bookings')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Calendar className="w-10 h-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Totale Prenotazioni</p>
                          <p className="text-3xl font-bold">{stats.totalBookings}</p>
                        </div>
                      </div>
                      {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${!hasProAccess ? 'opacity-75' : ''}`}
                    onClick={() => handleStatClick('bookings')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Clock className="w-10 h-10 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">In Attesa</p>
                          <p className="text-3xl font-bold">{stats.pendingBookings}</p>
                        </div>
                      </div>
                      {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${!hasProAccess ? 'opacity-75' : ''}`}
                    onClick={() => handleStatClick('tables')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Table2 className="w-10 h-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Tavoli</p>
                          <p className="text-3xl font-bold">{stats.tables}</p>
                        </div>
                      </div>
                      {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </Card>
                  
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${!hasProAccess ? 'opacity-75' : ''}`}
                    onClick={() => handleStatClick('menu')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <UtensilsCrossed className="w-10 h-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Piatti</p>
                          <p className="text-3xl font-bold">{stats.menuItems}</p>
                        </div>
                      </div>
                      {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </Card>
                </div>

                {/* Secondary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
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
                      <XCircle className="w-10 h-10 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cancellate</p>
                        <p className="text-3xl font-bold">{stats.cancelledBookings}</p>
                      </div>
                    </div>
                  </Card>
                  <Card 
                    className={`p-6 cursor-pointer transition-all hover:shadow-md ${!hasProAccess ? 'opacity-75' : ''}`}
                    onClick={() => handleStatClick('reviews')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <TrendingUp className="w-10 h-10 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Recensioni</p>
                          <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold">{stats.totalReviews}</p>
                            {stats.avgRating > 0 && (
                              <Badge variant="secondary">⭐ {stats.avgRating}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </Card>
                </div>

                {/* Quick Actions & Previews */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Menu Items */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Anteprima Menu</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleStatClick('menu')}
                        className="gap-1"
                      >
                        Vedi tutto
                        {!hasProAccess ? <Lock className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
                      </Button>
                    </div>
                    {recentMenuItems.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Nessun piatto nel menu</p>
                    ) : (
                      <div className="space-y-3">
                        {recentMenuItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>
                            <Badge variant="secondary">€{item.price}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Quick Links */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
                    <div className="grid gap-3">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-3"
                        onClick={() => handleStatClick('bookings')}
                      >
                        <Calendar className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Gestisci Prenotazioni</p>
                          <p className="text-xs text-muted-foreground">{stats.pendingBookings} in attesa di conferma</p>
                        </div>
                        {!hasProAccess && <Lock className="w-4 h-4 ml-auto" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-3"
                        onClick={() => handleStatClick('tables')}
                      >
                        <Table2 className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Gestisci Tavoli</p>
                          <p className="text-xs text-muted-foreground">{stats.tables} tavoli configurati</p>
                        </div>
                        {!hasProAccess && <Lock className="w-4 h-4 ml-auto" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-3"
                        onClick={() => handleStatClick('menu')}
                      >
                        <UtensilsCrossed className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Modifica Menu</p>
                          <p className="text-xs text-muted-foreground">{stats.menuItems} piatti</p>
                        </div>
                        {!hasProAccess && <Lock className="w-4 h-4 ml-auto" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-3"
                        onClick={() => setActiveTab('info')}
                      >
                        <Info className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">Modifica Info Ristorante</p>
                          <p className="text-xs text-muted-foreground">Foto, orari, descrizione</p>
                        </div>
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="info">
              {restaurant && <RestaurantInfo restaurant={restaurant} onUpdate={() => setSelectedRestaurantId(selectedRestaurantId)} />}
            </TabsContent>
            <TabsContent value="notifications">
              {selectedRestaurantId && <NotificationsCenter restaurantId={selectedRestaurantId} />}
            </TabsContent>
            <TabsContent value="analytics">
              {hasProAccess && selectedRestaurantId && <RestaurantAnalytics restaurantId={selectedRestaurantId} />}
            </TabsContent>
            <TabsContent value="reviews">
              {hasProAccess && selectedRestaurantId && <ReviewsManagement restaurantId={selectedRestaurantId} />}
            </TabsContent>
            <TabsContent value="bookings">
              {hasProAccess && selectedRestaurantId && <BookingsManagement restaurantId={selectedRestaurantId} />}
            </TabsContent>
            <TabsContent value="tables">
              {hasProAccess && selectedRestaurantId && <TablesManagement restaurantId={selectedRestaurantId} />}
            </TabsContent>
            <TabsContent value="menu">
              {hasProAccess && selectedRestaurantId && <MenuManagement restaurantId={selectedRestaurantId} />}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        onClose={handlePaywallClose}
      />
    </div>
  );
};

export default Dashboard;
