import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5">
      <Card className="max-w-4xl mx-auto shadow-elegant border-2">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <Cookie className="w-6 h-6 text-primary mt-1" />
              <div>
                <CardTitle className="text-xl mb-2">Consenso Cookie</CardTitle>
                <CardDescription className="text-base">
                  Utilizziamo cookie essenziali per il funzionamento del sito e cookie analitici per migliorare la tua esperienza. 
                  Puoi gestire le tue preferenze in qualsiasi momento.
                </CardDescription>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleDecline}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2 text-sm">
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/cookies" className="text-primary hover:underline">
              Cookie Policy
            </Link>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleDecline}>
              Rifiuta Non Essenziali
            </Button>
            <Button onClick={handleAccept} className="bg-primary text-primary-foreground">
              Accetta Tutti
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookieConsent;
