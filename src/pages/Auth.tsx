import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PasswordStrengthIndicator from "@/components/PasswordStrengthIndicator";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { emailSchema, passwordSchema, nameSchema, phoneSchema, getSafeRedirectUrl } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const formItemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('businessRememberedPassword');
    
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setRememberMe(true);
      setTimeout(() => {
        const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
        if (emailInput) emailInput.value = savedEmail;
      }, 100);
    }

    if (window.location.hash === '#signup') {
      const signupTab = document.querySelector('[value="signup"]') as HTMLButtonElement;
      if (signupTab) signupTab.click();
    }
    
    setIsCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = getSafeRedirectUrl(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
      navigate(redirectTo === '/' ? '/restaurants' : redirectTo, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth`,
      },
    });

    if (error) {
      if (error.message?.toLowerCase().includes("provider is not enabled")) {
        toast.error(
          "Google non è ancora abilitato nel backend. Attiva il provider Google nelle impostazioni Auth e riprova."
        );
      } else {
        toast.error("Errore durante l'accesso con Google: " + error.message);
      }
      setIsLoading(false);
    }
  };

  const handleAppleLogin = () => {
    toast.message("Accesso con Apple non disponibile", {
      description: "Apple non è ancora supportato: il pulsante è solo grafico.",
    });
  };

  const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.64 13.17c.02 2.08 1.82 2.77 1.84 2.78-.01.05-.29 1.01-.96 2-.58.86-1.18 1.71-2.13 1.73-.93.02-1.23-.55-2.3-.55-1.07 0-1.4.53-2.29.57-.92.03-1.62-.92-2.2-1.78-1.2-1.75-2.12-4.94-.88-7.1.62-1.07 1.73-1.75 2.94-1.77.91-.02 1.77.61 2.3.61.54 0 1.54-.75 2.6-.64.44.02 1.68.18 2.48 1.37-.06.04-1.48.86-1.46 2.58Zm-1.7-4.97c.48-.58.81-1.39.72-2.2-.69.03-1.53.46-2.03 1.05-.45.52-.84 1.35-.73 2.14.76.06 1.56-.39 2.04-.99Z" />
    </svg>
  );

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

    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
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

    if (authData.user) {
      const { data: isAdmin } = await supabase.rpc('is_admin', { _user_id: authData.user.id });
      
      if (!isAdmin) {
        const { data: businessRole } = await supabase
          .from('business_roles')
          .select('id')
          .eq('user_id', authData.user.id)
          .maybeSingle();
        
        if (businessRole) {
          await supabase.auth.signOut();
          toast.error("Questo account è registrato come ristoratore. Usa il login business per accedere.");
          setIsLoading(false);
          return;
        }
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
    const confirmPwd = formData.get('confirmPassword') as string;

    if (password !== confirmPwd) {
      toast.error("Le password non corrispondono");
      setIsLoading(false);
      return;
    }

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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-elegant">
            <CardHeader className="text-center">
              <Skeleton className="h-9 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-5 w-2/3 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-11 w-full" />
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
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="shadow-elegant overflow-hidden">
            <CardHeader className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  Benvenuto su OneTable
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Accedi o registrati per prenotare il tuo tavolo
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="login" className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all duration-200">Accedi</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-background data-[state=active]:shadow-md rounded-lg transition-all duration-200">Registrati</TabsTrigger>
                  </TabsList>
                </motion.div>
                
                <TabsContent value="login" className="mt-0">
                  <motion.form 
                    onSubmit={handleLogin} 
                    className="space-y-4"
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="tua@email.com"
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="rememberMe" 
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                          className="border-2 transition-transform duration-150 hover:scale-105" 
                        />
                        <Label htmlFor="rememberMe" className="text-sm cursor-pointer font-normal">
                          Ricordami
                        </Label>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPasswordReset(true)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Password dimenticata?
                      </button>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Accesso in corso...
                          </>
                        ) : "Accedi"}
                      </Button>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        oppure
                      </span>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover:bg-muted transition-all duration-200"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        aria-label="Continua con Google"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continua con Google
                      </Button>
                    </motion.div>

                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover:bg-muted transition-all duration-200"
                        onClick={handleAppleLogin}
                        disabled={isLoading}
                        aria-label="Continua con Apple (non disponibile)"
                      >
                        <AppleIcon className="mr-2 h-4 w-4" />
                        Continua con Apple
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Apple: disponibile a breve
                      </p>
                    </motion.div>
                  </motion.form>
                </TabsContent>
                
                <TabsContent value="signup" className="mt-0">
                  <motion.form 
                    onSubmit={handleSignup} 
                    className="space-y-4"
                    variants={staggerChildren}
                    initial="initial"
                    animate="animate"
                  >
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        placeholder="Mario Rossi"
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="signup-email">Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        required
                        placeholder="tua@email.com"
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="signup-password">Password <span className="text-destructive">*</span></Label>
                      <Input
                        id="signup-password"
                        name="password"
                        type="password"
                        required
                        placeholder="••••••••"
                        minLength={8}
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                      <PasswordStrengthIndicator password={signupPassword} />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="confirm-password">Conferma Password <span className="text-destructive">*</span></Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                      <AnimatePresence mode="wait">
                        {confirmPassword && signupPassword !== confirmPassword && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-destructive"
                          >
                            Le password non corrispondono
                          </motion.p>
                        )}
                        {confirmPassword && signupPassword === confirmPassword && (
                          <motion.p 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-green-600 dark:text-green-500"
                          >
                            Le password corrispondono ✓
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div variants={formItemVariants} className="space-y-2">
                      <Label htmlFor="phone">Telefono <span className="text-destructive">*</span></Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+39 123 456 7890"
                        className="transition-shadow duration-200 focus:shadow-md"
                      />
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Registrazione in corso...
                          </>
                        ) : "Registrati"}
                      </Button>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants} className="relative my-4">
                      <Separator />
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                        oppure
                      </span>
                    </motion.div>
                    
                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover:bg-muted transition-all duration-200"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        aria-label="Continua con Google"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continua con Google
                      </Button>
                    </motion.div>

                    <motion.div variants={formItemVariants}>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full hover:bg-muted transition-all duration-200"
                        onClick={handleAppleLogin}
                        disabled={isLoading}
                        aria-label="Continua con Apple (non disponibile)"
                      >
                        <AppleIcon className="mr-2 h-4 w-4" />
                        Continua con Apple
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-1">
                        Apple: disponibile a breve
                      </p>
                    </motion.div>
                    
                    <motion.p variants={formItemVariants} className="text-xs text-muted-foreground text-center">
                      Registrandoti, accetti i nostri{" "}
                      <a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors underline">
                        Termini di Servizio
                      </a>{" "}
                      e la nostra{" "}
                      <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors underline">
                        Privacy Policy
                      </a>
                    </motion.p>
                  </motion.form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

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
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Invio in corso...
                  </>
                ) : "Invia Link di Recupero"}
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
