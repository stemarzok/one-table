import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { MobileUserMenu } from "@/components/MobileUserMenu";
import { DesktopUserMenu } from "@/components/DesktopUserMenu";
import { BusinessUserMenu } from "@/components/BusinessUserMenu";
import { MobileBusinessMenu } from "@/components/MobileBusinessMenu";
import { NotificationPopover } from "@/components/NotificationPopover";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, isBusinessMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Determine if we're on a landing page (where header should be transparent initially)
  const isLandingPage = location.pathname === '/' || location.pathname === '/business';
  
  // Determine if user is in business section based on current route
  const isInBusinessSection = location.pathname.startsWith('/dashboard') || 
                               location.pathname.startsWith('/business') ||
                               location.pathname.startsWith('/billing') ||
                               location.pathname.startsWith('/onboarding');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getLogoLink = () => {
    if (!isLoggedIn && isInBusinessSection) return "/business";
    if (!isLoggedIn) return "/";
    if (isBusinessMode) return "/dashboard";
    return "/restaurants";
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const link = getLogoLink();
    if (location.pathname === link) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Header classes based on scroll state and page type
  const headerClasses = isLandingPage
    ? scrolled
      ? "fixed top-0 left-0 right-0 z-50 bg-[hsl(0,0%,4%)] backdrop-blur-md shadow-header transition-all duration-200 ease-out"
      : "fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-200 ease-out"
    : "fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border";

  // Text color based on state
  const textColorClass = isLandingPage && !scrolled
    ? "text-white"
    : scrolled && isLandingPage
    ? "text-white"
    : "text-foreground";

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={getLogoLink()} onClick={handleLogoClick} className="flex items-center gap-0">
          <span className={`text-2xl font-extrabold ${isLandingPage ? 'text-white' : 'text-foreground'} transition-colors duration-200`}>One</span>
          <span className="text-2xl font-extrabold text-primary transition-colors duration-200">Table</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {!isLoggedIn && (
            <>
              {isInBusinessSection && (
                <>
                  <Link to="/" className={`text-sm font-semibold ${textColorClass} hover:text-primary transition-colors`}>
                    Home
                  </Link>
                  <Link to="/pricing" className={`text-sm font-semibold ${textColorClass} hover:text-primary transition-colors mr-2`}>
                    Prezzi
                  </Link>
                </>
              )}
              {!isInBusinessSection && (
                <Link to="/business" className={`text-sm font-semibold ${textColorClass} hover:text-primary transition-colors mr-2`}>
                  {t('nav.forBusiness')}
                </Link>
              )}
            </>
          )}

          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-2">
              <NotificationPopover />
              {isBusinessMode ? <BusinessUserMenu /> : <DesktopUserMenu />}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={isInBusinessSection ? '/business-login' : '/auth'}>
                <Button 
                  variant="outline" 
                  className={`rounded-full font-semibold transition-all duration-200 ${
                    isLandingPage 
                      ? 'border-white/30 text-white hover:bg-white/10 hover:border-white/50' 
                      : 'border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50'
                  }`}
                >
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to={isInBusinessSection ? '/business-registration' : '/auth#signup'}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full btn-premium">
                  Registrati
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu - Show user menu icon when logged in, hamburger when not */}
        {isLoggedIn ? (
          <div className="md:hidden flex items-center gap-2">
            <NotificationPopover />
            {isBusinessMode ? <MobileBusinessMenu /> : <MobileUserMenu />}
          </div>
        ) : (
          <button 
            className={`md:hidden ${textColorClass}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        )}
      </div>

      {/* Mobile menu - Only show when NOT logged in */}
      {mobileMenuOpen && !isLoggedIn && (
        <div className={`md:hidden border-t ${isLandingPage ? 'border-white/10 bg-[hsl(0,0%,8%)]' : 'border-border bg-background'}`}>
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {isInBusinessSection ? (
              <>
                <Link to="/" className={`py-2 font-medium ${isLandingPage ? 'text-white' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/pricing" className={`py-2 font-medium ${isLandingPage ? 'text-white' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>
                  Prezzi
                </Link>
              </>
            ) : (
              <Link to="/business" className={`py-2 font-medium ${isLandingPage ? 'text-white' : 'text-foreground'}`} onClick={() => setMobileMenuOpen(false)}>
                {t('nav.forBusiness')}
              </Link>
            )}
            <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-2">
            <Link to={isInBusinessSection ? '/business-login' : '/auth'} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className={`w-full font-semibold ${isLandingPage ? 'border-white/30 text-white hover:bg-white/10' : 'border-foreground/30 text-foreground hover:bg-foreground/5'}`}>
                {t('nav.login')}
              </Button>
            </Link>
            <Link to={isInBusinessSection ? '/business-registration' : '/auth#signup'} onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
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
