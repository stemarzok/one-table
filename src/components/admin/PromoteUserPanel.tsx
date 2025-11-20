import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";

export const PromoteUserPanel = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
      const bootstrapPassword = prompt("Inserisci la password di bootstrap admin:");
      
      if (!bootstrapPassword) {
        toast({
          title: "Operazione annullata",
          description: "Password di bootstrap non fornita",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-admin', {
        body: {
          bootstrapPassword,
          userEmail: email.trim(),
        }
      });

      if (error) throw error;

      toast({
        title: "Successo",
        description: `Utente ${email} promosso ad amministratore`,
      });
      
      setEmail("");
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

  return (
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
        <form onSubmit={handlePromote} className="space-y-4">
          <div className="space-y-2">
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
          <Button type="submit" disabled={loading}>
            {loading ? "Promozione in corso..." : "Promuovi ad Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
