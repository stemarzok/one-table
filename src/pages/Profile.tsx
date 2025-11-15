import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, TrendingUp, Camera, Mail, Lock, User } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [username, setUsername] = useState("Utente123");
  const [email, setEmail] = useState("utente@example.com");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userPoints] = useState(250);
  const currentLevel = "Argento";
  const nextLevel = "Oro";
  const pointsToNext = 301 - userPoints;
  const progress = (userPoints / 301) * 100;

  const handleSaveProfile = () => {
    toast({
      title: "Profilo aggiornato",
      description: "Le tue modifiche sono state salvate con successo.",
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
                    <AvatarImage src={avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-3xl">
                      <User className="w-12 h-12" />
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload">
                    <Button 
                      size="icon" 
                      className="absolute bottom-0 right-0 rounded-full shadow-lg cursor-pointer"
                      type="button"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="username">{t('profile.username')}</Label>
                    <Input 
                      id="username" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t('profile.username')} 
                      className="mt-2" 
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
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com" 
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="password">{t('profile.password')}</Label>
                    <div className="relative mt-2">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••" 
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  
                  <Button 
                    className="bg-primary hover:bg-primary/90 text-background font-semibold"
                    onClick={handleSaveProfile}
                  >
                    {t('profile.save')}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Card Livello e Punteggio */}
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">{t('profile.level')}</h2>
                  <Badge className="mt-1 bg-primary text-background border-primary font-semibold">
                    {currentLevel}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-foreground">{userPoints} {t('profile.points')}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm">+15 questa settimana</span>
                  </div>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <p className="text-muted-foreground">
                  Ti mancano <span className="font-bold text-primary">{pointsToNext} punti</span> per raggiungere il livello <span className="font-bold">{nextLevel}</span>
                </p>
              </div>
            </Card>

            {/* Card Vantaggi Livello Attuale */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-card-foreground mb-4">
                Vantaggi Livello {currentLevel}
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span>Priorità nelle prenotazioni</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span>5% di sconto sui conti</span>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                  <span>Tavoli con vista migliore</span>
                </li>
              </ul>
              
              <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-2">Prossimi vantaggi ({nextLevel}):</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">+</span>
                    <span>Prenotazioni garantite</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">+</span>
                    <span>15% di sconto sui conti</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <span className="text-primary">+</span>
                    <span>Welcome drink gratuito</span>
                  </li>
                </ul>
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
