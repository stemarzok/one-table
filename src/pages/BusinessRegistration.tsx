import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const BusinessRegistration = () => {
  const { toast } = useToast();
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Dati del richiedente
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [applicantEmail, setApplicantEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [applicantRole, setApplicantRole] = useState("");
  
  // Dati dell'attività
  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Redirect if already logged in with business role
    const checkExistingRole = async () => {
      if (isLoggedIn && profile?.id) {
        const { data } = await supabase
          .from('business_roles')
          .select('*')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (data) {
          navigate('/dashboard');
        }
      }
    };

    checkExistingRole();
  }, [isLoggedIn, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (password !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve contenere almeno 6 caratteri",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: applicantEmail,
        password: password,
        options: {
          data: {
            name: `${firstName} ${lastName}`,
            role: applicantRole
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Errore nella creazione dell'account");

      const userId = authData.user.id;
      const fullAddress = `${street}, ${city}, ${country}${postalCode ? ', ' + postalCode : ''}${province ? ', ' + province : ''}`;

      // 2. Create restaurant
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .insert({
          owner_id: userId,
          name: businessName,
          business_name: businessName,
          business_registration_number: vatNumber,
          legal_representative: legalRepresentative,
          email: businessEmail,
          phone: businessPhone,
          address: fullAddress,
          city: city,
          is_verified: true,
          verification_status: 'approved'
        })
        .select()
        .single();

      if (restaurantError) throw restaurantError;
      if (!restaurantData) throw new Error("Errore nella creazione del ristorante");

      // 3. Create business role
      const { error: roleError } = await supabase
        .from('business_roles')
        .insert({
          user_id: userId,
          restaurant_id: restaurantData.id,
          role: 'owner'
        });

      if (roleError) throw roleError;

      toast({
        title: "Registrazione completata!",
        description: "Reindirizzamento alla dashboard...",
      });

      // 4. Auto-login is already done by signUp, just navigate
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: t('businessReg.error'),
        description: error.message || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t('businessReg.title')}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('businessReg.subtitle')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dati del Richiedente */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Dati del Richiedente</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nome *</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lastName">Cognome *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicantEmail">Indirizzo Email *</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Almeno 6 caratteri"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Conferma Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ripeti la password"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="applicantRole">Il Tuo Ruolo nell'Azienda *</Label>
                  <Input
                    id="applicantRole"
                    value={applicantRole}
                    onChange={(e) => setApplicantRole(e.target.value)}
                    placeholder="Es: Titolare, Manager, Responsabile"
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Dati dell'Attività */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">Dati dell'Attività</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">Nome Ufficiale dell'Attività *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="vatNumber">Partita IVA *</Label>
                  <Input
                    id="vatNumber"
                    value={vatNumber}
                    onChange={(e) => setVatNumber(e.target.value)}
                    placeholder="IT12345678901"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="legalRepresentative">Rappresentante Legale *</Label>
                  <Input
                    id="legalRepresentative"
                    value={legalRepresentative}
                    onChange={(e) => setLegalRepresentative(e.target.value)}
                    placeholder="Nome Cognome"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="businessEmail">Email Attività *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="businessPhone">Telefono Attività *</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="country">Paese *</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Es: Italia"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="city">Città *</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="street">Via *</Label>
                  <Input
                    id="street"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Es: Via Roma, 123"
                    required
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">CAP *</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="Es: 00100"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province">Provincia *</Label>
                    <Input
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value.toUpperCase())}
                      placeholder="Es: RM"
                      maxLength={2}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('businessReg.submitting') : t('businessReg.submit')}
            </Button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessRegistration;
