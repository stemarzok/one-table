import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { Shield } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useState } from "react";
import { MobileUserMenu } from "@/components/MobileUserMenu";
import { DesktopUserMenu } from "@/components/DesktopUserMenu";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, profile, logout } = useAuth();
  const { hasRole: hasBusinessRole, loading: businessRoleLoading } = useBusinessRole();
  const { isAdmin, loading: adminRoleLoading } = useAdminRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const showDashboard = hasBusinessRole() && !businessRoleLoading;
  const showAdminPanel = isAdmin && !adminRoleLoading;

  // Determine if user is in business section based on current route
  const isInBusinessSection = location.pathname.startsWith('/dashboard') || 
                               location.pathname.startsWith('/business') ||
                               location.pathname.startsWith('/billing');

  const getLogoLink = () => {
    // If not logged in and in business section, return to business page
    if (!isLoggedIn && isInBusinessSection) return "/business";
    // If not logged in and not in business section, return to home
    if (!isLoggedIn) return "/";
    // If in business section and has business/admin role, go to dashboard
    if (isInBusinessSection && (showDashboard || showAdminPanel)) return "/dashboard";
    // If has business/admin role but not in business section, stay in user section
    if (showDashboard || showAdminPanel) return "/restaurants";
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
                <span className="text-sm font-medium">
                  {language === 'it' ? 'Italiano' : 'English'}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage('it')}>
                Italiano
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage('en')}>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoggedIn ? (
            <div className="hidden md:block">
              <DesktopUserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to={location.pathname === '/business' || location.pathname === '/business-login' || location.pathname === '/business-registration' ? '/business-login' : '/auth'}>
                <Button variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50 rounded-full">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to={location.pathname === '/business' || location.pathname === '/business-login' || location.pathname === '/business-registration' ? '/business-registration' : '/auth#signup'}>
                <Button className="bg-primary hover:bg-primary/90 text-background font-semibold rounded-full">
                  Registrati
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu - Show user menu icon when logged in, hamburger when not */}
        {isLoggedIn ? (
          <div className="md:hidden">
            <MobileUserMenu />
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
            <Link to={location.pathname === '/business' || location.pathname === '/business-login' || location.pathname === '/business-registration' ? '/business-login' : '/auth'} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50">
                {t('nav.login')}
              </Button>
            </Link>
            <Link to={location.pathname === '/business' || location.pathname === '/business-login' || location.pathname === '/business-registration' ? '/business-registration' : '/auth#signup'} onClick={() => setMobileMenuOpen(false)}>
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
