import { ArrowLeft, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useBusinessRole } from "@/hooks/useBusinessRole";
import { useAdminRole } from "@/hooks/useAdminRole";

const Settings = () => {
  const navigate = useNavigate();
  const { hasRole: hasBusinessRole } = useBusinessRole();
  const { isAdmin } = useAdminRole();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Impostazioni</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Gestione Abbonamento - Solo per Business e Admin */}
        {(hasBusinessRole() || isAdmin) && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Abbonamento</h2>
            <Button 
              onClick={() => navigate('/billing')}
              className="w-full"
              variant="outline"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Gestisci Abbonamento
            </Button>
          </Card>
        )}

        {/* Contatti */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Contatti</h2>
          <div className="space-y-4">
            <a href="mailto:info@onetable.it" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">info@onetable.it</p>
              </div>
            </a>
            
            <Separator />
            
            <a href="tel:+390212345678" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Phone className="w-5 h-5" />
              <div>
                <p className="font-medium">Telefono</p>
                <p className="text-sm text-muted-foreground">+39 02 1234 5678</p>
              </div>
            </a>
            
            <Separator />
            
            <div className="flex items-start gap-3 text-foreground">
              <MapPin className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Indirizzo</p>
                <p className="text-sm text-muted-foreground">Via della Innovazione, 42<br />20121 Milano, Italia</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Social */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Social Media</h2>
          <div className="flex gap-4">
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </Card>

        {/* Legale */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Informazioni Legali</h2>
          <div className="space-y-3">
            <a href="/privacy" className="block text-foreground hover:text-primary transition-colors py-2">
              Privacy Policy
            </a>
            <Separator />
            <a href="/terms" className="block text-foreground hover:text-primary transition-colors py-2">
              Termini e Condizioni
            </a>
            <Separator />
            <a href="/cookies" className="block text-foreground hover:text-primary transition-colors py-2">
              Cookie Policy
            </a>
            <Separator />
            <a href="/gdpr" className="block text-foreground hover:text-primary transition-colors py-2">
              GDPR
            </a>
            <Separator />
            <a href="/status" className="block text-foreground hover:text-primary transition-colors py-2">
              Status Sistema
            </a>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl font-bold text-foreground">One</span>
            <span className="text-2xl font-bold text-primary">Table</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            La piattaforma innovativa che premia la tua affidabilità con vantaggi esclusivi nei migliori ristoranti.
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OneTable. Tutti i diritti riservati.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
