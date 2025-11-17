import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { emailSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { Store, Lock, Mail } from "lucide-react";

const BusinessLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkBusinessRole = async () => {
      if (isLoggedIn && user) {
        // Check if user has business role
        const { data } = await supabase
          .from('business_roles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          navigate('/dashboard');
        }
      }
    };
    
    checkBusinessRole();
  }, [isLoggedIn, user, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      emailSchema.parse(email);
      if (!password || password.length < 1) {
        throw new Error("Password richiesta");
      }
    } catch (error: any) {
      toast.error(error.message || "Dati non validi");
      setIsLoading(false);
      return;
    }
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email o password non corretti");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Conferma la tua email prima di accedere");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Check if user has business role
    if (authData.user) {
      const { data: businessRole } = await supabase
        .from('business_roles')
        .select('*')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (!businessRole) {
        await supabase.auth.signOut();
        toast.error("Questo account non è associato a nessun ristorante. Completa prima la registrazione business.");
        setIsLoading(false);
        return;
      }
      
      toast.success("Accesso effettuato! Reindirizzamento alla dashboard...");
      setTimeout(() => navigate('/dashboard'), 1000);
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('reset-email') as string;

    try {
      emailSchema.parse(email);
    } catch (error: any) {
      toast.error(error.message || "Email non valida");
      setIsLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/business-login`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email di recupero inviata! Controlla la tua casella di posta.");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Area Ristoratori
            </CardTitle>
            <CardDescription className="text-base">
              Accedi alla dashboard del tuo ristorante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="ristorante@email.com"
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="h-11"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? "Accesso in corso..." : "Accedi alla Dashboard"}
              </Button>
              
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => navigate('/business-registration')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Non hai un account? Registra il tuo ristorante
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessLogin;
