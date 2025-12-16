import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trophy, Mail, User, Upload, Lock, Star, Calendar, Heart, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LevelBenefitsModal from "@/components/LevelBenefitsModal";
import PointsHistorySection from "@/components/PointsHistorySection";

const Profile = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isLoggedIn, profile, updateProfile, user, isBusinessMode } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [passwordForEmail, setPasswordForEmail] = useState("");
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [reviewsCount, setReviewsCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    
    // Business users should not access this profile page
    if (isBusinessMode) {
      navigate("/dashboard");
      return;
    }
    
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [isLoggedIn, profile, navigate, isBusinessMode]);

  // Fetch reviews count
  useEffect(() => {
    const fetchReviewsCount = async () => {
      if (!user?.id) return;
      
      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (!error && count !== null) {
        setReviewsCount(count);
      }
    };

    fetchReviewsCount();
  }, [user?.id]);

  const userPoints = profile?.points ?? 0;
  const currentLevel = profile?.level ?? "Bronze";
  
  // Fix level progression: Bronze → Silver → Gold → Platinum
  const getLevelInfo = (level: string, points: number) => {
    switch (level) {
      case "Bronze":
        return { 
          nextLevel: "Argento", 
          pointsToNext: 101 - points, 
          progress: (points / 101) * 100,
          nextThreshold: 101
        };
      case "Silver":
        return { 
          nextLevel: "Oro", 
          pointsToNext: 301 - points, 
          progress: ((points - 101) / (301 - 101)) * 100,
          nextThreshold: 301
        };
      case "Gold":
        return { 
          nextLevel: "Platino", 
          pointsToNext: 601 - points, 
          progress: ((points - 301) / (601 - 301)) * 100,
          nextThreshold: 601
        };
      case "Platinum":
        return { 
          nextLevel: null, 
          pointsToNext: 0, 
          progress: 100,
          nextThreshold: 0
        };
      default:
        return { 
          nextLevel: "Argento", 
          pointsToNext: 101 - points, 
          progress: (points / 101) * 100,
          nextThreshold: 101
        };
    }
  };

  const levelInfo = getLevelInfo(currentLevel, userPoints);

  const getLevelDisplayName = (level: string) => {
    switch (level) {
      case "Bronze": return "Bronzo";
      case "Silver": return "Argento";
      case "Gold": return "Oro";
      case "Platinum": return "Platino";
      default: return level;
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, phone });
    toast({ title: t('profile.profileUpdated') });
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Errore", description: t('profile.fillAllPasswordFields'), variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Errore", description: t('profile.passwordsMustMatch'), variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t('profile.passwordUpdated') });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !passwordForEmail) {
      toast({ title: "Errore", description: "Inserisci la nuova email e la password", variant: "destructive" });
      return;
    }

    // Verify password first
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: passwordForEmail,
    });

    if (signInError) {
      toast({ title: "Errore", description: "Password non corretta", variant: "destructive" });
      return;
    }

    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email aggiornata", description: "Controlla la nuova email per confermare il cambiamento" });
      setNewEmail("");
      setPasswordForEmail("");
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await updateProfile({ avatar_url: publicUrl });
      toast({ title: t('profile.avatarUpdated') });
    } catch (error: any) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  // Don't render for business users
  if (isBusinessMode) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">{t('profile.title')}</h1>
          
          <div className="grid gap-8">
            {/* Profile Section - First */}
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                      {profile?.name?.charAt(0).toUpperCase() ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="flex-1 w-full">
                  <h2 className="text-2xl font-bold text-foreground mb-6">{profile?.name}</h2>
                  
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="profile-info">
                      <AccordionTrigger className="text-base font-semibold">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Dati Personali
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">{t('profile.username')}</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">{t('profile.email')}</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="email" value={email} disabled className="pl-10 bg-muted" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">{t('profile.phone')}</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10" />
                            </div>
                          </div>

                          <Button type="submit" className="w-full">{t('profile.saveChanges')}</Button>
                        </form>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="change-password">
                      <AccordionTrigger className="text-base font-semibold">
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          {t('profile.changePassword')}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="current">{t('profile.currentPassword')}</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="pl-10" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="new">{t('profile.newPassword')}</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirm">{t('profile.confirmPassword')}</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10" />
                            </div>
                          </div>

                          <Button type="submit" className="w-full">{t('profile.changePassword')}</Button>
                        </form>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="change-email">
                      <AccordionTrigger className="text-base font-semibold">
                        <span className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Cambia Email
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <form onSubmit={handleEmailChange} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="newEmail">Nuova Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="newEmail"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="nuova@email.com"
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="passwordForEmail">Password Attuale</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="passwordForEmail"
                                type="password"
                                value={passwordForEmail}
                                onChange={(e) => setPasswordForEmail(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full">
                            Cambia Email
                          </Button>
                        </form>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            </Card>

            {/* Points and Level Section */}
            <Card className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{t('profile.loyaltyLevel')}</h3>
                  <Button 
                    variant="outline" 
                    className="px-4 py-2"
                    onClick={() => setShowLevelModal(true)}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    {getLevelDisplayName(currentLevel)}
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{userPoints} {t('profile.points')}</span>
                  </div>
                  
                  {levelInfo.nextLevel && (
                    <>
                      <Progress value={Math.max(0, Math.min(100, levelInfo.progress))} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        Ti mancano {Math.max(0, levelInfo.pointsToNext)} punti per raggiungere il livello {levelInfo.nextLevel}
                      </p>
                    </>
                  )}
                  
                  {!levelInfo.nextLevel && (
                    <p className="text-sm text-primary font-medium">
                      Hai raggiunto il livello massimo! 🎉
                    </p>
                  )}
                </div>

                {/* Points History */}
                {user?.id && <PointsHistorySection userId={user.id} />}
              </div>
            </Card>

            {/* Quick Access Cards - After points */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-bookings')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Le Mie Prenotazioni</h3>
                    <p className="text-sm text-muted-foreground">Gestisci le tue prenotazioni</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/favorites')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">I Miei Preferiti</h3>
                    <p className="text-sm text-muted-foreground">Ristoranti salvati</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Recensioni Scritte</h3>
                    <p className="text-sm text-muted-foreground">{reviewsCount} recensioni</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      <LevelBenefitsModal 
        open={showLevelModal} 
        onOpenChange={setShowLevelModal} 
        currentLevel={currentLevel}
      />
    </div>
  );
};

export default Profile;