import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      const redirectTo = getSafeRedirectUrl(sessionStorage.getItem('redirectTo'));
      sessionStorage.removeItem('redirectTo');
      navigate(redirectTo);
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate inputs
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
    
    // Authenticate with Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast.error("Email o password non corretti");
      } else {
        toast.error(error.message);
      }
      setIsLoading(false);
      return;
    }

    toast.success("Accesso effettuato con successo!");
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

    // Validate inputs
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
    
    // Sign up with Supabase
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

    toast.success("Registrazione completata! Benvenuto su OneTable!");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Benvenuto su OneTable</CardTitle>
            <CardDescription className="text-center">
              Accedi o crea un account per iniziare a guadagnare vantaggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Accedi</TabsTrigger>
                <TabsTrigger value="signup">Registrati</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="tua@email.com"
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      maxLength={128}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Accesso in corso..." : "Accedi"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nome completo</Label>
                    <Input
                      id="signup-name"
                      name="name"
                      type="text"
                      placeholder="Mario Rossi"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="tua@email.com"
                      maxLength={255}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      minLength={8}
                      maxLength={128}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimo 8 caratteri, con maiuscola, minuscola e numero
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Telefono</Label>
                    <Input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="+39 123 456 7890"
                      maxLength={20}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Registrazione in corso..." : "Registrati"}
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
