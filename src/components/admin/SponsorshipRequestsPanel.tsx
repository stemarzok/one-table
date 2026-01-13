import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  Megaphone,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Store,
  User
} from "lucide-react";

interface SponsorshipRequest {
  id: string;
  restaurant_id: string;
  user_id: string;
  email: string;
  status: string;
  duration_days: number | null;
  created_at: string;
  restaurant?: {
    name: string;
  };
}

interface SponsorshipCode {
  id: string;
  code: string;
  restaurant_id: string;
  user_id: string;
  duration_days: number | null;
  valid: boolean;
  used_at: string | null;
  expires_at: string | null;
  created_at: string;
  restaurant?: {
    name: string;
  };
}

export const SponsorshipRequestsPanel = () => {
  const [requests, setRequests] = useState<SponsorshipRequest[]>([]);
  const [codes, setCodes] = useState<SponsorshipCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();

    // Single consolidated realtime channel for all sponsorship-related tables
    const channel = supabase
      .channel('sponsorship-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsorship_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsorship_codes' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    try {
      // Fetch requests with restaurant info
      const { data: requestsData } = await supabase
        .from('sponsorship_requests')
        .select(`
          *,
          restaurant:restaurants(name)
        `)
        .order('created_at', { ascending: false });

      if (requestsData) {
        setRequests(requestsData.map(r => ({
          ...r,
          restaurant: r.restaurant as { name: string } | undefined
        })));
      }

      // Fetch codes with restaurant info
      const { data: codesData } = await supabase
        .from('sponsorship_codes')
        .select(`
          *,
          restaurant:restaurants(name)
        `)
        .order('created_at', { ascending: false });

      if (codesData) {
        setCodes(codesData.map(c => ({
          ...c,
          restaurant: c.restaurant as { name: string } | undefined
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async (request: SponsorshipRequest) => {
    setGeneratingFor(request.id);
    try {
      // Check if restaurant already has active sponsorship
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('is_sponsored, sponsor_end_date')
        .eq('id', request.restaurant_id)
        .single();

      if (restaurant?.is_sponsored && restaurant.sponsor_end_date) {
        const endDate = new Date(restaurant.sponsor_end_date);
        if (endDate > new Date()) {
          toast.error("Questo ristorante ha già una sponsorizzazione attiva");
          return;
        }
      }

      // Check if valid code already exists for this restaurant
      const existingValidCode = codes.find(c => {
        if (c.restaurant_id !== request.restaurant_id || !c.valid) return false;
        if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
        return true;
      });

      if (existingValidCode) {
        toast.error(`Esiste già un codice valido per questo ristorante: ${existingValidCode.code}`);
        return;
      }

      // Generate unique code
      let code = generateCode();
      let attempts = 0;
      while (codes.some(c => c.code === code) && attempts < 10) {
        code = generateCode();
        attempts++;
      }

      // Get duration
      const durationStr = selectedDuration[request.id] || '30';
      const durationDays = parseInt(durationStr);
      
      // Code expires in 30 days (time to use the code, not the sponsorship duration)
      const expiresAt = addDays(new Date(), 30).toISOString();

      // Insert code
      const { error: codeError } = await supabase
        .from('sponsorship_codes')
        .insert({
          code,
          restaurant_id: request.restaurant_id,
          user_id: request.user_id,
          duration_days: durationDays,
          valid: true,
          expires_at: expiresAt
        });

      if (codeError) {
        console.error('Code creation error:', codeError);
        throw codeError;
      }

      // Update request status
      const { error: requestError } = await supabase
        .from('sponsorship_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast.success(`Codice ${code} generato per ${request.restaurant?.name || 'ristorante'} (${durationDays} giorni)`);
      fetchData();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error("Impossibile generare il codice: " + (error.message || 'Errore sconosciuto'));
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleRejectRequest = async (request: SponsorshipRequest) => {
    try {
      const { error } = await supabase
        .from('sponsorship_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;

      toast.success("Richiesta rifiutata");
      fetchData();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error("Errore nel rifiuto della richiesta");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Codice copiato negli appunti");
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');
  const activeCodes = codes.filter(c => c.valid && (!c.expires_at || new Date(c.expires_at) > new Date()));
  const usedCodes = codes.filter(c => !c.valid || (c.expires_at && new Date(c.expires_at) <= new Date()));

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Gestione Sponsorizzazioni</h2>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Richieste in Attesa
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-destructive text-destructive-foreground text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="codes">Codici Attivi</TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessuna richiesta in attesa</p>
            </Card>
          ) : (
            pendingRequests.map(request => (
              <Card key={request.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-medium">{request.restaurant?.name || 'Ristorante'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span>{request.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Richiesta il {format(new Date(request.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedDuration[request.id] || '30'}
                      onValueChange={(value) => setSelectedDuration(prev => ({ ...prev, [request.id]: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 giorni</SelectItem>
                        <SelectItem value="30">30 giorni</SelectItem>
                        <SelectItem value="90">90 giorni</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      onClick={() => handleGenerateCode(request)}
                      disabled={generatingFor === request.id}
                      size="sm"
                    >
                      {generatingFor === request.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 mr-1" />
                          Genera
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectRequest(request)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="codes" className="space-y-4 mt-4">
          {activeCodes.length === 0 ? (
            <Card className="p-8 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessun codice attivo</p>
            </Card>
          ) : (
            activeCodes.map(code => (
              <Card key={code.id} className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-medium">{code.restaurant?.name || 'Ristorante'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-lg">
                        {code.code}
                      </Badge>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(code.code)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {code.duration_days} giorni • Scade il {format(new Date(code.expires_at!), 'dd MMM yyyy', { locale: it })}
                    </p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" /> Attivo
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Richieste Processate</h3>
          {processedRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna richiesta processata</p>
          ) : (
            processedRequests.slice(0, 20).map(request => (
              <Card key={request.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{request.restaurant?.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{request.email}</span>
                  </div>
                  <Badge variant={request.status === 'approved' ? 'default' : 'destructive'}>
                    {request.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                  </Badge>
                </div>
              </Card>
            ))
          )}

          <h3 className="font-medium text-sm text-muted-foreground mt-6 mb-2">Codici Usati/Scaduti</h3>
          {usedCodes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun codice usato o scaduto</p>
          ) : (
            usedCodes.slice(0, 20).map(code => (
              <Card key={code.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-sm">{code.code}</span>
                    <span className="text-xs text-muted-foreground ml-2">{code.restaurant?.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {code.used_at ? 'Usato' : 'Scaduto'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};