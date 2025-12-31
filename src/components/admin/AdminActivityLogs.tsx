import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { History, UserPlus, UserMinus, RefreshCw, Loader2, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Json } from "@/integrations/supabase/types";

interface ActivityLog {
  id: string;
  actor_id: string;
  action: string;
  target_user_id: string | null;
  target_email: string | null;
  details: Json;
  created_at: string;
  actor_profile?: {
    name: string;
    email: string;
  };
}

export const AdminActivityLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Fetch actor profiles
      const logsWithProfiles = await Promise.all(
        (data || []).map(async (log) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, email')
            .eq('id', log.actor_id)
            .maybeSingle();
          
          return {
            ...log,
            actor_profile: profile || undefined
          };
        })
      );

      setLogs(logsWithProfiles);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'admin_promoted':
      case 'superadmin_created':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'admin_removed':
        return <UserMinus className="w-4 h-4 text-red-500" />;
      case 'admin_role_changed':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <History className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'admin_promoted':
        return 'Promozione Admin';
      case 'superadmin_created':
        return 'Creazione Super Admin';
      case 'admin_removed':
        return 'Rimozione Admin';
      case 'admin_role_changed':
        return 'Cambio Ruolo';
      default:
        return action;
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'admin_promoted':
      case 'superadmin_created':
        return 'default';
      case 'admin_removed':
        return 'destructive';
      case 'admin_role_changed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getDetailsValue = (details: Json, key: string): string | undefined => {
    if (details && typeof details === 'object' && !Array.isArray(details)) {
      return (details as Record<string, unknown>)[key] as string | undefined;
    }
    return undefined;
  };

  const getRoleBadge = (role: string) => {
    if (role === 'superadmin') {
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600 text-white gap-1 text-xs">
          <Crown className="w-3 h-3" />
          Super Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 text-xs">
        <Shield className="w-3 h-3" />
        Admin
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Log Attività Admin
          </CardTitle>
          <CardDescription>
            Storico delle operazioni di gestione amministratori
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Nessuna attività registrata</p>
            <p className="text-sm">Le future operazioni sugli admin verranno tracciate qui</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg border"
              >
                <div className="mt-1">
                  {getActionIcon(log.action)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge variant={getActionBadgeVariant(log.action) as any}>
                      {getActionLabel(log.action)}
                    </Badge>
                    {getDetailsValue(log.details, 'role') && getRoleBadge(getDetailsValue(log.details, 'role')!)}
                  </div>
                  <p className="text-sm">
                    <span className="font-medium">{log.actor_profile?.name || 'Sistema'}</span>
                    {' '}
                    {log.action === 'admin_promoted' && 'ha promosso'}
                    {log.action === 'superadmin_created' && 'ha creato come super admin'}
                    {log.action === 'admin_removed' && 'ha rimosso'}
                    {log.action === 'admin_role_changed' && 'ha modificato il ruolo di'}
                    {' '}
                    <span className="font-medium">{log.target_email}</span>
                  </p>
                  {log.action === 'admin_role_changed' && getDetailsValue(log.details, 'old_role') && getDetailsValue(log.details, 'new_role') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Da {getDetailsValue(log.details, 'old_role')} a {getDetailsValue(log.details, 'new_role')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.created_at), "d MMM yyyy 'alle' HH:mm", { locale: it })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};