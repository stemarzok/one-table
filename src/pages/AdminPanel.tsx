import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, XCircle, FileText, Clock } from "lucide-react";

interface Application {
  id: string;
  business_name: string;
  business_registration_number: string;
  legal_representative: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  city: string;
  province: string | null;
  postal_code: string | null;
  documents_url: string[] | null;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  user_id: string;
}

const AdminPanel = () => {
  const { isLoggedIn, profile } = useAuth();
  const { isAdmin, loading } = useAdminRole();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
      return;
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!isAdmin) return;

      const { data, error } = await supabase
        .from('business_applications')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        setApplications(data);
      }
    };

    if (isAdmin) {
      fetchApplications();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('business-applications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_applications'
          },
          () => {
            fetchApplications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const viewDocument = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('business-documents')
        .createSignedUrl(fileName, 3600); // 1 hour expiry

      if (error) throw error;

      if (data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Errore",
        description: "Impossibile accedere al documento",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (application: Application) => {
    if (!profile?.id) return;

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('approve_business_application', {
        _application_id: application.id,
        _admin_id: profile.id
      });

      if (error) throw error;

      toast({
        title: "Approvata",
        description: `Richiesta di ${application.business_name} approvata con successo`,
      });
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!profile?.id || !selectedApp || !rejectionReason.trim()) return;

    setProcessing(true);
    try {
      const { error } = await supabase.rpc('reject_business_application', {
        _application_id: selectedApp.id,
        _admin_id: profile.id,
        _reason: rejectionReason
      });

      if (error) throw error;

      toast({
        title: "Rifiutata",
        description: `Richiesta di ${selectedApp.business_name} rifiutata`,
      });

      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedApp(null);
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg text-muted-foreground">Caricamento...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const pendingApps = applications.filter(app => app.status === 'pending');
  const approvedApps = applications.filter(app => app.status === 'approved');
  const rejectedApps = applications.filter(app => app.status === 'rejected');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Pannello Amministratore</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  In Attesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{pendingApps.length}</p>
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
                <p className="text-3xl font-bold">{approvedApps.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  Rifiutate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{rejectedApps.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Applications */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Richieste in Attesa</h2>
            {pendingApps.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Nessuna richiesta in attesa</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingApps.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.business_name}</CardTitle>
                          <CardDescription>
                            P.IVA: {app.business_registration_number}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">In Attesa</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Rappresentante Legale</p>
                          <p className="font-medium">{app.legal_representative}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{app.business_email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Telefono</p>
                          <p className="font-medium">{app.business_phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Indirizzo</p>
                          <p className="font-medium">{app.business_address}, {app.city}</p>
                        </div>
                      </div>

                      {app.documents_url && app.documents_url.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">Documenti</p>
                          <div className="flex flex-wrap gap-2">
                            {app.documents_url.map((fileName, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => viewDocument(fileName)}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Documento {index + 1}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(app)}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approva
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowRejectDialog(true);
                          }}
                          disabled={processing}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rifiuta
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Approved Applications */}
          {approvedApps.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-4">Richieste Approvate</h2>
              <div className="space-y-4">
                {approvedApps.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.business_name}</CardTitle>
                          <CardDescription>P.IVA: {app.business_registration_number}</CardDescription>
                        </div>
                        <Badge className="bg-green-600">Approvata</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Rejected Applications */}
          {rejectedApps.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Richieste Rifiutate</h2>
              <div className="space-y-4">
                {rejectedApps.map((app) => (
                  <Card key={app.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{app.business_name}</CardTitle>
                          <CardDescription>P.IVA: {app.business_registration_number}</CardDescription>
                        </div>
                        <Badge variant="destructive">Rifiutata</Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rifiuta Richiesta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Specifica il motivo del rifiuto per {selectedApp?.business_name}
            </p>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motivo del rifiuto..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim() || processing}
            >
              Rifiuta Richiesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
