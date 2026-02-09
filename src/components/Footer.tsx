import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";

const BUILD_VERSION = `v${new Date().toISOString().slice(0, 16).replace('T', '-')}`;

const Footer = () => {
  const { isLoggedIn, isBusinessMode } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  const isBusinessSection = location.pathname === '/business' || location.pathname === '/pricing';
  
  const isRestaurantsPage = location.pathname === '/restaurants';
  const isDashboardPage = location.pathname === '/dashboard';
  
  if (isDashboardPage) {
    return null;
  }
  
  if (isMobile && isLoggedIn && isRestaurantsPage) {
    return null;
  }

  const handleScrollToSection = (e: React.MouseEvent, sectionId: string) => {
    e.preventDefault();
    if (isBusinessSection) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
              {t('footer.description')}
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
            <h3 className="font-bold text-background mb-4">{t('footer.usefulLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleScrollToSection(e, 'how-it-works')}
                  className="text-background/80 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.howItWorks')}
                </a>
              </li>
              <li>
                <a 
                  href="#level-benefits" 
                  onClick={(e) => handleScrollToSection(e, 'level-benefits')}
                  className="text-background/80 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.levelsAndBenefits')}
                </a>
              </li>
              <li>
                <a 
                  href="#restaurant-list" 
                  onClick={(e) => handleScrollToSection(e, 'restaurant-list')}
                  className="text-background/80 hover:text-primary transition-colors cursor-pointer"
                >
                  {t('footer.partnerRestaurants')}
                </a>
              </li>
              <li>
                <a href="/business" className="text-background/80 hover:text-primary transition-colors">
                  {t('footer.forBusiness')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-bold text-background mb-4">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-background/80 hover:text-primary transition-colors">
                  {t('footer.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-background/80 hover:text-primary transition-colors">
                  {t('footer.termsAndConditions')}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-background/80 hover:text-primary transition-colors">
                  {t('footer.cookiePolicy')}
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
            <h3 className="font-bold text-background mb-4">{t('footer.contacts')}</h3>
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
            <p>&copy; {new Date().getFullYear()} OneTable. {t('footer.allRightsReserved')}</p>
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
