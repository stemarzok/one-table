import Header from "@/components/Header";
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
import { LayoutDashboard, Store, Table2, UtensilsCrossed, Calendar, AlertCircle, Lock, ArrowRight, Users, HelpCircle, CreditCard, Crown, Star, Bell, Settings, Pencil } from "lucide-react";
import { TablesManagement } from "@/components/dashboard/TablesManagement";
import { MenuManagement } from "@/components/dashboard/MenuManagement";
import { BookingsManagement } from "@/components/dashboard/BookingsManagement";
import { PaywallModal } from "@/components/PaywallModal";
import { DashboardTutorial } from "@/components/dashboard/DashboardTutorial";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BookingsSparkline } from "@/components/dashboard/BookingsSparkline";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ContextualAlerts } from "@/components/dashboard/ContextualAlerts";
import { ProfileCompletionProgress } from "@/components/dashboard/ProfileCompletionProgress";
import { RestaurantInfoModal } from "@/components/dashboard/RestaurantInfoModal";

const Dashboard = () => {
  const { isLoggedIn, isBusinessMode, user } = useAuth();
  const { hasRole, loading: businessLoading, businessRoles } = useBusinessRole();
  const { isAdmin, loading: adminLoading } = useAdminRole();
  const subscription = useSubscription();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoModalTab, setInfoModalTab] = useState("info");
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
  
  // Tabs that require Pro subscription
  const proTabs = ['bookings', 'tables', 'menu'];
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

  // Check if user has completed onboarding tutorial
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();
        
        if (data && !data.onboarding_completed) {
          setShowTutorial(true);
          setTutorialCompleted(false);
        } else {
          setTutorialCompleted(true);
        }
      }
    };
    checkOnboardingStatus();
  }, [user?.id]);

  const handleTutorialComplete = async () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
  };

  const handleTutorialDismiss = async () => {
    setShowTutorial(false);
    setTutorialCompleted(true);
    if (user?.id) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id);
    }
  };

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
      // Admins can ONLY access restaurants where they have a business role
      // This prevents admins from seeing all restaurant data
      if (businessRoles.length > 0) {
        const restaurantIds = businessRoles.map(r => r.restaurant_id);
        const { data } = await supabase.from('restaurants').select('*').in('id', restaurantIds);
        if (data) {
          setAllRestaurants(data);
          if (data.length > 0 && !selectedRestaurantId) {
            setSelectedRestaurantId(data[0].id);
          }
        }
      } else if (isAdmin) {
        // Admins without business roles can access admin panel but not restaurant dashboards
        setAllRestaurants([]);
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

  if (loading) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 text-center"><p className="text-lg text-muted-foreground">{t('dashboard.loading')}</p></div></main></div>;
  if (!isAdmin && !hasRole()) return <div className="min-h-screen bg-background"><Header /><main className="pt-24 pb-16"><div className="container mx-auto px-4 max-w-2xl"><Card className="p-12 text-center"><AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" /><h1 className="text-3xl font-bold mb-4">{t('dashboard.noAccess')}</h1><p className="text-muted-foreground mb-6">{t('dashboard.noAccessMsg')}</p><Button onClick={() => navigate('/business-registration')}>Registra il Tuo Ristorante</Button></Card></div></main></div>;

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
              <div className="flex items-center gap-3">
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
                {tutorialCompleted && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTutorial(true)}
                    className="gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Tutorial</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Tutorial Section */}
          {showTutorial && (
            <div className="mb-8">
              <DashboardTutorial 
                onComplete={handleTutorialComplete} 
                onDismiss={handleTutorialDismiss} 
              />
            </div>
          )}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
              <TabsTrigger value="overview">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">{t('dashboard.overview')}</span>
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
              <div className="space-y-8">
                {/* Header del Ristorante */}
                {restaurant && (
                  <section className="relative overflow-hidden rounded-2xl border bg-card shadow-lg">
                    <div className="relative p-6 md:p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        {/* Logo */}
                        <div 
                          className="flex-shrink-0 cursor-pointer group relative"
                          onClick={() => {
                            setInfoModalTab("info");
                            setShowInfoModal(true);
                          }}
                        >
                          {restaurant.logo_url ? (
                            <img 
                              src={restaurant.logo_url} 
                              alt={restaurant.name}
                              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-4 border-background shadow-xl group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-4 border-background shadow-xl group-hover:scale-105 transition-transform">
                              <Store className="w-12 h-12 text-primary" />
                            </div>
                          )}
                          <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil className="w-3 h-3" />
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h2 className="text-2xl md:text-3xl font-bold mb-1">{restaurant.name}</h2>
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                {restaurant.cuisine_type && (
                                  <Badge variant="secondary" className="font-medium">
                                    {restaurant.cuisine_type}
                                  </Badge>
                                )}
                                {restaurant.price_range && (
                                  <Badge variant="secondary" className="font-medium">
                                    {restaurant.price_range}
                                  </Badge>
                                )}
                                {restaurant.city && (
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    📍 {restaurant.city}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Rating badge */}
                            {stats.totalReviews > 0 && (
                              <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                                <Star className="w-5 h-5 fill-primary text-primary" />
                                <span className="text-xl font-bold">{stats.avgRating}</span>
                                <span className="text-xs text-muted-foreground">({stats.totalReviews})</span>
                              </div>
                            )}
                          </div>
                          
                          {restaurant.description ? (
                            <p className="text-muted-foreground line-clamp-2 max-w-2xl mb-4">{restaurant.description}</p>
                          ) : (
                            <p className="text-muted-foreground/60 italic mb-4">Nessuna descrizione aggiunta</p>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setInfoModalTab("info");
                              setShowInfoModal(true);
                            }}
                            className="gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            Gestisci Info e Orari
                          </Button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}

                {/* Alert Contestuali */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Notifiche</h2>
                  </div>
                  <ContextualAlerts
                    pendingBookings={stats.pendingBookings}
                    tables={stats.tables}
                    menuItems={stats.menuItems}
                    hasLogo={!!restaurant?.logo_url}
                    hasDescription={!!restaurant?.description}
                    hasOpeningHours={!!restaurant?.opening_hours}
                    inTrial={subscription.inTrial || false}
                    trialDaysRemaining={subscription.trialDaysRemaining}
                    subscribed={subscription.subscribed || false}
                    onNavigate={handleTabChange}
                    onNavigateTo={navigate}
                    onOpenInfoModal={() => {
                      setInfoModalTab("info");
                      setShowInfoModal(true);
                    }}
                  />
                </section>

                {/* Progress Completamento Profilo */}
                {restaurant && (
                  <ProfileCompletionProgress
                    hasLogo={!!restaurant.logo_url}
                    hasCoverImage={!!restaurant.cover_image_url}
                    hasDescription={!!restaurant.description}
                    hasOpeningHours={!!restaurant.opening_hours}
                    tablesCount={stats.tables}
                    menuItemsCount={stats.menuItems}
                    onNavigateToTab={handleTabChange}
                    onOpenInfoModal={() => {
                      setInfoModalTab("info");
                      setShowInfoModal(true);
                    }}
                  />
                )}

                {/* Sezione Prenotazioni con Sparkline */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Prenotazioni</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleStatClick('bookings')}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">In attesa</span>
                          {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </div>
                        <p className="text-4xl font-bold mb-3">{stats.pendingBookings}</p>
                        {selectedRestaurantId && (
                          <BookingsSparkline restaurantId={selectedRestaurantId} status="pending" />
                        )}
                      </div>
                    </Card>
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleStatClick('bookings')}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">Confermate</span>
                          {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </div>
                        <p className="text-4xl font-bold mb-3">{stats.confirmedBookings}</p>
                        {selectedRestaurantId && (
                          <BookingsSparkline restaurantId={selectedRestaurantId} status="confirmed" />
                        )}
                      </div>
                    </Card>
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleStatClick('bookings')}
                    >
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">Totali (7gg)</span>
                          {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </div>
                        <p className="text-4xl font-bold mb-3">{stats.totalBookings}</p>
                        {selectedRestaurantId && (
                          <BookingsSparkline restaurantId={selectedRestaurantId} status="all" />
                        )}
                      </div>
                    </Card>
                  </div>
                </section>

                {/* Attività Recenti */}
                {selectedRestaurantId && (
                  <section>
                    <RecentActivity
                      restaurantId={selectedRestaurantId}
                      hasProAccess={hasProAccess}
                      onViewAll={() => handleTabChange('bookings')}
                    />
                  </section>
                )}

                {/* Sezione Struttura (Tavoli + Menu) */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Struttura</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleStatClick('tables')}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-muted">
                            <Table2 className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Tavoli configurati</p>
                            <p className="text-3xl font-bold">{stats.tables}</p>
                          </div>
                          {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </div>
                      </div>
                    </Card>
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => handleStatClick('menu')}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-muted">
                            <UtensilsCrossed className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Piatti nel menu</p>
                            <p className="text-3xl font-bold">{stats.menuItems}</p>
                          </div>
                          {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                        </div>
                      </div>
                    </Card>
                  </div>
                </section>

                {/* Sezione Recensioni */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Star className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Recensioni</h2>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => navigate('/reviews')}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-muted">
                            <Users className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Totale recensioni</p>
                            <p className="text-3xl font-bold">{stats.totalReviews}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Card>
                    <Card 
                      className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/30"
                      onClick={() => navigate('/reviews')}
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-muted">
                            <Star className="w-6 h-6 text-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Valutazione media</p>
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold">{stats.avgRating > 0 ? stats.avgRating : '-'}</p>
                              {stats.avgRating > 0 && <span className="text-primary">/ 5</span>}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </Card>
                  </div>
                </section>

                {/* Sezione Account */}
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Crown className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-semibold">Account</h2>
                  </div>
                  <Card>
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-xl ${
                            subscription.subscribed 
                              ? 'bg-primary/10' 
                              : subscription.inTrial 
                                ? 'bg-muted'
                                : 'bg-destructive/10'
                          }`}>
                            <CreditCard className={`w-6 h-6 ${
                              subscription.subscribed 
                                ? 'text-primary' 
                                : subscription.inTrial 
                                  ? 'text-foreground'
                                  : 'text-destructive'
                            }`} />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Abbonamento</p>
                            <p className="text-xl font-bold">
                              {subscription.subscribed ? (
                                subscription.planType === 'promo_speciale' ? 'Promo Speciale' : 
                                subscription.planType === 'pro' ? 'Piano Pro' : 
                                subscription.planType === 'base' ? 'Piano Base' : 'Attivo'
                              ) : subscription.inTrial ? (
                                `Trial (${subscription.trialDaysRemaining} giorni)`
                              ) : (
                                'Non attivo'
                              )}
                            </p>
                            {subscription.subscribed && subscription.currentPeriodEnd && (
                              <p className="text-sm text-muted-foreground">
                                {subscription.cancelAtPeriodEnd ? 'Scade' : 'Rinnovo'} il{' '}
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant={subscription.subscribed ? "outline" : "default"}
                          onClick={() => navigate('/billing')}
                          className="gap-2"
                        >
                          {subscription.subscribed ? 'Gestisci' : 'Attiva abbonamento'}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </section>
              </div>
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
      
      <PaywallModal 
        open={showPaywall} 
        onOpenChange={setShowPaywall}
        onClose={handlePaywallClose}
      />
      
      <RestaurantInfoModal
        open={showInfoModal}
        onOpenChange={setShowInfoModal}
        restaurant={restaurant}
        onUpdate={() => {
          // Refresh restaurant data
          if (selectedRestaurantId) {
            supabase.from('restaurants').select('*').eq('id', selectedRestaurantId).maybeSingle().then(({ data }) => {
              if (data) setRestaurant(data);
            });
          }
        }}
        defaultTab={infoModalTab}
      />
    </div>
  );
};

export default Dashboard;
