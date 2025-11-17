import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BusinessRegistration = () => {
  const { toast } = useToast();
  const { isLoggedIn, profile } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [documents, setDocuments] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [hasApplication, setHasApplication] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    // Check if user already has an application
    const checkApplication = async () => {
      if (!profile?.id) return;

      const { data } = await supabase
        .from('business_applications')
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (data) {
        setHasApplication(true);
        toast({
          title: t('businessReg.pending'),
          description: t('businessReg.pendingMsg'),
        });
      }
    };

    checkApplication();
  }, [isLoggedIn, profile, navigate, toast, t]);

  const handleDocumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments(Array.from(files));
    }
  };

  const uploadDocuments = async (): Promise<string[]> => {
    if (!profile?.id || documents.length === 0) return [];

    const fileNames: string[] = [];

    for (const file of documents) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Store file names instead of URLs - admins will generate signed URLs when needed
      fileNames.push(fileName);
    }

    return fileNames;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast({
        title: t('businessReg.error'),
        description: "Devi essere autenticato",
        variant: "destructive",
      });
      return;
    }

    if (documents.length === 0) {
      toast({
        title: t('businessReg.error'),
        description: "Devi caricare almeno un documento",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const documentUrls = await uploadDocuments();

      const { error } = await supabase
        .from('business_applications')
        .insert({
          user_id: profile.id,
          business_name: businessName,
          business_registration_number: vatNumber,
          legal_representative: legalRepresentative,
          business_email: businessEmail,
          business_phone: businessPhone,
          business_address: address,
          city,
          province,
          postal_code: postalCode,
          documents_url: documentUrls,
        });

      if (error) throw error;

      toast({
        title: t('businessReg.success'),
        description: t('businessReg.successMsg'),
      });

      setHasApplication(true);
    } catch (error: any) {
      toast({
        title: t('businessReg.error'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (hasApplication) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="p-12 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">{t('businessReg.pending')}</h1>
              <p className="text-muted-foreground">{t('businessReg.pendingMsg')}</p>
              <Button onClick={() => navigate('/')} className="mt-6">
                Torna alla Home
              </Button>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            {/* Company Information */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">{t('businessReg.companyInfo')}</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="businessName">{t('businessReg.businessName')} *</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="vatNumber">{t('businessReg.vatNumber')} *</Label>
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
                  <Label htmlFor="legalRep">{t('businessReg.legalRep')} *</Label>
                  <Input
                    id="legalRep"
                    value={legalRepresentative}
                    onChange={(e) => setLegalRepresentative(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">{t('businessReg.contactInfo')}</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessEmail">{t('businessReg.businessEmail')} *</Label>
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
                    <Label htmlFor="businessPhone">{t('businessReg.businessPhone')} *</Label>
                    <Input
                      id="businessPhone"
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">{t('businessReg.address')} *</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">{t('businessReg.city')} *</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province">{t('businessReg.province')}</Label>
                    <Input
                      id="province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      placeholder="ES: MI"
                      maxLength={2}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">{t('businessReg.postalCode')}</Label>
                    <Input
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Documents */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-6">{t('businessReg.documents')}</h2>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('businessReg.docsRequired')}
                </p>

                <div>
                  {documents.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4" />
                          <span>{doc.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => documentsInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {t('businessReg.uploadDocs')}
                  </Button>
                  <input
                    ref={documentsInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={handleDocumentsChange}
                  />
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
