import { ArrowLeft, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Globe, Moon, Sun, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useLanguage, languageInfo, type Language } from "@/contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

const languages: Language[] = ['it', 'en', 'es', 'de', 'fr', 'nl', 'ru'];

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t, isTranslating } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    toast.success(newTheme === "dark" ? t('settings.themeDarkActivated') : t('settings.themeLightActivated'));
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    toast.success(`${t('menu.languageChanged')} ${languageInfo[lang].nativeName}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
          {isTranslating && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 space-y-6 pb-20">
        {/* Preferenze */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('settings.preferences')}</h2>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('settings.language')}
                {isTranslating && (
                  <span className="text-xs text-muted-foreground ml-2">({t('settings.translating')})</span>
                )}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {languages.map((lang) => {
                  const info = languageInfo[lang];
                  const isSelected = language === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      disabled={isTranslating}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                        isSelected ? 'border-primary bg-primary/10 ring-2 ring-primary/20' : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      } ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span className="text-xl">{info.flag}</span>
                      <span className="text-sm font-medium truncate">{info.nativeName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {t('settings.darkTheme')}
              </Label>
              <Switch checked={theme === "dark"} onCheckedChange={handleThemeToggle} />
            </div>
          </div>
        </Card>

        {/* Contatti */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('settings.contacts')}</h2>
          <div className="space-y-4">
            <a href="mailto:info@onetable.it" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
              <div>
                <p className="font-medium">{t('settings.email')}</p>
                <p className="text-sm text-muted-foreground">info@onetable.it</p>
              </div>
            </a>
            <Separator />
            <a href="tel:+390212345678" className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
              <Phone className="w-5 h-5" />
              <div>
                <p className="font-medium">{t('settings.phone')}</p>
                <p className="text-sm text-muted-foreground">+39 02 1234 5678</p>
              </div>
            </a>
            <Separator />
            <div className="flex items-start gap-3 text-foreground">
              <MapPin className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">{t('settings.address')}</p>
                <p className="text-sm text-muted-foreground">Via della Innovazione, 42<br />20121 Milano, Italia</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Social */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('settings.social')}</h2>
          <div className="flex gap-4">
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><Facebook className="w-6 h-6" /></a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><Instagram className="w-6 h-6" /></a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><Linkedin className="w-6 h-6" /></a>
            <a href="#" className="p-3 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"><Twitter className="w-6 h-6" /></a>
          </div>
        </Card>

        {/* Legale */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">{t('settings.legal')}</h2>
          <div className="space-y-3">
            <a href="/privacy" className="block text-foreground hover:text-primary transition-colors py-2">{t('settings.privacyPolicy')}</a>
            <Separator />
            <a href="/terms" className="block text-foreground hover:text-primary transition-colors py-2">{t('settings.termsConditions')}</a>
            <Separator />
            <a href="/cookies" className="block text-foreground hover:text-primary transition-colors py-2">{t('settings.cookiePolicy')}</a>
            <Separator />
            <a href="/gdpr" className="block text-foreground hover:text-primary transition-colors py-2">GDPR</a>
            <Separator />
            <a href="/status" className="block text-foreground hover:text-primary transition-colors py-2">{t('settings.systemStatus')}</a>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl font-bold text-foreground">One</span>
            <span className="text-2xl font-bold text-primary">Table</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{t('settings.aboutDescription')}</p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} OneTable. {t('settings.copyright')}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
