import logo from "@/assets/onetable-logo.png";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="OneTable" className="w-10 h-10" />
              <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                OneTable
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              La piattaforma innovativa che premia la tua affidabilità con vantaggi esclusivi nei migliori ristoranti.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4">Link Utili</h3>
            <ul className="space-y-2">
              <li>
                <a href="#come-funziona" className="text-muted-foreground hover:text-primary transition-colors">
                  Come Funziona
                </a>
              </li>
              <li>
                <a href="#livelli" className="text-muted-foreground hover:text-primary transition-colors">
                  Livelli e Vantaggi
                </a>
              </li>
              <li>
                <a href="#ristoranti" className="text-muted-foreground hover:text-primary transition-colors">
                  Ristoranti Partner
                </a>
              </li>
              <li>
                <a href="#business" className="text-muted-foreground hover:text-primary transition-colors">
                  Per Aziende
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4">Legale</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Termini e Condizioni
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/gdpr" className="text-muted-foreground hover:text-primary transition-colors">
                  GDPR
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-bold text-card-foreground mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@onetable.it" className="hover:text-primary transition-colors">
                  info@onetable.it
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <a href="tel:+390212345678" className="hover:text-primary transition-colors">
                  +39 02 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Via della Innovazione, 42<br />20121 Milano, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} OneTable. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
