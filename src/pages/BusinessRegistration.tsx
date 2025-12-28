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
import {
  passwordSchema,
  emailSchema,
  italianVATSchema,
  italianPostalCodeSchema,
  italianPhoneSchema,
  businessNameSchema,
  nameSchema,
} from "@/lib/validation";
import { BUSINESS_ROLES } from "@/lib/italianLocations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { AddressAutocomplete, type ParsedAddress } from "@/components/AddressAutocomplete";
import { cn } from "@/lib/utils";

const BusinessRegistration = () => {
  const { toast } = useToast();
  const { isLoggedIn, profile, setBusinessMode } = useAuth();
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
  const [country] = useState("Italia"); // Fixed to Italy
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [civicNumber, setCivicNumber] = useState("");
  const [civicLocked, setCivicLocked] = useState(false);
  const [addressFieldsLocked, setAddressFieldsLocked] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  // Civic number auto-correction: '71 a' → '71A', '  12b  ' → '12B'
  const normalizeCivic = (raw: string): string => {
    return raw
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/^0+/, "");
  };

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset address verification when user clears address fields
  const resetAddressVerification = () => {
    setAddressVerified(false);
    setStreet("");
    setCity("");
    setProvince("");
    setPostalCode("");
    setCivicNumber("");
    setCivicLocked(false);
    setAddressFieldsLocked(true);
  };

  // Unlock street/city/CAP/province for manual editing
  const handleUnlockAddressFields = () => {
    setShowUnlockDialog(true);
  };

  const confirmUnlockAddressFields = () => {
    setAddressFieldsLocked(false);
    setShowUnlockDialog(false);
  };

  // Handle address selection from autocomplete
  const handleAddressSelect = (address: ParsedAddress) => {
    if (address.street) setStreet(address.street);
    if (address.city) setCity(address.city);
    if (address.province) setProvince(address.province);
    if (address.postalCode) setPostalCode(address.postalCode);

    // Civic is always editable and mandatory; prefill when available.
    setCivicNumber(address.houseNumber || "");
    setCivicLocked(false);

    setAddressVerified(true);

    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      street: "",
      city: "",
      province: "",
      postalCode: "",
      civicNumber: "",
    }));
  };

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

  // Real-time validation
  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        const nameResult = nameSchema.safeParse(value);
        return nameResult.success ? null : nameResult.error.errors[0].message;
      
      case 'applicantEmail':
      case 'businessEmail':
        const emailResult = emailSchema.safeParse(value);
        return emailResult.success ? null : emailResult.error.errors[0].message;
      
      case 'password':
        const passwordResult = passwordSchema.safeParse(value);
        return passwordResult.success ? null : passwordResult.error.errors[0].message;
      
      case 'vatNumber':
        if (!value) return null;
        const vatResult = italianVATSchema.safeParse(value);
        return vatResult.success ? null : vatResult.error.errors[0].message;
      
      case 'postalCode':
        if (!value) return null;
        const postalResult = italianPostalCodeSchema.safeParse(value);
        return postalResult.success ? null : postalResult.error.errors[0].message;
      
      case 'businessPhone':
        if (!value) return null;
        const phoneResult = italianPhoneSchema.safeParse(value);
        return phoneResult.success ? null : phoneResult.error.errors[0].message;
      
      case 'businessName':
        const businessNameResult = businessNameSchema.safeParse(value);
        return businessNameResult.success ? null : businessNameResult.error.errors[0].message;
      
      default:
        return null;
    }
  };

  const handleFieldChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    const error = validateField(field, value);
    setErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Comprehensive validation
    const validationErrors: Record<string, string> = {};

    // Validate all fields
    const firstNameError = validateField('firstName', firstName);
    if (firstNameError) validationErrors.firstName = firstNameError;

    const lastNameError = validateField('lastName', lastName);
    if (lastNameError) validationErrors.lastName = lastNameError;

    const emailError = validateField('applicantEmail', applicantEmail);
    if (emailError) validationErrors.applicantEmail = emailError;

    const passwordError = validateField('password', password);
    if (passwordError) validationErrors.password = passwordError;

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Le password non corrispondono";
    }

    if (!applicantRole) {
      validationErrors.applicantRole = "Seleziona il tuo ruolo";
    }

    const businessNameError = validateField('businessName', businessName);
    if (businessNameError) validationErrors.businessName = businessNameError;

    const vatError = validateField('vatNumber', vatNumber);
    if (vatError) validationErrors.vatNumber = vatError;

    const legalRepError = validateField('firstName', legalRepresentative);
    if (legalRepError) validationErrors.legalRepresentative = legalRepError;

    const businessEmailError = validateField('businessEmail', businessEmail);
    if (businessEmailError) validationErrors.businessEmail = businessEmailError;

    const phoneError = validateField('businessPhone', businessPhone);
    if (phoneError) validationErrors.businessPhone = phoneError;

    // Address validation
    const civic = civicNumber.trim();
    const civicRegex = /^[0-9]{1,6}[A-Za-z]?([\/-][0-9]{1,6}[A-Za-z]?)?$/;

    if (!addressVerified) {
      validationErrors.street = "Seleziona un indirizzo dall'autocomplete";
    }

    if (!street) {
      validationErrors.street = "Via richiesta (seleziona dall'autocomplete)";
    }

    if (!civic) {
      validationErrors.civicNumber = "Numero civico obbligatorio";
    } else if (!civicRegex.test(civic)) {
      validationErrors.civicNumber = "Numero civico non valido";
    }

    if (!province) {
      validationErrors.province = "Provincia richiesta (usa l'autocomplete)";
    }

    if (!city) {
      validationErrors.city = "Città richiesta (usa l'autocomplete)";
    }

    const postalCodeError = validateField('postalCode', postalCode);
    if (postalCodeError) validationErrors.postalCode = postalCodeError;

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Errori di validazione",
        description: "Correggi i campi evidenziati prima di procedere",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Get the role label for the selected role
      const selectedRole = BUSINESS_ROLES.find(r => r.value === applicantRole);
      const roleLabel = selectedRole?.label || applicantRole;

      // Call edge function to create user, restaurant and business role
      const { data, error } = await supabase.functions.invoke('register-business', {
        body: {
          firstName,
          lastName,
          applicantEmail,
          password,
          applicantRole: roleLabel,
          businessName,
          vatNumber: vatNumber.toUpperCase().replace(/\s/g, ''),
          legalRepresentative,
          businessEmail,
          businessPhone,
          country,
          city,
          street: `${street}, ${civicNumber.trim()}`,
          province,
          postalCode
        }
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Errore durante la registrazione");

      // Auto-login after registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: applicantEmail,
        password: password,
      });

      if (loginError) throw loginError;

      // Set business mode after successful registration and login
      setBusinessMode(true);

      toast({
        title: "Registrazione completata! 🎉",
        description: "Il tuo account è stato creato con successo. Verrai reindirizzato al tour di configurazione.",
      });

      // Redirect to onboarding after a short delay
      setTimeout(() => {
        navigate('/onboarding');
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

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className="text-destructive text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {errors[field]}
      </p>
    );
  };

  const renderFieldSuccess = (field: string, value: string) => {
    if (!value || errors[field]) return null;
    const error = validateField(field, value);
    if (error) return null;
    return (
      <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Valido
      </p>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {t('businessReg.title')}
          </h1>
          <p className="text-muted-foreground mb-4">
            {t('businessReg.subtitle')}
          </p>

          {/* Security Notice */}
          <Card className="p-4 mb-8 border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Registrazione Verificata</h3>
                <p className="text-sm text-muted-foreground">
                  Tutti i dati vengono verificati. La Partita IVA viene controllata secondo l'algoritmo ufficiale italiano. 
                  Forniamo solo indirizzi e località verificate per garantire l'autenticità delle attività registrate.
                </p>
              </div>
            </div>
          </Card>
          
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
                      onChange={(e) => handleFieldChange('firstName', e.target.value, setFirstName)}
                      required
                      className={`mt-2 ${errors.firstName ? 'border-destructive' : ''}`}
                    />
                    {renderFieldError('firstName')}
                    {renderFieldSuccess('firstName', firstName)}
                  </div>

                  <div>
                    <Label htmlFor="lastName">Cognome *</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value, setLastName)}
                      required
                      className={`mt-2 ${errors.lastName ? 'border-destructive' : ''}`}
                    />
                    {renderFieldError('lastName')}
                    {renderFieldSuccess('lastName', lastName)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicantEmail">Indirizzo Email *</Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    value={applicantEmail}
                    onChange={(e) => handleFieldChange('applicantEmail', e.target.value, setApplicantEmail)}
                    required
                    className={`mt-2 ${errors.applicantEmail ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('applicantEmail')}
                  {renderFieldSuccess('applicantEmail', applicantEmail)}
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => handleFieldChange('password', e.target.value, setPassword)}
                    placeholder="Min 8 caratteri, 1 maiuscola, 1 minuscola, 1 numero"
                    required
                    className={`mt-2 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('password')}
                  {renderFieldSuccess('password', password)}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Conferma Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (e.target.value !== password) {
                        setErrors(prev => ({ ...prev, confirmPassword: "Le password non corrispondono" }));
                      } else {
                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Ripeti la password"
                    required
                    className={`mt-2 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('confirmPassword')}
                  {confirmPassword && confirmPassword === password && (
                    <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Password corrispondenti
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="applicantRole">Il Tuo Ruolo nell'Azienda *</Label>
                  <Select value={applicantRole} onValueChange={setApplicantRole}>
                    <SelectTrigger className={`mt-2 ${errors.applicantRole ? 'border-destructive' : ''}`}>
                      <SelectValue placeholder="Seleziona il tuo ruolo" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {renderFieldError('applicantRole')}
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
                    onChange={(e) => handleFieldChange('businessName', e.target.value, setBusinessName)}
                    required
                    className={`mt-2 ${errors.businessName ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('businessName')}
                  {renderFieldSuccess('businessName', businessName)}
                </div>

                <div>
                  <Label htmlFor="vatNumber">Partita IVA *</Label>
                  <Input
                    id="vatNumber"
                    value={vatNumber}
                    onChange={(e) => handleFieldChange('vatNumber', e.target.value.toUpperCase(), setVatNumber)}
                    placeholder="IT12345678901 o 12345678901"
                    required
                    className={`mt-2 ${errors.vatNumber ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('vatNumber')}
                  {renderFieldSuccess('vatNumber', vatNumber)}
                  <p className="text-xs text-muted-foreground mt-1">
                    La Partita IVA viene verificata automaticamente
                  </p>
                </div>

                <div>
                  <Label htmlFor="legalRepresentative">Rappresentante Legale *</Label>
                  <Input
                    id="legalRepresentative"
                    value={legalRepresentative}
                    onChange={(e) => handleFieldChange('legalRepresentative', e.target.value, setLegalRepresentative)}
                    placeholder="Nome e Cognome"
                    required
                    className={`mt-2 ${errors.legalRepresentative ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('legalRepresentative')}
                </div>

                <div>
                  <Label htmlFor="businessEmail">Email Attività *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={businessEmail}
                    onChange={(e) => handleFieldChange('businessEmail', e.target.value, setBusinessEmail)}
                    required
                    className={`mt-2 ${errors.businessEmail ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('businessEmail')}
                  {renderFieldSuccess('businessEmail', businessEmail)}
                </div>

                <div>
                  <Label htmlFor="businessPhone">Telefono Attività *</Label>
                  <Input
                    id="businessPhone"
                    type="tel"
                    value={businessPhone}
                    onChange={(e) => handleFieldChange('businessPhone', e.target.value, setBusinessPhone)}
                    placeholder="+39 333 1234567"
                    required
                    className={`mt-2 ${errors.businessPhone ? 'border-destructive' : ''}`}
                  />
                  {renderFieldError('businessPhone')}
                  {renderFieldSuccess('businessPhone', businessPhone)}
                </div>

                {/* Address Autocomplete Section */}
                <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Label>Cerca Indirizzo *</Label>
                      <p className="text-xs text-muted-foreground">
                        Seleziona la via dai suggerimenti; il numero civico è obbligatorio (se non compare, lo inserisci sotto).
                      </p>
                    </div>
                    {addressVerified && (
                      <button
                        type="button"
                        onClick={resetAddressVerification}
                        className="text-xs text-destructive hover:underline whitespace-nowrap"
                      >
                        Cambia indirizzo
                      </button>
                    )}
                  </div>

                  {!addressVerified ? (
                    <AddressAutocomplete
                      onAddressSelect={handleAddressSelect}
                      placeholder="Es: Via Vittorio Emanuele 71, Colturano"
                      className="mt-1"
                    />
                  ) : null}

                  {renderFieldError('street')}

                  {addressVerified && (
                    <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
                      {/* Modifica Indirizzo button */}
                      {addressFieldsLocked && (
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleUnlockAddressFields}
                            className="text-xs text-primary hover:underline"
                          >
                            Modifica indirizzo manualmente
                          </button>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <Label htmlFor="street">Via *</Label>
                        <Input
                          id="street"
                          value={street}
                          readOnly={addressFieldsLocked}
                          onChange={(e) => setStreet(e.target.value)}
                          className={cn(
                            "mt-2",
                            addressFieldsLocked
                              ? "bg-muted cursor-not-allowed"
                              : "bg-background"
                          )}
                        />
                        {addressFieldsLocked && (
                          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Via verificata
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="civicNumber">Numero civico *</Label>
                        <Input
                          id="civicNumber"
                          value={civicNumber}
                          onChange={(e) => {
                            setCivicNumber(e.target.value);
                            setErrors((prev) => ({ ...prev, civicNumber: "" }));
                          }}
                          onBlur={(e) => {
                            const normalized = normalizeCivic(e.target.value);
                            setCivicNumber(normalized);
                          }}
                          placeholder="Es: 71, 71A, 12/B"
                          className={cn(
                            "mt-2 bg-background",
                            errors.civicNumber ? "border-destructive" : ""
                          )}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Esempi validi: 1, 22, 71A, 3/B, 10-12
                        </p>
                        {renderFieldError("civicNumber")}
                        {civicNumber && !errors.civicNumber && (
                          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Numero civico OK
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="postalCode">CAP *</Label>
                        <Input
                          id="postalCode"
                          value={postalCode}
                          readOnly={addressFieldsLocked}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className={cn(
                            "mt-2",
                            addressFieldsLocked
                              ? "bg-muted cursor-not-allowed"
                              : "bg-background"
                          )}
                        />
                        {addressFieldsLocked && (
                          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            CAP verificato
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="city">Città *</Label>
                        <Input
                          id="city"
                          value={city}
                          readOnly={addressFieldsLocked}
                          onChange={(e) => setCity(e.target.value)}
                          className={cn(
                            "mt-2",
                            addressFieldsLocked
                              ? "bg-muted cursor-not-allowed"
                              : "bg-background"
                          )}
                        />
                        {addressFieldsLocked && (
                          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Città verificata
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="province">Provincia *</Label>
                        <Input
                          id="province"
                          value={province}
                          readOnly={addressFieldsLocked}
                          onChange={(e) => setProvince(e.target.value)}
                          className={cn(
                            "mt-2",
                            addressFieldsLocked
                              ? "bg-muted cursor-not-allowed"
                              : "bg-background"
                          )}
                        />
                        {addressFieldsLocked && (
                          <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Provincia verificata
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    🇮🇹 Powered by OpenStreetMap • Nota: alcuni indirizzi non restituiscono il civico nei suggerimenti.
                  </p>
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

      {/* AlertDialog for unlocking address fields */}
      <AlertDialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modificare l'indirizzo?</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler modificare i campi indirizzo? Eventuali modifiche manuali non saranno verificate automaticamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={confirmUnlockAddressFields}>Conferma</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessRegistration;
