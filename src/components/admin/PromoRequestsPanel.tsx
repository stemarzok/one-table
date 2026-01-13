import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  Gift,
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Trash2,
  Edit,
  User,
  RefreshCw,
  AlertCircle
} from "lucide-react";

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
  profiles?: { email: string; name: string } | null;
}

export const PromoRequestsPanel = () => {
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [activePromos, setActivePromos] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Record<string, string>>({});
  
  // Edit subscription modal
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({ extendDays: '', newEndDate: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  
  // Delete subscription modal
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [deletingSub, setDeletingSub] = useState(false);

  const fetchData = async () => {
    try {
      const { data: requestsData } = await supabase
        .from('promo_requests')
        .select('*')
        .order('created_at', { ascending: false });
      setRequests(requestsData || []);

      const { data: codesData } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });
      setCodes(codesData || []);

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('plan_type', 'promo_speciale')
        .order('current_period_end', { ascending: false });
      
      // Fetch profiles for subscriptions
      if (subData && subData.length > 0) {
        const userIds = [...new Set(subData.map(s => s.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email, name')
          .in('id', userIds);
        
        const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
        
        const subsWithProfiles = subData.map(sub => ({
          ...sub,
          profiles: profilesMap.get(sub.user_id) || null
        }));
        setActivePromos(subsWithProfiles);
      } else {
        setActivePromos([]);
      }
    } catch (error) {
      console.error('Error fetching promo data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Single consolidated realtime channel for all promo-related tables
    const channel = supabase
      .channel('promo-all-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_requests' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'promo_codes' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      const { data: activeSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', request.user_id)
        .eq('status', 'active')
        .maybeSingle();

      if (activeSub) {
        toast.error("Questo utente ha già un abbonamento attivo");
        return;
      }

      const existingValidCode = codes.find(c => {
        if (c.user_id !== request.user_id || !c.valid) return false;
        if (c.expires_at && new Date(c.expires_at) < new Date()) return false;
        return true;
      });

      if (existingValidCode) {
        toast.error(`Esiste già un codice valido per questo utente: ${existingValidCode.code}`);
        return;
      }

      let code = generateCode();
      let attempts = 0;
      while (codes.some(c => c.code === code) && attempts < 10) {
        code = generateCode();
        attempts++;
      }

      const durationStr = selectedDuration[request.id] || 'unlimited';
      const durationDays = durationStr === 'unlimited' ? null : parseInt(durationStr);
      const expiresAt = durationDays ? addDays(new Date(), durationDays).toISOString() : null;

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

      const { error: requestError } = await supabase
        .from('promo_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast.success(`Codice ${code} generato per ${request.email}`);
      fetchData();
    } catch (error: any) {
      console.error('Error generating code:', error);
      toast.error("Impossibile generare il codice");
    } finally {
      setGeneratingFor(null);
    }
  };

  const handleRejectRequest = async (request: PromoRequest) => {
    try {
      const { error } = await supabase
        .from('promo_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;
      toast.success("Richiesta rifiutata");
      fetchData();
    } catch (error) {
      toast.error("Errore nel rifiuto della richiesta");
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Codice copiato negli appunti");
  };

  const handleEditSubscription = (sub: Subscription) => {
    setEditingSubscription(sub);
    setEditForm({
      extendDays: '',
      newEndDate: format(new Date(sub.current_period_end), 'yyyy-MM-dd')
    });
  };

  const handleSaveSubscriptionEdit = async () => {
    if (!editingSubscription) return;
    setSavingEdit(true);

    try {
      let newEndDate: Date;
      
      if (editForm.extendDays) {
        const days = parseInt(editForm.extendDays);
        newEndDate = addDays(new Date(editingSubscription.current_period_end), days);
      } else if (editForm.newEndDate) {
        newEndDate = new Date(editForm.newEndDate);
        newEndDate.setHours(23, 59, 59, 999);
      } else {
        toast.error("Inserisci un numero di giorni o una data");
        return;
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          current_period_end: newEndDate.toISOString(),
          status: 'active'
        })
        .eq('id', editingSubscription.id);

      if (error) throw error;

      toast.success(`Nuova scadenza: ${format(newEndDate, "d MMMM yyyy", { locale: it })}`);
      setEditingSubscription(null);
      fetchData();
    } catch (error: any) {
      toast.error("Impossibile modificare l'abbonamento");
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

      toast.success("Abbonamento cancellato");
      setDeletingSubscription(null);
      fetchData();
    } catch (error) {
      toast.error("Impossibile cancellare l'abbonamento");
    } finally {
      setDeletingSub(false);
    }
  };

  const handleReactivateSubscription = async (sub: Subscription) => {
    try {
      const newEndDate = addDays(new Date(), 30);
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'active',
          current_period_end: newEndDate.toISOString()
        })
        .eq('id', sub.id);

      if (error) throw error;

      toast.success(`Abbonamento riattivato fino al ${format(newEndDate, "d MMMM yyyy", { locale: it })}`);
      fetchData();
    } catch (error) {
      toast.error("Impossibile riattivare l'abbonamento");
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');
  const activeCodes = codes.filter(c => c.valid && (!c.expires_at || new Date(c.expires_at) >= new Date()));
  const usedCodes = codes.filter(c => !c.valid || (c.expires_at && new Date(c.expires_at) < new Date()));
  const activeSubscriptions = activePromos.filter(s => s.status === 'active');
  const expiredSubscriptions = activePromos.filter(s => s.status === 'cancelled');

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
        <Gift className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-semibold">Gestione Codici Promo</h2>
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
          <TabsTrigger value="subscriptions">
            Abbonamenti Attivi
            {activeSubscriptions.length > 0 && (
              <Badge className="ml-2 bg-green-500 text-white text-xs">
                {activeSubscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">Storico</TabsTrigger>
        </TabsList>

        {/* Pending Requests */}
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
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{request.email}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Richiesta il {format(new Date(request.created_at), 'dd MMM yyyy, HH:mm', { locale: it })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Select 
                      value={selectedDuration[request.id] || 'unlimited'}
                      onValueChange={(value) => setSelectedDuration(prev => ({ ...prev, [request.id]: value }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 giorni</SelectItem>
                        <SelectItem value="90">90 giorni</SelectItem>
                        <SelectItem value="365">1 anno</SelectItem>
                        <SelectItem value="unlimited">Illimitato</SelectItem>
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

        {/* Active Codes */}
        <TabsContent value="codes" className="space-y-4 mt-4">
          {activeCodes.length === 0 ? (
            <Card className="p-8 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessun codice attivo</p>
            </Card>
          ) : (
            activeCodes.map(code => {
              const relatedRequest = requests.find(r => r.user_id === code.user_id);
              return (
                <Card key={code.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{relatedRequest?.email || 'Utente'}</span>
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
                        {code.duration_days ? `${code.duration_days} giorni` : 'Illimitato'} 
                        {code.expires_at && ` • Scade il ${format(new Date(code.expires_at), 'dd MMM yyyy', { locale: it })}`}
                      </p>
                    </div>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                      <CheckCircle className="w-3 h-3 mr-1" /> Attivo
                    </Badge>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Active Subscriptions */}
        <TabsContent value="subscriptions" className="space-y-4 mt-4">
          {activeSubscriptions.length === 0 ? (
            <Card className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nessun abbonamento promo attivo</p>
            </Card>
          ) : (
            activeSubscriptions.map(sub => {
              const email = sub.profiles?.email || requests.find(r => r.user_id === sub.user_id)?.email || 'Email non disponibile';
              const isUnlimited = new Date(sub.current_period_end).getFullYear() >= 2099;
              const isExpired = new Date(sub.current_period_end) < new Date();
              return (
                <Card key={sub.id} className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{email}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isUnlimited 
                          ? 'Nessuna scadenza (illimitato)'
                          : isExpired 
                            ? `Scaduto il ${format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: it })}`
                            : `Scade il ${format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: it })}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={isExpired ? "bg-orange-500 text-white" : "bg-green-500 text-white"}>
                        {isExpired ? 'Scaduto' : 'Attivo'}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => handleEditSubscription(sub)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Modifica
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingSubscription(sub)}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="space-y-4 mt-4">
          <h3 className="font-medium text-sm text-muted-foreground mb-2">Richieste Processate</h3>
          {processedRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna richiesta processata</p>
          ) : (
            processedRequests.slice(0, 20).map(request => (
              <Card key={request.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{request.email}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {format(new Date(request.created_at), 'dd MMM yyyy', { locale: it })}
                    </span>
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
                  </div>
                  <Badge variant="secondary">
                    {code.used_at ? 'Usato' : 'Scaduto'}
                  </Badge>
                </div>
              </Card>
            ))
          )}

          <h3 className="font-medium text-sm text-muted-foreground mt-6 mb-2">Abbonamenti Scaduti/Cancellati</h3>
          {expiredSubscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun abbonamento scaduto</p>
          ) : (
            expiredSubscriptions.slice(0, 20).map(sub => {
              const email = sub.profiles?.email || requests.find(r => r.user_id === sub.user_id)?.email || 'Utente';
              return (
                <Card key={sub.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{email}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(sub.current_period_end), 'dd MMM yyyy', { locale: it })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {sub.status === 'cancelled' ? 'Cancellato' : 'Scaduto'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivateSubscription(sub)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Riattiva
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Subscription Modal */}
      <Dialog open={!!editingSubscription} onOpenChange={() => setEditingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifica Abbonamento</DialogTitle>
            <DialogDescription>
              Modifica la data di scadenza dell'abbonamento promo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Estendi di giorni</Label>
              <Input
                type="number"
                placeholder="es. 30"
                value={editForm.extendDays}
                onChange={(e) => setEditForm(prev => ({ ...prev, extendDays: e.target.value, newEndDate: '' }))}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">oppure</div>
            <div>
              <Label>Imposta data specifica</Label>
              <Input
                type="date"
                value={editForm.newEndDate}
                onChange={(e) => setEditForm(prev => ({ ...prev, newEndDate: e.target.value, extendDays: '' }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSubscription(null)}>
              Annulla
            </Button>
            <Button onClick={handleSaveSubscriptionEdit} disabled={savingEdit}>
              {savingEdit ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subscription Modal */}
      <Dialog open={!!deletingSubscription} onOpenChange={() => setDeletingSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancella Abbonamento</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler cancellare questo abbonamento promo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingSubscription(null)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleCancelSubscription} disabled={deletingSub}>
              {deletingSub ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Cancella Abbonamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};