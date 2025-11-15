import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Lock } from "lucide-react";

const AdminSetup = () => {
  const [bootstrapPassword, setBootstrapPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password di bootstrap - in produzione dovrebbe essere un secret
  const BOOTSTRAP_PASSWORD = "onetable-admin-2024";

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bootstrapPassword !== BOOTSTRAP_PASSWORD) {
      toast.error("Password di bootstrap non corretta");
      return;
    }

    if (!userEmail) {
      toast.error("Inserisci un'email valida");
      return;
    }

    setLoading(true);

    try {
      // Verifica che l'utente esista
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .maybeSingle();

      if (profileError || !profile) {
        toast.error("Utente non trovato. Assicurati che l'utente sia registrato.");
        setLoading(false);
        return;
      }

      // Verifica se è già admin
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admin_roles')
        .select('id')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (checkError) {
        console.error("Errore verifica admin:", checkError);
        toast.error("Errore durante la verifica");
        setLoading(false);
        return;
      }

      if (existingAdmin) {
        toast.info("Questo utente è già un amministratore");
        setLoading(false);
        return;
      }

      // Crea il ruolo admin
      const { error: insertError } = await supabase
        .from('admin_roles')
        .insert({
          user_id: profile.id,
          created_by: profile.id
        });

      if (insertError) {
        console.error("Errore creazione admin:", insertError);
        toast.error("Errore durante la creazione dell'admin");
        setLoading(false);
        return;
      }

      toast.success("Admin creato con successo! Reindirizzamento...");
      
      setTimeout(() => {
        navigate("/admin");
      }, 2000);

    } catch (error) {
      console.error("Errore:", error);
      toast.error("Errore imprevisto durante il setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            Setup Amministratore
          </CardTitle>
          <CardDescription className="text-center">
            Questa pagina permette di creare il primo amministratore del sistema.
            Inserisci la password di bootstrap e l'email dell'utente da promuovere.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password di Bootstrap</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Inserisci password di bootstrap"
                  value={bootstrapPassword}
                  onChange={(e) => setBootstrapPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password: onetable-admin-2024
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Utente</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@esempio.it"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                L'utente deve essere già registrato nel sistema
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Creazione in corso..." : "Crea Amministratore"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate("/")}
            >
              Torna alla Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
