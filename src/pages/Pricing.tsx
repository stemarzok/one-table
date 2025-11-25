import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PLANS = {
  base: {
    monthly: {
      name: "Base Mensile",
      price: "9,99",
      priceId: "price_1SX3euQuOzpnYfR6YW0yjYmD",
      period: "mese",
    },
    yearly: {
      name: "Base Annuale",
      price: "95,90",
      priceId: "price_1SX3fGQuOzpnYfR6O6XnEAC4",
      period: "anno",
      savings: "20%",
    },
  },
  pro: {
    monthly: {
      name: "Pro Mensile",
      price: "29,99",
      priceId: "price_1SX3fRQuOzpnYfR6h6iH18TY",
      period: "mese",
    },
    yearly: {
      name: "Pro Annuale",
      price: "287,90",
      priceId: "price_1SX3fbQuOzpnYfR6b39kAGmY",
      period: "anno",
      savings: "20%",
    },
  },
};

const Pricing = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, planName: string) => {
    if (!isLoggedIn) {
      toast.error("Devi effettuare l'accesso per procedere");
      navigate('/business-login');
      return;
    }

    // Apriamo subito una nuova scheda per evitare blocchi popup
    const checkoutWindow = window.open('', '_blank');

    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;
      
      if (data?.url) {
        if (checkoutWindow) {
          checkoutWindow.location.href = data.url;
        } else {
          window.open(data.url, '_blank', 'noopener');
        }
      } else if (checkoutWindow) {
        checkoutWindow.close();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Errore durante la creazione della sessione di pagamento");
      if (checkoutWindow) checkoutWindow.close();
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Scegli il Piano Perfetto per Te
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Inizia con 14 giorni di prova gratuita. Nessuna carta richiesta.
            </p>
            
            <div className="flex justify-center mb-8">
              <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as 'monthly' | 'yearly')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly">Mensile</TabsTrigger>
                  <TabsTrigger value="yearly">
                    Annuale
                    <Badge variant="secondary" className="ml-2">-20%</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Piano Base */}
            <Card className="p-8 relative">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Piano Base</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{PLANS.base[billingPeriod].price}
                  </span>
                  <span className="text-muted-foreground">/{PLANS.base[billingPeriod].period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <Badge variant="secondary" className="mt-2">
                    Risparmi {PLANS.base.yearly.savings}
                  </Badge>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Gestione prenotazioni illimitata</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Menu digitale</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Gestione tavoli</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Analytics base</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Supporto email</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleCheckout(
                  PLANS.base[billingPeriod].priceId,
                  PLANS.base[billingPeriod].name
                )}
                disabled={loading === PLANS.base[billingPeriod].priceId}
              >
                {loading === PLANS.base[billingPeriod].priceId ? 'Caricamento...' : 'Inizia Prova Gratuita'}
              </Button>
            </Card>

            {/* Piano Pro */}
            <Card className="p-8 relative border-primary shadow-lg">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                PIÙ POPOLARE
              </Badge>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-6 w-6 text-primary" />
                  <h3 className="text-2xl font-bold">Piano Pro</h3>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    €{PLANS.pro[billingPeriod].price}
                  </span>
                  <span className="text-muted-foreground">/{PLANS.pro[billingPeriod].period}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <Badge variant="secondary" className="mt-2">
                    Risparmi {PLANS.pro.yearly.savings}
                  </Badge>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span className="font-medium">Tutto del Piano Base, più:</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Analytics avanzate</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Gestione recensioni</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Centro notifiche</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Report personalizzati</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <span>Supporto prioritario</span>
                </li>
              </ul>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => handleCheckout(
                  PLANS.pro[billingPeriod].priceId,
                  PLANS.pro[billingPeriod].name
                )}
                disabled={loading === PLANS.pro[billingPeriod].priceId}
              >
                {loading === PLANS.pro[billingPeriod].priceId ? 'Caricamento...' : 'Inizia Prova Gratuita'}
              </Button>
            </Card>
          </div>

          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-8">Domande Frequenti</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
              <div>
                <h4 className="font-semibold mb-2">Come funziona la prova gratuita?</h4>
                <p className="text-muted-foreground">
                  Hai 14 giorni per testare tutte le funzionalità. Non ti verrà addebitato nulla durante il periodo di prova.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Posso cambiare piano in qualsiasi momento?</h4>
                <p className="text-muted-foreground">
                  Sì, puoi aggiornare o downgrade il tuo piano in qualsiasi momento dalla dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Quali metodi di pagamento accettate?</h4>
                <p className="text-muted-foreground">
                  Accettiamo carte di credito, Apple Pay, Google Pay e PayPal tramite Stripe.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Posso cancellare in qualsiasi momento?</h4>
                <p className="text-muted-foreground">
                  Assolutamente sì. Nessun vincolo. Puoi cancellare quando vuoi dalla tua dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
