import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "./hooks/useAnalytics";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import CookieConsent from "./components/CookieConsent";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Critical routes - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RestaurantsApp from "./pages/RestaurantsApp";
import RestaurantDetail from "./pages/RestaurantDetail";
import NotFound from "./pages/NotFound";

// Lazy loaded routes - loaded on demand
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const MyBookings = lazy(() => import("./pages/MyBookings"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Business = lazy(() => import("./pages/Business"));
const BusinessLogin = lazy(() => import("./pages/BusinessLogin"));
const BusinessRegistration = lazy(() => import("./pages/BusinessRegistration"));
const RestaurantRegistration = lazy(() => import("./pages/RestaurantRegistration"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Promo = lazy(() => import("./pages/Promo"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminSetup = lazy(() => import("./pages/AdminSetup"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Billing = lazy(() => import("./pages/Billing"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const GDPR = lazy(() => import("./pages/GDPR"));
const Status = lazy(() => import("./pages/Status"));

const queryClient = new QueryClient();

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
};

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsWrapper>
              <CookieConsent />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Critical routes - no lazy loading */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/restaurants" element={<RestaurantsApp />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                  
                  {/* User routes */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/favorites" element={<Favorites />} />
                  
                  {/* Business routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/business" element={<Business />} />
                  <Route path="/business-login" element={<BusinessLogin />} />
                  <Route path="/business-registration" element={<BusinessRegistration />} />
                  <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/promo" element={<Promo />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/billing" element={<Billing />} />
                  
                  {/* Admin routes */}
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin-setup" element={<AdminSetup />} />
                  
                  {/* Legal pages */}
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookies" element={<Cookies />} />
                  <Route path="/gdpr" element={<GDPR />} />
                  
                  {/* Utility pages */}
                  <Route path="/status" element={<Status />} />
                  
                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
