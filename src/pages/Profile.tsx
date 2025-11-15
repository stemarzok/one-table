import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Mail, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { isLoggedIn, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }
    
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [isLoggedIn, profile, navigate]);

  const userPoints = profile?.points ?? 0;
  const currentLevel = profile?.level ?? "Bronze";
  const nextLevel = currentLevel === "Bronze" ? "Argento" : currentLevel === "Argento" ? "Oro" : "Platino";
  const pointsToNext = currentLevel === "Bronze" ? 301 - userPoints : currentLevel === "Argento" ? 601 - userPoints : 1001 - userPoints;
  const progress = currentLevel === "Bronze" ? (userPoints / 301) * 100 : currentLevel === "Argento" ? (userPoints / 601) * 100 : (userPoints / 1001) * 100;

  const handleSaveProfile = async () => {
    await updateProfile({ name, phone });
    toast({
      title: "Profilo aggiornato",
      description: "Le tue modifiche sono state salvate con successo.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">{t('profile.title')}</h1>
          
          <div className="grid gap-8">
            {/* Card Avatar e Info Base */}
            <Card className="p-8">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      {name?.charAt(0).toUpperCase() || <User className="w-12 h-12" />}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="name">{t('profile.username')}</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('profile.username')} 
                      className="mt-2"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">{t('profile.email')}</Label>
                    <div className="relative mt-2">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email"
                        value={email}
                        disabled
                        className="pl-10" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">L'email non può essere modificata</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefono</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+39 123 456 7890"
                      className="mt-2"
                      maxLength={20}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                  {t('profile.saveChanges')}
                </Button>
              </div>
            </Card>

            {/* Card Livello Fedeltà */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  {t('profile.loyaltyLevel')}
                </h2>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {currentLevel}
                </Badge>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">{t('profile.progress')}</span>
                    <span className="font-semibold text-foreground">{userPoints} / {currentLevel === "Bronze" ? "301" : currentLevel === "Argento" ? "601" : "1001"} punti</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {pointsToNext > 0 
                      ? `${pointsToNext} punti al livello ${nextLevel}` 
                      : "Massimo livello raggiunto!"
                    }
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-foreground">{t('profile.benefits')}</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Sconto 10% su tutte le prenotazioni</li>
                    <li>• Accesso prioritario a eventi speciali</li>
                    <li>• Punti doppi ogni venerdì</li>
                    {currentLevel !== "Bronze" && <li>• Tavolo riservato in sala VIP</li>}
                    {currentLevel === "Oro" && <li>• Menu degustazione esclusivo mensile</li>}
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
