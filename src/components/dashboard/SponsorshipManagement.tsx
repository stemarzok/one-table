import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Megaphone, 
  TrendingUp, 
  Eye, 
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle,
  Ticket,
  Send,
  Loader2
} from "lucide-react";

interface SponsorshipManagementProps {
  restaurantId: string;
}

interface SponsorshipCode {
  id: string;
  code: string;
  duration_days: number | null;
  valid: boolean;
  expires_at: string | null;
  used_at: string | null;
}

interface SponsorshipRequest {
  id: string;
  status: string;
  created_at: string;
}

export const SponsorshipManagement = ({ restaurantId }: SponsorshipManagementProps) => {
  const { user, profile } = useAuth();
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorStartDate, setSponsorStartDate] = useState<Date | undefined>();
  const [sponsorEndDate, setSponsorEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  
  // Code activation state
  const [promoCode, setPromoCode] = useState("");
  const [activating, setActivating] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  // User's codes and requests
  const [availableCodes, setAvailableCodes] = useState<SponsorshipCode[]>([]);
  const [pendingRequest, setPendingRequest] = useState<SponsorshipRequest | null>(null);

  useEffect(() => {
    fetchSponsorshipStatus();
    fetchUserCodesAndRequests();
  }, [restaurantId]);

  const fetchSponsorshipStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('is_sponsored, sponsor_start_date, sponsor_end_date')
        .eq('id', restaurantId)
        .single();

      if (error) throw error;

      if (data) {
        setIsSponsored(data.is_sponsored || false);
        setSponsorStartDate(data.sponsor_start_date ? new Date(data.sponsor_start_date) : undefined);
        setSponsorEndDate(data.sponsor_end_date ? new Date(data.sponsor_end_date) : undefined);
      }
    } catch (error) {
      console.error('Error fetching sponsorship status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCodesAndRequests = async () => {
    if (!user) return;
    
    try {
      // Fetch available codes for this restaurant
      const { data: codes } = await supabase
        .from('sponsorship_codes')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.id)
        .eq('valid', true);
      
      if (codes) {
        // Filter out expired codes
        const validCodes = codes.filter(c => {
          if (!c.expires_at) return true;
          return new Date(c.expires_at) > new Date();
        });
        setAvailableCodes(validCodes);
      }

      // Fetch pending request
      const { data: requests } = await supabase
        .from('sponsorship_requests')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (requests && requests.length > 0) {
        setPendingRequest(requests[0]);
      } else {
        setPendingRequest(null);
      }
    } catch (error) {
      console.error('Error fetching codes and requests:', error);
    }
  };

  const handleActivateCode = async () => {
    if (!user || !promoCode.trim()) {
      toast.error("Inserisci un codice valido");
      return;
    }

    setActivating(true);
    try {
      const codeToCheck = promoCode.trim().toUpperCase();

      // Verify code exists and is valid for this restaurant and user
      const { data: codeData, error: codeError } = await supabase
        .from('sponsorship_codes')
        .select('*')
        .eq('code', codeToCheck)
        .eq('restaurant_id', restaurantId)
        .eq('user_id', user.id)
        .eq('valid', true)
        .maybeSingle();

      if (codeError) {
        console.error('Error checking code:', codeError);
        toast.error("Errore durante la verifica del codice");
        return;
      }

      if (!codeData) {
        // Check if code exists but for different restaurant/user
        const { data: anyCode } = await supabase
          .from('sponsorship_codes')
          .select('*')
          .eq('code', codeToCheck)
          .maybeSingle();

        if (!anyCode) {
          toast.error("Codice non trovato. Verifica di averlo inserito correttamente.");
        } else if (anyCode.restaurant_id !== restaurantId) {
          toast.error("Questo codice è per un altro ristorante.");
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

      // Calculate sponsorship dates
      const startDate = new Date();
      const durationDays = codeData.duration_days || 30; // Default 30 days
      const endDate = addDays(startDate, durationDays);

      // Update restaurant sponsorship
      const { error: updateError } = await supabase
        .from('restaurants')
        .update({
          is_sponsored: true,
          sponsor_start_date: startDate.toISOString(),
          sponsor_end_date: endDate.toISOString()
        })
        .eq('id', restaurantId);

      if (updateError) {
        console.error('Error updating restaurant:', updateError);
        toast.error("Errore nell'attivazione della sponsorizzazione");
        return;
      }

      // Mark code as used
      const { error: markUsedError } = await supabase
        .from('sponsorship_codes')
        .update({ valid: false, used_at: new Date().toISOString() })
        .eq('id', codeData.id);

      if (markUsedError) {
        console.error('Error marking code as used:', markUsedError);
      }

      toast.success(`Sponsorizzazione attivata per ${durationDays} giorni!`);
      setPromoCode("");
      setIsSponsored(true);
      setSponsorStartDate(startDate);
      setSponsorEndDate(endDate);
      fetchUserCodesAndRequests();
    } catch (error: any) {
      console.error('Error activating code:', error);
      toast.error("Errore durante l'attivazione del codice");
    } finally {
      setActivating(false);
    }
  };

  const handleRequestCode = async () => {
    if (!user || !profile) {
      toast.error("Devi essere loggato per richiedere un codice");
      return;
    }

    setRequesting(true);
    try {
      const { error } = await supabase
        .from('sponsorship_requests')
        .insert({
          restaurant_id: restaurantId,
          user_id: user.id,
          email: profile.email,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("Hai già una richiesta in sospeso per questo ristorante");
        } else {
          throw error;
        }
        return;
      }

      toast.success("Richiesta inviata! L'admin la esaminerà presto.");
      fetchUserCodesAndRequests();
    } catch (error: any) {
      console.error('Error requesting code:', error);
      toast.error("Errore durante l'invio della richiesta");
    } finally {
      setRequesting(false);
    }
  };

  const daysRemaining = sponsorEndDate ? differenceInDays(sponsorEndDate, new Date()) : 0;
  const isActive = isSponsored && daysRemaining > 0;
  const isExpired = isSponsored && daysRemaining <= 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Gestione Sponsorizzazione
          </h2>
          <p className="text-muted-foreground mt-1">
            Metti in evidenza il tuo ristorante nel carosello sponsorizzati
          </p>
        </div>
      </div>

      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-full ${isActive ? 'bg-green-500/10' : isExpired ? 'bg-destructive/10' : 'bg-muted'}`}>
            {isActive ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : isExpired ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <Clock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Stato Sponsorizzazione</h3>
            <div className="flex items-center gap-2 mt-1">
              {isActive ? (
                <Badge className="bg-green-500 text-white">Attivo</Badge>
              ) : isExpired ? (
                <Badge variant="destructive">Scaduto</Badge>
              ) : (
                <Badge variant="secondary">Non attivo</Badge>
              )}
              {isActive && (
                <span className="text-sm text-muted-foreground">
                  {daysRemaining} giorni rimanenti (fino al {format(sponsorEndDate!, 'dd MMM yyyy', { locale: it })})
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Code Activation Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Ticket className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Attiva con Codice</h3>
        </div>
        
        {availableCodes.length > 0 && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-2">
              Hai {availableCodes.length} codice/i disponibile/i:
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCodes.map(code => (
                <Badge key={code.id} variant="outline" className="bg-green-500/20 text-green-700 dark:text-green-400">
                  {code.code} ({code.duration_days || 30} giorni)
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Input
            placeholder="Inserisci codice (es. ABC123)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            maxLength={6}
            className="font-mono uppercase"
          />
          <Button onClick={handleActivateCode} disabled={activating || !promoCode.trim()}>
            {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Attiva"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Inserisci il codice ricevuto dall'amministratore per attivare la sponsorizzazione
        </p>
      </Card>

      {/* Request Code Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Send className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Richiedi Codice</h3>
        </div>
        
        {pendingRequest ? (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              <Clock className="w-4 h-4 inline mr-1" />
              Hai già una richiesta in attesa dal {format(new Date(pendingRequest.created_at), 'dd MMM yyyy', { locale: it })}. 
              L'admin la esaminerà presto.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Non hai un codice? Richiedi un codice di sponsorizzazione all'amministratore.
            </p>
            <Button 
              onClick={handleRequestCode} 
              disabled={requesting}
              variant="outline"
              className="w-full md:w-auto"
            >
              {requesting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Richiedi Codice Sponsorizzazione
            </Button>
          </>
        )}
      </Card>

      {/* Benefits Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Vantaggi della Sponsorizzazione</h3>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Maggiore Visibilità</p>
              <p className="text-xs text-muted-foreground">
                Il tuo ristorante appare nel carosello in primo piano
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Più Prenotazioni</p>
              <p className="text-xs text-muted-foreground">
                Aumenta le tue prenotazioni fino al 40%
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Megaphone className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Badge Sponsorizzato</p>
              <p className="text-xs text-muted-foreground">
                Un badge distintivo sulla tua scheda
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Pricing Info */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Piani Disponibili</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <p className="font-medium">7 Giorni</p>
            <p className="text-2xl font-bold text-primary mt-1">€29</p>
            <p className="text-xs text-muted-foreground mt-2">Ideale per eventi speciali</p>
          </div>
          <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 relative">
            <Badge className="absolute -top-2 right-2 bg-primary text-primary-foreground text-xs">
              Popolare
            </Badge>
            <p className="font-medium">30 Giorni</p>
            <p className="text-2xl font-bold text-primary mt-1">€79</p>
            <p className="text-xs text-muted-foreground mt-2">Miglior rapporto qualità-prezzo</p>
          </div>
          <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
            <p className="font-medium">90 Giorni</p>
            <p className="text-2xl font-bold text-primary mt-1">€199</p>
            <p className="text-xs text-muted-foreground mt-2">Massima esposizione</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Richiedi un codice per attivare la sponsorizzazione. I pagamenti saranno implementati prossimamente.
        </p>
      </Card>
    </div>
  );
};