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
import { Trophy, Mail, User, Upload, Lock, Star, Calendar, Heart, Phone, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import LevelBenefitsModal from "@/components/LevelBenefitsModal";
import PointsHistorySection from "@/components/PointsHistorySection";
import UserReviewsSection from "@/components/UserReviewsSection";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [showReviewsSection, setShowReviewsSection] = useState(false);
  const [personalDataOpen, setPersonalDataOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    
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
      case "Bronze": return t('levels.bronze');
      case "Silver": return t('levels.silver');
      case "Gold": return t('levels.gold');
      case "Platinum": return t('levels.platinum');
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
      setPasswordOpen(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !passwordForEmail) {
      toast({ title: "Errore", description: "Inserisci la nuova email e la password", variant: "destructive" });
      return;
    }

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
      setEmailOpen(false);
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
            {/* Profile Card with Avatar and Points */}
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

                <div className="flex-1 w-full space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{profile?.name}</h2>
                    <p className="text-muted-foreground">{profile?.email}</p>
                  </div>

                  {/* Level and Points Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{t('profile.loyaltyLevel')}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-3 py-1"
                        onClick={() => setShowLevelModal(true)}
                      >
                        <Trophy className="w-4 h-4 mr-1" />
                        {getLevelDisplayName(currentLevel)}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{userPoints} {t('profile.points')}</span>
                    </div>
                    
                    {levelInfo.nextLevel && (
                      <>
                        <Progress value={Math.max(0, Math.min(100, levelInfo.progress))} className="h-3" />
                        <p className="text-xs text-muted-foreground">
                          {t('profile.pointsToNextLevel').replace('{0}', String(Math.max(0, levelInfo.pointsToNext))).replace('{1}', levelInfo.nextLevel)}
                        </p>
                      </>
                    )}
                    
                    {!levelInfo.nextLevel && (
                      <p className="text-sm text-primary font-medium">
                        {t('profile.maxLevel')}
                      </p>
                    )}

                    {/* Points History */}
                    {user?.id && <PointsHistorySection userId={user.id} />}
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Access Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/my-bookings')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('profile.myBookings')}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.manageBookings')}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/favorites')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('profile.myFavorites')}</h3>
                    <p className="text-sm text-muted-foreground">{t('profile.savedRestaurants')}</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => setShowReviewsSection(true)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{t('profile.writtenReviews')}</h3>
                    <p className="text-sm text-muted-foreground">{reviewsCount} {t('profile.reviewsCount')}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Account Settings Card with Accordion */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold mb-6">{t('profile.title')}</h3>
              
              <div className="space-y-4">
                {/* Personal Data Section */}
                <Collapsible open={personalDataOpen} onOpenChange={setPersonalDataOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('profile.personalData')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${personalDataOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 px-4">
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
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
                  </CollapsibleContent>
                </Collapsible>

                {/* Change Password Section */}
                <Collapsible open={passwordOpen} onOpenChange={setPasswordOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('profile.changePassword')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${passwordOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 px-4">
                    <form onSubmit={handlePasswordChange} className="space-y-4">
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
                  </CollapsibleContent>
                </Collapsible>

                {/* Change Email Section */}
                <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('profile.changeEmail')}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${emailOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4 px-4">
                    <form onSubmit={handleEmailChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">{t('profile.newEmail')}</Label>
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
                        <Label htmlFor="passwordForEmail">{t('profile.currentPasswordLabel')}</Label>
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
                        {t('profile.changeEmailButton')}
                      </Button>
                    </form>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
      
      <LevelBenefitsModal 
        open={showLevelModal} 
        onOpenChange={setShowLevelModal} 
        currentLevel={currentLevel}
      />

      {showReviewsSection && user?.id && (
        <UserReviewsSection 
          userId={user.id} 
          onClose={() => setShowReviewsSection(false)} 
        />
      )}
    </div>
  );
};

export default Profile;
