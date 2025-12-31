import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Trash2, Crown, Shield, Loader2 } from "lucide-react";
import { useAdminRole } from "@/hooks/useAdminRole";
import { useAuth } from "@/contexts/AuthContext";
import { AdminActivityLogs } from "./AdminActivityLogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    name: string;
    email: string;
  };
}

export const AdminManagementPanel = () => {
  const { toast } = useToast();
  const { isSuperAdmin } = useAdminRole();
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('id, user_id, role, created_at');

      if (error) throw error;

      // Fetch profile info for each admin
      const adminsWithProfiles = await Promise.all(
        (data || []).map(async (admin) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', admin.user_id)
            .single();
          
          return {
            ...admin,
            profile: profile || undefined
          };
        })
      );

      setAdmins(adminsWithProfiles);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const sendNotificationEmail = async (action: 'promoted' | 'removed', targetEmail: string, targetName: string, role?: string) => {
    try {
      const actorName = profile?.name || 'Super Admin';
      
      await supabase.functions.invoke('send-admin-notification', {
        body: {
          action,
          targetEmail,
          targetName,
          actorName,
          role
        }
      });
      
      console.log(`Notification email sent for ${action} to ${targetEmail}`);
    } catch (error) {
      console.error('Error sending notification email:', error);
      // Don't throw - email failure shouldn't block the main action
    }
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un'email valida",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First find the user by email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .single();

      if (profileError || !profile) {
        throw new Error('Utente non trovato con questa email');
      }

      // Check if already admin
      const { data: existingAdmin } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (existingAdmin) {
        throw new Error('Questo utente è già un amministratore');
      }

      // Get target user name for email
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', profile.id)
        .single();

      // Insert new admin role
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert({
          user_id: profile.id,
          role: 'admin'
        });

      if (insertError) throw insertError;

      // Send notification email
      await sendNotificationEmail(
        'promoted', 
        email.trim(), 
        targetProfile?.name || 'Utente',
        'admin'
      );

      toast({
        title: "Successo",
        description: `Utente ${email} promosso ad amministratore. Email di notifica inviata.`,
      });
      
      setEmail("");
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile promuovere l'utente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminEmail: string, adminName: string) => {
    try {
      const { error } = await supabase
        .from('admin_roles')
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      // Send notification email
      await sendNotificationEmail('removed', adminEmail, adminName);

      toast({
        title: "Successo",
        description: `${adminEmail} rimosso dagli amministratori. Email di notifica inviata.`,
      });
      
      fetchAdmins();
    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message || "Impossibile rimuovere l'amministratore",
        variant: "destructive",
      });
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-500" />
            Gestione Amministratori
          </CardTitle>
          <CardDescription>
            Solo i Super Admin possono gestire gli amministratori
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Non hai i permessi per accedere a questa sezione.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Promote User Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Promuovi Utente ad Admin
          </CardTitle>
          <CardDescription>
            Inserisci l'email dell'utente da promuovere ad amministratore
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePromote} className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email">Email Utente</Label>
              <Input
                id="email"
                type="email"
                placeholder="utente@esempio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Promozione...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Promuovi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Amministratori Attuali
          </CardTitle>
          <CardDescription>
            Lista degli amministratori del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingAdmins ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nessun amministratore trovato
            </p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {admin.role === 'superadmin' ? (
                        <Crown className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Shield className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{admin.profile?.name || 'Utente'}</p>
                      <p className="text-sm text-muted-foreground">{admin.profile?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {admin.role === 'superadmin' ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Crown className="w-3 h-3 mr-1" />
                        Super Admin
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {admin.role !== 'superadmin' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Rimuovere amministratore?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Stai per rimuovere <strong>{admin.profile?.name}</strong> ({admin.profile?.email}) 
                              dagli amministratori. Questa azione può essere annullata promuovendo nuovamente l'utente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveAdmin(admin.id, admin.profile?.email || '', admin.profile?.name || 'Utente')}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Rimuovi Admin
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <AdminActivityLogs />

      {/* Info about SuperAdmin */}
      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Crown className="w-5 h-5" />
            Informazioni Super Admin
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Super Admin</strong> è il ruolo più alto nel sistema. Solo un Super Admin può:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Promuovere utenti ad Admin</li>
            <li>Rimuovere Admin dal sistema</li>
            <li>Accedere a tutte le funzionalità di amministrazione</li>
          </ul>
          <p className="pt-2">
            Il trasferimento del ruolo di Super Admin richiede un intervento diretto sul database 
            e non può essere effettuato dall'interfaccia utente per motivi di sicurezza.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};