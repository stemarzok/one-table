import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Crown, Calendar, CreditCard, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

const Billing = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription from database
  const fetchSubscription = async () => {
    if (!isLoggedIn || !user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        setSubscription(null);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user, isLoggedIn]);

  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "true") {
      toast.success("Abbonamento attivato con successo!");
      
      // Refresh subscription from Stripe and DB
      const refreshSub = async () => {
        const sessionId = searchParams.get("session_id") || undefined;
        try {
          await supabase.functions.invoke('check-subscription', {
            body: { sessionId }
          });
          
          // Wait a moment for DB to update, then fetch
          setTimeout(() => {
            fetchSubscription();
          }, 1000);
        } catch (error) {
          console.error('Error refreshing subscription:', error);
        }
      };
      
      refreshSub();

      // Remove params from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("success");
      newParams.delete("session_id");

      const query = newParams.toString();
      navigate(query ? `/billing?${query}` : "/billing", { replace: true });
    }
  }, [searchParams, navigate]);

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Portal error:', error);
      toast.error("Errore durante l'apertura del portale clienti");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 flex items-center justify-center min-h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const hasActiveSubscription = subscription && (subscription.status === 'active' || subscription.status === 'trialing');
  const isTrialing = subscription?.status === 'trialing';
  const planName = subscription?.plan_type === 'pro' ? 'Pro' : 'Base';
  const billingName = subscription?.billing_period === 'yearly' ? 'Annuale' : 'Mensile';
  
  const trialDaysRemaining = isTrialing && subscription?.trial_end 
    ? Math.ceil((new Date(subscription.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Gestione Abbonamento</h1>

          {hasActiveSubscription ? (
            <div className="space-y-6">
              {/* Trial Badge */}
              {isTrialing && (
                <Card className="p-6 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        💡 Trial attivo – {trialDaysRemaining} giorni rimasti
                      </h3>
                      <p className="text-muted-foreground">
                        Stai testando tutte le funzionalità gratuitamente. 
                        Al termine del trial, il tuo abbonamento si attiverà automaticamente.
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Current Plan */}
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-primary" />
                    <div>
                      <h2 className="text-2xl font-bold">Piano {planName}</h2>
                      <Badge variant="secondary">{billingName}</Badge>
                    </div>
                  </div>
                  <Badge variant={isTrialing ? "secondary" : "default"}>
                    {isTrialing ? 'In Prova' : 'Attivo'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <p className="text-sm">
                        {subscription?.cancel_at_period_end ? 'Scade il' : 'Prossimo rinnovo'}
                      </p>
                      <p className="font-medium text-foreground">
                        {subscription?.current_period_end && 
                          format(new Date(subscription.current_period_end), "d MMMM yyyy", { locale: it })
                        }
                      </p>
                    </div>
                  </div>

                  {subscription?.cancel_at_period_end && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">
                        Il tuo abbonamento è stato cancellato e terminerà alla fine del periodo corrente.
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Manage Subscription */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <CreditCard className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Gestisci il tuo abbonamento
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Aggiorna il metodo di pagamento, cambia piano o cancella l'abbonamento.
                    </p>
                    <Button onClick={handleManageSubscription}>
                      Apri Portale Clienti
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Features */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Funzionalità Incluse nel Piano {planName}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Gestione prenotazioni illimitata</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Menu digitale</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>Gestione tavoli</span>
                  </li>
                  {subscription?.plan_type === 'pro' && (
                    <>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Analytics avanzate</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Gestione recensioni</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>Supporto prioritario</span>
                      </li>
                    </>
                  )}
                </ul>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Crown className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Nessun abbonamento attivo</h2>
              <p className="text-muted-foreground mb-6">
                Inizia con 14 giorni di prova gratuita e sblocca tutte le funzionalità.
              </p>
              <Button size="lg" onClick={() => navigate('/pricing')}>
                Visualizza Piani
              </Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Billing;
