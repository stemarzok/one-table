import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Megaphone, 
  CalendarDays, 
  TrendingUp, 
  Eye, 
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface SponsorshipManagementProps {
  restaurantId: string;
}

export const SponsorshipManagement = ({ restaurantId }: SponsorshipManagementProps) => {
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsorStartDate, setSponsorStartDate] = useState<Date | undefined>();
  const [sponsorEndDate, setSponsorEndDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    fetchSponsorshipStatus();
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

  const handleToggleSponsorship = async (enabled: boolean) => {
    setSaving(true);
    try {
      const updates: any = { is_sponsored: enabled };
      
      if (enabled && !sponsorStartDate) {
        updates.sponsor_start_date = new Date().toISOString();
        updates.sponsor_end_date = addDays(new Date(), 30).toISOString();
        setSponsorStartDate(new Date());
        setSponsorEndDate(addDays(new Date(), 30));
      }
      
      if (!enabled) {
        updates.sponsor_start_date = null;
        updates.sponsor_end_date = null;
        setSponsorStartDate(undefined);
        setSponsorEndDate(undefined);
      }

      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId);

      if (error) throw error;

      setIsSponsored(enabled);
      toast.success(enabled ? 'Sponsorizzazione attivata!' : 'Sponsorizzazione disattivata');
    } catch (error) {
      console.error('Error toggling sponsorship:', error);
      toast.error('Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = async (type: 'start' | 'end', date: Date | undefined) => {
    if (!date) return;
    
    setSaving(true);
    try {
      const updates: any = {};
      
      if (type === 'start') {
        updates.sponsor_start_date = date.toISOString();
        setSponsorStartDate(date);
        setShowStartCalendar(false);
      } else {
        updates.sponsor_end_date = date.toISOString();
        setSponsorEndDate(date);
        setShowEndCalendar(false);
      }

      const { error } = await supabase
        .from('restaurants')
        .update(updates)
        .eq('id', restaurantId);

      if (error) throw error;
      toast.success('Date aggiornate');
    } catch (error) {
      console.error('Error updating dates:', error);
      toast.error('Errore durante l\'aggiornamento');
    } finally {
      setSaving(false);
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

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
                    {daysRemaining} giorni rimanenti
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {isSponsored ? 'Attivo' : 'Disattivo'}
            </span>
            <Switch
              checked={isSponsored}
              onCheckedChange={handleToggleSponsorship}
              disabled={saving}
            />
          </div>
        </div>

        {isSponsored && (
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Data Inizio
              </label>
              <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {sponsorStartDate 
                      ? format(sponsorStartDate, 'dd MMMM yyyy', { locale: it })
                      : 'Seleziona data'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sponsorStartDate}
                    onSelect={(date) => handleDateChange('start', date)}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Data Fine
              </label>
              <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {sponsorEndDate 
                      ? format(sponsorEndDate, 'dd MMMM yyyy', { locale: it })
                      : 'Seleziona data'
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sponsorEndDate}
                    onSelect={(date) => handleDateChange('end', date)}
                    disabled={(date) => date < (sponsorStartDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
          Contatta il supporto per attivare un piano di sponsorizzazione a pagamento
        </p>
      </Card>
    </div>
  );
};
