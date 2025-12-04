import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { MobileUserMenu } from "@/components/MobileUserMenu";
import { DesktopUserMenu } from "@/components/DesktopUserMenu";
import { BusinessUserMenu } from "@/components/BusinessUserMenu";
import { MobileBusinessMenu } from "@/components/MobileBusinessMenu";
import { NotificationBell } from "@/components/NotificationBell";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, isBusinessMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine if user is in business section based on current route
  const isInBusinessSection = location.pathname.startsWith('/dashboard') || 
                               location.pathname.startsWith('/business') ||
                               location.pathname.startsWith('/billing') ||
                               location.pathname.startsWith('/onboarding');

  const getLogoLink = () => {
    // If not logged in and in business section, return to business page
    if (!isLoggedIn && isInBusinessSection) return "/business";
    // If not logged in and not in business section, return to home
    if (!isLoggedIn) return "/";
    // If logged in as business user, go to dashboard
    if (isBusinessMode) return "/dashboard";
    // Regular users always go to restaurants
    return "/restaurants";
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const link = getLogoLink();
    if (location.pathname === link) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={getLogoLink()} onClick={handleLogoClick} className="flex items-center gap-0">
          <span className="text-2xl font-bold text-foreground">One</span>
          <span className="text-2xl font-bold text-primary">Table</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {!isLoggedIn && (
            <>
              {isInBusinessSection && (
                <Link to="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                  Prezzi
                </Link>
              )}
              <Link to={isInBusinessSection ? '/' : '/business'} className="text-sm font-medium text-foreground hover:text-primary transition-colors mr-2">
                {isInBusinessSection ? 'Home' : t('nav.forBusiness')}
              </Link>
            </>
          )}

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              {isBusinessMode && <NotificationBell />}
              {isBusinessMode ? <BusinessUserMenu /> : <DesktopUserMenu />}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={isInBusinessSection ? '/business-login' : '/auth'}>
                <Button variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50 rounded-full">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to={isInBusinessSection ? '/business-registration' : '/auth#signup'}>
                <Button className="bg-primary hover:bg-primary/90 text-background font-semibold rounded-full">
                  Registrati
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu - Show user menu icon when logged in, hamburger when not */}
        {isLoggedIn ? (
          <div className="md:hidden flex items-center gap-2">
            {isBusinessMode && <NotificationBell />}
            {isBusinessMode ? <MobileBusinessMenu /> : <MobileUserMenu />}
          </div>
        ) : (
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile menu - Only show when NOT logged in */}
      {mobileMenuOpen && !isLoggedIn && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {isInBusinessSection && (
              <Link to="/pricing" className="py-2 text-foreground" onClick={() => setMobileMenuOpen(false)}>
                Prezzi
              </Link>
            )}
            <Link to={isInBusinessSection ? '/' : '/business'} className="py-2 text-foreground" onClick={() => setMobileMenuOpen(false)}>
              {isInBusinessSection ? 'Home' : t('nav.forBusiness')}
            </Link>
            <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
            <Link to={isInBusinessSection ? '/business-login' : '/auth'} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50">
                {t('nav.login')}
              </Button>
            </Link>
            <Link to={isInBusinessSection ? '/business-registration' : '/auth#signup'} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-background font-semibold">
                Registrati
              </Button>
            </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
