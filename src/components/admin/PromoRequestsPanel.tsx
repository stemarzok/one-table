import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Gift, Clock, CheckCircle, Loader2, Copy } from "lucide-react";
import { format } from "date-fns";
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
}

export const PromoRequestsPanel = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);

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

      // Insert code
      const { error: codeError } = await supabase
        .from('promo_codes')
        .insert({
          code,
          user_id: request.user_id,
          valid: true
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
        description: `Codice ${code} creato per ${request.email}`,
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
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              In Attesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Approvate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{approvedRequests.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Codici Attivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{codes.filter(c => c.valid).length}</p>
          </CardContent>
        </Card>
      </div>

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
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      User ID: <code className="text-xs">{request.user_id.slice(0, 8)}...</code>
                    </p>
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
                      <Badge variant={code.valid ? "default" : "secondary"}>
                        {code.valid ? 'Valido' : 'Utilizzato'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Email: {relatedRequest?.email || 'N/A'}</span>
                      <span>•</span>
                      <span>Creato il {format(new Date(code.created_at), "d MMM yyyy", { locale: it })}</span>
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
