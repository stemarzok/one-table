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

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bootstrapPassword) {
      toast.error("Inserisci la password di bootstrap");
      return;
    }

    if (!userEmail) {
      toast.error("Inserisci un'email valida");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-admin", {
        body: {
          bootstrapPassword,
          userEmail,
        },
      });

      if (error) {
        toast.error(error.message || "Errore durante la creazione dell'admin");
        setLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
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
                Contatta l'amministratore di sistema per la password
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
