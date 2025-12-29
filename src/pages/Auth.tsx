import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { emailSchema, passwordSchema, nameSchema, phoneSchema, getSafeRedirectUrl } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedEmail && savedPassword) {
      setRememberMe(true);
      // Wait for the form to render before setting values
      setTimeout(() => {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
        if (emailInput) emailInput.value = savedEmail;
        if (passwordInput) passwordInput.value = savedPassword;
      }, 100);
    }

    // Open signup tab if hash is #signup
    if (window.location.hash === '#signup') {
      const signupTab = document.querySelector('[value="signup"]') as HTMLButtonElement;
      if (signupTab) signupTab.click();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = getSafeRedirectUrl(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
      navigate(redirectTo === '/' ? '/restaurants' : redirectTo);
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      toast.error("Errore durante l'accesso con Google: " + error.message);
      setIsLoading(false);
    }
  };

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

    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberedPassword', password);
    } else {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
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

    // Check if this is a business-only account
    if (authData.user) {
      const { data: businessRole } = await supabase
        .from('business_roles')
        .select('id')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (businessRole) {
        // Business users cannot access customer section
        await supabase.auth.signOut();
        toast.error("Questo account è registrato come ristoratore. Usa il login business per accedere.");
        setIsLoading(false);
        return;
      }
    }

    toast.success("Accesso effettuato con successo!");
    setIsLoading(false);
  };

  const handlePasswordReset = async (email: string) => {
    setIsLoading(true);

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
      setShowPasswordReset(false);
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
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="signup">Registrati</TabsTrigger>
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="rememberMe" 
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        className="border-2" 
                      />
                      <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-normal">
                        Ricordami
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPasswordReset(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Password dimenticata?
                    </button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      oppure
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continua con Google
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
                  
                  <div className="relative my-4">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      oppure
                    </span>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continua con Google
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Registrandoti, accetti i nostri{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Termini di Servizio
                    </a>{" "}
                    e la nostra{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Password Reset Dialog */}
        <Dialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
          <DialogContent onOpenAutoFocus={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>
            <DialogHeader>
              <DialogTitle>Recupera Password</DialogTitle>
              <DialogDescription>
                Inserisci la tua email e ti invieremo un link per reimpostare la password
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('reset-email') as string;
              handlePasswordReset(email);
            }} className="space-y-4">
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
                {isLoading ? "Invio in corso..." : "Invia Link di Recupero"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
