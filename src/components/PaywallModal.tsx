import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Crown, Sparkles, Gift, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

export const PaywallModal = ({ open, onOpenChange, onClose }: PaywallModalProps) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showConfirmRequest, setShowConfirmRequest] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [hasActiveCode, setHasActiveCode] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  const handleRequestCode = async () => {
    if (!user || !profile) {
      toast.error("Devi essere loggato per richiedere un codice");
      return;
    }

    setLoading(true);
    try {
      // Check if user already has an active subscription
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeSub) {
        toast.info("Hai già un abbonamento attivo");
        setHasActiveSubscription(true);
        return;
      }

      // Check if user already has an active code
      const { data: activeCode } = await supabase
        .from('promo_codes')
        .select('id, code')
        .eq('user_id', user.id)
        .eq('valid', true)
        .maybeSingle();

      if (activeCode) {
        toast.info("Hai già un codice attivo. Inseriscilo per attivare la promo.");
        setHasActiveCode(true);
        setShowCodeInput(true);
        setShowConfirmRequest(false);
        return;
      }

      // Check if user already has a pending request
      const { data: existingRequest } = await supabase
        .from('promo_requests')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        toast.info("Hai già una richiesta in attesa");
        setRequestSent(true);
        setHasExistingRequest(true);
        return;
      }

      // Create new request - THIS IS THE KEY FIX
      const { error } = await supabase
        .from('promo_requests')
        .insert({
          user_id: user.id,
          email: profile.email,
          status: 'pending'
        });

      if (error) {
        console.error('Error creating promo request:', error);
        throw error;
      }

      toast.success("Richiesta inviata con successo! L'amministratore la riceverà a breve.");
      setRequestSent(true);
    } catch (error: any) {
      console.error('Error creating promo request:', error);
      toast.error("Errore nell'invio della richiesta: " + (error.message || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCode = async () => {
    if (!user || !promoCode.trim()) {
      toast.error("Inserisci un codice valido");
      return;
    }

    setLoading(true);
    try {
      const codeToCheck = promoCode.trim().toUpperCase();
      console.log('Checking code:', codeToCheck, 'for user:', user.id);

      // Verify code exists and is valid for this user
      const { data: codeData, error: codeError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', codeToCheck)
        .eq('user_id', user.id)
        .eq('valid', true)
        .maybeSingle();

      console.log('Code data:', codeData, 'Error:', codeError);

      if (codeError) {
        console.error('Error checking code:', codeError);
        toast.error("Errore durante la verifica del codice");
        return;
      }

      if (!codeData) {
        // Try to find if code exists but for different user or already used
        const { data: anyCode } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', codeToCheck)
          .maybeSingle();

        if (!anyCode) {
          toast.error("Codice non trovato. Verifica di averlo inserito correttamente.");
        } else if (anyCode.user_id !== user.id) {
          toast.error("Questo codice non è assegnato al tuo account.");
        } else if (!anyCode.valid) {
          toast.error("Questo codice è già stato utilizzato.");
        } else {
          toast.error("Codice non valido.");
        }
        return;
      }

      // Check if code has expired
      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        toast.error("Questo codice è scaduto");
        return;
      }

      // Calculate expiration date based on code duration
      const currentPeriodEnd = codeData.expires_at 
        ? new Date(codeData.expires_at).toISOString()
        : new Date(2099, 11, 31).toISOString();

      // Use 'lifetime' for valid billing_period (constraint allows: monthly, yearly, lifetime)
      const billingPeriod = 'lifetime';

      // Check if user already has a subscription
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let subError;
      if (existingSub) {
        // Update existing subscription
        const { error } = await supabase
          .from('subscriptions')
          .update({
            plan_type: 'promo_speciale',
            billing_period: billingPeriod,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            trial_end: null
          })
          .eq('user_id', user.id);
        subError = error;
      } else {
        // Insert new subscription
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            plan_type: 'promo_speciale',
            billing_period: billingPeriod,
            status: 'active',
            current_period_start: new Date().toISOString(),
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: false,
            trial_end: null
          });
        subError = error;
      }

      if (subError) {
        console.error('Error creating subscription:', subError);
        toast.error("Errore nella creazione dell'abbonamento: " + subError.message);
        return;
      }

      // Mark code as used ONLY AFTER subscription is successfully created
      const { error: updateCodeError } = await supabase
        .from('promo_codes')
        .update({ valid: false, used_at: new Date().toISOString() })
        .eq('id', codeData.id);

      if (updateCodeError) {
        console.error('Error updating code:', updateCodeError);
        // Don't throw here - subscription is already created
      }

      toast.success("Codice attivato! Promo Speciale attivo.");
      onOpenChange(false);
      
      // Refresh page to reflect new subscription
      window.location.reload();
    } catch (error: any) {
      console.error('Error activating code:', error);
      toast.error("Errore nell'attivazione del codice: " + (error.message || 'Errore sconosciuto'));
    } finally {
      setLoading(false);
    }
  };

  // Close and redirect to dashboard overview - user doesn't get access
  const handleCloseAndRedirect = () => {
    setShowCodeInput(false);
    setShowConfirmRequest(false);
    setPromoCode("");
    setRequestSent(false);
    setHasExistingRequest(false);
    setHasActiveCode(false);
    setHasActiveSubscription(false);
    onOpenChange(false);
    onClose?.();
    navigate('/dashboard');
  };

  const handleCheckExistingCode = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Check if user has an active subscription
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeSub) {
        toast.info("Hai già un abbonamento attivo!");
        setHasActiveSubscription(true);
        return;
      }

      // Check if user has an unused code that is not expired
      const { data: existingCode } = await supabase
        .from('promo_codes')
        .select('code, expires_at')
        .eq('user_id', user.id)
        .eq('valid', true)
        .maybeSingle();

      if (existingCode) {
        // Check if code is not expired
        if (!existingCode.expires_at || new Date(existingCode.expires_at) > new Date()) {
          setHasActiveCode(true);
          setShowCodeInput(true);
          return;
        }
      }

      // Check if user has an existing pending request
      const { data: existingRequest } = await supabase
        .from('promo_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingRequest) {
        setRequestSent(true);
        setHasExistingRequest(true);
        setShowConfirmRequest(true);
      } else {
        // Show request form
        setShowConfirmRequest(true);
      }
    } catch (error) {
      console.error('Error checking existing code:', error);
      setShowConfirmRequest(true);
    } finally {
      setLoading(false);
    }
  };

  // Show code input screen
  if (showCodeInput) {
    return (
      <Dialog open={open} onOpenChange={() => {}} modal>
        <DialogContent 
          className="sm:max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseAndRedirect}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">
              Inserisci Codice Speciale
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Inserisci il codice a 6 cifre che hai ricevuto
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Es: ABC123"
              maxLength={6}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleActivateCode}
              disabled={promoCode.length !== 6 || loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Attiva Codice
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowCodeInput(false);
                setPromoCode("");
              }}
            >
              Indietro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show confirm request screen
  if (showConfirmRequest) {
    return (
      <Dialog open={open} onOpenChange={() => {}} modal>
        <DialogContent 
          className="sm:max-w-md [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleCloseAndRedirect}
          >
            <X className="h-4 w-4" />
          </Button>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl">
              {requestSent || hasExistingRequest ? "Richiesta Inviata" : "Richiedi Codice Speciale"}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {requestSent || hasExistingRequest
                ? "La tua richiesta è stata inviata. Attendi che l'amministrazione ti fornisca un codice."
                : "Vuoi richiedere un codice speciale? L'amministratore riceverà la tua richiesta."
              }
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 pt-4">
            {requestSent || hasExistingRequest ? (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => setShowCodeInput(true)}
                >
                  Ho già un codice
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleCloseAndRedirect}
                >
                  Torna alla Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleRequestCode}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Conferma Richiesta
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowConfirmRequest(false)}
                >
                  Indietro
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main paywall screen
  return (
    <Dialog open={open} onOpenChange={() => {}} modal>
      <DialogContent 
        className="sm:max-w-md [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={handleCloseAndRedirect}
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Per continuare serve un abbonamento
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Ottieni accesso completo a tutte le funzionalità con il Piano Base o Pro
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">14 giorni di prova gratuita</p>
              <p className="text-sm text-muted-foreground">Testa tutte le funzionalità senza impegno</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Gestione completa</p>
              <p className="text-sm text-muted-foreground">Prenotazioni, menu, tavoli e analytics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Supporto prioritario</p>
              <p className="text-sm text-muted-foreground">Assistenza dedicata per il tuo business</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => {
              onOpenChange(false);
              navigate('/pricing');
            }}
          >
            Scegli un Piano
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="w-full"
            onClick={handleCheckExistingCode}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Gift className="h-4 w-4 mr-2" />
            )}
            Ho un codice speciale
          </Button>
          <Button 
            variant="ghost" 
            size="lg"
            onClick={handleCloseAndRedirect}
          >
            Forse più tardi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
