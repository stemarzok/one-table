import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 animate-in slide-in-from-bottom-5">
      <div className="max-w-5xl mx-auto bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Cookie className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            Utilizziamo cookie per migliorare la tua esperienza.{" "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
            {" • "}
            <Link to="/cookies" className="text-primary hover:underline">Cookie Policy</Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleDecline} className="text-muted-foreground">
            Rifiuta
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accetta
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={handleDecline}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
