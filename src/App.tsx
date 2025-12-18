import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAnalytics } from "./hooks/useAnalytics";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import CookieConsent from "./components/CookieConsent";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Business from "./pages/Business";
import BusinessLogin from "./pages/BusinessLogin";
import Profile from "./pages/Profile";
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantsApp from "./pages/RestaurantsApp";
import MyBookings from "./pages/MyBookings";
import Favorites from "./pages/Favorites";
import RestaurantRegistration from "./pages/RestaurantRegistration";
import BusinessRegistration from "./pages/BusinessRegistration";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import AdminPanel from "./pages/AdminPanel";
import AdminSetup from "./pages/AdminSetup";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import GDPR from "./pages/GDPR";
import Status from "./pages/Status";
import Settings from "./pages/Settings";
import Pricing from "./pages/Pricing";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnalyticsWrapper = ({ children }: { children: React.ReactNode }) => {
  useAnalytics();
  return <>{children}</>;
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
              <CookieConsent />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/business" element={<Business />} />
                <Route path="/business-login" element={<BusinessLogin />} />
                <Route path="/restaurants" element={<RestaurantsApp />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/restaurant-registration" element={<RestaurantRegistration />} />
                <Route path="/business-registration" element={<BusinessRegistration />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin-setup" element={<AdminSetup />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/gdpr" element={<GDPR />} />
                <Route path="/status" element={<Status />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnalyticsWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
