import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/onetable-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="OneTable" className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              OneTable
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#come-funziona" className="text-foreground hover:text-primary transition-colors">
              Come Funziona
            </a>
            <a href="#livelli" className="text-foreground hover:text-primary transition-colors">
              Livelli
            </a>
            <a href="#ristoranti" className="text-foreground hover:text-primary transition-colors">
              Ristoranti
            </a>
            <a href="#business" className="text-foreground hover:text-primary transition-colors font-medium">
              Per Aziende
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost">Accedi</Button>
            <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">
              Registrati
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <a
              href="#come-funziona"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Come Funziona
            </a>
            <a
              href="#livelli"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Livelli
            </a>
            <a
              href="#ristoranti"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Ristoranti
            </a>
            <a
              href="#business"
              className="block py-2 text-foreground hover:text-primary transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Per Aziende
            </a>
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" className="w-full">Accedi</Button>
              <Button className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90">
                Registrati
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
