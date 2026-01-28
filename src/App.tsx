import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAnalytics } from "./hooks/useAnalytics";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import CookieConsent from "./components/CookieConsent";
import CustomCursor from "./components/CustomCursor";
import AudioPlayer from "./components/AudioPlayer";
import PageTransition from "./components/PageTransition";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AnimatePresence } from "framer-motion";

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

// Animated routes wrapper
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Critical routes - no lazy loading */}
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
          <Route path="/restaurants" element={<PageTransition><RestaurantsApp /></PageTransition>} />
          <Route path="/restaurant/:id" element={<PageTransition><RestaurantDetail /></PageTransition>} />
          
          {/* User routes */}
          <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
          <Route path="/my-bookings" element={<PageTransition><MyBookings /></PageTransition>} />
          <Route path="/reviews" element={<PageTransition><Reviews /></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><Favorites /></PageTransition>} />
          
          {/* Business routes */}
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="/business" element={<PageTransition><Business /></PageTransition>} />
          <Route path="/business-login" element={<PageTransition><BusinessLogin /></PageTransition>} />
          <Route path="/business-registration" element={<PageTransition><BusinessRegistration /></PageTransition>} />
          <Route path="/restaurant-registration" element={<PageTransition><RestaurantRegistration /></PageTransition>} />
          <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
          <Route path="/pricing" element={<PageTransition><Pricing /></PageTransition>} />
          <Route path="/promo" element={<PageTransition><Promo /></PageTransition>} />
          <Route path="/analytics" element={<PageTransition><Analytics /></PageTransition>} />
          <Route path="/billing" element={<PageTransition><Billing /></PageTransition>} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
          <Route path="/admin-setup" element={<PageTransition><AdminSetup /></PageTransition>} />
          
          {/* Legal pages */}
          <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
          <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
          <Route path="/cookies" element={<PageTransition><Cookies /></PageTransition>} />
          <Route path="/gdpr" element={<PageTransition><GDPR /></PageTransition>} />
          
          {/* Utility pages */}
          <Route path="/status" element={<PageTransition><Status /></PageTransition>} />
          
          {/* Catch-all */}
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsWrapper>
              <CustomCursor />
              <AudioPlayer />
              <CookieConsent />
              <AnimatedRoutes />
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
