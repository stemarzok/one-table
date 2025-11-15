import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

const BUILD_VERSION = `v${new Date().toISOString().slice(0, 16).replace('T', '-')}`;

const Footer = () => {
  return (
    <footer className="bg-foreground border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-background">
                One
              </span>
              <span className="text-2xl font-bold text-primary">
                Table
              </span>
            </div>
            <p className="text-background/80 text-sm mb-4">
              La piattaforma innovativa che premia la tua affidabilità con vantaggi esclusivi nei migliori ristoranti.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-background hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-background hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-background hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Section */}
          <div>
            <h3 className="font-bold text-background mb-4">Link Utili</h3>
            <ul className="space-y-2">
              <li>
                <a href="/#come-funziona" className="text-background/80 hover:text-primary transition-colors">
                  Come Funziona
                </a>
              </li>
              <li>
                <a href="/#livelli" className="text-background/80 hover:text-primary transition-colors">
                  Livelli e Vantaggi
                </a>
              </li>
              <li>
                <a href="/#ristoranti" className="text-background/80 hover:text-primary transition-colors">
                  Ristoranti Partner
                </a>
              </li>
              <li>
                <a href="/business" className="text-background/80 hover:text-primary transition-colors">
                  Per Aziende
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold text-background mb-4">Legale</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-background/80 hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-background/80 hover:text-primary transition-colors">
                  Termini e Condizioni
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-background/80 hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="/gdpr" className="text-background/80 hover:text-primary transition-colors">
                  GDPR
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="font-bold text-background mb-4">Contatti</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/80">
                <Mail className="w-4 h-4" />
                <a href="mailto:info@onetable.it" className="hover:text-primary transition-colors">
                  info@onetable.it
                </a>
              </li>
              <li className="flex items-center gap-2 text-background/80">
                <Phone className="w-4 h-4" />
                <a href="tel:+390212345678" className="hover:text-primary transition-colors">
                  +39 02 1234 5678
                </a>
              </li>
              <li className="flex items-start gap-2 text-background/80">
                <MapPin className="w-4 h-4 mt-1" />
                <span>Via della Innovazione, 42<br />20121 Milano, Italia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p>&copy; {new Date().getFullYear()} OneTable. Tutti i diritti riservati.</p>
            <div className="flex items-center gap-3">
              <a href="/status" className="hover:text-primary transition-colors text-xs">
                Status
              </a>
              <span className="text-xs opacity-50">{BUILD_VERSION}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
