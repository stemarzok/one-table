import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn, profile, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0">
          <span className="text-2xl font-bold text-foreground">One</span>
          <span className="text-2xl font-bold text-primary">Table</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to={location.pathname === '/business' ? '/' : '/business'} className="text-sm font-medium text-foreground hover:text-primary transition-colors mr-2">
            {location.pathname === '/business' ? 'Home' : t('nav.forBusiness')}
          </Link>
          
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="w-10 h-10 cursor-pointer border-2 border-primary hover:border-primary/80 transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {profile?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer">
                    {t('nav.profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" className="border-foreground/30 text-foreground hover:bg-foreground/5 hover:border-foreground/50 rounded-full">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-background font-semibold rounded-full">
                  Registrati
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
