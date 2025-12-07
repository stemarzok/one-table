import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Clock, CheckCircle, Loader2, Copy, Trash2, Edit, User, Calendar, RefreshCw, XCircle, AlertCircle } from "lucide-react";
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
  current_period_start: string;
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
  
  // Edit subscription modal
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({ extendDays: '', newEndDate: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Delete subscription modal
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [deletingSub, setDeletingSub] = useState(false);

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

      // Fetch ALL promo subscriptions (not just active)
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('plan_type', 'promo_speciale')
        .order('current_period_end', { ascending: false });

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

    const subsChannel = supabase
      .channel('promo-subs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(codesChannel);
      supabase.removeChannel(subsChannel);
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
      // Check if user already has an active subscription
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', request.user_id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeSub) {
        toast({
          title: "Attenzione",
          description: "Questo utente ha già un abbonamento attivo",
          variant: "destructive",
        });
        return;
      }

      // Check if code already exists for this user (valid and not expired)
      const existingValidCode = codes.find(c => {
        if (c.user_id !== request.user_id || !c.valid) return false;
        // Check if not expired
        if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
        return true;
      });

      if (existingValidCode) {
        toast({
          title: "Attenzione",
          description: `Esiste già un codice valido per questo utente: ${existingValidCode.code}`,
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
      
      // Calculate expiration date from NOW + duration days (not current date)
      const expiresAt = durationDays 
        ? addDays(new Date(), durationDays).toISOString() 
        : null;

      console.log('Creating code:', { code, durationDays, expiresAt, user_id: request.user_id });

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

      if (codeError) {
        console.error('Code creation error:', codeError);
        throw codeError;
      }

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
        description: "Impossibile generare il codice: " + (error.message || 'Errore sconosciuto'),
        variant: "destructive",
      });
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleRevokeCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({ valid: false })
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Codice Revocato",
        description: "Il codice è stato revocato e non può più essere utilizzato",
      });

      fetchData();
    } catch (error) {
      console.error('Error revoking code:', error);
      toast({
        title: "Errore",
        description: "Impossibile revocare il codice",
        variant: "destructive",
      });
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

  // Subscription management
  const handleEditSubscription = (sub: Subscription) => {
    setEditingSubscription(sub);
    const currentEnd = new Date(sub.current_period_end);
    setEditForm({
      extendDays: '',
      newEndDate: format(currentEnd, 'yyyy-MM-dd')
    });
  };

  const handleSaveSubscriptionEdit = async () => {
    if (!editingSubscription) return;
    setSavingEdit(true);

    try {
      let newEndDate: Date;
      
      if (editForm.extendDays) {
        // Extend by days
        const days = parseInt(editForm.extendDays);
        newEndDate = addDays(new Date(editingSubscription.current_period_end), days);
      } else if (editForm.newEndDate) {
        // Set specific date
        newEndDate = new Date(editForm.newEndDate);
        newEndDate.setHours(23, 59, 59, 999);
      } else {
        toast({
          title: "Errore",
          description: "Inserisci un numero di giorni o una data",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          current_period_end: newEndDate.toISOString(),
          status: 'active' // Ensure it's active if we're extending
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;

      toast({
        title: "Abbonamento Modificato",
        description: `Nuova scadenza: ${format(newEndDate, "d MMMM yyyy", { locale: it })}`,
      });

      setEditingSubscription(null);
      fetchData();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare l'abbonamento: " + (error.message || ''),
        variant: "destructive",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!deletingSubscription) return;
    setDeletingSub(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', deletingSubscription.id);

      if (error) throw error;

      toast({
        title: "Abbonamento Cancellato",
        description: "L'abbonamento promo è stato cancellato",
      });

      setDeletingSubscription(null);
      fetchData();
    } catch (error: any) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile cancellare l'abbonamento: " + (error.message || ''),
        variant: "destructive",
      });
    } finally {
      setDeletingSub(false);
    }
  };

  const handleDeleteSubscription = async () => {
    if (!deletingSubscription) return;
    setDeletingSub(true);

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', deletingSubscription.id);

      if (error) throw error;

      toast({
        title: "Abbonamento Eliminato",
        description: "L'abbonamento promo è stato eliminato definitivamente",
      });

      setDeletingSubscription(null);
      fetchData();
    } catch (error: any) {
      console.error('Error deleting subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'abbonamento: " + (error.message || ''),
        variant: "destructive",
      });
    } finally {
      setDeletingSub(false);
    }
  };

  const handleReactivateSubscription = async (sub: Subscription) => {
    try {
      // Reactivate with 30 days from now
      const newEndDate = addDays(new Date(), 30);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          current_period_end: newEndDate.toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      toast({
        title: "Abbonamento Riattivato",
        description: `Abbonamento riattivato fino al ${format(newEndDate, "d MMMM yyyy", { locale: it })}`,
      });

      fetchData();
    } catch (error: any) {
      console.error('Error reactivating subscription:', error);
      toast({
        title: "Errore",
        description: "Impossibile riattivare l'abbonamento",
        variant: "destructive",
      });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  
  // Separate codes
  const activeCodes = codes.filter(c => c.valid && (!c.expires_at || new Date(c.expires_at) >= new Date()));
  const expiredCodes = codes.filter(c => c.expires_at && new Date(c.expires_at) < new Date() && c.valid);
  const usedCodes = codes.filter(c => !c.valid);
  
  // Separate subscriptions
  const activeSubscriptions = activePromos.filter(s => s.status === 'active' && new Date(s.current_period_end) >= new Date());
  const expiredSubscriptions = activePromos.filter(s => s.status === 'active' && new Date(s.current_period_end) < new Date());
  const cancelledSubscriptions = activePromos.filter(s => s.status === 'cancelled');

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
              Richieste in Attesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequests.length}</p>
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
            <p className="text-3xl font-bold">{activeCodes.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Promo Attive
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeSubscriptions.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Promo Scadute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{expiredSubscriptions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Promo Subscriptions */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          Abbonamenti Promo Attivi ({activeSubscriptions.length})
        </h2>
        {activeSubscriptions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessun abbonamento promo attivo</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeSubscriptions.map((sub) => {
              const relatedRequest = requests.find(r => r.user_id === sub.user_id);
              const isUnlimited = new Date(sub.current_period_end).getFullYear() >= 2099;
              return (
                <Card key={sub.id}>
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium">{relatedRequest?.email || 'Email non disponibile'}</p>
                        <p className="text-sm text-muted-foreground">
                          {isUnlimited 
                            ? 'Nessuna scadenza (illimitato)'
                            : `Scade il ${format(new Date(sub.current_period_end), "d MMMM yyyy", { locale: it })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-500">Attivo</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubscription(sub)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingSubscription(sub)}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancella
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Expired Promo Subscriptions */}
      {expiredSubscriptions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            Abbonamenti Promo Scaduti ({expiredSubscriptions.length})
          </h2>
          <div className="space-y-4">
            {expiredSubscriptions.map((sub) => {
              const relatedRequest = requests.find(r => r.user_id === sub.user_id);
              return (
                <Card key={sub.id} className="border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/10">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium">{relatedRequest?.email || 'Email non disponibile'}</p>
                        <p className="text-sm text-orange-600">
                          Scaduto il {format(new Date(sub.current_period_end), "d MMMM yyyy", { locale: it })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">Scaduto</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateSubscription(sub)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Riattiva (+30gg)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSubscription(sub)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Modifica
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingSubscription(sub)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled Subscriptions */}
      {cancelledSubscriptions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-muted-foreground" />
            Abbonamenti Cancellati ({cancelledSubscriptions.length})
          </h2>
          <div className="space-y-4">
            {cancelledSubscriptions.map((sub) => {
              const relatedRequest = requests.find(r => r.user_id === sub.user_id);
              return (
                <Card key={sub.id} className="opacity-60">
                  <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-medium">{relatedRequest?.email || 'Email non disponibile'}</p>
                        <p className="text-sm text-muted-foreground">Cancellato</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Cancellato</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateSubscription(sub)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Riattiva
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingSubscription(sub)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Active Codes */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          Codici Attivi ({activeCodes.length})
        </h2>
        {activeCodes.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nessun codice attivo</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeCodes.map((code) => {
              const relatedRequest = requests.find(r => r.user_id === code.user_id);
              return (
                <Card key={code.id}>
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
                        <Badge variant="default">Valido</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeCode(code.id)}
                          className="text-orange-600 border-orange-600 hover:bg-orange-50"
                        >
                          Revoca
                        </Button>
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
                          <span>Scade il {format(new Date(code.expires_at), "d MMM yyyy", { locale: it })}</span>
                        </>
                      )}
                      {!code.expires_at && (
                        <>
                          <span>•</span>
                          <span>Nessuna scadenza</span>
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

      {/* Expired Codes */}
      {expiredCodes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-yellow-500" />
            Codici Scaduti ({expiredCodes.length})
          </h2>
          <div className="space-y-4">
            {expiredCodes.map((code) => {
              const relatedRequest = requests.find(r => r.user_id === code.user_id);
              return (
                <Card key={code.id} className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/10">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <code className="text-2xl font-mono font-bold tracking-widest text-muted-foreground">
                          {code.code}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Scaduto</Badge>
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Email: {relatedRequest?.email || 'N/A'}</span>
                      <span>•</span>
                      <span className="text-yellow-600">
                        Scaduto il {format(new Date(code.expires_at!), "d MMM yyyy", { locale: it })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Used Codes */}
      {usedCodes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-muted-foreground" />
            Codici Utilizzati ({usedCodes.length})
          </h2>
          <div className="space-y-4">
            {usedCodes.map((code) => {
              const relatedRequest = requests.find(r => r.user_id === code.user_id);
              return (
                <Card key={code.id} className="opacity-60">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <code className="text-2xl font-mono font-bold tracking-widest text-muted-foreground">
                          {code.code}
                        </code>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Utilizzato</Badge>
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>Email: {relatedRequest?.email || 'N/A'}</span>
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
        </div>
      )}

      {/* Edit Subscription Modal */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Abbonamento Promo</DialogTitle>
            <DialogDescription>
              Modifica la durata dell'abbonamento promo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Estendi di giorni</Label>
              <Input
                type="number"
                placeholder="Es: 30"
                value={editForm.extendDays}
                onChange={(e) => setEditForm({ ...editForm, extendDays: e.target.value, newEndDate: '' })}
              />
            </div>
            <div className="text-center text-muted-foreground">oppure</div>
            <div className="space-y-2">
              <Label>Imposta data specifica</Label>
              <Input
                type="date"
                value={editForm.newEndDate}
                onChange={(e) => setEditForm({ ...editForm, newEndDate: e.target.value, extendDays: '' })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubscription(null)}>
              Annulla
            </Button>
            <Button onClick={handleSaveSubscriptionEdit} disabled={savingEdit}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete/Cancel Subscription Modal */}
      <Dialog open={!!deletingSubscription} onOpenChange={() => setDeletingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestione Abbonamento</DialogTitle>
            <DialogDescription>
              Cosa vuoi fare con questo abbonamento promo?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={handleCancelSubscription}
              disabled={deletingSub}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancella abbonamento (mantiene record)
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDeleteSubscription}
              disabled={deletingSub}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Elimina definitivamente
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSubscription(null)}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
