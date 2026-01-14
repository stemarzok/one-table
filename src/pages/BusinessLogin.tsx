import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { emailSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { Store, Lock, Mail, Loader2 } from "lucide-react";

const BusinessLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const { isLoggedIn, user, setBusinessMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Clean up any previously stored passwords (security fix)
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('businessRememberedPassword');
    
    // Load saved email only if remember me was checked (never store passwords)
    const savedEmail = localStorage.getItem('businessRememberedEmail');
    if (savedEmail) {
      setRememberMe(true);
      const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
      if (emailInput) emailInput.value = savedEmail;
    }
  }, []);

  // Fast redirect if already logged in with business role
  useEffect(() => {
    if (isLoggedIn && user) {
      // Quick check - use cached query with minimal fields
      Promise.all([
        supabase.from('business_roles').select('id').eq('user_id', user.id).limit(1).maybeSingle(),
        supabase.from('admin_roles').select('id').eq('user_id', user.id).limit(1).maybeSingle()
      ]).then(([businessResult, adminResult]) => {
        if (businessResult.data || adminResult.data) {
          setBusinessMode(true);
          navigate('/dashboard', { replace: true });
        } else {
          setIsCheckingAuth(false);
        }
      });
    } else {
      setIsCheckingAuth(false);
    }
  }, [isLoggedIn, user, navigate, setBusinessMode]);

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

    // Save email only if remember me is checked (never store passwords)
    if (rememberMe) {
      localStorage.setItem('businessRememberedEmail', email);
    } else {
      localStorage.removeItem('businessRememberedEmail');
    }
    
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email o password non corretti");
      } else if (error.message.includes("Email not confirmed")) {
        toast.error("Devi confermare la tua email. Clicca su 'Rinvia email di conferma' per riceverla nuovamente.");
        setShowResendConfirmation(true);
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    // Check if user is admin or has business role - optimized with minimal fields
    if (authData.user) {
      const [businessRoleResult, adminRoleResult, profileResult] = await Promise.all([
        supabase.from('business_roles').select('id').eq('user_id', authData.user.id).limit(1).maybeSingle(),
        supabase.from('admin_roles').select('id').eq('user_id', authData.user.id).limit(1).maybeSingle(),
        supabase.from('profiles').select('onboarding_completed').eq('id', authData.user.id).maybeSingle()
      ]);
      
      if (!businessRoleResult.data && !adminRoleResult.data) {
        await supabase.auth.signOut();
        toast.error("Questo account non è associato a nessun ristorante. Completa prima la registrazione business.");
        setIsLoading(false);
        return;
      }
      
      // Set business mode immediately
      setBusinessMode(true);
      toast.success("Accesso effettuato!");
      
      // Navigate immediately without delay
      const hasCompletedOnboarding = profileResult.data?.onboarding_completed;
      if (!hasCompletedOnboarding && businessRoleResult.data) {
        navigate('/onboarding', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
    
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
      redirectTo: `${window.location.origin}/business-login`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email di recupero inviata! Controlla la tua casella di posta.");
      setShowPasswordReset(false);
    }
    
    setIsLoading(false);
  };

  const handleResendConfirmation = async (email: string) => {
    setIsLoading(true);

    try {
      emailSchema.parse(email);
    } catch (error: any) {
      toast.error(error.message || "Email non valida");
      setIsLoading(false);
      return;
    }
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Email di conferma inviata! Controlla la tua casella di posta e clicca sul link per confermare il tuo account.");
      setShowResendConfirmation(false);
    }
    
    setIsLoading(false);
  };

  // Skeleton loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-elegant">
            <CardHeader className="text-center space-y-2">
              <Skeleton className="mx-auto w-16 h-16 rounded-full" />
              <Skeleton className="mx-auto h-8 w-48" />
              <Skeleton className="mx-auto h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-11 w-full" />
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-elegant animate-fade-in">
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="rememberMe" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-2"
                    disabled={isLoading}
                  />
                  <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-normal">
                    Ricordami
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordReset(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  Password dimenticata?
                </button>
              </div>
              
              <Button
                type="submit"
                className="w-full h-11 text-base transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accesso in corso...
                  </>
                ) : (
                  "Accedi alla Dashboard"
                )}
              </Button>
              
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setShowResendConfirmation(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                  disabled={isLoading}
                >
                  Non hai ricevuto l'email di conferma? Rinvia
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/business-registration')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                  disabled={isLoading}
                >
                  Non hai un account? Registra il tuo ristorante
                </button>
              </div>
            </form>
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
                  placeholder="ristorante@email.com"
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

        {/* Resend Confirmation Dialog */}
        <Dialog open={showResendConfirmation} onOpenChange={setShowResendConfirmation}>
          <DialogContent onOpenAutoFocus={(e) => { e.preventDefault(); window.scrollTo(0, 0); }}>
            <DialogHeader>
              <DialogTitle>Rinvia Email di Conferma</DialogTitle>
              <DialogDescription>
                Inserisci la tua email e ti invieremo nuovamente il link di conferma
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const email = formData.get('resend-email') as string;
              handleResendConfirmation(email);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="resend-email"
                  name="resend-email"
                  type="email"
                  required
                  placeholder="ristorante@email.com"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Invio in corso..." : "Rinvia Email di Conferma"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessLogin;
