import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { emailSchema, passwordSchema, nameSchema, phoneSchema, getSafeRedirectUrl } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = getSafeRedirectUrl(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
      navigate(redirectTo === '/' ? '/restaurants' : redirectTo);
    }
  }, [isLoggedIn, navigate]);

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
    
    const { error } = await supabase.auth.signInWithPassword({
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

    toast.success("Accesso effettuato con successo!");
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
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email di recupero inviata! Controlla la tua casella di posta.");
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;

    try {
      nameSchema.parse(name);
      emailSchema.parse(email);
      passwordSchema.parse(password);
      phoneSchema.parse(phone);
    } catch (error: any) {
      toast.error(error.message || "Dati non validi");
      setIsLoading(false);
      return;
    }
    
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name,
          phone,
        },
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        toast.error("Questa email è già registrata. Prova ad accedere.");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    toast.success("Registrazione completata! Controlla la tua email per confermare l'account.");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Benvenuto su OneTable
            </CardTitle>
            <CardDescription className="text-base">
              Accedi o registrati per prenotare il tuo tavolo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="signup">Registrati</TabsTrigger>
                <TabsTrigger value="reset">Recupera</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="tua@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 py-1">
                    <Checkbox id="rememberMe" name="rememberMe" className="border-2" />
                    <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-normal">
                      Ricordami per il prossimo accesso
                    </Label>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Mario Rossi"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      required
                      placeholder="tua@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password <span className="text-destructive">*</span></Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimo 8 caratteri, con maiuscola, minuscola e numero
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefono <span className="text-destructive">*</span></Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrazione in corso..." : "Registrati"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="reset">
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="reset-email"
                      name="reset-email"
                      type="email"
                      required
                      placeholder="tua@email.com"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Invio in corso..." : "Invia email di recupero"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
