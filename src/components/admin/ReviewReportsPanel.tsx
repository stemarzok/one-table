import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { AlertTriangle, CheckCircle, XCircle, Trash2, Eye, Flag } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ReviewReport {
  id: string;
  review_id: string;
  reporter_id: string;
  restaurant_id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  review?: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
    user_id: string;
    profiles?: {
      name: string;
      email: string;
    };
  };
  restaurant?: {
    name: string;
  };
}

export const ReviewReportsPanel = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReviewReport | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('review_reports')
        .select(`
          *,
          review:reviews(
            id,
            rating,
            comment,
            created_at,
            user_id
          ),
          restaurant:restaurants(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each review
      const reportsWithProfiles = await Promise.all(
        (data || []).map(async (report) => {
          if (report.review?.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name, email')
              .eq('id', report.review.user_id)
              .single();
            
            return {
              ...report,
              review: {
                ...report.review,
                profiles: profileData
              }
            };
          }
          return report;
        })
      );

      setReports(reportsWithProfiles as ReviewReport[]);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const channel = supabase
      .channel('review-reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'review_reports' },
        () => fetchReports()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleResolve = async (reportId: string, action: 'dismissed' | 'resolved') => {
    if (!profile?.id) return;
    setProcessing(true);

    try {
      const { error } = await supabase
        .from('review_reports')
        .update({
          status: action,
          admin_notes: adminNotes || null,
          resolved_at: new Date().toISOString(),
          resolved_by: profile.id
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: action === 'resolved' ? "Segnalazione risolta" : "Segnalazione archiviata",
        description: action === 'resolved' 
          ? "La segnalazione è stata gestita" 
          : "La segnalazione è stata archiviata senza azione",
      });

      setShowDetailsDialog(false);
      setAdminNotes("");
      setSelectedReport(null);
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

  const handleDeleteReview = async () => {
    if (!selectedReport?.review_id || !profile?.id) return;
    setProcessing(true);

    try {
      // Delete the review
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', selectedReport.review_id);

      if (deleteError) throw deleteError;

      // Update the report as resolved
      const { error: updateError } = await supabase
        .from('review_reports')
        .update({
          status: 'resolved',
          admin_notes: adminNotes || 'Recensione rimossa',
          resolved_at: new Date().toISOString(),
          resolved_by: profile.id
        })
        .eq('id', selectedReport.id);

      if (updateError) throw updateError;

      toast({
        title: "Recensione eliminata",
        description: "La recensione inappropriata è stata rimossa",
      });

      setShowDeleteDialog(false);
      setShowDetailsDialog(false);
      setAdminNotes("");
      setSelectedReport(null);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600">In Attesa</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-500/20 text-green-600">Risolta</Badge>;
      case 'dismissed':
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Archiviata</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Caricamento segnalazioni...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Flag className="w-4 h-4 text-yellow-500" />
              In Attesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingReports.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Risolte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter(r => r.status === 'resolved').length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-muted-foreground" />
              Archiviate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reports.filter(r => r.status === 'dismissed').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Segnalazioni in Attesa
          </CardTitle>
          <CardDescription>
            Recensioni segnalate dai ristoratori che richiedono moderazione
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingReports.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nessuna segnalazione in attesa
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ristorante</TableHead>
                  <TableHead>Autore Recensione</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.restaurant?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {report.review?.profiles?.name || 'Utente eliminato'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Dettagli
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved Reports */}
      {resolvedReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Segnalazioni Gestite</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Ristorante</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Risolto il</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedReports.slice(0, 10).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.created_at), 'dd MMM yyyy', { locale: it })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.restaurant?.name || 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {report.reason}
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      {report.resolved_at 
                        ? format(new Date(report.resolved_at), 'dd MMM yyyy', { locale: it })
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dettagli Segnalazione</DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ristorante</p>
                  <p className="font-medium">{selectedReport.restaurant?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Autore Recensione</p>
                  <p className="font-medium">{selectedReport.review?.profiles?.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedReport.review?.profiles?.email}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Motivo Segnalazione</p>
                <p className="p-3 bg-destructive/10 rounded-lg text-destructive">
                  {selectedReport.reason}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Contenuto Recensione</p>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-500">★ {selectedReport.review?.rating}/5</span>
                    <span className="text-xs text-muted-foreground">
                      {selectedReport.review?.created_at && 
                        format(new Date(selectedReport.review.created_at), 'dd MMM yyyy', { locale: it })}
                    </span>
                  </div>
                  <p>{selectedReport.review?.comment || 'Nessun commento'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Note Admin (opzionale)</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Aggiungi note sulla decisione..."
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleResolve(selectedReport!.id, 'dismissed')}
              disabled={processing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Archivia (Nessuna Azione)
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={processing}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Elimina Recensione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Conferma Eliminazione
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Sei sicuro di voler eliminare questa recensione? L'azione è irreversibile.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={handleDeleteReview} disabled={processing}>
              Elimina Recensione
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
