import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Connect to actual auth

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0">
          <span className="text-2xl font-bold text-foreground">One</span>
          <span className="text-2xl font-bold text-primary">Table</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/business" className="text-foreground hover:text-primary transition-colors">
            {t('nav.forBusiness')}
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLanguage('it')}
              className={`px-2 py-1 text-sm transition-colors ${
                language === 'it' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Italiano
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-sm transition-colors ${
                language === 'en' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              English
            </button>
          </div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="w-10 h-10 cursor-pointer border-2 border-primary hover:border-primary/80 transition-colors">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      U
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
                <DropdownMenuItem onClick={() => setIsLoggedIn(false)}>
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90 text-foreground font-semibold">
                {t('nav.login')}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
