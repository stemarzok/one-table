import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Clock, CheckCircle, Loader2, Copy, Trash2, Edit, User } from "lucide-react";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";

interface PromoRequest {
  id: string;
  user_id: string;
  email: string;
  status: string;
  created_at: string;
}

interface PromoCode {
  id: string;
  code: string;
  user_id: string;
  valid: boolean;
  created_at: string;
  used_at: string | null;
  expires_at: string | null;
  duration_days: number | null;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_end: string;
}

export const PromoRequestsPanel = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [activePromos, setActivePromos] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<{ [key: string]: string }>({});
  const [deletingCode, setDeletingCode] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      // Fetch promo requests
      const { data: requestsData, error: requestsError } = await supabase
        .from('promo_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setRequests(requestsData || []);

      // Fetch promo codes
      const { data: codesData, error: codesError } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (codesError) throw codesError;
      setCodes(codesData || []);

      // Fetch active promo subscriptions
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('plan_type', 'promo_speciale')
        .eq('status', 'active');

      if (subError) throw subError;
      setActivePromos(subData || []);
    } catch (error) {
      console.error('Error fetching promo data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates
    const requestsChannel = supabase
      .channel('promo-requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_requests' }, fetchData)
      .subscribe();

    const codesChannel = supabase
      .channel('promo-codes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(codesChannel);
    };
  }, []);

  const generateCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateCode = async (request: PromoRequest) => {
    setGeneratingFor(request.id);
    try {
      // Check if code already exists for this user
      const existingCode = codes.find(c => c.user_id === request.user_id && c.valid);
      if (existingCode) {
        toast({
          title: "Attenzione",
          description: "Esiste già un codice valido per questo utente",
          variant: "destructive",
        });
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
      const durationStr = selectedDuration[request.id] || 'unlimited';
      const durationDays = durationStr === 'unlimited' ? null : parseInt(durationStr);
      const expiresAt = durationDays ? addDays(new Date(), durationDays).toISOString() : null;

      // Insert code
      const { error: codeError } = await supabase
        .from('promo_codes')
        .insert({
          code,
          user_id: request.user_id,
          valid: true,
          duration_days: durationDays,
          expires_at: expiresAt
        });

      if (codeError) throw codeError;

      // Update request status
      const { error: requestError } = await supabase
        .from('promo_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast({
        title: "Codice Generato",
        description: `Codice ${code} creato per ${request.email}${durationDays ? ` (valido ${durationDays} giorni)` : ' (illimitato)'}`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast({
        title: "Errore",
        description: "Impossibile generare il codice",
        variant: "destructive",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    setDeletingCode(codeId);
    try {
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Codice Eliminato",
        description: "Il codice è stato eliminato",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il codice",
        variant: "destructive",
      });
    } finally {
      setDeletingCode(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copiato",
      description: "Codice copiato negli appunti",
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-5 h-5 text-yellow-500" />
              In Attesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Approvate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvedRequests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Gift className="w-5 h-5 text-primary" />
              Codici Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{codes.filter(c => c.valid).length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-5 h-5 text-blue-500" />
              Promo Attive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activePromos.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promo Users */}
      {activePromos.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Utenti con Promo Attiva</h2>
          <div className="space-y-4">
            {activePromos.map((sub) => {
              const relatedRequest = requests.find(r => r.user_id === sub.user_id);
              const isExpired = new Date(sub.current_period_end) < new Date();
              return (
                <Card key={sub.id} className={isExpired ? 'opacity-60' : ''}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{relatedRequest?.email || 'Email non disponibile'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(sub.current_period_end).getFullYear() >= 2099 
                            ? 'Nessuna scadenza'
                            : `Scade il ${format(new Date(sub.current_period_end), "d MMMM yyyy", { locale: it })}`}
                        </p>
                      </div>
                      <Badge variant={isExpired ? "secondary" : "default"}>
                        {isExpired ? 'Scaduto' : 'Attivo'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Pending Requests */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Richieste in Attesa</h2>
        {pendingRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessuna richiesta in attesa</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.email}</CardTitle>
                      <CardDescription>
                        Richiesta il {format(new Date(request.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">In Attesa</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Durata:</span>
                      <Select
                        value={selectedDuration[request.id] || 'unlimited'}
                        onValueChange={(value) => setSelectedDuration(prev => ({ ...prev, [request.id]: value }))}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue placeholder="Seleziona" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7">7 giorni</SelectItem>
                          <SelectItem value="14">14 giorni</SelectItem>
                          <SelectItem value="30">30 giorni</SelectItem>
                          <SelectItem value="60">60 giorni</SelectItem>
                          <SelectItem value="90">90 giorni</SelectItem>
                          <SelectItem value="unlimited">Illimitato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => handleGenerateCode(request)}
                      disabled={generatingFor === request.id}
                    >
                      {generatingFor === request.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Gift className="h-4 w-4 mr-2" />
                      )}
                      Genera Codice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Generated Codes */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Codici Generati</h2>
        {codes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessun codice generato</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {codes.map((code) => {
              const relatedRequest = requests.find(r => r.user_id === code.user_id);
              const isExpired = code.expires_at && new Date(code.expires_at) < new Date();
              return (
                <Card key={code.id} className={isExpired && code.valid ? 'border-yellow-500/50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <code className="text-2xl font-mono font-bold tracking-widest">
                          {code.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyCode(code.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={code.valid ? (isExpired ? "secondary" : "default") : "secondary"}>
                          {!code.valid ? 'Utilizzato' : (isExpired ? 'Scaduto' : 'Valido')}
                        </Badge>
                        {code.valid && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCode(code.id)}
                            disabled={deletingCode === code.id}
                          >
                            {deletingCode === code.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Email: {relatedRequest?.email || 'N/A'}</span>
                      <span>•</span>
                      <span>Creato il {format(new Date(code.created_at), "d MMM yyyy", { locale: it })}</span>
                      {code.expires_at && (
                        <>
                          <span>•</span>
                          <span className={isExpired ? 'text-yellow-600' : ''}>
                            {isExpired ? 'Scaduto il' : 'Scade il'} {format(new Date(code.expires_at), "d MMM yyyy", { locale: it })}
                          </span>
                        </>
                      )}
                      {!code.expires_at && (
                        <>
                          <span>•</span>
                          <span>Nessuna scadenza</span>
                        </>
                      )}
                      {code.used_at && (
                        <>
                          <span>•</span>
                          <span>Usato il {format(new Date(code.used_at), "d MMM yyyy", { locale: it })}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
