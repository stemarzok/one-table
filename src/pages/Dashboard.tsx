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
import { LayoutDashboard, Store, Table2, UtensilsCrossed, Calendar, AlertCircle, CheckCircle, Clock, XCircle, Lock, ArrowRight, TrendingUp, Users, HelpCircle, CreditCard, Crown, Star, Sparkles, ExternalLink } from "lucide-react";
import { TablesManagement } from "@/components/dashboard/TablesManagement";
import { MenuManagement } from "@/components/dashboard/MenuManagement";
import { BookingsManagement } from "@/components/dashboard/BookingsManagement";
import { PaywallModal } from "@/components/PaywallModal";
import { DashboardTutorial } from "@/components/dashboard/DashboardTutorial";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
                {/* Stats Cards con gradenti colorati */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Prenotazioni In Attesa */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => handleStatClick('bookings')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-amber-500/20 group-hover:scale-110 transition-transform">
                          <Clock className="w-6 h-6 text-amber-500" />
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
                      </div>
                      <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingBookings}</p>
                      <p className="text-sm text-muted-foreground font-medium">In attesa</p>
                    </div>
                  </Card>

                  {/* Prenotazioni Confermate */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => handleStatClick('bookings')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/20 group-hover:scale-110 transition-transform">
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
                      </div>
                      <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.confirmedBookings}</p>
                      <p className="text-sm text-muted-foreground font-medium">Confermate</p>
                    </div>
                  </Card>

                  {/* Valutazione Media */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => navigate('/reviews')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform">
                          <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <div className="flex items-baseline gap-1">
                        <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{stats.avgRating > 0 ? stats.avgRating : '-'}</p>
                        {stats.avgRating > 0 && <span className="text-yellow-500 text-lg">★</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Valutazione media</p>
                    </div>
                  </Card>

                  {/* Recensioni Totali */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => navigate('/reviews')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <p className="text-4xl font-bold text-primary">{stats.totalReviews}</p>
                      <p className="text-sm text-muted-foreground font-medium">Recensioni</p>
                    </div>
                  </Card>
                </div>

                {/* Seconda riga: Abbonamento + Stats secondarie */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* Subscription Status - occupa 2 colonne */}
                  <Card className={`lg:col-span-2 relative overflow-hidden ${
                    subscription.subscribed 
                      ? 'bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-background border-emerald-500/30' 
                      : subscription.inTrial 
                        ? 'bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-background border-amber-500/30'
                        : 'bg-gradient-to-br from-red-500/15 via-red-500/5 to-background border-red-500/30'
                  }`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${
                            subscription.subscribed 
                              ? 'bg-emerald-500/20' 
                              : subscription.inTrial 
                                ? 'bg-amber-500/20'
                                : 'bg-red-500/20'
                          }`}>
                            <Crown className={`w-8 h-8 ${
                              subscription.subscribed 
                                ? 'text-emerald-500' 
                                : subscription.inTrial 
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">Abbonamento</h3>
                            <p className="text-muted-foreground">
                              {subscription.planType === 'promo_speciale' ? 'Promo Speciale' : 
                               subscription.planType === 'pro' ? 'Piano Pro' : 
                               subscription.planType === 'base' ? 'Piano Base' : 'Nessun piano attivo'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {subscription.subscribed ? (
                            <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-sm px-3 py-1">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Attivo
                            </Badge>
                          ) : subscription.inTrial ? (
                            <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-sm px-3 py-1">
                              <Clock className="w-3 h-3 mr-1" />
                              {subscription.trialDaysRemaining} giorni trial
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="bg-red-500/20 text-red-500 border-red-500/30 text-sm px-3 py-1">
                              Non attivo
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {subscription.subscribed && subscription.currentPeriodEnd && (
                            <span>
                              {subscription.cancelAtPeriodEnd ? '⚠️ Scade il' : 'Rinnovo il'}{' '}
                              <span className="font-medium text-foreground">
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'long'
                                })}
                              </span>
                            </span>
                          )}
                        </div>
                        <Button 
                          size="sm"
                          variant={subscription.subscribed ? "outline" : "default"}
                          onClick={() => navigate('/billing')}
                          className="gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          {subscription.subscribed ? 'Gestisci' : 'Attiva ora'}
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Tavoli */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => handleStatClick('tables')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 group-hover:scale-110 transition-transform">
                          <Table2 className="w-6 h-6 text-blue-500" />
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
                      </div>
                      <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{stats.tables}</p>
                      <p className="text-sm text-muted-foreground font-medium">Tavoli</p>
                    </div>
                  </Card>

                  {/* Piatti Menu */}
                  <Card 
                    className="group relative overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1"
                    onClick={() => handleStatClick('menu')}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent" />
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 group-hover:scale-110 transition-transform">
                          <UtensilsCrossed className="w-6 h-6 text-purple-500" />
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4 text-muted-foreground" /> : <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />}
                      </div>
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">{stats.menuItems}</p>
                      <p className="text-sm text-muted-foreground font-medium">Piatti nel menu</p>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions & Preview */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Menu Items con preview visiva */}
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <UtensilsCrossed className="w-5 h-5 text-primary" />
                        Anteprima Menu
                      </h3>
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
                      <div className="text-center py-12 text-muted-foreground">
                        <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nessun piatto nel menu</p>
                        <Button variant="outline" size="sm" className="mt-3" onClick={() => handleStatClick('menu')}>
                          Aggiungi piatto
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {recentMenuItems.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <UtensilsCrossed className="w-5 h-5 text-primary/50" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-sm text-muted-foreground">{item.category}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="font-semibold">€{item.price}</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Quick Links con icone e descrizioni */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Azioni Rapide
                    </h3>
                    <div className="grid gap-3">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-4 hover:bg-primary/5 hover:border-primary/30"
                        onClick={() => handleStatClick('bookings')}
                      >
                        <div className="p-2 rounded-lg bg-yellow-500/10 mr-3">
                          <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium">Gestisci Prenotazioni</p>
                          <p className="text-xs text-muted-foreground">{stats.pendingBookings} in attesa di conferma</p>
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-4 hover:bg-primary/5 hover:border-primary/30"
                        onClick={() => handleStatClick('tables')}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 mr-3">
                          <Table2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium">Gestisci Tavoli</p>
                          <p className="text-xs text-muted-foreground">{stats.tables} tavoli configurati</p>
                        </div>
                        {!hasProAccess ? <Lock className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto py-4 hover:bg-primary/5 hover:border-primary/30"
                        onClick={() => navigate('/analytics')}
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10 mr-3">
                          <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-medium">Visualizza Analytics</p>
                          <p className="text-xs text-muted-foreground">Statistiche avanzate</p>
                        </div>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </div>
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
    </div>
  );
};

export default Dashboard;
